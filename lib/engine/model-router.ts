import type { IntentType, SearchMode, ResolvedModel, ModelFallbackChain } from "./types";
import {
  UI_MODEL_MAP,
  NVIDIA_MODELS,
  OPENROUTER_MODELS,
  FALLBACK_CHAINS,
} from "./config";

// ── Auto-Selection Logic ───────────────────────────────────────
// NVIDIA is primary; OpenRouter is secondary for specialized tasks

function autoSelectModel(intent: IntentType, mode: SearchMode): ResolvedModel {
  // Deep mode → reasoning-class model
  if (mode === "deep") {
    return OPENROUTER_MODELS.deepseekR1;
  }

  // Corpus mode → strong general model
  if (mode === "corpus") {
    return NVIDIA_MODELS.nemotronUltra;
  }

  // Pro mode → intent-based selection
  switch (intent) {
    case "coding":
      return OPENROUTER_MODELS.qwenCoder;
    case "research":
      return NVIDIA_MODELS.nemotronUltra;
    case "comparison":
      return NVIDIA_MODELS.nemotron;
    case "explanation":
      return NVIDIA_MODELS.nemotron;
    case "factual":
      return NVIDIA_MODELS.nemotron;
    default:
      return NVIDIA_MODELS.nemotron;
  }
}

// ── Fallback Chain Builder ─────────────────────────────────────

function buildFallbackChain(primary: ResolvedModel, intent: IntentType): ResolvedModel[] {
  // Intent-specific chains take priority
  if (intent === "coding") {
    return FALLBACK_CHAINS.coding.filter((m) => m.modelId !== primary.modelId);
  }
  if (intent === "research") {
    return FALLBACK_CHAINS.reasoning.filter((m) => m.modelId !== primary.modelId);
  }

  // Provider-based fallback
  const chain = FALLBACK_CHAINS[primary.provider] ?? FALLBACK_CHAINS.nvidia;
  return chain.filter((m) => m.modelId !== primary.modelId);
}

// ── Public API ─────────────────────────────────────────────────

export function selectModel(
  userModelId: string | undefined,
  intent: IntentType,
  mode: SearchMode
): ModelFallbackChain {
  let primary: ResolvedModel;

  if (userModelId && UI_MODEL_MAP[userModelId]) {
    primary = UI_MODEL_MAP[userModelId];
  } else {
    primary = autoSelectModel(intent, mode);
  }

  const fallbacks = buildFallbackChain(primary, intent);

  return { primary, fallbacks };
}

export function getNextFallback(
  chain: ModelFallbackChain,
  failedModelIds: Set<string>
): ResolvedModel | null {
  for (const model of chain.fallbacks) {
    if (!failedModelIds.has(model.modelId)) return model;
  }
  return null;
}
