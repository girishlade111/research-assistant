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
import { runReportSynthesisAgent } from "./agents/report-synthesis-agent";

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

// ── Orchestrator ────────────────────────────────────────────────────

export async function runResearchOrchestrator(input: OrchestratorInput): Promise<ResearchResult> {
  const { userQuery, userId, conversationId, researchMode, apiKeys, onProgress } = input;

  // ━━━ PHASE 1: INITIALIZATION (Sequential) ━━━
  console.log('[Orchestrator]', { phase: 'INIT', status: 'starting', query: userQuery, researchMode, timestamp: Date.now() });

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
  console.log('[Orchestrator]', {
    phase: 'PLAN_READY',
    status: 'plan_created',
    sectionsCount: plan.dynamicSections.length,
    researchType: plan.researchType,
    estimatedPages: plan.estimatedPages,
    timestamp: Date.now(),
  });
  onProgress({ phase: 1, percent: 10, status: "Research plan created", type: "plan_ready" });

  // Step 4: Model Selection
  const modelAssignments = await selectModelsForPlan(plan, userQuery, apiKeys.nvidiaKey);
  onProgress({ phase: 1, percent: 15, status: "AI models assigned", type: "models_assigned" });

  // ━━━ PHASE 2: PARALLEL RESEARCH (All agents simultaneous) ━━━
  console.log('[Orchestrator]', { phase: 'PARALLEL_RESEARCH', status: 'launching_agents', agentCount: plan.dynamicSections.length, timestamp: Date.now() });

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

  console.log('[AllAgents COMPLETE]', {
    total: results.length,
    fulfilled: results.filter(r => r.status === 'fulfilled').length,
    rejected: results.filter(r => r.status === 'rejected').length,
    rejectedReasons: results
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      .map(r => r.reason?.message ?? String(r.reason)),
    timestamp: Date.now(),
  });

  const completedSections = results
    .filter((r): r is PromiseFulfilledResult<SectionResult> => r.status === "fulfilled")
    .map(r => r.value);

  const failedSections = results
    .map((r, i) => r.status === "rejected" ? { sectionId: plan.dynamicSections[i].id, error: String(r.reason) } : null)
    .filter(Boolean) as { sectionId: string; error: string }[];

  onProgress({ 
    phase: 2, 
    percent: 70,
    status: `Research complete: ${completedSections.length}/${plan.dynamicSections.length} sections`,
    type: "phase_complete",
    completedSections: completedSections.map(s => s.sectionTitle),
    failedSections: failedSections.length
  });

  // ━━━ PHASE 3: REPORT SYNTHESIS (Sequential) ━━━
  console.log('[Orchestrator]', { phase: 'REPORT_SYNTHESIS', status: 'starting', completedSections: completedSections.length, failedSections: failedSections.length, timestamp: Date.now() });

  // Step 6: Report Synthesis Agent
  onProgress({ phase: 3, percent: 80, status: "Compiling final report..." });
  const finalReport = await runReportSynthesisAgent({
    plan,
    completedSections,
    failedSections: failedSections.map(f => f.sectionId),
    originalQuery: userQuery,
    userMemory,
    apiKeys
  });

  const researchResult: ResearchResult = {
    overview: finalReport.sections.executiveSummary,
    keyInsights: finalReport.sections.keyFindings,
    details: finalReport.sections.dynamic.map(d => `## ${d.title}\n\n${d.content}`).join("\n\n") + "\n\n" + finalReport.sections.crossSectionAnalysis + "\n\n" + finalReport.sections.confidenceAssessment,
    comparison: "",
    expertInsights: [],
    conclusion: finalReport.sections.conclusions,
    sources: finalReport.sources,
    references: [],
    metadata: {
      model: finalReport.metadata.modelsUsed[0] || "nvidia/nemotron-3-super-120b-a12b",
      provider: "nvidia",
      searchProvider: "multi",
      intent: "research",
      tokensUsed: 0,
      durationMs: 0,
    }
  };

  // Step 7: Save & Cache
  onProgress({ phase: 3, percent: 95, status: "Saving report..." });
  await saveReport(userId, conversationId, researchResult);
  await setCachedResponse(queryHash, researchResult, 3600);

  // Step 8: Return Complete Report
  console.log('[Orchestrator]', { phase: 'COMPLETE', status: 'report_ready', timestamp: Date.now() });
  onProgress({ phase: 3, percent: 100, status: "Report ready!", type: "complete" });
  return researchResult;
}
