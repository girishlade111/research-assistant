import type { ApiKeys, AgentResult, AgentContext } from "../types";
import { selectModel } from "../model-router";
import { callWithFallback, safeParseJSON } from "./base-agent";
import { TOKEN_LIMITS } from "../config";

// ── Summary Agent ─────────────────────────────────────────────
// Role: Executive summary, key points, quick facts, action items
// Primary: minimaxai/minimax-m2.7 (nvidia)
// Fallback: google/gemma-4-31b-it (openrouter)

const SYSTEM_PROMPT = `You are an Executive Summary Agent. 

CRITICAL: Adapt your depth and length to the complexity of the query. For complex topics, generate deep executive briefings. For simple queries, remain concise and direct.

OUTPUT STRUCTURE:

**overview**:
- Executive Summary: Topic importance, core findings, bottom-line takeaway.
- Thematic Analysis: Major themes with titles and implications (only if topic is complex).
- Strategic Implications: Practical impact and recommendations (if relevant).

**key_points**: Theme label + brief explanation. Provide only as many as needed to properly summarize the topic.
**quick_facts**: Category + data point + significance. Provide only as many as genuinely useful.
**action_items**: **[Priority]** + specific recommendation (if applicable to the query).

Use ### headers, **bold terms**, and bullet points.

Return ONLY valid JSON (no markdown fences):
{
  "overview": "An executive briefing sized appropriately for query complexity with ### headers and **bold findings**",
  "key_points": ["**[Theme]**: Explanation", "...number appropriate to scope"],
  "quick_facts": ["**[Category]**: Data point with significance", "...number appropriate to scope"],
  "action_items": ["**[Priority: Critical/High/Medium] [Title]**: Recommendation", "...number appropriate to scope"]
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
