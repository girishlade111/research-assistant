import type { ApiKeys, AgentResult, AgentContext } from "../types";
import { selectModel } from "../model-router";
import { callWithFallback, safeParseJSON } from "./base-agent";
import { TOKEN_LIMITS } from "../config";

// ── Fact-Check Agent ───────────────────────────────────────────
// Role: Validate claims, detect contradictions, assess source reliability
// Primary: mistralai/mistral-large-3-675b-instruct-2512 (nvidia)
// Fallback: meta-llama/llama-3.3-70b-instruct (openrouter)

const SYSTEM_PROMPT = `You are a Fact-Check & Verification Agent performing rigorous cross-source validation.

CRITICAL: Adapt your depth and length to the complexity of the query. For complex topics, generate an extensive fact-check report. For simple queries, provide a concise verification summary.

OUTPUT STRUCTURE:

**verified_claims**: For each: **[Claim]** (Confidence) — evidence, citations. Provide only as many as necessary to validate the core topic.
**unverified_claims**: For each: **[Claim]** (Risk) — why unverifiable. Provide if questionable claims exist.
**contradictions**: Conflicting claims with sources and resolution. Only if applicable.
**fact_check_summary**: 
- Overall Assessment: Reliability rating, confidence statement.
- Evidence Strength: Strongest vs weakest areas.
- Critical Warnings: Any major contradictions.
**warnings**: **[Category]** — specific concern. Extract only the most crucial warnings.

SCORING: 90-100 High (multiple independent confirmations) | 70-89 Medium-High | 50-69 Medium (mixed) | 30-49 Medium-Low | 0-29 Low

Return ONLY valid JSON (no markdown fences):
{
  "verified_claims": ["**[Claim]** (Confidence: X) — Evidence and analysis", "...number appropriate to scope"],
  "unverified_claims": ["**[Claim]** (Risk: X) — Why unverifiable and risk", "...number appropriate to scope"],
  "contradictions": ["**[Topic]** — Source X vs Y analysis and resolution", "...number appropriate to scope"],
  "reliability_score": 85,
  "reliability_label": "High|Medium-High|Medium|Medium-Low|Low",
  "fact_check_summary": "Narrative sized appropriately for query complexity with ### headers and **bold findings**",
  "warnings": ["**[Category] — [Title]**: Concern and adjustment guidance", "...number appropriate to scope"]
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

  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    {
      role: "user" as const,
      content: `Query: ${context.query}
Enhanced: ${context.enhanced_query}

Sources:\n${sourcesText || "No web sources available."}
${filesText ? `\nFiles:\n${filesText}` : ""}

Cross-validate all sources. Assess reliability rigorously (1200+ words). Return ONLY valid JSON.`,
    },
  ];

  try {
    const result = await callWithFallback(
      "fact-check-agent",
      chain.primary,
      chain.fallbacks[0],
      messages,
      TOKEN_LIMITS.agentMaxTokens,
      apiKeys
    );

    const parsed = safeParseJSON(result.content);

    return {
      agent: "fact-check-agent",
      output: parsed ?? {
        verified_claims: [],
        unverified_claims: [],
        contradictions: [],
        reliability_score: 50,
        reliability_label: "Medium",
        fact_check_summary: result.content.slice(0, 500),
        warnings: [],
      },
      model_used: result.model_used,
      provider: result.provider,
      durationMs: Date.now() - start,
      isFallback: result.isFallback,
    };
  } catch (err) {
    return {
      agent: "fact-check-agent",
      output: {
        verified_claims: [],
        unverified_claims: [],
        contradictions: [],
        reliability_score: 0,
        reliability_label: "Unknown",
        fact_check_summary: "Fact-check could not be completed.",
        warnings: [],
      },
      model_used: "none",
      provider: "none",
      durationMs: Date.now() - start,
      isFallback: false,
      error: err instanceof Error ? err.message : "Fact-check agent failed",
    };
  }
}
