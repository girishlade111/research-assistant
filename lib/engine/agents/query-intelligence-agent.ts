import type { ApiKeys, AgentResult, AgentContext } from "../types";
import { selectModel } from "../model-router";
import { callWithFallback, safeParseJSON } from "./base-agent";
import { TOKEN_LIMITS } from "../config";

// ── Query Intelligence Agent ───────────────────────────────────
// Role: Expand query, detect intent, generate subtopics
// Primary: moonshotai/kimi-k2-thinking (nvidia)
// Fallback: openai/gpt-oss-120b (openrouter)

const SYSTEM_PROMPT = `You are a Query Intelligence Agent that transforms user queries into massive, highly detailed research blueprints for a multi-agent pipeline.

CRITICAL: You must generate a highly comprehensive, multi-layered research directive regardless of the initial query's simplicity. Your output must be deeply analytical, expansive, and serve as the foundation for a 6-page research report.

OUTPUT REQUIREMENTS:
1. **enhanced_query**: A massive, deeply structured research directive (minimum 500-800 words). Break it down into Context, Objectives, Key Questions, and Methodological Approach using ### headers.
2. **intent**: Classify as coding|research|comparison|explanation|factual|general
3. **subtopics**: At least 8-12 highly detailed, self-contained research vectors with descriptions.
4. **key_concepts**: At least 10-15 relevant definitions, explaining their nuance and importance.
5. **search_terms**: 10-15 highly optimized search vectors with advanced Boolean operators.

FORMAT: Use **bold labels** for every list item. Use ### headers in enhanced_query. Organize everything into detailed bullet points for readability.

Return ONLY valid JSON (no markdown fences):
{
  "enhanced_query": "Massive, highly detailed research directive with ### headers",
  "intent": "coding|research|comparison|explanation|factual|general",
  "subtopics": ["**[Title]** — Detailed description", "..."],
  "key_concepts": ["**[Term]** — Detailed definition", "..."],
  "search_terms": ["**[Focus]** — Optimized search query", "..."]
}`;

export async function runQueryIntelligenceAgent(
  query: string,
  mode: "pro" | "deep" | "corpus",
  apiKeys: ApiKeys
): Promise<AgentResult & { enhanced_query: string; subtopics: string[] }> {
  const start = Date.now();
  const chain = selectModel("query", query);

  const modeHint: Record<string, string> = {
    pro: "Professional, well-structured research expansion.",
    deep: "Academic-grade query expansion with breadth and depth.",
    corpus: "Literature and evidence-based search directives.",
  };

  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    {
      role: "user" as const,
      content: `Query: "${query}"\nMode: ${mode} — ${modeHint[mode] ?? ""}\n\nYour output guides 5 downstream agents that each produce a full page. Be thorough. Return ONLY valid JSON.`,
    },
  ];

  try {
    const result = await callWithFallback(
      "query-intelligence-agent",
      chain.primary,
      chain.fallbacks[0],
      messages,
      TOKEN_LIMITS.agentMaxTokens,
      apiKeys
    );

    const parsed = safeParseJSON(result.content);

    const enhanced_query = parsed
      ? String(parsed.enhanced_query ?? query)
      : query;
    const subtopics: string[] = parsed
      ? (Array.isArray(parsed.subtopics) ? (parsed.subtopics as string[]) : [])
      : [];

    return {
      agent: "query-intelligence-agent",
      output: parsed ?? { enhanced_query, subtopics },
      model_used: result.model_used,
      provider: result.provider,
      durationMs: Date.now() - start,
      isFallback: result.isFallback,
      enhanced_query,
      subtopics,
    };
  } catch (err) {
    return {
      agent: "query-intelligence-agent",
      output: { enhanced_query: query, subtopics: [] },
      model_used: "none",
      provider: "none",
      durationMs: Date.now() - start,
      isFallback: false,
      error: err instanceof Error ? err.message : "Query agent failed",
      enhanced_query: query,
      subtopics: [],
    };
  }
}
