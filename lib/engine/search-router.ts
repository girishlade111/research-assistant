import type { SearchResult, SearchOptions, ApiKeys } from "./types";
import { nvidiaComplete } from "./providers/nvidia";
import { openrouterComplete } from "./providers/openrouter";

// ── Search Result Parser ───────────────────────────────────────
// Both NVIDIA and OpenRouter return generated text → parse into SearchResult[]

function parseGeneratedResults(content: string, maxResults: number): SearchResult[] {
  // Try JSON first
  try {
    const fence = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    const raw = fence ? fence[1] : content;
    const parsed = JSON.parse(raw);
    const items: unknown[] = Array.isArray(parsed) ? parsed : parsed.results ?? parsed.sources ?? [];
    return items.slice(0, maxResults).map((r: unknown, i: number) => {
      const item = r as Record<string, string>;
      return {
        title: item.title ?? `Source ${i + 1}`,
        url: item.url ?? "",
        snippet: item.snippet ?? item.summary ?? item.description ?? "",
        domain: item.domain ?? extractDomain(item.url ?? ""),
        relevanceScore: 1 - i * 0.08,
      };
    });
  } catch {
    // Fall back to line-by-line parsing of numbered lists
    const lines = content.split("\n").filter(Boolean);
    const results: SearchResult[] = [];
    for (const line of lines) {
      const urlMatch = line.match(/https?:\/\/[^\s)"<>]+/);
      if (urlMatch) {
        const url = urlMatch[0];
        results.push({
          title: extractTitleFromUrl(url),
          url,
          snippet: line.replace(url, "").replace(/^\s*[\-\*\d.]+\s*/, "").trim().slice(0, 250),
          domain: extractDomain(url),
          relevanceScore: 1 - results.length * 0.08,
        });
      }
      if (results.length >= maxResults) break;
    }
    return results;
  }
}

function extractDomain(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
}

function extractTitleFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    const segments = path.split("/").filter(Boolean);
    const last = segments[segments.length - 1] ?? "";
    return last.replace(/[-_]/g, " ").replace(/\.\w+$/, "").trim() || extractDomain(url);
  } catch { return url; }
}

// ── Search system prompt ───────────────────────────────────────

function buildSearchMessages(query: string, searchTerms: string[], maxResults: number, mode: string) {
  const termsText = searchTerms.length > 0 ? `Optimized search terms to explore: ${searchTerms.join(", ")}` : "";
  
  return [
    {
      role: "system" as const,
      content: `You are a research search engine assistant. Generate ${maxResults} highly relevant search result entries for the given query.
      
Mode: ${mode === "deep" ? "Academic/in-depth" : mode === "corpus" ? "Scientific literature" : "Professional research"}
${termsText}

Return ONLY a valid JSON array of ${maxResults} objects. Each object MUST have:
- "title": descriptive title of the source
- "url": a plausible, realistic URL (e.g. https://arxiv.org/..., https://docs.example.com/..., https://en.wikipedia.org/wiki/...)
- "snippet": 1-2 sentence excerpt summarizing what that source says about the topic
- "domain": the domain name only (e.g. "arxiv.org")

Focus on high-quality, authoritative sources: Wikipedia, arXiv, official docs, major news, research papers, technical blogs.
Return ONLY the JSON array, no extra text.`,
    },
    {
      role: "user" as const,
      content: `Research query: "${query}"`,
    },
  ];
}

// ── NVIDIA-powered Search ──────────────────────────────────────
// Uses a fast/balanced model to generate structured search results

async function searchViaNvidia(
  apiKey: string,
  query: string,
  searchTerms: string[],
  maxResults: number,
  mode: string
): Promise<SearchResult[]> {
  const response = await nvidiaComplete(apiKey, {
    model: "abacusai/dracarys-llama-3.1-70b-instruct",   // fast, balanced
    messages: buildSearchMessages(query, searchTerms, maxResults, mode),
    maxTokens: 1500,
    temperature: 0.4,
  });
  return parseGeneratedResults(response.content, maxResults);
}

// ── OpenRouter-powered Search ─────────────────────────────────
// Uses Llama 3.3 70B (free) as primary; GLM-4.5 Air as secondary

async function searchViaOpenRouter(
  apiKey: string,
  query: string,
  searchTerms: string[],
  maxResults: number,
  mode: string
): Promise<SearchResult[]> {
  const response = await openrouterComplete(apiKey, {
    model: "meta-llama/llama-3.3-70b-instruct:free",
    messages: buildSearchMessages(query, searchTerms, maxResults, mode),
    maxTokens: 1500,
    temperature: 0.4,
    jsonMode: true,
  });
  return parseGeneratedResults(response.content, maxResults);
}

// ── Public API: Search with Fallback ───────────────────────────
// Primary: NVIDIA NIM → Fallback: OpenRouter

export async function searchWithFallback(
  options: SearchOptions,
  apiKeys: ApiKeys
): Promise<{ results: SearchResult[]; provider: "nvidia" | "openrouter" }> {
  const { query, maxResults, mode } = options;

  // Primary: NVIDIA NIM search
  if (apiKeys.nvidiaKey) {
    try {
      const results = await searchViaNvidia(
        apiKeys.nvidiaKey,
        options.enhanced_query || options.query,
        options.search_terms || [],
        options.maxResults,
        mode
      );
      if (results.length > 0) {
        console.log("[search-router] NVIDIA search OK:", results.length, "results");
        return { results, provider: "nvidia" };
      }
    } catch (err) {
      console.warn("[search-router] NVIDIA search failed, trying OpenRouter:", err);
    }
  }

  // Fallback: OpenRouter search
  if (apiKeys.openrouterKey) {
    try {
      const results = await searchViaOpenRouter(
        apiKeys.openrouterKey,
        options.enhanced_query || options.query,
        options.search_terms || [],
        options.maxResults,
        mode
      );
      if (results.length > 0) {
        console.log("[search-router] OpenRouter search OK:", results.length, "results");
        return { results, provider: "openrouter" };
      }
    } catch (error) {
      console.warn("[search-router] OpenRouter search failed:", error);
    }
  }

  // Both failed — return empty
  console.warn("[search-router] All search providers failed, returning empty");
  return { results: [], provider: "openrouter" };
}
