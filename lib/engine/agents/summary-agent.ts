import type { ApiKeys, AgentResult, AgentContext } from "../types";
import { selectModel } from "../model-router";
import { callWithFallback, safeParseJSON } from "./base-agent";
import { TOKEN_LIMITS } from "../config";

// ── Summary Agent (Multi-Stage Synthesis) ───────────────────────
// Role: Executive summary, key points, quick facts, action items
// Strategy: 2-stage sequential generation for reliability
// Primary: minimaxai/minimax-m2.7 (nvidia)
// Fallback: google/gemma-4-31b-it (openrouter)

const BASE_SYSTEM_PROMPT = `You are the Executive Summary Agent. Your job is to distill complex research findings into a comprehensive, well-structured executive briefing.

WORD COUNT TARGET: 800-1200 words total.
`;

const STAGE_1_PROMPT = `${BASE_SYSTEM_PROMPT}
STAGE 1: Executive Summary & Themes (Target: 600-800 words)

MANDATORY OUTPUT FIELDS:
1. "overview_part_1": MINIMUM 600 words. Must contain:
   - ### Executive Summary (Bottom line + Urgency + Top findings)
   - ### Key Themes & Thematic Analysis (4-6 major themes with evidence)

Return ONLY valid JSON:
{
  "overview_part_1": "string"
}`;

const STAGE_2_PROMPT = `${BASE_SYSTEM_PROMPT}
STAGE 2: Strategy, Facts & Actions (Target: 600-800 words)

MANDATORY OUTPUT FIELDS:
1. "overview_part_2": MINIMUM 300 words. Must contain:
   - ### Strategic Implications & Recommendations
   - ### Outlook & Conclusion

2. "key_points": MINIMUM 8-12 items. Substantive findings (2-3 sentences each).
3. "quick_facts": MINIMUM 10-15 items. Specific data/stats.
4. "action_items": MINIMUM 5-8 items. Ranked by priority.

Return ONLY valid JSON:
{
  "overview_part_2": "string",
  "key_points": ["string", "..."],
  "quick_facts": ["string", "..."],
  "action_items": ["string", "..."]
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

  const userPrompt = `ORIGINAL QUERY: ${context.query}\nENHANCED DIRECTIVE: ${context.enhanced_query}\n\nSOURCES:\n${sourcesText}\n\nFILES:\n${filesText}`;

  try {
    // Stage 1
    const res1 = await callWithFallback("summary-agent", chain.primary, chain.fallbacks[0],
      [{ role: "system", content: STAGE_1_PROMPT }, { role: "user", content: userPrompt }],
      TOKEN_LIMITS.agentMaxTokens, apiKeys, { jsonMode: true });
    const p1 = safeParseJSON(res1.content) ?? { overview_part_1: "" };

    // Stage 2
    const res2 = await callWithFallback("summary-agent", chain.primary, chain.fallbacks[0],
      [{ role: "system", content: STAGE_2_PROMPT }, { role: "user", content: userPrompt }],
      TOKEN_LIMITS.agentMaxTokens, apiKeys, { jsonMode: true });
    const p2 = safeParseJSON(res2.content) ?? { overview_part_2: "", key_points: [], quick_facts: [], action_items: [] };

    const mergedOutput = {
      overview: `${String(p1.overview_part_1 ?? "")}\n\n${String(p2.overview_part_2 ?? "")}`,
      key_points: p2.key_points as string[] ?? [],
      quick_facts: p2.quick_facts as string[] ?? [],
      action_items: p2.action_items as string[] ?? [],
    };

    return {
      agent: "summary-agent",
      output: mergedOutput,
      model_used: res2.model_used,
      provider: res2.provider,
      durationMs: Date.now() - start,
      isFallback: res2.isFallback,
    };
  } catch (err) {
    return {
      agent: "summary-agent",
      output: { overview: "", key_points: [], quick_facts: [], action_items: [] },
      model_used: "none", provider: "none", durationMs: Date.now() - start, isFallback: false,
      error: err instanceof Error ? err.message : "Summary failed",
    };
  }
}

