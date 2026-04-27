import crypto from "crypto";
import type {
  ResearchResult,
  OrchestratorInput,
  ResearchPlan,
  SectionResult,
  AgentContext,
  SearchResult
} from "./types";
import { runQueryIntelligenceAgent } from "./agents/query-intelligence-agent";
import { selectModelsForPlan } from "./agents/model-selector-agent";
import { runSectionAgent } from "./agents/section-research-agent";
import { runReportAgent } from "./agents/report-agent";

// ── Mock DB & Cache (As requested in steps) ───────────────────────────

async function getCachedResponse(queryHash: string): Promise<ResearchResult | null> {
  // Simulate Redis/Upstash check
  return null;
}

async function setCachedResponse(queryHash: string, report: ResearchResult, ttl: number): Promise<void> {
  // Simulate Redis set
}

async function buildMemoryContext(userId?: string): Promise<string> {
  // Simulate Supabase fetch + Redis cache (5 min TTL)
  return userId ? "User prefers concise technical summaries." : "";
}

async function saveReport(userId: string | undefined, conversationId: string | undefined, report: ResearchResult): Promise<void> {
  // Simulate Supabase save
}

function generateHash(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

// ── Timeout Helper ──────────────────────────────────────────────────

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Agent timeout after ${ms}ms`)), ms)
    )
  ]);
};

// ── Report Synthesis Agent Wrapper ───────────────────────────────────

async function runReportSynthesisAgent(params: {
  plan: ResearchPlan;
  completedSections: SectionResult[];
  originalQuery: string;
  userMemory: string;
  apiKeys: any;
}): Promise<ResearchResult> {
  const { plan, completedSections, originalQuery, apiKeys } = params;
  
  // Aggregate all web results across sections
  const dedupedWebResults: SearchResult[] = [];
  const seenUrls = new Set<string>();
  for (const sec of completedSections) {
    for (const src of sec.sourcesUsed) {
      if (!seenUrls.has(src.url)) {
        seenUrls.add(src.url);
        dedupedWebResults.push({
          title: src.title,
          url: src.url,
          snippet: "",
          domain: "",
          relevanceScore: src.relevance === "high" ? 0.9 : 0.5,
        });
      }
    }
  }

  const agentContext: AgentContext = {
    query: originalQuery,
    enhanced_query: originalQuery,
    intent: "research",
    subtopics: plan.dynamicSections.map(s => s.sectionTitle),
    search_terms: [],
    web_results: dedupedWebResults,
    file_context: [],
  };

  const sectionSummary = completedSections.map(s =>
    `[${s.agentRole}] ${s.sectionTitle}:\n${s.content}\nKey Findings: ${s.keyFindings.join("; ")}`
  ).join("\n\n---\n\n");

  const reportResult = await runReportAgent(
    agentContext,
    {
      query: originalQuery,
      enhanced_query: originalQuery,
      queryOutput: { researchPlan: plan, researchType: "general" },
      searchOutput: { sources: [], summaries: [], raw_results: dedupedWebResults },
      analysisOutput: { analysis: sectionSummary, patterns: [], caveats: [], comparison: "" },
      summaryOutput: { overview: plan.reportTitle, key_points: [], quick_facts: [], action_items: [] },
      factCheckOutput: { verified_claims: [], unverified_claims: [], contradictions: [], warnings: [], reliability_score: 100, reliability_label: "High", fact_check_summary: "" },
      codingOutput: {},
      sources: dedupedWebResults.map((r, i) => ({
        id: String(i + 1),
        title: r.title,
        snippet: r.snippet,
        url: r.url,
        domain: r.domain,
      })),
    },
    apiKeys,
    undefined
  );

  return {
    overview: String((reportResult.output as any).overview || plan.reportTitle),
    keyInsights: ((reportResult.output as any).key_insights as string[]) || [],
    details: String((reportResult.output as any).details || sectionSummary),
    comparison: String((reportResult.output as any).comparison || ""),
    expertInsights: ((reportResult.output as any).expert_insights as string[]) || [],
    conclusion: String((reportResult.output as any).conclusion || ""),
    sources: dedupedWebResults.map((r, i) => ({
      id: String(i + 1),
      title: r.title,
      snippet: r.snippet,
      url: r.url,
      domain: r.domain,
    })),
    references: [],
    metadata: {
      model: reportResult.model_used,
      provider: reportResult.provider,
      searchProvider: "multi",
      intent: "research",
      tokensUsed: 0,
      durationMs: reportResult.durationMs,
    }
  };
}

// ── Orchestrator ────────────────────────────────────────────────────

export async function runResearchOrchestrator(input: OrchestratorInput): Promise<ResearchResult> {
  const { userQuery, userId, conversationId, researchMode, apiKeys, onProgress } = input;

  // ━━━ PHASE 1: INITIALIZATION (Sequential) ━━━

  // Step 1: Cache Check
  const queryHash = generateHash(userQuery + (researchMode || ""));
  const cachedReport = await getCachedResponse(queryHash);
  if (cachedReport) {
    onProgress({ phase: 3, percent: 100, status: "Returning cached report...", type: "complete" });
    return cachedReport;
  }

  // Step 2: Memory Fetch
  const userMemory = await buildMemoryContext(userId);

  // Step 3: Query Intelligence Agent
  onProgress({ phase: 1, percent: 5, status: "Analyzing query and building research plan..." });
  const searchMode = researchMode === "deep" ? "deep" : "pro";
  const queryResult = await runQueryIntelligenceAgent(userQuery, searchMode, apiKeys, {
    userQuery,
    userMemory,
    researchMode,
  });

  if (queryResult.error || !queryResult.plan) {
    throw new Error(queryResult.error || "Failed to generate research plan");
  }

  const plan = queryResult.plan;
  onProgress({ phase: 1, percent: 10, status: "Research plan created", type: "plan_ready" });

  // Step 4: Model Selection
  const modelAssignments = await selectModelsForPlan(plan, userQuery, apiKeys.nvidiaKey);
  onProgress({ phase: 1, percent: 15, status: "AI models assigned", type: "models_assigned" });

  // ━━━ PHASE 2: PARALLEL RESEARCH (All agents simultaneous) ━━━

  onProgress({ phase: 2, percent: 18, status: "Launching parallel research agents..." });
  const totalAgents = plan.dynamicSections.length;
  let completedCount = 0;

  const agentPromises = plan.dynamicSections.map((section, index) => {
    const modelAssignment = modelAssignments.find(m => m.sectionId === section.id) || {
      sectionId: section.id,
      agentRole: section.agentRole,
      primaryModel: { platform: "nvidia", modelId: "abacusai/dracarys-llama-3.1-70b-instruct" },
      fallbackModel: { platform: "openrouter", modelId: "meta-llama/llama-3.3-70b-instruct:free" },
      taskType: "balanced_research",
      maxTokens: 8000,
    };
    
    // Applying 90s individual timeout
    return withTimeout(runSectionAgent({
      section,
      assignedModel: modelAssignment,
      originalQuery: userQuery,
      globalSearchContext: plan.globalSearchContext,
      apiKeys,
      onProgress: (agentProgress) => {
        if (agentProgress.status === "complete") completedCount++;
        onProgress({
          phase: 2,
          type: "agent_update",
          sectionId: section.id,
          agentRole: section.agentRole,
          status: agentProgress.status,
          percent: 15 + Math.round((completedCount / totalAgents) * 55)
        });
      }
    }), 90_000);
  });

  const results = await Promise.allSettled(agentPromises);

  const completedSections = results
    .filter((r): r is PromiseFulfilledResult<SectionResult> => r.status === "fulfilled")
    .map(r => r.value);

  const failedSections = results
    .map((r, i) => r.status === "rejected" ? { sectionId: plan.dynamicSections[i].id, error: r.reason } : null)
    .filter(Boolean);

  onProgress({ 
    phase: 2, 
    percent: 70,
    status: `Research complete: ${completedSections.length}/${plan.dynamicSections.length} sections`,
    type: "phase_complete",
    completedSections: completedSections.map(s => s.sectionTitle),
    failedSections: failedSections.length
  });

  // ━━━ PHASE 3: REPORT SYNTHESIS (Sequential) ━━━

  // Step 6: Report Synthesis Agent
  onProgress({ phase: 3, percent: 80, status: "Compiling final report..." });
  const finalReport = await runReportSynthesisAgent({
    plan,
    completedSections,
    originalQuery: userQuery,
    userMemory,
    apiKeys
  });

  // Step 7: Save & Cache
  onProgress({ phase: 3, percent: 95, status: "Saving report..." });
  await saveReport(userId, conversationId, finalReport);
  await setCachedResponse(queryHash, finalReport, 3600);

  // Step 8: Return Complete Report
  onProgress({ phase: 3, percent: 100, status: "Report ready!", type: "complete" });
  return finalReport;
}
