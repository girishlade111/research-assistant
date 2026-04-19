import type { ApiKeys, AgentResult, AgentContext } from "../types";
import { selectModel } from "../model-router";
import { callWithFallback, safeParseJSON } from "./base-agent";
import { TOKEN_LIMITS } from "../config";

// ── Fact-Check Agent ───────────────────────────────────────────
// Role: Validate claims, detect contradictions, assess source reliability
// Primary: mistralai/mistral-large-3-675b-instruct-2512 (nvidia)
// Fallback: meta-llama/llama-3.3-70b-instruct (openrouter)

const SYSTEM_PROMPT = `You are a Fact-Check & Verification Agent performing rigorous, exhaustive cross-source validation.

CRITICAL: You must generate a minimum of ONE FULL PAGE (800-1000+ words) of meticulous verification and critical assessment.

OUTPUT STRUCTURE:

**verified_claims**: At least 8-12 claims. **[Claim]** (Confidence) — exhaustive evidence, citations, and analytical backing.
**unverified_claims**: At least 5-8 claims (if present). **[Claim]** (Risk) — detailed reasoning on why it's unverifiable and potential risk impact.
**contradictions**: Deep dive into any conflicting claims with sources, nuance, and potential resolution.
**fact_check_summary** field (must be massive and deeply sectioned):
- Overall Assessment: Exhaustive reliability rating and confidence statement.
- Evidence Strength: Deep dive into the strongest vs weakest evidentiary areas.
- Critical Warnings: Comprehensive analysis of major contradictions or biases.
**warnings**: At least 5-8 critical warnings. **[Category]** — highly specific concern and detailed adjustment guidance.

SCORING: 90-100 High | 70-89 Medium-High | 50-69 Medium | 30-49 Medium-Low | 0-29 Low

Use ### headers, **bold terms**, and organized bullet points extensively.

Return ONLY valid JSON (no markdown fences):
{
  "verified_claims": ["**[Claim]** (Confidence: X) — Exhaustive evidence and analysis", "..."],
  "unverified_claims": ["**[Claim]** (Risk: X) — Detailed risk analysis", "..."],
  "contradictions": ["**[Topic]** — Source X vs Y exhaustive analysis", "..."],
  "reliability_score": 85,
  "reliability_label": "High|Medium-High|Medium|Medium-Low|Low",
  "fact_check_summary": "Massive narrative summary (800+ words) with ### headers and **bold findings**",
  "warnings": ["**[Category] — [Title]**: Detailed concern and guidance", "..."]
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
