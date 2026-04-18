import type { ApiKeys, AgentResult, AgentContext } from "../types";
import { selectModel } from "../model-router";
import { callWithFallback, safeParseJSON } from "./base-agent";
import { TOKEN_LIMITS } from "../config";

// ── Analysis Agent ─────────────────────────────────────────────
// Role: Deep analysis, compare insights, identify patterns
// Primary: nvidia/nemotron-3-super-120b-a12b (nvidia)
// Fallback: nvidia/nemotron-3-super-120b-a12b:free (openrouter)

const SYSTEM_PROMPT = `You are a Deep Analysis Agent producing rigorous multi-dimensional research analysis.

CRITICAL: Adapt your depth and length to the complexity of the query. For complex topics, generate deep, extensive analysis. For simple queries, remain concise and direct.

OUTPUT STRUCTURE:

**analysis** field:
- Foundational Context: Topic landscape, key players, current significance.
- Multi-Dimensional Analysis: If topic is complex, analyze through technical, economic, and practical lenses. If simple, provide direct facts.
- Critical Evaluation: Strongest/weakest arguments, unresolved questions (if applicable).

**patterns**: Provide as many non-obvious patterns as necessary to cover the topic (e.g., 2-5). Each with bold title, evidence, and significance.
**comparison**: Structured pros/cons for alternatives. Only if applicable.
**caveats**: Important context or risks to account for (provide as many as relevant).

Every claim must reference source numbers where possible. Use ### headers, **bold terms**, and bullet points.

Return ONLY valid JSON (no markdown fences):
{
  "analysis": "Structured analysis sized appropriately for the query complexity with ### headers and **bold findings**",
  "patterns": ["**Pattern 1: [Name]** — Evidence and significance", "...number appropriate to scope"],
  "comparison": "Structured comparison, or an empty string if not applicable",
  "confidence": "high|medium|low",
  "caveats": ["**Caveat 1: [Title]** — Impact and mitigation", "...number appropriate to scope"]
}`;

export async function runAnalysisAgent(
  context: AgentContext,
  apiKeys: ApiKeys
): Promise<AgentResult> {
  const start = Date.now();
  const chain = selectModel("analysis", context.query);

  const sourcesText = context.web_results.slice(0, 8).map((r, i) =>
    `[Source ${i + 1}] ${r.title} (${r.domain})\n${r.snippet}`
  ).join("\n\n");

  const filesText = context.file_context.slice(0, 10).map(f =>
    `[File: ${f.fileName}]\n${f.content.slice(0, 10000)}`
  ).join("\n\n");

  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    {
      role: "user" as const,
      content: `Query: ${context.query}
Enhanced: ${context.enhanced_query}

Sources:\n${sourcesText || "No web sources available."}
${filesText ? `\nFiles:\n${filesText}` : ""}
Subtopics: ${context.subtopics.join("; ") || "N/A"}

Produce deep, structured analysis (1200+ words). Return ONLY valid JSON.`,
    },
  ];

  try {
    const result = await callWithFallback(
      "analysis-agent",
      chain.primary,
      chain.fallbacks[0],
      messages,
      TOKEN_LIMITS.agentMaxTokens,
      apiKeys
    );

    const parsed = safeParseJSON(result.content);

    return {
      agent: "analysis-agent",
      output: parsed ?? { analysis: result.content, patterns: [], comparison: "", confidence: "medium", caveats: [] },
      model_used: result.model_used,
      provider: result.provider,
      durationMs: Date.now() - start,
      isFallback: result.isFallback,
    };
  } catch (err) {
    return {
      agent: "analysis-agent",
      output: { analysis: "", patterns: [], comparison: "", confidence: "low", caveats: [] },
      model_used: "none",
      provider: "none",
      durationMs: Date.now() - start,
      isFallback: false,
      error: err instanceof Error ? err.message : "Analysis agent failed",
    };
  }
}
