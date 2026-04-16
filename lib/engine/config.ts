import type { ResolvedModel } from "./types";

// ── API Endpoints ──────────────────────────────────────────────

export const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";
export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
export const PERPLEXITY_BASE_URL = "https://api.perplexity.ai";

// ── Retry Configuration ────────────────────────────────────────

export const RETRY_CONFIG = {
  maxRetries: 2,
  baseDelayMs: 1000,
  maxDelayMs: 8000,
} as const;

// ── Token Limits ───────────────────────────────────────────────

export const TOKEN_LIMITS = {
  contextWindow: 6000,
  maxResponseTokens: 2048,
  wordsToTokenRatio: 1.3,
} as const;

// ── NVIDIA Models (Primary) ────────────────────────────────────

export const NVIDIA_MODELS = {
  nemotron: {
    provider: "nvidia" as const,
    modelId: "nvidia/llama-3.1-nemotron-70b-instruct",
    displayName: "Nemotron 70B",
    maxTokens: 4096,
    temperature: 0.3,
  },
  nemotronUltra: {
    provider: "nvidia" as const,
    modelId: "nvidia/llama-3.3-nemotron-super-49b-v1",
    displayName: "Nemotron Super 49B",
    maxTokens: 4096,
    temperature: 0.2,
  },
  mistralLarge: {
    provider: "nvidia" as const,
    modelId: "mistralai/mistral-large-2-instruct",
    displayName: "Mistral Large 2",
    maxTokens: 4096,
    temperature: 0.2,
  },
} satisfies Record<string, ResolvedModel>;

// ── OpenRouter Models (Secondary / Fallback) ───────────────────

export const OPENROUTER_MODELS = {
  deepseekR1: {
    provider: "openrouter" as const,
    modelId: "deepseek/deepseek-r1",
    displayName: "DeepSeek-R1",
    maxTokens: 4096,
    temperature: 0.1,
  },
  gptOss: {
    provider: "openrouter" as const,
    modelId: "openai/gpt-4.1-nano",
    displayName: "GPT-4.1 Nano",
    maxTokens: 4096,
    temperature: 0.3,
  },
  qwenCoder: {
    provider: "openrouter" as const,
    modelId: "qwen/qwen-2.5-coder-32b-instruct",
    displayName: "Qwen 2.5 Coder 32B",
    maxTokens: 4096,
    temperature: 0.2,
  },
  gemma: {
    provider: "openrouter" as const,
    modelId: "google/gemma-3-27b-it",
    displayName: "Gemma 3 27B",
    maxTokens: 4096,
    temperature: 0.4,
  },
} satisfies Record<string, ResolvedModel>;

// ── Perplexity Models (Search) ─────────────────────────────────

export const PERPLEXITY_MODELS = {
  sonar: {
    provider: "perplexity" as const,
    modelId: "sonar",
    displayName: "Sonar",
    maxTokens: 2048,
    temperature: 0.3,
  },
  sonarPro: {
    provider: "perplexity" as const,
    modelId: "sonar-pro",
    displayName: "Sonar Pro",
    maxTokens: 4096,
    temperature: 0.2,
  },
  sonarReasoning: {
    provider: "perplexity" as const,
    modelId: "sonar-reasoning-pro",
    displayName: "Sonar Reasoning Pro",
    maxTokens: 4096,
    temperature: 0.1,
  },
} satisfies Record<string, ResolvedModel>;

// ── UI Model ID → Real Model Mapping ───────────────────────────
// Maps the model-selector.tsx IDs to actual provider models

export const UI_MODEL_MAP: Record<string, ResolvedModel> = {
  // Fast category
  "flash-1": NVIDIA_MODELS.nemotron,
  "turbo-2": OPENROUTER_MODELS.gemma,

  // Reasoning category
  "reason-1": OPENROUTER_MODELS.deepseekR1,
  "think-3": NVIDIA_MODELS.nemotronUltra,

  // Coding category
  "code-1": OPENROUTER_MODELS.qwenCoder,
  "dev-2": OPENROUTER_MODELS.deepseekR1,

  // Balanced category
  "balanced-1": NVIDIA_MODELS.nemotronUltra,
  "standard-2": OPENROUTER_MODELS.gptOss,
};

// ── Fallback Chains ────────────────────────────────────────────
// When a provider fails, try the next model in the chain

export const FALLBACK_CHAINS: Record<string, ResolvedModel[]> = {
  nvidia: [
    OPENROUTER_MODELS.gptOss,
    OPENROUTER_MODELS.gemma,
    OPENROUTER_MODELS.deepseekR1,
  ],
  openrouter: [
    NVIDIA_MODELS.nemotron,
    NVIDIA_MODELS.nemotronUltra,
  ],
  coding: [
    OPENROUTER_MODELS.qwenCoder,
    OPENROUTER_MODELS.deepseekR1,
    NVIDIA_MODELS.nemotron,
  ],
  reasoning: [
    OPENROUTER_MODELS.deepseekR1,
    NVIDIA_MODELS.nemotronUltra,
    OPENROUTER_MODELS.gptOss,
  ],
};
