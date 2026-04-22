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

Your job is to partner with the user to design a high-impact research strategy. You help them bridge the gap between a vague idea and a deep, multi-agent research effort.

STRATEGY:
- **Clarify & Scope**: If the request is broad, propose specific dimensions (e.g., "Should we focus on technical benchmarks or market adoption?").
- **Propose a Blueprint**: Structure your response with a clear "Research Roadmap".
- **Multi-Agent Awareness**: Remind the user that once ready, we will deploy specialized agents (Search, Analysis, Coding, Fact-Check) for the actual work.
- **Tone**: Senior research consultant — professional, insightful, and proactive.

Behavior rules:
- Do NOT perform the full research yet.
- Write clearly with headings and bullets.
- If the user has prior context, always acknowledge and build upon it.
- End with: "I'm ready to begin the full research whenever you are. Just say 'proceed', 'start', or 'go ahead' to launch the multi-agent pipeline."

Output style:
- Markdown only.
- Use these sections:
  ### 🎯 Research Objective
  ### 🗺️ Proposed Roadmap (Subtopics & Dimensions)
  ### 🔍 Recommended Sources & Depth
  ### ⚠️ Key Assumptions & Unknowns
  ### 🚀 Suggested Next Step
`;

const TRANSITION_SYSTEM = `You are a Workflow Orchestrator. 

Analyze the latest user message to decide if it's time to trigger the Multi-Agent Research Pipeline.

TRIGGER CRITERIA (decision: "begin_research"):
- Explicit confirmation: "go", "start", "proceed", "begin", "do it", "yes".
- Indirect intent: "looks good", "continue with that", "let's see the report", "analyze this now".
- Casual agreement: "ok", "cool", "alright".
- Transition from planning to action in any language.

STAY CRITERIA (decision: "stay_planning"):
- User asks a question about the plan.
- User adds more constraints or subtopics.
- User is still exploring or brainstorming.
- User says "wait", "not yet", or "hold on".

Return ONLY valid JSON:
{"decision":"begin_research"|"stay_planning","reason":"brief explanation","confidence":0.0-1.0}`;

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
