import type { SearchResult, BuiltContext } from "./types";
import { TOKEN_LIMITS } from "./config";

// ── Deduplication ──────────────────────────────────────────────

function deduplicateByUrl(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>();
  return results.filter((r) => {
    const normalized = r.url.toLowerCase().replace(/\/+$/, "");
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

// ── Relevance Ranking ──────────────────────────────────────────

function rankByRelevance(results: SearchResult[]): SearchResult[] {
  return [...results].sort((a, b) => {
    // Primary: relevance score (higher is better)
    if (b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }
    // Secondary: snippet length as proxy for content richness
    return b.snippet.length - a.snippet.length;
  });
}

// ── Token Estimation ───────────────────────────────────────────

function estimateTokens(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.ceil(words * TOKEN_LIMITS.wordsToTokenRatio);
}

// ── Context Formatting ─────────────────────────────────────────

function formatAsContext(results: SearchResult[]): string {
  return results
    .map(
      (r, i) =>
        `[Source ${i + 1}] ${r.title}\nURL: ${r.url}\n${r.snippet}\n`
    )
    .join("\n---\n\n");
}

// ── Public API ─────────────────────────────────────────────────

export function buildContext(
  searchResults: SearchResult[],
  tokenLimit: number = TOKEN_LIMITS.contextWindow
): BuiltContext {
  // Step 1: Deduplicate
  let results = deduplicateByUrl(searchResults);

  // Step 2: Rank
  results = rankByRelevance(results);

  // Step 3: Trim to token budget
  const included: SearchResult[] = [];
  let totalTokens = 0;

  for (const result of results) {
    const entryText = `[Source] ${result.title}\nURL: ${result.url}\n${result.snippet}\n---\n`;
    const entryTokens = estimateTokens(entryText);

    if (totalTokens + entryTokens > tokenLimit) break;

    included.push(result);
    totalTokens += entryTokens;
  }

  // Step 4: Format
  const text = formatAsContext(included);

  return {
    text,
    sourceCount: included.length,
    estimatedTokens: totalTokens,
    sources: included,
  };
}
