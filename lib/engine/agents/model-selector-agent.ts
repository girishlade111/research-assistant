import type {
  ResearchPlan,
  DynamicSection,
  SectionTaskType,
  AgentModelAssignment,
  ModelAssignment,
} from "../types";
import {
  SECTION_MODEL_MAP,
  TASK_TYPE_TO_SECTION,
  PRIORITY_TOKEN_BUDGET,
  QUERY_OVERRIDE_RULES,
  NVIDIA_MODELS,
  OPENROUTER_MODELS,
  type SectionModelEntry,
} from "../config/model-config";
import { NVIDIA_BASE_URL } from "../config";

// ── Step 1: Classify a section into a SectionTaskType ─────────
// Uses agentRole + focusArea + sectionTitle keywords to pick the
// best task type. Pure string matching, no AI call.

const ROLE_KEYWORDS: [RegExp, SectionTaskType][] = [
  [/\b(search|web|scraping|crawl|source[\s-]?gather)\b/i,                       "web_search"],
  [/\b(financ|revenue|profit|valuation|earning|market\s*cap|investment)\b/i,     "financial_analysis"],
  [/\b(code|develop|program|implement|algorithm|engineer|debug|software)\b/i,    "code_generation"],
  [/\b(risk|threat|vulnerabilit|security|compliance|audit)\b/i,                  "deep_reasoning"],
  [/\b(fact[\s-]?check|verify|valid|accuracy|claim|reliab)\b/i,                  "fact_checking"],
  [/\b(summar|brief|overview|executive|digest|synopsis|highlight)\b/i,           "fast_summary"],
  [/\b(report|synthes|compil|aggregate|final[\s-]?document)\b/i,                 "report_compilation"],
  [/\b(reason|think|analy[sz]|deep[\s-]?dive|investigat|root[\s-]?cause)\b/i,    "deep_reasoning"],
  [/\b(market|trend|forecast|competitive|landscape|industry|sector)\b/i,         "balanced_research"],
  [/\b(technic|architect|infrastructure|system[\s-]?design|stack|framework)\b/i, "deep_reasoning"],
];

function classifySectionTask(section: DynamicSection): SectionTaskType {
  const blob = `${section.agentRole} ${section.focusArea} ${section.sectionTitle}`.toLowerCase();

  for (const [pattern, taskType] of ROLE_KEYWORDS) {
    if (pattern.test(blob)) return taskType;
  }

  if (section.requiresWebSearch) return "web_search";

  switch (section.priority) {
    case "high":   return "deep_reasoning";
    case "low":    return "fast_summary";
    default:       return "balanced_research";
  }
}

// ── Step 2 + 3: Look up model from static map, apply overrides ─

function resolveModelEntry(
  taskType: SectionTaskType,
  queryOverride: SectionTaskType | null
): { entry: SectionModelEntry; effectiveTaskType: SectionTaskType } {
  const effective = queryOverride ?? taskType;
  const sectionKey = TASK_TYPE_TO_SECTION[effective];
  const entry = SECTION_MODEL_MAP[sectionKey];
  return { entry, effectiveTaskType: effective };
}

function detectQueryOverride(query: string): SectionTaskType | null {
  const lower = query.toLowerCase();
  for (const rule of QUERY_OVERRIDE_RULES) {
    if (rule.pattern.test(lower)) return rule.forcedTaskType;
  }
  return null;
}

// ── Step 4: Async health check for NVIDIA NIM availability ────
// Non-blocking: runs in background. If primary is NVIDIA and
// the ping fails, swap primary ↔ fallback for that assignment.

const HEALTH_CHECK_TIMEOUT_MS = 4000;

let _nvidiaHealthy: boolean | null = null;
let _lastCheckMs = 0;
const HEALTH_CACHE_TTL_MS = 60_000;

async function checkNvidiaHealth(apiKey: string | undefined): Promise<boolean> {
  if (!apiKey) return false;

  const now = Date.now();
  if (_nvidiaHealthy !== null && now - _lastCheckMs < HEALTH_CACHE_TTL_MS) {
    return _nvidiaHealthy;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS);

    const res = await fetch(`${NVIDIA_BASE_URL}/models`, {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
    });

    clearTimeout(timer);
    _nvidiaHealthy = res.ok;
  } catch {
    _nvidiaHealthy = false;
  }

  _lastCheckMs = Date.now();
  return _nvidiaHealthy;
}

function swapToFallback(assignment: AgentModelAssignment): AgentModelAssignment {
  return {
    ...assignment,
    primaryModel: assignment.fallbackModel,
    fallbackModel: assignment.primaryModel,
  };
}

// ── Step 5: Token budget for a section ────────────────────────

function resolveMaxTokens(
  section: DynamicSection,
  entry: SectionModelEntry
): number {
  const priorityBudget = PRIORITY_TOKEN_BUDGET[section.priority];
  if (priorityBudget) return Math.max(priorityBudget, entry.defaultMaxTokens);
  return entry.defaultMaxTokens;
}

// ── Public API: getModelForTask ───────────────────────────────
// Single-section lookup without health check.

export function getModelForTask(
  taskType: SectionTaskType,
  query?: string
): { primary: ModelAssignment; fallback: ModelAssignment; maxTokens: number } {
  const override = query ? detectQueryOverride(query) : null;
  const { entry } = resolveModelEntry(taskType, override);
  return {
    primary:  { ...entry.primary },
    fallback: { ...entry.fallback },
    maxTokens: entry.defaultMaxTokens,
  };
}

// ── Public API: selectModelsForPlan ───────────────────────────
// Takes a full ResearchPlan + raw query, returns one
// AgentModelAssignment per dynamicSection.

export async function selectModelsForPlan(
  plan: ResearchPlan,
  query: string,
  nvidiaApiKey?: string
): Promise<AgentModelAssignment[]> {
  const queryOverride = detectQueryOverride(query);

  const assignments: AgentModelAssignment[] = plan.dynamicSections.map(section => {
    const baseTaskType = classifySectionTask(section);
    const { entry, effectiveTaskType } = resolveModelEntry(baseTaskType, queryOverride);
    const maxTokens = resolveMaxTokens(section, entry);

    return {
      sectionId:     section.id,
      agentRole:     section.agentRole,
      primaryModel:  { ...entry.primary },
      fallbackModel: { ...entry.fallback },
      taskType:      effectiveTaskType,
      maxTokens,
    };
  });

  // Step 4: Non-blocking health check — if NVIDIA is down, swap all
  // NVIDIA-primary assignments to their OpenRouter fallbacks.
  const healthy = await checkNvidiaHealth(nvidiaApiKey);

  if (!healthy) {
    return assignments.map(a =>
      a.primaryModel.platform === "nvidia" ? swapToFallback(a) : a
    );
  }

  return assignments;
}

// ── Utility: reset health cache (for testing) ─────────────────

export function resetHealthCache(): void {
  _nvidiaHealthy = null;
  _lastCheckMs = 0;
}
