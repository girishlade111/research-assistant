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
  OrchestratorInput,
  OrchestratorProgressEvent,
  SectionResult,
  ResearchPlan,
  AgentModelAssignment,
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
import { selectModelsForPlan } from "./agents/model-selector-agent";
import { runSectionAgent } from "./agents/section-research-agent";

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

// ══════════════════════════════════════════════════════════════
// Simple Chat (unchanged — used by route.ts for chat mode)
// ══════════════════════════════════════════════════════════════

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

// ══════════════════════════════════════════════════════════════
// New Parallel Research Orchestrator
// ══════════════════════════════════════════════════════════════

export async function runResearchOrchestrator(input: OrchestratorInput): Promise<ResearchResult> {
  const startTime = Date.now();
  const {
    userQuery,
    researchMode,
    mode = researchMode === "deep" ? "deep" : "pro",
    files = [],
    conversationHistory,
    apiKeys,
    onProgress,
    onChunk,
    onAgentStatus,
    onThinking,
  } = input;

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

  const emit = (event: AgentStatusEvent) => {
    onAgentStatus?.(event);
  };

  // ═══════════════════════════════════════════════════════════
  // PHASE 1: INITIALIZATION (Sequential)
  // ═══════════════════════════════════════════════════════════

  // ── Step 1: Query Intelligence Agent ─────────────────────
  onProgress({ phase: 1, percent: 5, status: "Analyzing query and building research plan..." });
  think("query-intelligence", "Expanding query into a structured research blueprint...", "query-intelligence-agent");
  emit({ agent: "query-intelligence-agent", status: "running", model: "mistralai/mistral-large-3-675b-instruct-2512", provider: "nvidia" });

  const queryResult = await runQueryIntelligenceAgent(userQuery, mode, apiKeys, {
    userQuery,
    userMemory: "",
    researchMode,
  });

  emit({
    agent: "query-intelligence-agent",
    status: queryResult.error ? "failed" : "done",
    model: queryResult.model_used,
    provider: queryResult.provider,
    durationMs: queryResult.durationMs,
    isFallback: queryResult.isFallback,
    error: queryResult.error,
  });

  const researchPlan: ResearchPlan = queryResult.plan;
  const enhancedQuery = queryResult.enhanced_query;
  const subtopics = queryResult.subtopics;
  const searchTerms = queryResult.search_terms;

  think(
    "query-intelligence",
    `Research plan created: "${researchPlan.reportTitle}" with ${researchPlan.dynamicSections.length} sections, ~${researchPlan.estimatedPages} pages.`,
    "query-intelligence-agent"
  );

  onProgress({
    phase: 1,
    percent: 10,
    status: "Research plan created",
    type: "plan_ready",
  });

  // ── Step 2: Model Selection ──────────────────────────────
  const modelAssignments = await selectModelsForPlan(
    researchPlan,
    userQuery,
    apiKeys.nvidiaKey
  );

  onProgress({
    phase: 1,
    percent: 15,
    status: `AI models assigned for ${modelAssignments.length} research sections`,
    type: "models_assigned",
  });

  think("model-selection", `Assigned specialized models to ${modelAssignments.length} sections.`);

  // ═══════════════════════════════════════════════════════════
  // PHASE 2: PARALLEL RESEARCH (All section agents simultaneous)
  // ═══════════════════════════════════════════════════════════

  onProgress({ phase: 2, percent: 18, status: "Launching parallel research agents..." });
  think("parallel-agents", `Launching ${researchPlan.dynamicSections.length} section agents in parallel...`);

  let completedCount = 0;
  const totalAgents = researchPlan.dynamicSections.length;

  const agentPromises = researchPlan.dynamicSections.map((section) => {
    const assignment = modelAssignments.find(m => m.sectionId === section.id);
    const fallbackAssignment: AgentModelAssignment = assignment ?? {
      sectionId: section.id,
      agentRole: section.agentRole,
      primaryModel: { platform: "nvidia", modelId: "abacusai/dracarys-llama-3.1-70b-instruct" },
      fallbackModel: { platform: "openrouter", modelId: "meta-llama/llama-3.3-70b-instruct:free" },
      taskType: "balanced_research",
      maxTokens: 16384,
    };

    return runSectionAgent({
      section,
      assignedModel: fallbackAssignment,
      originalQuery: userQuery,
      globalSearchContext: researchPlan.globalSearchContext,
      apiKeys,
      onProgress: (agentProgress) => {
        if (agentProgress.status === "complete") {
          completedCount++;
        }
        onProgress({
          phase: 2,
          type: "agent_update",
          sectionId: section.id,
          agentRole: section.agentRole,
          percent: 15 + Math.round((completedCount / totalAgents) * 55),
          status: `${section.agentRole}: ${agentProgress.status}`,
        });
      },
    });
  });

  const settledResults = await Promise.allSettled(agentPromises);

  const completedSections: SectionResult[] = [];
  const failedSections: { sectionId: string; error: string }[] = [];

  settledResults.forEach((result, i) => {
    const section = researchPlan.dynamicSections[i];
    if (result.status === "fulfilled") {
      completedSections.push(result.value);
    } else {
      const errMsg = result.reason instanceof Error ? result.reason.message : String(result.reason);
      failedSections.push({ sectionId: section.id, error: errMsg });
      console.warn(`[orchestrator] Section "${section.sectionTitle}" failed: ${errMsg}`);
    }
  });

  onProgress({
    phase: 2,
    percent: 70,
    status: `Research complete: ${completedSections.length}/${totalAgents} sections`,
    type: "phase_complete",
    completedSections: completedSections.map(s => s.sectionTitle),
    failedSections: failedSections.length,
  });

  think(
    "parallel-agents",
    `${completedSections.length} of ${totalAgents} section agents completed.${failedSections.length > 0 ? ` ${failedSections.length} failed.` : ""}`
  );

  // ═══════════════════════════════════════════════════════════
  // PHASE 3: REPORT SYNTHESIS (Sequential)
  // ═══════════════════════════════════════════════════════════

  onProgress({ phase: 3, percent: 75, status: "Compiling final report..." });
  think("report-synthesis", "Synthesizing all section findings into a structured research report...", "report-agent");
  emit({ agent: "report-agent", status: "running", model: "moonshotai/kimi-k2-thinking", provider: "nvidia" });

  // Build AgentContext for backward compatibility with report-agent
  const intent = (queryResult.output.researchType as ResearchResult["metadata"]["intent"]) ?? "general";

  const allWebResults: SearchResult[] = completedSections.flatMap(s =>
    s.sourcesUsed.map((src, idx) => ({
      title: src.title,
      url: src.url,
      snippet: "",
      domain: extractDomain(src.url),
      relevanceScore: src.relevance === "high" ? 0.9 : src.relevance === "medium" ? 0.7 : 0.5,
    }))
  );
  // Deduplicate by URL
  const seenUrls = new Set<string>();
  const dedupedWebResults = allWebResults.filter(r => {
    if (seenUrls.has(r.url)) return false;
    seenUrls.add(r.url);
    return true;
  });

  const agentContext: AgentContext = {
    query: userQuery,
    enhanced_query: enhancedQuery,
    intent: mapResearchTypeToIntent(intent),
    subtopics,
    search_terms: searchTerms,
    web_results: dedupedWebResults,
    file_context: files,
    conversationHistory,
  };

  const sources = dedupedWebResults.map((r, i) => searchResultToSource(r, i));

  // Build synthesis inputs from section results
  const sectionSummary = completedSections.map(s =>
    `[${s.agentRole}] ${s.sectionTitle}:\n${s.content.slice(0, 2000)}\nKey Findings: ${s.keyFindings.join("; ")}`
  ).join("\n\n---\n\n");

  const analysisOutput: Record<string, unknown> = {
    analysis: sectionSummary,
    patterns: completedSections.flatMap(s => s.keyFindings),
    caveats: completedSections
      .filter(s => s.dataQuality === "limited")
      .map(s => `Data limitations in "${s.sectionTitle}" (confidence: ${s.confidenceScore})`),
    comparison: "",
  };

  const summaryOutput: Record<string, unknown> = {
    overview: researchPlan.reportTitle,
    key_points: completedSections.flatMap(s => s.keyFindings).slice(0, 12),
    quick_facts: completedSections.flatMap(s => s.dataPoints.map(dp => `${dp.metric}: ${dp.value}${dp.year ? ` (${dp.year})` : ""}`)),
    action_items: [],
  };

  const factCheckOutput: Record<string, unknown> = {
    verified_claims: completedSections.filter(s => s.confidenceScore >= 0.7).flatMap(s => s.keyFindings),
    unverified_claims: completedSections.filter(s => s.confidenceScore < 0.5).flatMap(s => s.keyFindings),
    contradictions: [],
    warnings: failedSections.map(f => `Section failed: ${f.sectionId} — ${f.error}`),
    reliability_score: completedSections.length > 0
      ? Math.round(completedSections.reduce((sum, s) => sum + s.confidenceScore, 0) / completedSections.length * 100)
      : 0,
    reliability_label: completedSections.length > 0
      ? (completedSections.reduce((sum, s) => sum + s.confidenceScore, 0) / completedSections.length >= 0.7 ? "High" : "Moderate")
      : "Low",
    fact_check_summary: `Report based on ${completedSections.length} completed sections with ${completedSections.reduce((sum, s) => sum + s.sourcesUsed.length, 0)} total sources.`,
  };

  // Synthesize via report-agent
  const reportResult = await runReportAgent(
    agentContext,
    {
      query: userQuery,
      enhanced_query: enhancedQuery,
      queryOutput: { ...queryResult.output, researchPlan },
      searchOutput: { sources, summaries: [], raw_results: dedupedWebResults },
      analysisOutput,
      summaryOutput,
      factCheckOutput,
      codingOutput: {},
      sources,
    },
    apiKeys,
    onChunk
  );

  emit({
    agent: "report-agent",
    status: reportResult.error ? "failed" : "done",
    model: reportResult.model_used,
    provider: reportResult.provider,
    durationMs: reportResult.durationMs,
    isFallback: reportResult.isFallback,
    error: reportResult.error,
  });

  if (!reportResult.error) {
    think("report-synthesis", "Report generation complete. Assembling final output...", "report-agent");
  }

  onProgress({ phase: 3, percent: 95, status: "Assembling final report..." });

  // ═══════════════════════════════════════════════════════════
  // Build final ResearchResult
  // ═══════════════════════════════════════════════════════════

  const reportOutput = reportResult.output as Record<string, unknown>;

  // Build pseudo-AgentResults for compatibility with report-assembler
  const queryAgentResult: AgentResult = queryResult;
  const searchAgentResult: AgentResult = {
    agent: "web-search-agent",
    output: { sources, summaries: [], raw_results: dedupedWebResults },
    model_used: "multi-section",
    provider: "multi",
    durationMs: 0,
    isFallback: false,
  };
  const analysisAgentResult: AgentResult = {
    agent: "analysis-agent",
    output: analysisOutput,
    model_used: "multi-section",
    provider: "multi",
    durationMs: completedSections.reduce((sum, s) => sum + s.durationMs, 0),
    isFallback: false,
  };
  const summaryAgentResult: AgentResult = {
    agent: "summary-agent",
    output: summaryOutput,
    model_used: "multi-section",
    provider: "multi",
    durationMs: 0,
    isFallback: false,
  };
  const codingAgentResult: AgentResult = {
    agent: "coding-agent",
    output: {},
    model_used: "none",
    provider: "none",
    durationMs: 0,
    isFallback: false,
    error: "skipped",
  };
  const factCheckAgentResult: AgentResult = {
    agent: "fact-check-agent",
    output: factCheckOutput,
    model_used: "multi-section",
    provider: "multi",
    durationMs: 0,
    isFallback: false,
  };

  const allAgentResults = [
    queryAgentResult,
    searchAgentResult,
    analysisAgentResult,
    summaryAgentResult,
    codingAgentResult,
    factCheckAgentResult,
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
    searchProvider: "multi",
    intent: mapResearchTypeToIntent(intent),
    workflowMode: "research",
    switchedFromPlanning: false,
    tokensUsed: 0,
    durationMs: totalDuration,
    isFallback: reportResult.isFallback,
    agentTrace,
  };

  const assembledResult = buildAssembledResearchResult(
    {
      context: agentContext,
      sources,
      searchResults: dedupedWebResults,
      queryResult: queryAgentResult,
      searchResult: searchAgentResult,
      analysisResult: analysisAgentResult,
      summaryResult: summaryAgentResult,
      factCheckResult: factCheckAgentResult,
      codingResult: codingAgentResult,
      reportResult,
    },
    finalMetadata
  );

  const shouldAssemble = shouldUseAssembledReport(reportOutput);

  if (onChunk) {
    onChunk("", true);
  }

  onProgress({
    phase: 3,
    percent: 100,
    status: "Report ready!",
    type: "complete",
    completedSections: completedSections.map(s => s.sectionTitle),
    failedSections: failedSections.length,
  });

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

// ══════════════════════════════════════════════════════════════
// Main Multi-Agent Orchestrator (backward-compatible wrapper)
// Called by route.ts — delegates to new parallel engine
// ══════════════════════════════════════════════════════════════

export async function runResearch(
  query: string,
  options: ResearchOptions,
  apiKeys: ApiKeys,
  onChunk?: StreamCallback,
  onAgentStatus?: AgentStatusCallback,
  onThinking?: ThinkingCallback
): Promise<ResearchResult> {
  return runResearchOrchestrator({
    userQuery: query,
    researchMode: options.mode === "deep" ? "deep" : "fast",
    mode: options.mode,
    files: options.files,
    conversationHistory: options.conversationHistory,
    disabledAgents: options.disabledAgents,
    apiKeys,
    onProgress: (event) => {
      // Map progress events to agent status events for backward compat
      if (event.type === "agent_update" && onAgentStatus && event.sectionId) {
        // Section agents don't map 1:1 to legacy AgentName, so we emit
        // generic thinking steps instead
        onThinking?.({
          id: `t-${Date.now()}-sec-${event.sectionId}`,
          phase: "section-research",
          text: event.status,
          timestamp: Date.now(),
        });
      }
    },
    onChunk,
    onAgentStatus,
    onThinking,
  });
}

// ══════════════════════════════════════════════════════════════
// Legacy single-model path (kept for non-streaming fallback)
// ══════════════════════════════════════════════════════════════

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

// ── Helpers ───────────────────────────────────────────────────

function extractDomain(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
}

function mapResearchTypeToIntent(researchType: unknown): ResearchResult["metadata"]["intent"] {
  const mapping: Record<string, ResearchResult["metadata"]["intent"]> = {
    financial: "research",
    technical: "research",
    scientific: "research",
    news: "factual",
    comparative: "comparison",
    general: "general",
  };
  return mapping[String(researchType)] ?? "general";
}
