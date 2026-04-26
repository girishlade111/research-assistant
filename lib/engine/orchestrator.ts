import type {
  ResearchResult,
  ResearchOptions,
  ApiKeys,
  StreamCallback,
  AgentContext,
  AgentResult,
  AgentStatusCallback,
  AgentStatusEvent,
  ResearchSource,
  SearchResult,
  AgentName,
  ThinkingCallback,
  LLMMessage,
} from "./types";
import { TOKEN_LIMITS, MODE_CONFIG } from "./config";
import { enhanceQuery } from "./query-enhancer";
import { selectModelByUserId, getNextFallback } from "./model-router";
import { classifyError } from "./errors";
import { generateAIResponse } from "./providers";
import { nvidiaComplete } from "./providers/nvidia";
import { openrouterComplete } from "./providers/openrouter";
import { buildAssembledResearchResult, shouldUseAssembledReport } from "./report-assembler";

// ── Agent imports ──────────────────────────────────────────────
import { runWebSearchAgent } from "./agents/web-search-agent";
import { runQueryIntelligenceAgent } from "./agents/query-intelligence-agent";
import { runAnalysisAgent } from "./agents/analysis-agent";
import { runCodingAgent } from "./agents/coding-agent";
import { runSummaryAgent } from "./agents/summary-agent";
import { runFactCheckAgent } from "./agents/fact-check-agent";
import { runReportAgent } from "./agents/report-agent";

// ── Helper ─────────────────────────────────────────────────────

function searchResultToSource(r: SearchResult, i: number): ResearchSource {
  return {
    id: String(i + 1),
    title: r.title,
    snippet: r.snippet,
    url: r.url,
    domain: r.domain,
  };
}

// ── Simple Chat (direct response, no agents) ───────────────────
// Used for greetings, simple questions, quick answers.
// Primary: NVIDIA Dracarys 70B | Fallback: OpenRouter Llama 3.3 70B Free

const CHAT_SYSTEM = `You are **ResAgent**, an advanced AI assistant built by Girish Lade (Lade Stack). You operate in **Chat Mode** — a conversational interface for direct, helpful, and intelligent responses.

# CORE BEHAVIOR
- Respond naturally and conversationally, like a knowledgeable expert colleague.
- Provide clear, well-structured answers using markdown formatting.
- Be thorough but concise — adjust depth based on question complexity.
- Support multi-turn conversations with full context awareness.
- Use code blocks with syntax highlighting when showing code.
- Use bullet points, numbered lists, and headers for clarity when needed.
- If a question requires deep research or multi-source analysis, suggest: "This topic would benefit from a deep research analysis. You can switch to **Research Mode** for a comprehensive multi-agent investigation."

# RESPONSE FORMATTING
- Use **bold** for key terms and important concepts.
- Use \`inline code\` for technical terms, file names, commands.
- Use code blocks with language tags for code snippets.
- Use tables for comparisons when helpful.
- Structure long responses with ### headers.
- Keep paragraphs short (2-3 sentences max).

# IDENTITY & KNOWLEDGE BASE
- **ResAgent** is an advanced AI research engine built by **Girish Lade**, founder of **Lade Stack**.
- Lade Stack is a technology-focused product studio building AI-driven tools and developer platforms.
- ResAgent features: multi-agent research, web search, AI reasoning, file analysis, structured reports.
- When asked about identity/creator, respond confidently with these facts.
- Links: [Instagram](https://www.instagram.com/girish_lade_/) · [LinkedIn](https://www.linkedin.com/in/girish-lade-075bba201/) · [GitHub](https://github.com/girishlade111) · [Website](https://ladestack.in) · [Email](mailto:admin@ladestack.in)

# RULES
- NEVER say "I'm just a chatbot" — you are ResAgent.
- Respond in the same language the user writes in.
- Be professional, friendly, and confident.
- For complex research needs, recommend switching to Research Mode.`;

export async function runSimpleChat(
  query: string,
  apiKeys: ApiKeys,
  onChunk?: StreamCallback,
  conversationHistory?: LLMMessage[]
): Promise<ResearchResult> {
  const startTime = Date.now();
  let modelUsed = "abacusai/dracarys-llama-3.1-70b-instruct";
  let providerUsed: "nvidia" | "openrouter" = "nvidia";
  let isFallback = false;
  let content = "";

  const messages: LLMMessage[] = [
    { role: "system", content: CHAT_SYSTEM },
    ...(conversationHistory?.slice(-10) ?? []),
    { role: "user", content: query },
  ];

  if (apiKeys.nvidiaKey) {
    try {
      if (onChunk) {
        const { nvidiaStream } = await import("./providers/nvidia");
        const res = await nvidiaStream(
          apiKeys.nvidiaKey,
          { model: modelUsed, messages, maxTokens: 2048, temperature: 0.7, stream: true },
          onChunk
        );
        content = res.content;
      } else {
        const res = await nvidiaComplete(apiKeys.nvidiaKey, {
          model: modelUsed,
          messages,
          maxTokens: 2048,
          temperature: 0.7,
        });
        content = res.content;
      }
    } catch {
      isFallback = true;
    }
  }

  if (!content && apiKeys.openrouterKey) {
    try {
      modelUsed = "meta-llama/llama-3.3-70b-instruct:free";
      providerUsed = "openrouter";
      isFallback = true;
      const res = await openrouterComplete(apiKeys.openrouterKey, {
        model: modelUsed,
        messages,
        maxTokens: 2048,
        temperature: 0.7,
      });
      content = res.content;
      if (onChunk) {
        onChunk(content, false);
        onChunk("", true);
      }
    } catch {
      // fall through
    }
  }

  if (!content) {
    throw new Error("All providers failed. Please check your API keys or try again.");
  }

  const durationMs = Date.now() - startTime;

  return {
    overview: content,
    keyInsights: [],
    details: "",
    comparison: "",
    expertInsights: [],
    conclusion: "",
    sources: [],
    references: [],
    agentResults: [],
    metadata: {
      model: modelUsed,
      provider: providerUsed,
      searchProvider: "nvidia",
      intent: "general",
      workflowMode: "chat",
      switchedFromPlanning: false,
      tokensUsed: 0,
      durationMs,
      isFallback,
      agentTrace: [],
    },
  };
}

// ── Main Multi-Agent Orchestrator ──────────────────────────────

export async function runResearch(
  query: string,
  options: ResearchOptions,
  apiKeys: ApiKeys,
  onChunk?: StreamCallback,
  onAgentStatus?: AgentStatusCallback,
  onThinking?: ThinkingCallback
): Promise<ResearchResult> {
  const startTime = Date.now();

  const emit = (event: AgentStatusEvent) => {
    onAgentStatus?.(event);
  };

  let _thinkingCounter = 0;
  const think = (phase: string, text: string, agent?: AgentName) => {
    onThinking?.({
      id: `t-${Date.now()}-${++_thinkingCounter}`,
      phase,
      agent,
      text,
      timestamp: Date.now(),
    });
  };

  const disabled = options.disabledAgents || [];

  // ═══════════════════════════════════════════════════════════
  // PHASE 1: Query Intelligence (First)
  // ═══════════════════════════════════════════════════════════

  think("query-intelligence", "Expanding query into a structured research blueprint...", "query-intelligence-agent");

  emit({ agent: "query-intelligence-agent", status: "running", model: "moonshotai/kimi-k2-thinking", provider: "nvidia" });

  const queryResult = await (disabled.includes("query-intelligence-agent")
    ? Promise.resolve({
        agent: "query-intelligence-agent",
        output: { intent: "general" as const, subtopics: [], search_terms: [] },
        model_used: "none",
        provider: "none",
        durationMs: 0,
        isFallback: false,
        error: "skipped",
        enhanced_query: query,
        subtopics: [],
        search_terms: [],
      } as AgentResult & { enhanced_query: string; subtopics: string[]; search_terms: string[] }).then((r) => { emit({ agent: r.agent, status: "skipped" }); return r; })
    : runQueryIntelligenceAgent(query, options.mode, apiKeys).then(r => {
        emit({
          agent: "query-intelligence-agent",
          status: r.error ? "failed" : "done",
          model: r.model_used,
          provider: r.provider,
          durationMs: r.durationMs,
          isFallback: r.isFallback,
          error: r.error,
        });
        return r;
      }));

  const qr = queryResult as AgentResult & { enhanced_query?: string; subtopics?: string[]; search_terms?: string[] };
  const enhancedQuery = qr.enhanced_query || queryResult.output?.enhanced_query || query;
  const subtopics = qr.subtopics || (queryResult.output?.subtopics as string[]) || [];
  const searchTerms = qr.search_terms || (queryResult.output?.search_terms as string[]) || [];

  if (!queryResult.error || queryResult.error !== "skipped") {
    think(
      "query-intelligence",
      `Identified intent: "${queryResult.output?.intent ?? "general"}". Generated ${subtopics.length} subtopics and ${searchTerms.length} search terms.`,
      "query-intelligence-agent"
    );
  }

  // ═══════════════════════════════════════════════════════════
  // PHASE 1.5: Web Search (Second, using optimized terms)
  // ═══════════════════════════════════════════════════════════

  think(
    "web-search",
    `Searching for: ${searchTerms.slice(0, 4).map(t => `"${t}"`).join(", ")}${searchTerms.length > 4 ? "..." : ""}`,
    "web-search-agent"
  );

  emit({ agent: "web-search-agent", status: "running", model: "abacusai/dracarys-llama-3.1-70b-instruct", provider: "nvidia" });

  const searchResult = await ((MODE_CONFIG[options.mode].maxSources > 0 && !disabled.includes("web-search-agent")) ? runWebSearchAgent(
    { query, enhanced_query: enhancedQuery, search_terms: searchTerms },
    options.mode,
    apiKeys
  ).then(r => {
    emit({
      agent: "web-search-agent",
      status: r.error ? "failed" : "done",
      model: r.model_used,
      provider: r.provider,
      durationMs: r.durationMs,
      isFallback: r.isFallback,
      error: r.error,
    });
    return r;
  }) : Promise.resolve({
    agent: "web-search-agent",
    output: { sources: [], summaries: [], raw_results: [] },
    model_used: "none",
    provider: "none",
    durationMs: 0,
    isFallback: false,
    error: disabled.includes("web-search-agent") ? "skipped" : undefined,
  } as AgentResult).then((r) => { 
      if (disabled.includes("web-search-agent")) emit({ agent: r.agent, status: "skipped" }); 
      return r; 
  }));

  // Build shared AgentContext from Phase 1 outputs
  const webResults: SearchResult[] = (searchResult.output.raw_results as SearchResult[]) ?? [];

  if (webResults.length > 0) {
    const domains = [...new Set(webResults.map(r => r.domain))].slice(0, 4);
    think(
      "web-search",
      `Found ${webResults.length} relevant sources from ${domains.join(", ")}.`,
      "web-search-agent"
    );
  }

  const intent = (queryResult.output.intent as ResearchResult["metadata"]["intent"]) ||
    enhanceQuery(query, options.mode).intent;

  const agentContext: AgentContext = {
    query,
    enhanced_query: enhancedQuery,
    intent,
    subtopics,
    search_terms: searchTerms,
    web_results: webResults,
    file_context: options.files || [],
    conversationHistory: options.conversationHistory,
  };

  // ═══════════════════════════════════════════════════════════
  // PHASE 2: Analysis + Summary + Coding + Fact-Check (parallel)
  // ═══════════════════════════════════════════════════════════

  think("parallel-agents", "Launching parallel analysis agents...");

  emit({ agent: "analysis-agent", status: "running", model: "nvidia/nemotron-3-super-120b-a12b", provider: "nvidia" });
  think("analysis", "Running deep multi-dimensional analysis on collected sources...", "analysis-agent");

  emit({ agent: "summary-agent", status: "running", model: "minimaxai/minimax-m2.7", provider: "nvidia" });
  think("summary", "Generating executive briefing and key themes...", "summary-agent");

  emit({ agent: "coding-agent", status: intent === "coding" ? "running" : "skipped", model: "qwen/qwen3-coder-480b-a35b-instruct", provider: "nvidia" });
  if (intent === "coding") {
    think("coding", "Generating production-quality code with documentation...", "coding-agent");
  }

  emit({ agent: "fact-check-agent", status: "running", model: "mistralai/mistral-large-3-675b-instruct-2512", provider: "nvidia" });
  think("fact-check", "Cross-referencing claims and validating source reliability...", "fact-check-agent");

  const skipAgent = (agentName: AgentName, basePromise: Promise<AgentResult>) => {
    if (disabled.includes(agentName)) {
      const skippedR: AgentResult = {
        agent: agentName,
        output: {},
        model_used: "none",
        provider: "none",
        durationMs: 0,
        isFallback: false,
        error: "skipped",
      };
      emit({ agent: agentName, status: "skipped" });
      return Promise.resolve(skippedR);
    }
    return basePromise;
  };

  const [analysisResult, summaryResult, codingResult, factCheckResult] = await Promise.all([
    skipAgent("analysis-agent", runAnalysisAgent(agentContext, apiKeys).then(r => {
      emit({
        agent: "analysis-agent",
        status: r.error ? "failed" : "done",
        model: r.model_used,
        provider: r.provider,
        durationMs: r.durationMs,
        isFallback: r.isFallback,
        error: r.error,
      });
      if (!r.error) {
        const patterns = (r.output.patterns as string[])?.length ?? 0;
        think("analysis", `Deep analysis complete${patterns > 0 ? `. Identified ${patterns} key patterns.` : "."}`, "analysis-agent");
      }
      return r;
    })),
    skipAgent("summary-agent", runSummaryAgent(agentContext, apiKeys).then(r => {
      emit({
        agent: "summary-agent",
        status: r.error ? "failed" : "done",
        model: r.model_used,
        provider: r.provider,
        durationMs: r.durationMs,
        isFallback: r.isFallback,
        error: r.error,
      });
      if (!r.error) {
        const keyPoints = (r.output.key_points as string[])?.length ?? 0;
        think("summary", `Executive briefing complete${keyPoints > 0 ? `. Distilled ${keyPoints} key themes.` : "."}`, "summary-agent");
      }
      return r;
    })),
    skipAgent("coding-agent", runCodingAgent(agentContext, apiKeys).then(r => {
      emit({
        agent: "coding-agent",
        status: r.error === "skipped" ? "skipped" : r.error ? "failed" : "done",
        model: r.model_used,
        provider: r.provider,
        durationMs: r.durationMs,
        isFallback: r.isFallback,
        error: r.error,
      });
      if (!r.error && r.error !== "skipped") {
        think("coding", `Code generation complete. Language: ${(r.output.language as string) ?? "auto-detected"}.`, "coding-agent");
      }
      return r;
    })),
    skipAgent("fact-check-agent", runFactCheckAgent(agentContext, apiKeys).then(r => {
      emit({
        agent: "fact-check-agent",
        status: r.error ? "failed" : "done",
        model: r.model_used,
        provider: r.provider,
        durationMs: r.durationMs,
        isFallback: r.isFallback,
        error: r.error,
      });
      if (!r.error) {
        const verified = (r.output.verified_claims as string[])?.length ?? 0;
        const contradictions = (r.output.contradictions as string[])?.length ?? 0;
        think("fact-check", `Verified ${verified} claims${contradictions > 0 ? `, found ${contradictions} contradictions` : ""}.`, "fact-check-agent");
      }
      return r;
    })),
  ]);

  // ═══════════════════════════════════════════════════════════
  // PHASE 3: Report Agent — Aggregate Everything
  // ═══════════════════════════════════════════════════════════

  think("report-synthesis", "Synthesizing all agent findings into a structured research report...", "report-agent");

  emit({ agent: "report-agent", status: "running", model: "moonshotai/kimi-k2-thinking", provider: "nvidia" });

  const sources = webResults.map((r, i) => searchResultToSource(r, i));

  const reportResult = await runReportAgent(
    agentContext,
    {
      query,
      enhanced_query: enhancedQuery,
      queryOutput: queryResult.output,
      searchOutput: searchResult.output,
      analysisOutput: analysisResult.output,
      summaryOutput: summaryResult.output,
      factCheckOutput: factCheckResult.output,
      codingOutput: codingResult.output,
      sources,
    },
    apiKeys,
    onChunk
  ).then(r => {
    emit({
      agent: "report-agent",
      status: r.error ? "failed" : "done",
      model: r.model_used,
      provider: r.provider,
      durationMs: r.durationMs,
      isFallback: r.isFallback,
      error: r.error,
    });
    if (!r.error) {
      think("report-synthesis", "Report generation complete. Assembling final output...", "report-agent");
    }
    return r;
  });

  const reportOutput = reportResult.output as Record<string, unknown>;

  // ═══════════════════════════════════════════════════════════
  // Build final ResearchResult
  // ═══════════════════════════════════════════════════════════

  const allAgentResults = [
    queryResult,
    searchResult,
    analysisResult,
    summaryResult,
    codingResult,
    factCheckResult,
    reportResult,
  ];

  const agentTrace: AgentStatusEvent[] = allAgentResults.map(r => ({
    agent: r.agent,
    status: r.error === "skipped" ? "skipped" : r.error ? "failed" : "done",
    model: r.model_used,
    provider: r.provider,
    durationMs: r.durationMs,
    isFallback: r.isFallback,
  }));

  const totalDuration = Date.now() - startTime;

  const finalMetadata: ResearchResult["metadata"] = {
    model: reportResult.model_used,
    provider: reportResult.provider,
    searchProvider: (searchResult.provider as string) || "nvidia",
    intent,
    workflowMode: "research",
    switchedFromPlanning: options.workflowMode === "planning",
    tokensUsed: 0,
    durationMs: totalDuration,
    isFallback: reportResult.isFallback,
    agentTrace,
  };

  const assembledResult = buildAssembledResearchResult(
    {
      context: agentContext,
      sources,
      searchResults: webResults,
      queryResult,
      searchResult,
      analysisResult,
      summaryResult,
      factCheckResult,
      codingResult,
      reportResult,
    },
    finalMetadata
  );

  const shouldAssemble = shouldUseAssembledReport(reportOutput);

  if (onChunk) {
    onChunk("", true);
  }

  if (shouldAssemble) {
    return assembledResult;
  }

  return {
    ...assembledResult,
    overview: String(reportOutput.overview ?? assembledResult.overview),
    keyInsights: (reportOutput.key_insights as string[] | undefined) ?? assembledResult.keyInsights,
    details: String(reportOutput.details ?? assembledResult.details),
    comparison: String(reportOutput.comparison ?? assembledResult.comparison),
    expertInsights: (reportOutput.expert_insights as string[] | undefined) ?? assembledResult.expertInsights,
    conclusion: String(reportOutput.conclusion ?? assembledResult.conclusion),
    factCheck: String(reportOutput.fact_check_summary ?? assembledResult.factCheck ?? ""),
    metadata: finalMetadata,
    agentResults: allAgentResults,
  };
}

// ── Legacy single-model path (kept for non-streaming fallback) ──

const LEGACY_SYSTEM_PROMPT = `You are an advanced AI research agent. Your job is to generate structured, accurate, and insightful research reports.

OUTPUT FORMAT:
You MUST respond with ONLY a valid JSON object in this exact structure:
{
  "overview": "A concise 2-3 sentence summary",
  "key_insights": ["insight 1", "insight 2", "insight 3"],
  "details": "In-depth analysis with supporting evidence.",
  "comparison": "Structured comparison if applicable, empty string otherwise.",
  "expert_insights": ["Non-obvious insight 1", "Practical implication"],
  "conclusion": "Final takeaway with actionable recommendation (1-2 sentences)",
  "reference_notes": ["Brief note on source quality"]
}`;

export async function runResearchLegacy(
  query: string,
  options: ResearchOptions,
  apiKeys: ApiKeys,
  onChunk?: StreamCallback
): Promise<ResearchResult> {
  const startTime = Date.now();
  const enhanced = enhanceQuery(query, options.mode);
  const modelChain = selectModelByUserId(options.userModelId, query);
  let activeModel = modelChain.primary;
  const failedModels = new Set<string>();

  const { buildContext: bc } = await import("./context-builder");
  const { searchWithFallback } = await import("./search-router");
  const { normalizeResponse } = await import("./response-normalizer");

  const { results: searchResults, provider: searchProvider } = await searchWithFallback(
    { query: enhanced.enhanced, mode: options.mode, maxResults: options.maxSources ?? 6 },
    apiKeys
  );

  const context = bc(searchResults, options.files || [], options.maxTokens ?? TOKEN_LIMITS.contextWindow, enhanced.enhanced);

  const system = LEGACY_SYSTEM_PROMPT;
  const user = `Query: ${query}\n\nSources:\n${context.text}\n\nReturn ONLY valid JSON.`;

  let llmResponse = null as Awaited<ReturnType<typeof generateAIResponse>> | null;

  while (true) {
    try {
      llmResponse = await generateAIResponse({
        model: activeModel.id,
        provider: activeModel.provider,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        stream: !!onChunk,
        apiKeys,
        onChunk,
      });
      break;
    } catch (err) {
      const researchErr = classifyError(err, activeModel.provider);
      failedModels.add(activeModel.id);
      if (!researchErr.retryable) throw researchErr;
      const nextModel = getNextFallback(modelChain, failedModels);
      if (!nextModel) throw researchErr;
      activeModel = nextModel;
    }
  }

  return normalizeResponse(llmResponse!.content, searchResults, {
    model: activeModel.id,
    provider: activeModel.provider,
    searchProvider,
    intent: enhanced.intent,
    tokensUsed: llmResponse!.usage.total_tokens || context.estimatedTokens,
    durationMs: Date.now() - startTime,
    isFallback: activeModel.id !== modelChain.primary.id,
  });
}
