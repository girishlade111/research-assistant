import type { SectionTaskType, ModelAssignment } from "../types";

// ── Full Model IDs ────────────────────────────────────────────
// NVIDIA NIM (primary platform)
export const NVIDIA_MODELS = {
  minimax:    "minimaxai/minimax-m2.7",
  kimi:       "moonshotai/kimi-k2-thinking",
  dracarys:   "abacusai/dracarys-llama-3.1-70b-instruct",
  mistral:    "mistralai/mistral-large-3-675b-instruct-2512",
  deepseek:   "deepseek-ai/deepseek-v3.2",
  glm:        "z-ai/glm4.7",
  qwen:       "qwen/qwen3-coder-480b-a35b-instruct",
  nemotron:   "nvidia/nemotron-3-super-120b-a12b",
} as const;

// OpenRouter (fallback platform, free tiers)
export const OPENROUTER_MODELS = {
  nemotron:   "nvidia/nemotron-3-super-120b-a12b:free",
  qwen:       "qwen/qwen3-coder:free",
  llama:      "meta-llama/llama-3.3-70b-instruct:free",
  gptOss:     "openai/gpt-oss-120b:free",
  glmAir:     "z-ai/glm-4.5-air:free",
  gemma:      "google/gemma-4-31b-it:free",
  minimax:    "minimax/minimax-m2.5:free",
} as const;

// ── Section-Level Model Map ───────────────────────────────────
// Maps named section roles to primary + fallback model assignments.

export interface SectionModelEntry {
  primary: ModelAssignment;
  fallback: ModelAssignment;
  defaultMaxTokens: number;
}

export const SECTION_MODEL_MAP: Record<string, SectionModelEntry> = {
  queryIntelligence: {
    primary:  { platform: "nvidia",     modelId: NVIDIA_MODELS.mistral },
    fallback: { platform: "openrouter", modelId: OPENROUTER_MODELS.gptOss },
    defaultMaxTokens: 16384,
  },
  webSearch: {
    primary:  { platform: "nvidia",     modelId: NVIDIA_MODELS.dracarys },
    fallback: { platform: "openrouter", modelId: OPENROUTER_MODELS.llama },
    defaultMaxTokens: 16384,
  },
  financialAnalysis: {
    primary:  { platform: "nvidia",     modelId: NVIDIA_MODELS.deepseek },
    fallback: { platform: "openrouter", modelId: OPENROUTER_MODELS.gptOss },
    defaultMaxTokens: 16384,
  },
  marketResearch: {
    primary:  { platform: "nvidia",     modelId: NVIDIA_MODELS.glm },
    fallback: { platform: "openrouter", modelId: OPENROUTER_MODELS.nemotron },
    defaultMaxTokens: 16384,
  },
  riskAnalysis: {
    primary:  { platform: "nvidia",     modelId: NVIDIA_MODELS.kimi },
    fallback: { platform: "openrouter", modelId: OPENROUTER_MODELS.gptOss },
    defaultMaxTokens: 16384,
  },
  technicalAnalysis: {
    primary:  { platform: "nvidia",     modelId: NVIDIA_MODELS.deepseek },
    fallback: { platform: "openrouter", modelId: OPENROUTER_MODELS.gptOss },
    defaultMaxTokens: 16384,
  },
  codeGeneration: {
    primary:  { platform: "nvidia",     modelId: NVIDIA_MODELS.qwen },
    fallback: { platform: "openrouter", modelId: OPENROUTER_MODELS.qwen },
    defaultMaxTokens: 32768,
  },
  factChecking: {
    primary:  { platform: "nvidia",     modelId: NVIDIA_MODELS.kimi },
    fallback: { platform: "openrouter", modelId: OPENROUTER_MODELS.gptOss },
    defaultMaxTokens: 16384,
  },
  summarization: {
    primary:  { platform: "nvidia",     modelId: NVIDIA_MODELS.minimax },
    fallback: { platform: "openrouter", modelId: OPENROUTER_MODELS.glmAir },
    defaultMaxTokens: 16384,
  },
  reportSynthesis: {
    primary:  { platform: "nvidia",     modelId: NVIDIA_MODELS.nemotron },
    fallback: { platform: "openrouter", modelId: OPENROUTER_MODELS.nemotron },
    defaultMaxTokens: 32768,
  },
} as const;

// ── Task-Type → Section Role Mapping ──────────────────────────
// Each SectionTaskType resolves to a named key in SECTION_MODEL_MAP.

export const TASK_TYPE_TO_SECTION: Record<SectionTaskType, keyof typeof SECTION_MODEL_MAP> = {
  web_search:         "webSearch",
  deep_reasoning:     "riskAnalysis",
  code_generation:    "codeGeneration",
  fast_summary:       "summarization",
  financial_analysis: "financialAnalysis",
  report_compilation: "reportSynthesis",
  fact_checking:      "factChecking",
  balanced_research:  "marketResearch",
};

// ── Token Budget by Priority ──────────────────────────────────

export const PRIORITY_TOKEN_BUDGET: Record<string, number> = {
  high:   16384,
  medium: 12288,
  low:    8192,
};

// ── Dynamic Override Patterns ─────────────────────────────────
// Regex patterns tested against the raw query to force a task type
// override on ALL sections. Evaluated top-to-bottom, first match wins.

export interface QueryOverrideRule {
  pattern: RegExp;
  forcedTaskType: SectionTaskType;
  sectionKey: keyof typeof SECTION_MODEL_MAP;
}

export const QUERY_OVERRIDE_RULES: QueryOverrideRule[] = [
  {
    pattern: /\b(code|function|algorithm|script|implement|debug|program|api)\b/i,
    forcedTaskType: "code_generation",
    sectionKey: "codeGeneration",
  },
  {
    pattern: /\b(invest|stock|revenue|profit|valuation|earnings|dividend|market\s*cap|ipo|fund)\b/i,
    forcedTaskType: "financial_analysis",
    sectionKey: "financialAnalysis",
  },
  {
    pattern: /\b(compare|vs\.?|versus|difference|benchmark|head[\s-]?to[\s-]?head)\b/i,
    forcedTaskType: "balanced_research",
    sectionKey: "marketResearch",
  },
  {
    pattern: /\b(why|explain|reason|cause|how\s+does|mechanism|principle)\b/i,
    forcedTaskType: "deep_reasoning",
    sectionKey: "riskAnalysis",
  },
];
