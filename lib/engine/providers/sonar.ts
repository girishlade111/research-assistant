import type { SearchResult } from "../types";
import { PERPLEXITY_BASE_URL, RETRY_CONFIG } from "../config";
import { ResearchError } from "../errors";

// ── Types ──────────────────────────────────────────────────────

export interface SonarSearchOptions {
  query: string;
  maxResults: number;
  recencyFilter?: "month" | "week" | "day" | "hour";
  model?: "sonar" | "sonar-pro";
}

interface SonarRawResponse {
  choices: { message: { content: string } }[];
  citations?: string[];
}

// ── Helpers ────────────────────────────────────────────────────

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function extractTitleFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    const segments = path.split("/").filter(Boolean);
    const last = segments[segments.length - 1] ?? "";
    const title = last
      .replace(/[-_]/g, " ")
      .replace(/\.\w+$/, "")
      .trim();
    return title || extractDomain(url);
  } catch {
    return url;
  }
}

function extractSnippetForIndex(content: string, index: number, total: number): string {
  const sentences = content
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.length > 15);

  if (sentences.length === 0) return content.slice(0, 200);

  const chunkSize = Math.max(1, Math.floor(sentences.length / Math.max(total, 1)));
  const start = index * chunkSize;
  const chunk = sentences.slice(start, start + chunkSize);

  return chunk.join(" ").slice(0, 250) || sentences[0].slice(0, 250);
}

// ── Core Search Function ───────────────────────────────────────

async function fetchSonar(
  apiKey: string,
  options: SonarSearchOptions
): Promise<SearchResult[]> {
  const res = await fetch(`${PERPLEXITY_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options.model ?? "sonar",
      messages: [
        {
          role: "system",
          content:
            "You are a research assistant. Provide factual, well-sourced, concise information. Cite all sources used.",
        },
        { role: "user", content: options.query },
      ],
      max_tokens: 1024,
      temperature: 0.3,
      return_citations: true,
      search_recency_filter: options.recencyFilter ?? "month",
    }),
  });

  if (!res.ok) {
    throw new ResearchError(
      `Sonar API error: ${res.status}`,
      res.status === 429
        ? "rate_limit"
        : res.status === 401
          ? "auth"
          : "provider_down",
      { provider: "perplexity", statusCode: res.status }
    );
  }

  const data: SonarRawResponse = await res.json();
  return normalizeSonarResults(data, options.maxResults);
}

// ── Result Normalization ───────────────────────────────────────

function normalizeSonarResults(
  raw: SonarRawResponse,
  maxResults: number
): SearchResult[] {
  const content = raw.choices?.[0]?.message?.content ?? "";
  const citations = raw.citations ?? [];

  if (citations.length === 0) {
    // No citations — extract URLs from content as fallback
    const urlMatches = content.match(/https?:\/\/[^\s)>"]+/g) ?? [];
    const unique = [...new Set(urlMatches)];
    return unique.slice(0, maxResults).map((url, i) => ({
      title: extractTitleFromUrl(url),
      url,
      snippet: extractSnippetForIndex(content, i, unique.length),
      domain: extractDomain(url),
      relevanceScore: 1 - i * 0.1,
    }));
  }

  return citations.slice(0, maxResults).map((url, i) => ({
    title: extractTitleFromUrl(url),
    url,
    snippet: extractSnippetForIndex(content, i, citations.length),
    domain: extractDomain(url),
    relevanceScore: 1 - i * 0.08,
  }));
}

// ── Retry Wrapper ──────────────────────────────────────────────

export async function sonarSearch(
  apiKey: string,
  options: SonarSearchOptions
): Promise<SearchResult[]> {
  let lastError: ResearchError | null = null;

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      return await fetchSonar(apiKey, options);
    } catch (err) {
      lastError =
        err instanceof ResearchError
          ? err
          : new ResearchError(String(err), "unknown", { provider: "perplexity" });

      if (!lastError.retryable || attempt === RETRY_CONFIG.maxRetries) break;

      const delay = Math.min(
        RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt),
        RETRY_CONFIG.maxDelayMs
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError ?? new ResearchError("Sonar: all retries exhausted", "unknown", { provider: "perplexity" });
}
