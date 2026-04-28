import type {
  SectionAgentConfig,
  SectionResult,
  SectionDataPoint,
  SectionSourceRef,
  SectionProgressEvent,
  SearchResult,
  ApiKeys,
  LLMMessage,
  DynamicSection,
  AgentModelAssignment,
} from "../types";
import { searchWithFallback } from "../search-router";
import { generateAIResponse } from "../providers";
import { classifyError } from "../errors";
import { safeParseJSON } from "./base-agent";

// ── Constants ─────────────────────────────────────────────────

const MAX_SOURCES_PER_SECTION = 15;
const SYNTHESIS_MAX_TOKENS = 8000;
const SYNTHESIS_TEMPERATURE = 0.3;
const AGENT_TIMEOUT_MS = 90_000;

// ── System Prompt Template ────────────────────────────────────

function buildSystemPrompt(
  section: DynamicSection,
  originalQuery: string
): string {
  return `You are a ${section.agentRole} working as part of a multi-agent research team.

Your EXCLUSIVE focus: "${section.sectionTitle}"
Research context: ${section.focusArea}
Original research query: "${originalQuery}"

You have been provided with web search results. Your job is to:
1. Extract ONLY information relevant to your specific section focus
2. Analyze the data deeply — don't just summarize
3. Find patterns, trends, contradictions in the data
4. Include specific numbers, dates, percentages wherever available
5. Write 600-900 words of dense, analytical content
6. Identify the top 3-5 key findings from your section

STRICT RULES:
- Do NOT write about topics outside your section focus
- Do NOT repeat information from the original search results verbatim
- Do NOT write generic statements — everything must be specific and cited
- Always write in third person, professional tone
- If data is insufficient, clearly state "Data limitations: ..."
- Return ONLY valid JSON

OUTPUT FORMAT — Return exactly this structure:
{
  "sectionId": "${section.id}",
  "sectionTitle": "${section.sectionTitle}",
  "agentRole": "${section.agentRole}",
  "content": "Full markdown content (600-900 words with ## subheadings)",
  "keyFindings": ["specific finding 1", "specific finding 2", "specific finding 3"],
  "dataPoints": [
    { "metric": "Revenue", "value": "$97.69B", "year": "2024", "source": "Tesla 10-K" }
  ],
  "sourcesUsed": [{ "title": "", "url": "", "relevance": "high|medium|low" }],
  "confidenceScore": 0.85,
  "dataQuality": "rich|moderate|limited",
  "wordCount": 750
}`;
}

// ── Step 1: Web Search Execution ──────────────────────────────
// Runs section.searchQueries sequentially via search-router,
// deduplicates by URL, caps at MAX_SOURCES_PER_SECTION.

async function executeSearchQueries(
  queries: string[],
  existingResults: SearchResult[],
  apiKeys: ApiKeys
): Promise<SearchResult[]> {
  const seenUrls = new Set<string>(existingResults.map(r => r.url));
  const allResults: SearchResult[] = [...existingResults];

  for (const query of queries) {
    if (allResults.length >= MAX_SOURCES_PER_SECTION) break;

    try {
      console.log('[WebSearch QUERY]', { query, currentResultCount: allResults.length });
      const { results } = await searchWithFallback(
        {
          query,
          mode: "pro",
          maxResults: 5,
          search_terms: [query],
        },
        apiKeys
      );

      for (const result of results) {
        if (allResults.length >= MAX_SOURCES_PER_SECTION) break;
        if (seenUrls.has(result.url)) continue;
        seenUrls.add(result.url);
        allResults.push(result);
      }
    } catch (searchErr) {
      console.error('[WebSearch FAILED]', {
        query,
        error: searchErr instanceof Error ? searchErr.message : String(searchErr),
        timestamp: new Date().toISOString(),
      });
    }
  }

  return allResults;
}

// ── Step 2: Context Building ──────────────────────────────────
// Combines all search results into a single context string
// that the synthesis model will consume.

function buildSearchContext(sources: SearchResult[]): string {
  if (sources.length === 0) {
    return "No web search results available. Use your internal knowledge to produce the best possible analysis. Clearly note any data limitations.";
  }

  return sources.map(s => 
    `SOURCE [${s.title}] (${s.url}):\n${s.snippet}`
  ).join('\n\n---\n\n');
}

// ── Step 3: Section Synthesis ─────────────────────────────────
// Calls the model assigned by model-selector-agent to produce
// the section content. Returns raw LLM response string.

async function callSynthesisModel(
  systemPrompt: string,
  searchContext: string,
  section: DynamicSection,
  model: AgentModelAssignment,
  apiKeys: ApiKeys
): Promise<{ content: string; modelUsed: string; provider: string; isFallback: boolean }> {
  const userMessage = `${searchContext}\n\nAnalyze and write your section`;

  const messages: LLMMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ];

  // Try primary model
  try {
    const response = await generateAIResponse({
      model: model.primaryModel.modelId,
      provider: model.primaryModel.platform,
      messages,
      stream: false,
      apiKeys,
      maxTokens: SYNTHESIS_MAX_TOKENS,
      temperature: SYNTHESIS_TEMPERATURE,
      timeoutMs: AGENT_TIMEOUT_MS,
      jsonMode: true,
    });

    return {
      content: response.content,
      modelUsed: model.primaryModel.modelId,
      provider: model.primaryModel.platform,
      isFallback: false,
    };
  } catch (primaryErr) {
    const classified = classifyError(primaryErr, model.primaryModel.platform);
    console.warn(
      `[section-agent:${section.id}] Primary ${model.primaryModel.modelId} failed (${classified.kind}), switching to fallback`
    );
  }

  // Fallback model
  const response = await generateAIResponse({
    model: model.fallbackModel.modelId,
    provider: model.fallbackModel.platform,
    messages,
    stream: false,
    apiKeys,
    maxTokens: SYNTHESIS_MAX_TOKENS,
    temperature: SYNTHESIS_TEMPERATURE,
    timeoutMs: AGENT_TIMEOUT_MS,
    jsonMode: true,
  });

  return {
    content: response.content,
    modelUsed: model.fallbackModel.modelId,
    provider: model.fallbackModel.platform,
    isFallback: true,
  };
}

// ── Step 4: Parse & Validate Result ───────────────────────────
// Extracts JSON from LLM response with regex fallback.

function parseAndNormalize(
  raw: string,
  section: DynamicSection
): Omit<SectionResult, "modelUsed" | "provider" | "isFallback" | "durationMs" | "error"> {
  const parsed = safeParseJSON(raw);

  if (parsed && typeof parsed.content === "string") {
    return {
      sectionId: String(parsed.sectionId ?? section.id),
      sectionTitle: String(parsed.sectionTitle ?? section.sectionTitle),
      agentRole: String(parsed.agentRole ?? section.agentRole),
      content: String(parsed.content),
      keyFindings: normalizeStringArray(parsed.keyFindings),
      dataPoints: normalizeDataPoints(parsed.dataPoints),
      sourcesUsed: normalizeSourceRefs(parsed.sourcesUsed),
      confidenceScore: clamp(Number(parsed.confidenceScore) || 0.5, 0, 1),
      dataQuality: normalizeDataQuality(parsed.dataQuality),
      wordCount: Number(parsed.wordCount) || countWords(String(parsed.content)),
    };
  }

  // Last resort: treat entire response as content
  const contentText = raw.length > 50 ? raw : `Data limitations: insufficient data for section "${section.sectionTitle}".`;
  return {
    sectionId: section.id,
    sectionTitle: section.sectionTitle,
    agentRole: section.agentRole,
    content: contentText,
    keyFindings: [],
    dataPoints: [],
    sourcesUsed: [],
    confidenceScore: 0.3,
    dataQuality: "limited",
    wordCount: countWords(contentText),
  };
}

// ── Step 5: Progress Callback Helpers ─────────────────────────

function emitProgress(
  config: SectionAgentConfig,
  event: Partial<SectionProgressEvent> & Pick<SectionProgressEvent, "status">
): void {
  config.onProgress?.({
    sectionId: config.section.id,
    agentRole: config.section.agentRole,
    ...event,
  });
}

// ── Public API ────────────────────────────────────────────────

export async function runSectionAgent(config: SectionAgentConfig): Promise<SectionResult> {
  const start = Date.now();
  const { section, assignedModel, originalQuery, apiKeys } = config;

  // Step 1: Web Search
  emitProgress(config, { status: "searching" });

  console.log('[WebSearch START]', {
    sectionId: section.id,
    queries: section.searchQueries,
    model: assignedModel?.primaryModel?.modelId,
    requiresWebSearch: section.requiresWebSearch,
    timestamp: new Date().toISOString(),
  });

  let searchResults: SearchResult[];
  try {
    searchResults = section.requiresWebSearch
      ? await executeSearchQueries(
        section.searchQueries,
        config.existingSearchResults ?? [],
        apiKeys
      )
      : config.existingSearchResults ?? [];
  } catch (searchErr) {
    console.error('[WebSearch FAILED]', {
      sectionId: section.id,
      error: searchErr instanceof Error ? searchErr.message : String(searchErr),
      timestamp: new Date().toISOString(),
    });
    searchResults = config.existingSearchResults ?? [];
  }

  console.log('[WebSearch RESULT]', {
    sectionId: section.id,
    sourcesFound: searchResults.length,
    firstResultPreview: searchResults[0]?.snippet?.slice(0, 100),
  });

  // Step 2: Context Building
  const searchContext = buildSearchContext(searchResults);

  // Step 3: Section Synthesis
  emitProgress(config, { status: "synthesizing", sourcesFound: searchResults.length });

  const systemPrompt = buildSystemPrompt(section, originalQuery);

  let llmResult: { content: string; modelUsed: string; provider: string; isFallback: boolean };
  try {
    llmResult = await callSynthesisModel(
      systemPrompt,
      searchContext,
      section,
      assignedModel,
      apiKeys
    );
  } catch (err) {
    // Step 4: Both models failed — return partial result
    const errMsg = err instanceof Error ? err.message : "Section synthesis failed";
    emitProgress(config, { status: "failed", error: errMsg });
    return {
      sectionId: section.id,
      sectionTitle: section.sectionTitle,
      agentRole: section.agentRole,
      content: `Data limitations: unable to generate content for "${section.sectionTitle}". Both primary and fallback models failed.`,
      keyFindings: [],
      dataPoints: [],
      sourcesUsed: searchResults.slice(0, 5).map(s => ({ title: s.title, url: s.url, relevance: "low" as const })),
      confidenceScore: 0.1,
      dataQuality: "limited",
      wordCount: 0,
      modelUsed: "none",
      provider: "none",
      isFallback: false,
      durationMs: Date.now() - start,
      error: errMsg,
    };
  }

  // Step 4: Parse & Validate
  const parsed = parseAndNormalize(llmResult.content, section);

  const result: SectionResult = {
    ...parsed,
    modelUsed: llmResult.modelUsed,
    provider: llmResult.provider,
    isFallback: llmResult.isFallback,
    durationMs: Date.now() - start,
  };

  // Step 5: Progress Callback
  emitProgress(config, {
    status: "complete",
    wordCount: result.wordCount,
    sourcesFound: result.sourcesUsed.length,
    confidence: result.confidenceScore,
  });

  return result;
}

// ── Batch runner: execute multiple sections in parallel ────────

export async function runAllSectionAgents(
  configs: SectionAgentConfig[]
): Promise<SectionResult[]> {
  return Promise.all(configs.map(runSectionAgent));
}

// ── Normalization Helpers ─────────────────────────────────────

function normalizeStringArray(val: unknown): string[] {
  if (!Array.isArray(val)) return [];
  return val.filter((v): v is string => typeof v === "string");
}

function normalizeDataPoints(val: unknown): SectionDataPoint[] {
  if (!Array.isArray(val)) return [];
  return val
    .filter((v): v is Record<string, unknown> => typeof v === "object" && v !== null)
    .map(v => ({
      metric: String(v.metric ?? ""),
      value: String(v.value ?? ""),
      year: v.year ? String(v.year) : undefined,
      source: v.source ? String(v.source) : undefined,
    }));
}

function normalizeSourceRefs(val: unknown): SectionSourceRef[] {
  if (!Array.isArray(val)) return [];
  return val
    .filter((v): v is Record<string, unknown> => typeof v === "object" && v !== null)
    .map(v => ({
      title: String(v.title ?? ""),
      url: String(v.url ?? ""),
      relevance: normalizeRelevance(v.relevance),
    }));
}

function normalizeRelevance(val: unknown): "high" | "medium" | "low" {
  const s = String(val);
  if (s === "high" || s === "medium" || s === "low") return s;
  return "medium";
}

function normalizeDataQuality(val: unknown): "rich" | "moderate" | "limited" {
  const s = String(val);
  if (s === "rich" || s === "moderate" || s === "limited") return s;
  return "moderate";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}
