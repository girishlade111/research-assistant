import type { ApiKeys, AgentResult, AgentContext, ResearchSource } from "../types";
import { selectModel } from "../model-router";
import { callWithFallback, safeParseJSON } from "./base-agent";
import { TOKEN_LIMITS } from "../config";

// ── Report Generation Agent (Multi-Stage Synthesis) ──────────────
// Role: Combine ALL agent outputs into one structured final report
// Strategy: 4-stage sequential generation to handle massive word counts (4k-6k)
// Primary: moonshotai/kimi-k2-thinking (nvidia)
// Fallback: openai/gpt-oss-120b (openrouter)

const BASE_SYSTEM_PROMPT = `You are the Report Synthesis Agent — the FINAL stage of a multi-agent research pipeline. Your mission is to synthesize ALL specialized agent outputs into a massive, publication-quality research report spanning 5-6 full pages.

You receive outputs from: Query Intelligence, Executive Summary, Deep Analysis, Fact-Check, and Coding agents.

SYNTHESIS RULES:
1. DO NOT simply concatenate. Cross-reference agents: "The Analysis Agent identified X, corroborated by the Fact-Check Agent's finding that Y."
2. MAINTAIN A COHESIVE NARRATIVE. The report must read as one unified document.
3. USE RICH FORMATTING: ### headers, **bold** key terms, bullet points, and --- horizontal rules.
4. WORD COUNT TARGET: 4000-6000 words total across all sections.
`;

const STAGE_1_PROMPT = `${BASE_SYSTEM_PROMPT}
STAGE 1: Overview & Key Insights (Target: 1000-1500 words)

MANDATORY OUTPUT FIELDS:
1. "overview": MINIMUM 800-1000 words. Include:
   - ### Executive Summary (Lead finding + Background)
   - ### Research Methodology & Scope (Process + Sources)
   - ### Key Findings at a Glance (5-7 bold findings)
   - ### Reliability & Confidence Statement (Score + Caveats)

2. "key_insights": MINIMUM 12-18 items.
   - Format: "**[Insight Title]** (Source: [Agent Name]) — [Detailed 3-4 sentence explanation with evidence]."
   - MUST include insights from EVERY upstream agent.

Return ONLY valid JSON:
{
  "overview": "string",
  "key_insights": ["string", "..."]
}`;

const STAGE_2_PROMPT = `${BASE_SYSTEM_PROMPT}
STAGE 2: Core Analysis (Chapters 1-4) (Target: 1500-2000 words)

You are continuing the report. Generate the first half of the "details" section.
MANDATORY OUTPUT FIELD:
1. "details_part_1": MINIMUM 1500 words. Must contain:
   - ### Chapter 1: Foundational Context & Background
   - ### Chapter 2: Technical / Mechanistic Deep Dive
   - ### Chapter 3: Multi-Dimensional Impact Assessment
   - ### Chapter 4: Evidence Analysis & Source Review

Return ONLY valid JSON:
{
  "details_part_1": "string"
}`;

const STAGE_3_PROMPT = `${BASE_SYSTEM_PROMPT}
STAGE 3: Advanced Analysis (Chapters 5-8) (Target: 1500-2000 words)

You are continuing the report. Generate the second half of the "details" section.
MANDATORY OUTPUT FIELD:
1. "details_part_2": MINIMUM 1500 words. Must contain:
   - ### Chapter 5: Patterns, Trends & Emerging Insights
   - ### Chapter 6: Comparative Analysis
   - ### Chapter 7: Risk Assessment & Caveats
   - ### Chapter 8: Future Outlook & Strategic Roadmap

Return ONLY valid JSON:
{
  "details_part_2": "string"
}`;

const STAGE_4_PROMPT = `${BASE_SYSTEM_PROMPT}
STAGE 4: Synthesis & Conclusion (Target: 1000-1500 words)

MANDATORY OUTPUT FIELDS:
1. "comparison": MINIMUM 400-600 words. Structured matrix, Pros/Cons, Recommendations.
2. "expert_insights": MINIMUM 8-12 items. Original analytical contributions synthesizing across multiple agents.
3. "conclusion": MINIMUM 400-600 words. Summary of Findings, Actionable Recommendations, Future Research.
4. "fact_check_summary": 200-400 words reliability assessment.
5. "reliability_score": number (0-100).

Return ONLY valid JSON:
{
  "comparison": "string",
  "expert_insights": ["string", "..."],
  "conclusion": "string",
  "fact_check_summary": "string",
  "reliability_score": number
}`;

interface AllAgentOutputs {
  query: string;
  enhanced_query: string;
  queryOutput: Record<string, unknown>;
  searchOutput: Record<string, unknown>;
  analysisOutput: Record<string, unknown>;
  summaryOutput: Record<string, unknown>;
  factCheckOutput: Record<string, unknown>;
  codingOutput: Record<string, unknown>;
  sources: ResearchSource[];
}

export async function runReportAgent(
  context: AgentContext,
  allOutputs: AllAgentOutputs,
  apiKeys: ApiKeys,
  onChunk?: (text: string, done: boolean) => void
): Promise<AgentResult> {
  const start = Date.now();
  const chain = selectModel("report", context.query);

  const agentSummary = `
═══════════════════════════════════════════════════
SPECIALIZED AGENT OUTPUTS
═══════════════════════════════════════════════════
QUERY: ${allOutputs.enhanced_query}
SUMMARY: ${allOutputs.summaryOutput.overview ?? ""}
ANALYSIS: ${allOutputs.analysisOutput.analysis ?? ""}
FACT-CHECK: ${allOutputs.factCheckOutput.fact_check_summary ?? ""}
CODING: ${allOutputs.codingOutput.code ? "Code available" : "N/A"}
SOURCES: ${allOutputs.sources.length} sources found.
`.trim();

  const userPrompt = `ORIGINAL USER QUERY: ${context.query}\n\n${agentSummary}\n\nPerform synthesis stage by stage.`;

  try {
    // Stage 1
    const res1 = await callWithFallback("report-agent", chain.primary, chain.fallbacks[0], 
      [{ role: "system", content: STAGE_1_PROMPT }, { role: "user", content: userPrompt }],
      TOKEN_LIMITS.reportMaxTokens, apiKeys, { jsonMode: true });
    const p1 = safeParseJSON(res1.content) ?? { overview: "", key_insights: [] };
    if (onChunk) onChunk(`### Report Synthesis: Stage 1 complete...\n`, false);

    // Stage 2
    const res2 = await callWithFallback("report-agent", chain.primary, chain.fallbacks[0], 
      [{ role: "system", content: STAGE_2_PROMPT }, { role: "user", content: userPrompt }],
      TOKEN_LIMITS.reportMaxTokens, apiKeys, { jsonMode: true });
    const p2 = safeParseJSON(res2.content) ?? { details_part_1: "" };
    if (onChunk) onChunk(`### Report Synthesis: Stage 2 complete...\n`, false);

    // Stage 3
    const res3 = await callWithFallback("report-agent", chain.primary, chain.fallbacks[0], 
      [{ role: "system", content: STAGE_3_PROMPT }, { role: "user", content: userPrompt }],
      TOKEN_LIMITS.reportMaxTokens, apiKeys, { jsonMode: true });
    const p3 = safeParseJSON(res3.content) ?? { details_part_2: "" };
    if (onChunk) onChunk(`### Report Synthesis: Stage 3 complete...\n`, false);

    // Stage 4
    const res4 = await callWithFallback("report-agent", chain.primary, chain.fallbacks[0], 
      [{ role: "system", content: STAGE_4_PROMPT }, { role: "user", content: userPrompt }],
      TOKEN_LIMITS.reportMaxTokens, apiKeys, { jsonMode: true });
    const p4 = safeParseJSON(res4.content) ?? { comparison: "", expert_insights: [], conclusion: "", fact_check_summary: "", reliability_score: 0 };
    if (onChunk) onChunk(`### Report Synthesis: Finalizing...\n`, false);

    const mergedOutput = {
      overview: String(p1.overview ?? ""),
      key_insights: p1.key_insights as string[] ?? [],
      details: `${String(p2.details_part_1 ?? "")}\n\n${String(p3.details_part_2 ?? "")}`,
      comparison: String(p4.comparison ?? ""),
      expert_insights: p4.expert_insights as string[] ?? [],
      conclusion: String(p4.conclusion ?? ""),
      fact_check_summary: String(p4.fact_check_summary ?? ""),
      reliability_score: Number(p4.reliability_score ?? 0),
    };

    return {
      agent: "report-agent",
      output: mergedOutput,
      model_used: res4.model_used,
      provider: res4.provider,
      durationMs: Date.now() - start,
      isFallback: res4.isFallback,
    };
  } catch (err) {
    return {
      agent: "report-agent",
      output: { overview: context.query, details: "", key_insights: [], comparison: "", expert_insights: [], conclusion: "", fact_check_summary: "", reliability_score: 0 },
      model_used: "none", provider: "none", durationMs: Date.now() - start, isFallback: false,
      error: err instanceof Error ? err.message : "Report synthesis failed",
    };
  }
}

