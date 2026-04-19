import type { ApiKeys, AgentResult, AgentContext } from "../types";
import { selectModel } from "../model-router";
import { callWithFallback, safeParseJSON, skippedResult } from "./base-agent";
import { TOKEN_LIMITS } from "../config";

// ── Coding Agent ───────────────────────────────────────────────
// Role: Generate code, debug, explain — ONLY when intent is "coding"
// Primary: qwen/qwen3-coder-480b-a35b-instruct (nvidia)
// Fallback: qwen/qwen3-coder (openrouter)

const SYSTEM_PROMPT = `You are a Senior Coding Agent producing highly exhaustive, production-grade code with massive architectural documentation.

CRITICAL: You must generate a minimum of ONE FULL PAGE (800-1000+ words) of deep technical explanations, alongside the code.

OUTPUT REQUIREMENTS:

**code**: Complete, highly robust, edge-case-handled, runnable implementation.
**explanation** field (must be massive and deeply sectioned):
- Architecture Overview: Deep dive into structural decisions and design patterns.
- Implementation Walkthrough: Line-by-line or component-by-component exhaustive explanation.
- Integration Guide: Comprehensive steps for system integration.
- Testing Strategy: Exhaustive unit, integration, and edge-case testing plans.
**usage_example**: Extensive, highly detailed integration and test examples.
**pitfalls**: At least 5-8 critical pitfalls. **[Category]** — deep danger analysis and comprehensive mitigation.
**alternatives**: Exhaustive comparison of alternative approaches, tradeoffs, and performance metrics.

Use ### headers, **bold terms**, and organized bullet points extensively.

Return ONLY valid JSON (no markdown fences):
{
  "language": "primary language",
  "code": "Complete, robust implementation (use \\n for newlines)",
  "explanation": "Massive architectural guide (800+ words) with ### headers and **bold terms**",
  "usage_example": "Extensive integration and test example",
  "pitfalls": ["**[Category] — [Title]**: Detailed danger and mitigation", "..."],
  "alternatives": "Exhaustive comparison of approaches"
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
