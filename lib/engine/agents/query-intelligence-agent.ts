import type { ApiKeys, AgentResult, ResearchPlan, QueryIntelligenceInput } from "../types";
import { selectModel } from "../model-router";
import { callWithFallback, safeParseJSON } from "./base-agent";
import { TOKEN_LIMITS } from "../config";

// ── Query Intelligence Agent ───────────────────────────────────
// Role: Senior Research Director — analyze query, produce structured research plan
// Primary: mistralai/mistral-large-3-675b-instruct-2512 (nvidia)
// Fallback: openai/gpt-oss-120b (openrouter)

const SYSTEM_PROMPT = `You are a Senior Research Director and Query Intelligence Specialist.
Your job is to analyze a user's research query and create a precise,
multi-dimensional research execution plan.

You must:
1. Understand the core intent (informational/comparative/technical/financial/scientific)
2. Identify ALL research dimensions that a comprehensive report needs
3. Generate 6-8 specific research sections based on query complexity
4. For each section, write 3 targeted search queries
5. Determine which sections are mandatory vs optional
6. Estimate total report pages (minimum 7, maximum unlimited)

RULES:
- Never create duplicate or overlapping sections
- Each section must have a distinct research focus
- Search queries must be specific, not generic
- Always include: Overview, Key Insights, Conclusion as fixed sections
- Dynamic sections must be query-specific (never hardcode them)
- Return ONLY valid JSON, no markdown, no explanation

OUTPUT FORMAT — return this exact JSON structure:
{
  "queryId": "unique-id-string",
  "originalQuery": "the user's original query",
  "researchType": "financial|technical|scientific|news|comparative|general",
  "reportTitle": "Professional Report Title",
  "estimatedPages": 8,
  "fixedSections": [
    { "id": "overview", "title": "Executive Overview", "order": 1 },
    { "id": "keyInsights", "title": "Key Insights", "order": 99 },
    { "id": "conclusion", "title": "Conclusions & Recommendations", "order": 100 }
  ],
  "dynamicSections": [
    {
      "id": "section_<topic>",
      "agentRole": "Specialist role name",
      "sectionTitle": "Section Title",
      "focusArea": "What this section investigates",
      "priority": "high|medium|low",
      "searchQueries": ["query 1", "query 2", "query 3"],
      "outputLength": "long|medium|short",
      "requiresWebSearch": true
    }
  ],
  "globalSearchContext": "Overall search context string",
  "totalAgentsNeeded": 7
}

SECTION GENERATION RULES:
- fixedSections: Always exactly 3 (Overview order=1, Key Insights order=99, Conclusion order=100)
- dynamicSections: Generate 6-8 sections, each with a unique research dimension
- Each dynamicSection.searchQueries must have exactly 3 specific, actionable search queries
- priority: "high" for core topic areas, "medium" for supporting context, "low" for supplementary
- outputLength: "long" for high priority, "medium" for medium, "short" for low
- requiresWebSearch: true for factual/current data, false for pure analytical sections
- agentRole: A realistic specialist title (e.g., "Financial Analysis Specialist", "Technical Architecture Expert")
- queryId: Generate a unique slug from the query (lowercase, hyphens, max 40 chars)
- estimatedPages: Based on dynamicSections count — each high=1.5 pages, medium=1 page, low=0.5 pages, plus 2 pages for fixed sections`;

const RESEARCH_MODE_MAP: Record<string, string> = {
  fast: "Generate a focused plan with 6 high-priority sections. Optimize for speed — fewer but more targeted search queries.",
  deep: "Generate an exhaustive plan with 8 sections covering every research dimension. Maximize breadth and depth.",
  pro: "Generate a comprehensive plan with 7-8 sections balancing thoroughness with actionable insights.",
  corpus: "Generate an analytical plan with 6-7 sections. Focus on AI knowledge synthesis — minimize web search dependency.",
};

export async function runQueryIntelligenceAgent(
  query: string,
  mode: "pro" | "deep" | "corpus",
  apiKeys: ApiKeys,
  input?: Partial<QueryIntelligenceInput>
): Promise<AgentResult & { plan: ResearchPlan; enhanced_query: string; subtopics: string[]; search_terms: string[] }> {
  const start = Date.now();
  const chain = selectModel("query", query);

  const userMemory = input?.userMemory ?? "";
  const researchMode = input?.researchMode ?? (mode === "deep" ? "deep" : "fast");

  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    {
      role: "user" as const,
      content: `USER QUERY: "${query}"

RESEARCH MODE: ${researchMode} — ${RESEARCH_MODE_MAP[mode] ?? RESEARCH_MODE_MAP.pro}
${userMemory ? `\nUSER CONTEXT: ${userMemory}` : ""}

IMPORTANT: Return ONLY valid JSON matching the exact schema above. No markdown fences, no explanation text.`,
    },
  ];

  console.log('[QueryIntelligence START]', {
    query,
    researchMode,
    model: chain.primary.modelId,
    fallbackModel: chain.fallbacks[0]?.modelId,
    timestamp: new Date().toISOString(),
  });

  try {
    const result = await callWithFallback(
      "query-intelligence-agent",
      chain.primary,
      chain.fallbacks[0],
      messages,
      TOKEN_LIMITS.agentMaxTokens,
      apiKeys,
      { jsonMode: true, temperature: 0.4 }
    );

    let parsed = safeParseJSON(result.content);

    if (!parsed || !parsed.dynamicSections) {
      console.warn('[QueryIntelligence PARSE_FAIL]', {
        rawResponsePreview: result.content?.slice(0, 500),
        modelUsed: result.model_used,
        retrying: true,
        timestamp: new Date().toISOString(),
      });
      const retryResult = await callWithFallback(
        "query-intelligence-agent",
        chain.primary,
        chain.fallbacks[0],
        [
          ...messages,
          { role: "assistant" as const, content: result.content },
          { role: "user" as const, content: "Your response was not valid JSON or missing required fields. Return ONLY the JSON object with all required fields: queryId, originalQuery, researchType, reportTitle, estimatedPages, fixedSections, dynamicSections, globalSearchContext, totalAgentsNeeded." },
        ],
        TOKEN_LIMITS.agentMaxTokens,
        apiKeys,
        { jsonMode: true, temperature: 0.2 }
      );
      parsed = safeParseJSON(retryResult.content);
    }

    if (!parsed || !parsed.dynamicSections) {
      console.error('[QueryIntelligence PARSE_FAIL_FINAL]', {
        query,
        timestamp: new Date().toISOString(),
      });
      throw new Error("Failed to parse research plan after retry");
    }

    console.log('[QueryIntelligence RESPONSE]', {
      rawResponsePreview: JSON.stringify(parsed).slice(0, 500),
      parseSuccess: true,
      sectionsCreated: parsed.dynamicSections?.length,
      modelUsed: result.model_used,
      provider: result.provider,
      timestamp: new Date().toISOString(),
    });

    const plan = normalizeResearchPlan(parsed, query);

    const enhanced_query = plan.reportTitle + " — " + plan.globalSearchContext;
    const subtopics = plan.dynamicSections.map(s => s.sectionTitle);
    const search_terms = plan.dynamicSections.flatMap(s => s.searchQueries);

    return {
      agent: "query-intelligence-agent",
      output: plan as unknown as Record<string, unknown>,
      model_used: result.model_used,
      provider: result.provider,
      durationMs: Date.now() - start,
      isFallback: result.isFallback,
      plan,
      enhanced_query,
      subtopics,
      search_terms,
    };
  } catch (err) {
    const fallbackPlan = buildFallbackPlan(query);

    return {
      agent: "query-intelligence-agent",
      output: fallbackPlan as unknown as Record<string, unknown>,
      model_used: "none",
      provider: "none",
      durationMs: Date.now() - start,
      isFallback: false,
      error: err instanceof Error ? err.message : "Query intelligence agent failed",
      plan: fallbackPlan,
      enhanced_query: query,
      subtopics: fallbackPlan.dynamicSections.map(s => s.sectionTitle),
      search_terms: fallbackPlan.dynamicSections.flatMap(s => s.searchQueries),
    };
  }
}

function normalizeResearchPlan(raw: Record<string, unknown>, query: string): ResearchPlan {
  const dynamicSections = Array.isArray(raw.dynamicSections)
    ? (raw.dynamicSections as Record<string, unknown>[]).map(s => ({
        id: String(s.id ?? `section_${Math.random().toString(36).slice(2, 8)}`),
        agentRole: String(s.agentRole ?? "Research Specialist"),
        sectionTitle: String(s.sectionTitle ?? "Untitled Section"),
        focusArea: String(s.focusArea ?? ""),
        priority: validatePriority(s.priority),
        searchQueries: Array.isArray(s.searchQueries)
          ? (s.searchQueries as string[]).map(String).slice(0, 3)
          : [],
        outputLength: validateOutputLength(s.outputLength),
        requiresWebSearch: Boolean(s.requiresWebSearch ?? true),
      }))
    : [];

  const fixedSections = Array.isArray(raw.fixedSections)
    ? (raw.fixedSections as Record<string, unknown>[]).map(s => ({
        id: String(s.id ?? ""),
        title: String(s.title ?? ""),
        order: Number(s.order ?? 0),
      }))
    : [
        { id: "overview", title: "Executive Overview", order: 1 },
        { id: "keyInsights", title: "Key Insights", order: 99 },
        { id: "conclusion", title: "Conclusions & Recommendations", order: 100 },
      ];

  return {
    queryId: String(raw.queryId ?? generateQueryId(query)),
    originalQuery: String(raw.originalQuery ?? query),
    researchType: validateResearchType(raw.researchType),
    reportTitle: String(raw.reportTitle ?? query),
    estimatedPages: Math.max(7, Number(raw.estimatedPages) || 8),
    fixedSections,
    dynamicSections,
    globalSearchContext: String(raw.globalSearchContext ?? query),
    totalAgentsNeeded: Number(raw.totalAgentsNeeded) || dynamicSections.length + 3,
  };
}

function buildFallbackPlan(query: string): ResearchPlan {
  return {
    queryId: generateQueryId(query),
    originalQuery: query,
    researchType: "general",
    reportTitle: query,
    estimatedPages: 7,
    fixedSections: [
      { id: "overview", title: "Executive Overview", order: 1 },
      { id: "keyInsights", title: "Key Insights", order: 99 },
      { id: "conclusion", title: "Conclusions & Recommendations", order: 100 },
    ],
    dynamicSections: [
      {
        id: "section_background",
        agentRole: "Background Research Specialist",
        sectionTitle: "Background & Context",
        focusArea: "Historical context and current landscape",
        priority: "high",
        searchQueries: [`${query} overview`, `${query} background context`, `${query} current state 2025`],
        outputLength: "long",
        requiresWebSearch: true,
      },
      {
        id: "section_analysis",
        agentRole: "Analysis Specialist",
        sectionTitle: "Detailed Analysis",
        focusArea: "In-depth examination of key aspects",
        priority: "high",
        searchQueries: [`${query} analysis`, `${query} key factors`, `${query} detailed examination`],
        outputLength: "long",
        requiresWebSearch: true,
      },
      {
        id: "section_trends",
        agentRole: "Trends & Future Outlook Specialist",
        sectionTitle: "Trends & Future Outlook",
        focusArea: "Emerging trends and future projections",
        priority: "medium",
        searchQueries: [`${query} trends 2025`, `${query} future outlook`, `${query} predictions`],
        outputLength: "medium",
        requiresWebSearch: true,
      },
    ],
    globalSearchContext: query,
    totalAgentsNeeded: 6,
  };
}

function generateQueryId(query: string): string {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40);
}

function validateResearchType(val: unknown): ResearchPlan["researchType"] {
  const valid = ["financial", "technical", "scientific", "news", "comparative", "general"];
  return valid.includes(String(val)) ? (String(val) as ResearchPlan["researchType"]) : "general";
}

function validatePriority(val: unknown): "high" | "medium" | "low" {
  const valid = ["high", "medium", "low"];
  return valid.includes(String(val)) ? (String(val) as "high" | "medium" | "low") : "medium";
}

function validateOutputLength(val: unknown): "long" | "medium" | "short" {
  const valid = ["long", "medium", "short"];
  return valid.includes(String(val)) ? (String(val) as "long" | "medium" | "short") : "medium";
}
