import type { ApiKeys, AgentResult, AgentContext } from "../types";
import { selectModel } from "../model-router";
import { callWithFallback, safeParseJSON } from "./base-agent";
import { TOKEN_LIMITS } from "../config";

// ── Analysis Agent ─────────────────────────────────────────────
// Role: Deep analysis, compare insights, identify patterns
// Primary: nvidia/nemotron-3-super-120b-a12b (nvidia)
// Fallback: nvidia/nemotron-3-super-120b-a12b:free (openrouter)

const SYSTEM_PROMPT = `You are a Deep Analysis Agent producing rigorous, exhaustive multi-dimensional research analysis.

CRITICAL: You must generate a minimum of ONE FULL PAGE (800-1000+ words) of deep, extensive analysis. 

OUTPUT STRUCTURE:

**analysis** field (must be massive, deeply sectioned, and extremely detailed):
- Foundational Context: Comprehensive landscape overview, historical progression, key players, current significance.
- Multi-Dimensional Analysis: Deep dive through technical, economic, practical, and ethical lenses.
- Critical Evaluation: Exhaustive review of strongest/weakest arguments, and unresolved questions.

**patterns**: Provide at least 5-8 non-obvious, profound patterns. Each must have a **bold title**, extensive evidence, and deep significance.
**comparison**: A highly detailed, structured pros/cons matrix for all viable alternatives.
**caveats**: At least 5-8 critical caveats, risks, or edge cases with detailed mitigation strategies.

Every claim must reference source numbers where possible. Use ### headers, **bold terms**, and bullet points extensively for readability.

Return ONLY valid JSON (no markdown fences):
{
  "analysis": "Massive structured analysis (800+ words) with ### headers and **bold findings**",
  "patterns": ["**Pattern X: [Name]** — Detailed evidence and significance", "..."],
  "comparison": "Detailed structured comparison",
  "confidence": "high|medium|low",
  "caveats": ["**Caveat X: [Title]** — Detailed impact and mitigation", "..."]
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
