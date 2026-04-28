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

function withGracefulTimeout(
  promise: Promise<SectionResult>,
  ms: number,
  section: { id: string; sectionTitle: string; agentRole: string }
): Promise<SectionResult> {
  return Promise.race([
    promise,
    new Promise<SectionResult>((resolve) =>
      setTimeout(() => {
        console.error('[SectionAgent TIMEOUT]', {
          sectionId: section.id,
          sectionTitle: section.sectionTitle,
          timeoutMs: ms,
          timestamp: Date.now(),
        });
        resolve({
          sectionId: section.id,
          sectionTitle: section.sectionTitle,
          agentRole: section.agentRole,
          content: `## ${section.sectionTitle}\n\nThis section timed out after ${ms / 1000}s. The research agent could not complete its analysis within the allotted time.`,
          keyFindings: [],
          dataPoints: [],
          sourcesUsed: [],
          confidenceScore: 0,
          dataQuality: "limited",
          wordCount: 0,
          modelUsed: "none",
          provider: "none",
          isFallback: false,
          durationMs: ms,
          tokensUsed: 0,
          error: `Timeout after ${ms}ms`,
        });
      }, ms)
    ),
  ]);
}

// ── Orchestrator ────────────────────────────────────────────────────

export async function runResearchOrchestrator(input: OrchestratorInput): Promise<ResearchResult> {
  const orchestratorStart = Date.now();
  const { userQuery, userId, conversationId, researchMode, apiKeys, onProgress } = input;

  // ━━━ PHASE 1: INITIALIZATION (Sequential) ━━━
  console.log('[Orchestrator]', { phase: 'INIT', status: 'starting', query: userQuery, researchMode, timestamp: orchestratorStart });

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

  const STAGGER_DELAY_MS = 200;

  const agentPromises = plan.dynamicSections.map((section, index) => {
    const modelAssignment = modelAssignments.find(m => m.sectionId === section.id) || {
      sectionId: section.id,
      agentRole: section.agentRole,
      primaryModel: { platform: "nvidia", modelId: "abacusai/dracarys-llama-3.1-70b-instruct" },
      fallbackModel: { platform: "openrouter", modelId: "meta-llama/llama-3.3-70b-instruct:free" },
      taskType: "balanced_research",
      maxTokens: 8000,
    };

    const launchAgent = async (): Promise<SectionResult> => {
      if (index > 0) {
        await new Promise(r => setTimeout(r, index * STAGGER_DELAY_MS));
      }
      return runSectionAgent({
        section,
        assignedModel: modelAssignment,
        originalQuery: userQuery,
        globalSearchContext: plan.globalSearchContext,
        apiKeys,
        researchMode,
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
      });
    };

    return withGracefulTimeout(launchAgent(), 150_000, section);
  });

  const results = await Promise.allSettled(agentPromises);

  // Extract all fulfilled results (withGracefulTimeout always resolves, so rejected should be rare)
  const allSections = results
    .filter((r): r is PromiseFulfilledResult<SectionResult> => r.status === "fulfilled")
    .map(r => r.value)
    .filter(s => s !== null && s !== undefined);

  // Also capture any truly rejected promises (shouldn't happen with graceful timeout, but be safe)
  const rejectedSections = results
    .map((r, i) => r.status === "rejected" ? { sectionId: plan.dynamicSections[i].id, error: String(r.reason) } : null)
    .filter(Boolean) as { sectionId: string; error: string }[];

  // A section "completed" if it has real content (>50 chars), even if it also has an error
  const completedSections = allSections.filter(s => s.content && s.content.length > 50 && s.modelUsed !== "none");
  const failedSections = [
    ...allSections
      .filter(s => !s.content || s.content.length <= 50 || s.modelUsed === "none")
      .map(s => ({ sectionId: s.sectionId, error: s.error ?? "No content produced" })),
    ...rejectedSections,
  ];

  console.log('[AllAgents COMPLETE]', {
    total: results.length,
    fulfilled: allSections.length,
    completed: completedSections.length,
    failed: failedSections.length,
    rejectedPromises: rejectedSections.length,
    sectionDetails: allSections.map(s => ({
      id: s.sectionId,
      model: s.modelUsed,
      contentLen: s.content?.length ?? 0,
      hasError: !!s.error,
      durationMs: s.durationMs,
    })),
    timestamp: Date.now(),
  });

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
  // Pass all fulfilled sections (including errored ones with partial content) so the report isn't empty
  const sectionsForReport = allSections.length > 0 ? allSections : completedSections;

  onProgress({ phase: 3, percent: 80, status: "Compiling final report..." });
  const finalReport = await runReportSynthesisAgent({
    plan,
    completedSections: sectionsForReport,
    failedSections: failedSections.map(f => f.sectionId),
    originalQuery: userQuery,
    userMemory,
    apiKeys
  });

  const totalTokensUsed = allSections.reduce((sum, s) => sum + (s.tokensUsed ?? 0), 0);
  const totalDurationMs = Date.now() - orchestratorStart;

  console.log('[Orchestrator METRICS]', {
    totalTokensUsed,
    totalDurationMs,
    perSection: allSections.map(s => ({ id: s.sectionId, tokens: s.tokensUsed, durationMs: s.durationMs, error: s.error })),
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
      tokensUsed: totalTokensUsed,
      durationMs: totalDurationMs,
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
