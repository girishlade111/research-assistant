import type { ApiKeys, AgentResult, AgentContext } from "../types";
import { selectModel } from "../model-router";
import { callWithFallback, safeParseJSON } from "./base-agent";
import { TOKEN_LIMITS } from "../config";

// ── Fact-Check Agent (Multi-Stage Verification) ──────────────────
// Role: Validate claims, detect contradictions, assess source reliability
// Strategy: 2-stage sequential generation for reliability
// Primary: mistralai/mistral-large-3-675b-instruct-2512 (nvidia)
// Fallback: meta-llama/llama-3.3-70b-instruct (openrouter)

const BASE_SYSTEM_PROMPT = `You are the Fact-Check Agent. Your job is to rigorously validate claims, detect contradictions, and assess source reliability.

WORD COUNT TARGET: 800-1200 words total.
`;

const STAGE_1_PROMPT = `${BASE_SYSTEM_PROMPT}
STAGE 1: Claims & Contradictions (Target: 400-600 words)

MANDATORY OUTPUT FIELDS:
1. "verified_claims": MINIMUM 8-12 items.
2. "unverified_claims": MINIMUM 3-6 items.
3. "contradictions": MINIMUM 2-4 items.

Return ONLY valid JSON:
{
  "verified_claims": ["string", "..."],
  "unverified_claims": ["string", "..."],
  "contradictions": ["string", "..."]
}`;

const STAGE_2_PROMPT = `${BASE_SYSTEM_PROMPT}
STAGE 2: Summary & Reliability (Target: 600-800 words)

MANDATORY OUTPUT FIELDS:
1. "fact_check_summary": MINIMUM 600 words. Must contain:
   - ### Overall Reliability Assessment
   - ### Evidence Strength Analysis
   - ### Source Quality Assessment
   - ### Critical Warnings & Bias Detection
   - ### Recommendations for Readers

2. "warnings": MINIMUM 5-8 items.
3. "reliability_score": number (0-100).
4. "reliability_label": "High" | "Medium-High" | "Medium" | "Medium-Low" | "Low"

Return ONLY valid JSON:
{
  "fact_check_summary": "string",
  "warnings": ["string", "..."],
  "reliability_score": number,
  "reliability_label": "High|Medium-High|Medium|Medium-Low|Low"
}`;

export async function runFactCheckAgent(
  context: AgentContext,
  apiKeys: ApiKeys
): Promise<AgentResult> {
  const start = Date.now();
  const chain = selectModel("fact-check", context.query);

  const sourcesText = context.web_results.slice(0, 8).map((r, i) =>
    `[Source ${i + 1}] ${r.title} (${r.domain}): ${r.snippet}`
  ).join("\n\n");

  const filesText = context.file_context.slice(0, 10).map(f =>
    `[File: ${f.fileName}]\n${f.content.slice(0, 10000)}`
  ).join("\n\n");

  const userPrompt = `ORIGINAL QUERY: ${context.query}\nENHANCED DIRECTIVE: ${context.enhanced_query}\n\nSOURCES:\n${sourcesText}\n\nFILES:\n${filesText}`;

  try {
    // Stage 1
    const res1 = await callWithFallback("fact-check-agent", chain.primary, chain.fallbacks[0],
      [{ role: "system", content: STAGE_1_PROMPT }, { role: "user", content: userPrompt }],
      TOKEN_LIMITS.agentMaxTokens, apiKeys, { jsonMode: true });
    const p1 = safeParseJSON(res1.content) ?? { verified_claims: [], unverified_claims: [], contradictions: [] };

    // Stage 2
    const res2 = await callWithFallback("fact-check-agent", chain.primary, chain.fallbacks[0],
      [{ role: "system", content: STAGE_2_PROMPT }, { role: "user", content: userPrompt }],
      TOKEN_LIMITS.agentMaxTokens, apiKeys, { jsonMode: true });
    const p2 = safeParseJSON(res2.content) ?? { fact_check_summary: "", warnings: [], reliability_score: 50, reliability_label: "Medium" };

    const mergedOutput = {
      verified_claims: p1.verified_claims as string[] ?? [],
      unverified_claims: p1.unverified_claims as string[] ?? [],
      contradictions: p1.contradictions as string[] ?? [],
      fact_check_summary: String(p2.fact_check_summary ?? ""),
      warnings: p2.warnings as string[] ?? [],
      reliability_score: Number(p2.reliability_score ?? 50),
      reliability_label: String(p2.reliability_label ?? "Medium"),
    };

    return {
      agent: "fact-check-agent",
      output: mergedOutput,
      model_used: res2.model_used,
      provider: res2.provider,
      durationMs: Date.now() - start,
      isFallback: res2.isFallback,
    };
  } catch (err) {
    return {
      agent: "fact-check-agent",
      output: { verified_claims: [], unverified_claims: [], contradictions: [], fact_check_summary: "", warnings: [], reliability_score: 50, reliability_label: "Medium" },
      model_used: "none", provider: "none", durationMs: Date.now() - start, isFallback: false,
      error: err instanceof Error ? err.message : "Fact-check failed",
    };
  }
}

