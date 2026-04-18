import type { ApiKeys, AgentResult, AgentContext } from "../types";
import { selectModel } from "../model-router";
import { callWithFallback, safeParseJSON } from "./base-agent";
import { TOKEN_LIMITS } from "../config";

// ── Query Intelligence Agent ───────────────────────────────────
// Role: Expand query, detect intent, generate subtopics
// Primary: moonshotai/kimi-k2-thinking (nvidia)
// Fallback: openai/gpt-oss-120b (openrouter)

const SYSTEM_PROMPT = `You are a Query Intelligence Agent that transforms user queries into research blueprints for a multi-agent pipeline. 

CRITICAL: Adapt your depth and length to the complexity of the query. For complex topics, generate comprehensive directives. For simple queries, remain concise and direct.

OUTPUT REQUIREMENTS:
1. **enhanced_query**: A structured research directive. For complex topics, use ### headers and expand on context and analytical angles. For simple topics, provide a clear, brief directive.
2. **intent**: Classify as coding|research|comparison|explanation|factual|general
3. **subtopics**: Self-contained research vectors with short descriptions. Provide only as many as needed to cover the topic (e.g., 2-3 for simple queries, 6-8 for complex ones).
4. **key_concepts**: Relevant definitions. Only provide what is genuinely necessary.
5. **search_terms**: Optimized search vectors with Boolean operators. Provide 3-8 depending on scope.

FORMAT: Use **bold labels** for every list item. Use ### headers in enhanced_query if size warrants it.

Return ONLY valid JSON (no markdown fences):
{
  "enhanced_query": "A research directive sized appropriately for the query complexity",
  "intent": "coding|research|comparison|explanation|factual|general",
  "subtopics": ["**Subtopic 1: [Title]** — Short description", "...number appropriate to scope"],
  "key_concepts": ["**[Term]** — Short definition", "...number appropriate to scope"],
  "search_terms": ["**[Focus]** — Optimized search query", "...number appropriate to scope"]
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
