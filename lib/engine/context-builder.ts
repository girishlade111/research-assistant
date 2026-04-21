import type { SearchResult, BuiltContext, FileContext } from "./types";
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

// ── Chunking & Scoring ─────────────────────────────────────────

interface Chunk {
  fileName: string;
  text: string;
  score: number;
}

function chunkText(text: string, maxWords: number = 500): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(" "));
  }
  return chunks;
}

function scoreChunk(chunk: string, query: string): number {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  const chunkLower = chunk.toLowerCase();
  let score = 0;
  for (const term of queryTerms) {
    const regex = new RegExp(term, "gi");
    const matches = chunkLower.match(regex);
    if (matches) {
      score += matches.length;
    }
  }
  return score;
}

// ── Context Formatting ─────────────────────────────────────────

function formatAsContext(results: SearchResult[], chunks: Chunk[]): string {
  let context = "";
  
  if (chunks.length > 0) {
    context += "=== FILE CONTENT (High Priority) ===\n\n";
    context += chunks
      .map((c) => `[File: ${c.fileName}]\n${c.text}\n`)
      .join("\n---\n\n");
    context += "\n\n";
  }

  if (results.length > 0) {
    context += "=== WEB SEARCH RESULTS ===\n\n";
    context += results
      .map(
        (r, i) =>
          `[Source ${i + 1}] ${r.title}\nURL: ${r.url}\n${r.snippet}\n`
      )
      .join("\n---\n\n");
  }

  return context.trim();
}

// ── Public API ─────────────────────────────────────────────────

export function buildContext(
  searchResults: SearchResult[],
  files: FileContext[],
  tokenLimit: number = TOKEN_LIMITS.contextWindow,
  query: string
): BuiltContext {
  // Step 1: Process and rank files
  const allChunks: Chunk[] = [];
  for (const file of files) {
    const textChunks = chunkText(file.content);
    for (const text of textChunks) {
      allChunks.push({
        fileName: file.fileName,
        text,
        score: scoreChunk(text, query)
      });
    }
  }
  allChunks.sort((a, b) => b.score - a.score);

  // Step 2: Deduplicate web results
  let results = deduplicateByUrl(searchResults);

  // Step 3: Rank web results
  results = rankByRelevance(results);

  // Step 4: Trim to token budget
  const includedResults: SearchResult[] = [];
  const includedChunks: Chunk[] = [];
  let totalTokens = 0;

  // We allocate roughly up to 60% of context to files if they exist, rest to web.
  // Or we just interleave greedily. Since files are "High Priority", we process chunks first.
  for (const chunk of allChunks) {
    const entryText = `[File: ${chunk.fileName}]\n${chunk.text}\n---\n`;
    const entryTokens = estimateTokens(entryText);

    // Give files at most 70% of the token limit
    if (totalTokens + entryTokens > tokenLimit * 0.7) continue;

    includedChunks.push(chunk);
    totalTokens += entryTokens;
  }

  for (const result of results) {
    const entryText = `[Source] ${result.title}\nURL: ${result.url}\n${result.snippet}\n---\n`;
    const entryTokens = estimateTokens(entryText);

    if (totalTokens + entryTokens > tokenLimit) break;

    includedResults.push(result);
    totalTokens += entryTokens;
  }

  // Formatting creates slightly more tokens, but the estimate is safe.
  const text = formatAsContext(includedResults, includedChunks);
  
  // Create File Sources to attach to the final source list
  const uniqueFiles = new Set(includedChunks.map(c => c.fileName));
  const fileSources = Array.from(uniqueFiles).map((fileName, idx) => ({
    title: fileName,
    url: `file://${fileName}`,
    snippet: `Content from uploaded file: ${fileName}`,
    domain: "Local File",
    relevanceScore: 1
  }));

  // Merge web and file sources for the UI
  const allSources = [...fileSources, ...includedResults];

  return {
    text,
    sourceCount: allSources.length,
    estimatedTokens: totalTokens,
    sources: allSources as SearchResult[], // Assuming UI accepts this structure for file sources
  };
}
