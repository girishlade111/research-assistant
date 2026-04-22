import type {
  ApiKeys,
  LLMMessage,
  ResearchResult,
  StreamCallback,
  WorkflowMode,
} from "./types";
import { nvidiaComplete } from "./providers/nvidia";
import { openrouterComplete } from "./providers/openrouter";

const PLANNING_SYSTEM = `You are **ResAgent Planning Mode**.

Your job is to help the user plan a research effort before running full research.

Behavior rules:
- Do NOT perform the full research yet.
- Turn the user's request into a structured research plan.
- Infer the topic even if the user is vague or exploratory.
- If the user has already discussed the topic in prior messages, use that context.
- Write clearly with headings and bullets.
- Highlight assumptions, open questions, scope boundaries, and the recommended research path.
- End with a short note that the user can ask you to begin research whenever ready, without needing exact wording.

Output style:
- Markdown only.
- Use these sections when relevant:
  ### Planning Objective
  ### What Should Be Researched
  ### Recommended Scope
  ### Research Questions
  ### Information Needed
  ### Risks / Unknowns
  ### Suggested Next Step

Do not output JSON.`;

const TRANSITION_SYSTEM = `You are a workflow classifier for a research assistant.

Decide whether the user's latest message means:
1. stay in planning mode, or
2. begin actual research now.

Important:
- The user does NOT need to say "research this topic" exactly.
- Detect intent even when phrased indirectly, casually, or in another language.
- If the latest message means "go ahead", "start now", "continue with research", "do the analysis", "proceed", or equivalent, classify it as begin_research.
- If the user is still clarifying scope, asking planning questions, or refining the request, classify it as stay_planning.

Return ONLY valid JSON:
{"decision":"begin_research"|"stay_planning","reason":"short explanation","confidence":0.0-1.0}`;

function buildPlanningMessages(query: string, conversationHistory?: LLMMessage[]): LLMMessage[] {
  const priorContext =
    conversationHistory && conversationHistory.length > 0
      ? conversationHistory
          .slice(-8)
          .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
          .join("\n\n")
      : "No prior conversation context.";

  return [
    { role: "system", content: PLANNING_SYSTEM },
    {
      role: "user",
      content: `Conversation context:
${priorContext}

Latest user message:
${query}`,
    },
  ];
}

function buildTransitionMessages(query: string, conversationHistory?: LLMMessage[]): LLMMessage[] {
  const priorContext =
    conversationHistory && conversationHistory.length > 0
      ? conversationHistory
          .slice(-10)
          .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
          .join("\n\n")
      : "No prior conversation context.";

  return [
    { role: "system", content: TRANSITION_SYSTEM },
    {
      role: "user",
      content: `Prior planning conversation:
${priorContext}

Latest user message:
${query}`,
    },
  ];
}

function safeParseDecision(raw: string): {
  decision: "begin_research" | "stay_planning";
  reason: string;
  confidence: number;
} | null {
  const trimmed = raw.trim().replace(/^\uFEFF/, "");

  for (const candidate of [
    trimmed,
    trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1] ?? "",
    trimmed.match(/\{[\s\S]*\}/)?.[0] ?? "",
  ]) {
    if (!candidate) continue;
    try {
      const parsed = JSON.parse(candidate) as {
        decision?: string;
        reason?: string;
        confidence?: number;
      };
      return {
        decision: parsed.decision === "begin_research" ? "begin_research" : "stay_planning",
        reason: String(parsed.reason ?? ""),
        confidence: Number(parsed.confidence ?? 0.75),
      };
    } catch {
      continue;
    }
  }

  return null;
}

function heuristicTransition(query: string): boolean | null {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return null;

  const beginPatterns = [
    /\b(start|begin|proceed|continue|go ahead|move forward)\b.*\b(research|analysis|analyze|investigate|deep dive|report)\b/i,
    /\b(now|okay|ok|alright|fine)\b.*\b(research|analyze|investigate|do it)\b/i,
    /\b(research|analyze|investigate|explore)\b.*\b(this|it|topic|that)\b/i,
    /\bgo ahead\b/i,
    /\bdo the research\b/i,
    /\bstart researching\b/i,
    /\bcontinue with research\b/i,
  ];

  const stayPatterns = [
    /\b(plan|planning|outline|brainstorm|scope|clarify|refine)\b/i,
    /\bwhat should\b/i,
    /\bhow should we\b/i,
    /\bbefore we research\b/i,
  ];

  if (beginPatterns.some((pattern) => pattern.test(normalized))) return true;
  if (stayPatterns.some((pattern) => pattern.test(normalized))) return false;
  return null;
}

async function completeWithFallback(
  messages: LLMMessage[],
  apiKeys: ApiKeys,
  options?: { maxTokens?: number; temperature?: number; jsonMode?: boolean }
) {
  if (apiKeys.nvidiaKey) {
    try {
      const response = await nvidiaComplete(apiKeys.nvidiaKey, {
        model: "moonshotai/kimi-k2-thinking",
        messages,
        maxTokens: options?.maxTokens ?? 1400,
        temperature: options?.temperature ?? 0.3,
      });

      return {
        content: response.content,
        model: response.model_used,
        provider: "nvidia" as const,
        isFallback: false,
      };
    } catch {
      // fall through
    }
  }

  if (!apiKeys.openrouterKey) {
    throw new Error("All providers failed. Please check your API keys or try again.");
  }

  const response = await openrouterComplete(apiKeys.openrouterKey, {
    model: "openai/gpt-oss-120b:free",
    messages,
    maxTokens: options?.maxTokens ?? 1400,
    temperature: options?.temperature ?? 0.3,
    jsonMode: options?.jsonMode,
  });

  return {
    content: response.content,
    model: response.model_used,
    provider: "openrouter" as const,
    isFallback: true,
  };
}

export async function detectPlanningTransition(
  query: string,
  apiKeys: ApiKeys,
  conversationHistory?: LLMMessage[]
): Promise<{ shouldBeginResearch: boolean; reason: string; confidence: number }> {
  const heuristic = heuristicTransition(query);
  if (heuristic !== null) {
    return {
      shouldBeginResearch: heuristic,
      reason: heuristic ? "Heuristic transition match" : "Heuristic planning match",
      confidence: 0.9,
    };
  }

  try {
    const result = await completeWithFallback(
      buildTransitionMessages(query, conversationHistory),
      apiKeys,
      { maxTokens: 120, temperature: 0.1, jsonMode: true }
    );
    const parsed = safeParseDecision(result.content);
    if (parsed) {
      return {
        shouldBeginResearch: parsed.decision === "begin_research",
        reason: parsed.reason,
        confidence: parsed.confidence,
      };
    }
  } catch {
    // fall through
  }

  return {
    shouldBeginResearch: false,
    reason: "Transition classifier unavailable",
    confidence: 0.4,
  };
}

export async function runPlanningChat(
  query: string,
  apiKeys: ApiKeys,
  conversationHistory?: LLMMessage[],
  onChunk?: StreamCallback
): Promise<ResearchResult> {
  const startTime = Date.now();
  const result = await completeWithFallback(
    buildPlanningMessages(query, conversationHistory),
    apiKeys,
    { maxTokens: 2200, temperature: 0.4 }
  );

  if (onChunk) {
    onChunk(result.content, false);
    onChunk("", true);
  }

  return {
    overview: result.content,
    keyInsights: [],
    details: "",
    comparison: "",
    expertInsights: [],
    conclusion: "",
    sources: [],
    references: [],
    agentResults: [],
    metadata: {
      model: result.model,
      provider: result.provider,
      searchProvider: "nvidia",
      intent: "general",
      workflowMode: "planning" satisfies WorkflowMode,
      switchedFromPlanning: false,
      tokensUsed: 0,
      durationMs: Date.now() - startTime,
      isFallback: result.isFallback,
      agentTrace: [],
    },
  };
}
