import type { ApiKeys, AgentResult, AgentContext } from "../types";
import { selectModel } from "../model-router";
import { callWithFallback, safeParseJSON, skippedResult } from "./base-agent";
import { TOKEN_LIMITS } from "../config";

// ── Coding Agent ───────────────────────────────────────────────
// Role: Generate code, debug, explain — ONLY when intent is "coding"
// Primary: qwen/qwen3-coder-480b-a35b-instruct (nvidia)
// Fallback: qwen/qwen3-coder (openrouter)

const SYSTEM_PROMPT = `You are a Senior Coding Agent producing production-grade code with comprehensive documentation.

CRITICAL: Adapt your documentation depth and length to the complexity of the request. For complex architectural requests, provide deep explanations. For simple script or component requests, provide direct, concise explanations without unnecessary bloat.

OUTPUT REQUIREMENTS:

**code**: Runnable implementation. Follow language idioms and address security concerns where applicable.
**explanation**: 
- Architecture Overview (if complex)
- Implementation walkthough
- Integration Guide (if applicable)
- Testing Strategy
**pitfalls**: **[Category]** — danger and mitigation. Provide only as many as genuinely useful.
**alternatives**: Compare approaches if applicable to the query.

Return ONLY valid JSON (no markdown fences):
{
  "language": "primary language",
  "code": "Complete implementation with comments and error handling (use \\\\n for newlines)",
  "explanation": "Guide sized appropriately for the query complexity with ### headers and **bold terms**",
  "usage_example": "Integration and test example",
  "pitfalls": ["**[Category] — [Title]**: Danger and mitigation", "...number appropriate to scope"],
  "alternatives": "Comparison of approaches if applicable, else an empty string"
}`;

export async function runCodingAgent(
  context: AgentContext,
  apiKeys: ApiKeys
): Promise<AgentResult> {
  if (context.intent !== "coding") {
    return skippedResult("coding-agent");
  }

  const start = Date.now();
  const chain = selectModel("coding", context.query);

  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    {
      role: "user" as const,
      content: `Coding Request: ${context.query}
Enhanced: ${context.enhanced_query}

${context.file_context.length > 0
  ? `Code Context:\n${context.file_context.slice(0, 10).map(f => `File: ${f.fileName}\n${f.content.slice(0, 15000)}`).join("\n\n")}`
  : "No existing code context."
}

Produce production-ready code with comprehensive docs (1200+ words total). Return ONLY valid JSON.`,
    },
  ];

  try {
    const result = await callWithFallback(
      "coding-agent",
      chain.primary,
      chain.fallbacks[0],
      messages,
      TOKEN_LIMITS.agentMaxTokens * 2, // coding gets double tokens
      apiKeys
    );

    const parsed = safeParseJSON(result.content);

    return {
      agent: "coding-agent",
      output: parsed ?? {
        language: "unknown",
        code: result.content,
        explanation: "",
        usage_example: "",
        pitfalls: [],
        alternatives: "",
      },
      model_used: result.model_used,
      provider: result.provider,
      durationMs: Date.now() - start,
      isFallback: result.isFallback,
    };
  } catch (err) {
    return {
      agent: "coding-agent",
      output: { language: "", code: "", explanation: "", pitfalls: [], alternatives: "" },
      model_used: "none",
      provider: "none",
      durationMs: Date.now() - start,
      isFallback: false,
      error: err instanceof Error ? err.message : "Coding agent failed",
    };
  }
}
