import type { ApiKeys, AgentResult, AgentContext } from "../types";
import { selectModel } from "../model-router";
import { callWithFallback, safeParseJSON } from "./base-agent";
import { TOKEN_LIMITS } from "../config";

// ── Analysis Agent (Multi-Stage Deep Dive) ───────────────────────
// Role: Deep analysis, compare insights, identify patterns
// Strategy: 2-stage sequential generation for reliability
// Primary: nvidia/nemotron-3-super-120b-a12b (nvidia)
// Fallback: nvidia/nemotron-3-super-120b-a12b:free (openrouter)

const BASE_SYSTEM_PROMPT = `You are the Deep Analysis Agent. Your job is to perform rigorous, multi-dimensional research analysis. 

You receive web search results, file context, and an enhanced query. Your job is to perform DEEP ANALYSIS — not summarization. Synthesize across sources, identify patterns, evaluate evidence quality, and provide original insights.

WORD COUNT TARGET: 1000-1500 words total.
`;

const STAGE_1_PROMPT = `${BASE_SYSTEM_PROMPT}
STAGE 1: Foundation & Technical (Target: 600-800 words)

MANDATORY OUTPUT FIELDS:
1. "analysis_part_1": MINIMUM 600 words. Must contain:
   - ### Foundational Context & Landscape Overview
   - ### Technical & Mechanistic Deep Dive

Return ONLY valid JSON:
{
  "analysis_part_1": "string"
}`;

const STAGE_2_PROMPT = `${BASE_SYSTEM_PROMPT}
STAGE 2: Impact & Evaluation (Target: 600-800 words)

MANDATORY OUTPUT FIELDS:
1. "analysis_part_2": MINIMUM 400 words. Must contain:
   - ### Multi-Dimensional Impact Analysis
   - ### Critical Evaluation & Evidence Assessment
   - ### Future Outlook & Strategic Implications

2. "patterns": MINIMUM 5-8 items. Non-obvious connections.
3. "comparison": MINIMUM 300-500 words. Structured comparison.
4. "confidence": "high" | "medium" | "low".
5. "caveats": MINIMUM 5-8 items. Critical risks.

Return ONLY valid JSON:
{
  "analysis_part_2": "string",
  "patterns": ["string", "..."],
  "comparison": "string",
  "confidence": "high|medium|low",
  "caveats": ["string", "..."]
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

  const userPrompt = `ORIGINAL QUERY: ${context.query}\nENHANCED DIRECTIVE: ${context.enhanced_query}\n\nSOURCES:\n${sourcesText}\n\nFILES:\n${filesText}`;

  try {
    // Stage 1
    const res1 = await callWithFallback("analysis-agent", chain.primary, chain.fallbacks[0],
      [{ role: "system", content: STAGE_1_PROMPT }, { role: "user", content: userPrompt }],
      TOKEN_LIMITS.agentMaxTokens, apiKeys, { jsonMode: true });
    const p1 = safeParseJSON(res1.content) ?? { analysis_part_1: "" };

    // Stage 2
    const res2 = await callWithFallback("analysis-agent", chain.primary, chain.fallbacks[0],
      [{ role: "system", content: STAGE_2_PROMPT }, { role: "user", content: userPrompt }],
      TOKEN_LIMITS.agentMaxTokens, apiKeys, { jsonMode: true });
    const p2 = safeParseJSON(res2.content) ?? { analysis_part_2: "", patterns: [], comparison: "", confidence: "medium", caveats: [] };

    const mergedOutput = {
      analysis: `${String(p1.analysis_part_1 ?? "")}\n\n${String(p2.analysis_part_2 ?? "")}`,
      patterns: p2.patterns as string[] ?? [],
      comparison: String(p2.comparison ?? ""),
      confidence: String(p2.confidence ?? "medium"),
      caveats: p2.caveats as string[] ?? [],
    };

    return {
      agent: "analysis-agent",
      output: mergedOutput,
      model_used: res2.model_used,
      provider: res2.provider,
      durationMs: Date.now() - start,
      isFallback: res2.isFallback,
    };
  } catch (err) {
    return {
      agent: "analysis-agent",
      output: { analysis: "", patterns: [], comparison: "", confidence: "low", caveats: [] },
      model_used: "none", provider: "none", durationMs: Date.now() - start, isFallback: false,
      error: err instanceof Error ? err.message : "Analysis failed",
    };
  }
}

