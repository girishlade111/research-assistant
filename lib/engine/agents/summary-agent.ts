import type { ApiKeys, AgentResult, AgentContext } from "../types";
import { selectModel } from "../model-router";
import { callWithFallback, safeParseJSON } from "./base-agent";
import { TOKEN_LIMITS } from "../config";

// ── Summary Agent ─────────────────────────────────────────────
// Role: Executive summary, key points, quick facts, action items
// Primary: minimaxai/minimax-m2.7 (nvidia)
// Fallback: google/gemma-4-31b-it (openrouter)

const SYSTEM_PROMPT = `You are an Executive Summary Agent producing highly detailed, multi-layered executive briefings. 

CRITICAL: You must generate a minimum of ONE FULL PAGE (800-1000+ words) of comprehensive briefing material. 

OUTPUT STRUCTURE:

**overview** field (must be massive and deeply sectioned):
- Executive Summary: In-depth topic importance, exhaustive core findings, and profound bottom-line takeaway.
- Thematic Analysis: Deep dive into all major themes with titles and cascading implications.
- Strategic Implications: Exhaustive practical impact analysis and detailed long-term recommendations.

**key_points**: At least 8-12 comprehensive points. Theme label + detailed, highly informative explanation.
**quick_facts**: At least 10-15 critical facts. Category + data point + profound significance.
**action_items**: At least 5-8 actionable steps. **[Priority]** + highly specific, strategic recommendation.

Use ### headers, **bold terms**, and organized bullet points extensively for maximum readability.

Return ONLY valid JSON (no markdown fences):
{
  "overview": "Massive executive briefing (800+ words) with ### headers and **bold findings**",
  "key_points": ["**[Theme]**: Detailed explanation", "..."],
  "quick_facts": ["**[Category]**: Data point with significance", "..."],
  "action_items": ["**[Priority: Critical/High/Medium] [Title]**: Detailed recommendation", "..."]
}`;

export async function runSummaryAgent(
  context: AgentContext,
  apiKeys: ApiKeys
): Promise<AgentResult> {
  const start = Date.now();
  const chain = selectModel("summary", context.query);

  const sourcesText = context.web_results.slice(0, 6).map((r, i) =>
    `[${i + 1}] ${r.title} (${r.domain}): ${r.snippet}`
  ).join("\n");

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

Produce comprehensive executive summary (1200+ words). Return ONLY valid JSON.`,
    },
  ];

  try {
    const result = await callWithFallback(
      "summary-agent",
      chain.primary,
      chain.fallbacks[0],
      messages,
      TOKEN_LIMITS.agentMaxTokens,
      apiKeys
    );

    const parsed = safeParseJSON(result.content);

    return {
      agent: "summary-agent",
      output: parsed ?? {
        overview: result.content.slice(0, 500),
        key_points: [],
        quick_facts: [],
        action_items: [],
      },
      model_used: result.model_used,
      provider: result.provider,
      durationMs: Date.now() - start,
      isFallback: result.isFallback,
    };
  } catch (err) {
    return {
      agent: "summary-agent",
      output: { overview: "", key_points: [], quick_facts: [], action_items: [] },
      model_used: "none",
      provider: "none",
      durationMs: Date.now() - start,
      isFallback: false,
      error: err instanceof Error ? err.message : "Summary agent failed",
    };
  }
}
