import type { SearchResult, SearchOptions, SearchProvider, ApiKeys } from "./types";
import { sonarSearch } from "./providers/sonar";
import { openrouterComplete } from "./providers/openrouter";

// ── OpenRouter LLM-Based Search Fallback ───────────────────────

async function searchViaOpenRouter(
  apiKey: string,
  query: string,
  maxResults: number
): Promise<SearchResult[]> {
  const response = await openrouterComplete(apiKey, {
    model: "google/gemma-3-27b-it",
    messages: [
      {
        role: "system",
        content: `You are a research search engine. Given a query, return a JSON object with a "results" array of ${maxResults} relevant search results. Each result must have: title (string), url (string), snippet (string), domain (string). Return ONLY valid JSON.`,
      },
      {
        role: "user",
        content: `Find relevant academic and technical sources for: "${query}"`,
      },
    ],
    maxTokens: 1024,
    temperature: 0.3,
    jsonMode: true,
  });

  try {
    const parsed = JSON.parse(response.content);
    const items: unknown[] = Array.isArray(parsed) ? parsed : parsed.results ?? [];

    return items.slice(0, maxResults).map((r: unknown, i: number) => {
      const item = r as Record<string, string>;
      return {
        title: item.title ?? `Source ${i + 1}`,
        url: item.url ?? "",
        snippet: item.snippet ?? "",
        domain: item.domain ?? "",
        relevanceScore: 1 - i * 0.1,
      };
    });
  } catch {
    return [];
  }
}

// ── Public API: Search with Fallback ───────────────────────────

export async function searchWithFallback(
  options: SearchOptions,
  apiKeys: ApiKeys
): Promise<{ results: SearchResult[]; provider: SearchProvider }> {
  const { query, maxResults, mode } = options;

  // Primary: Perplexity Sonar
  if (apiKeys.perplexityKey) {
    try {
      const results = await sonarSearch(apiKeys.perplexityKey, {
        query,
        maxResults,
        model: mode === "deep" ? "sonar-pro" : "sonar",
        recencyFilter: mode === "corpus" ? "month" : "week",
      });
      if (results.length > 0) {
        return { results, provider: "perplexity" };
      }
    } catch (err) {
      console.warn("[search-router] Sonar failed, trying OpenRouter fallback:", err);
    }
  }

  // Fallback: OpenRouter LLM-based search
  if (apiKeys.openrouterKey) {
    try {
      const results = await searchViaOpenRouter(apiKeys.openrouterKey, query, maxResults);
      return { results, provider: "openrouter" };
    } catch (err) {
      console.warn("[search-router] OpenRouter search fallback also failed:", err);
    }
  }

  // Both failed — return empty
  return { results: [], provider: "perplexity" };
}
