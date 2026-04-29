import crypto from "crypto";
import type {
  ResearchPlan,
  SectionResult,
  FinalReport,
  ApiKeys,
  LLMMessage,
  ResearchSource
} from "../types";
import { generateAIResponse } from "../providers";
import { safeParseJSON } from "./base-agent";

export interface ReportSynthesisInput {
  plan: ResearchPlan;
  completedSections: SectionResult[];
  failedSections: string[];
  originalQuery: string;
  userMemory: string;
  apiKeys: ApiKeys;
}

const SYSTEM_PROMPT = `You are a Senior Research Editor and Report Compiler at a top-tier
research firm. Your job is to synthesize research from multiple
specialist agents into a single, cohesive, professional report.

You will receive:
1. Research sections from 6-8 specialist agents
2. The original user query
3. User context/memory

Your report must:
- Minimum 4000 words (target 5000-6000 for deep queries)
- Professional, third-person analytical tone
- Connect findings across different sections (cross-analysis)
- Every claim must reference a section or data point
- Executive Summary must capture TOP 5 insights from ALL sections
- Conclusions must be actionable, not generic

MANDATORY REPORT STRUCTURE (in this exact order):
1. Report Header (title, date, query, estimated read time)
2. Executive Summary (350-400 words — most important section)
3. [Dynamic sections in priority order from agents]
4. Cross-Section Analysis (300-400 words — how sections connect)
5. Key Findings Summary (bullet points from all sections)
6. Conclusions & Recommendations (400-500 words)
7. Confidence Assessment (where data was strong vs limited)
8. References & Sources (all unique sources, formatted)
9. Report Metadata

WRITING RULES:
- Use ## for main section headers
- Use ### for subsections
- Use **bold** for key metrics and important terms
- Use tables for comparisons (markdown table format)
- Use > blockquotes for expert opinions
- Minimum 2 tables per report
- Every section must have at least one specific data point
- Do NOT write vague statements like "this is important"
- Return ONLY valid JSON — no extra text

EXPECTED JSON OUTPUT FORMAT:
{
  "reportId": "uuid",
  "title": "Report Title",
  "subtitle": "Generated Research Report",
  "generatedAt": "ISO timestamp",
  "originalQuery": "...",
  "estimatedReadTime": "12 min",
  "totalWords": 5200,
  "totalPages": 9,
  "sections": {
    "executiveSummary": "## Executive Summary\\n\\n...",
    "dynamic": [
      { "id": "section_1", "title": "...", "content": "...", "order": 1 }
    ],
    "crossSectionAnalysis": "## Cross-Section Analysis\\n\\n...",
    "keyFindings": ["finding 1", "finding 2"],
    "conclusions": "## Conclusions & Recommendations\\n\\n...",
    "confidenceAssessment": "## Data Confidence Assessment\\n\\n..."
  },
  "sources": [
    { "id": "1", "title": "", "url": "", "domain": "", "relevance": "high" }
  ],
  "metadata": {
    "totalAgentsUsed": 7,
    "successfulAgents": 7,
    "failedAgents": 0,
    "totalSourcesAnalyzed": 42,
    "modelsUsed": ["nvidia/nemotron-3-super-120b-a12b"]
  }
}`;

export async function runReportSynthesisAgent(
  input: ReportSynthesisInput
): Promise<FinalReport> {
  const { plan, completedSections, failedSections, originalQuery, userMemory, apiKeys } = input;

  // Step 1 - Pre-processing:
  // Sort sections based on the plan's order or priority. Since sections in plan have priorities, let's just keep the order from the plan.
  const orderedSections = plan.dynamicSections
    .map(ds => completedSections.find(s => s.sectionId === ds.id))
    .filter((s): s is SectionResult => s !== undefined);

  // Deduplicate all sources
  const seenUrls = new Set<string>();
  const uniqueSources: ResearchSource[] = [];
  let sourceIdCounter = 1;

  for (const sec of orderedSections) {
    for (const src of sec.sourcesUsed) {
      if (!seenUrls.has(src.url)) {
        seenUrls.add(src.url);
        let domain = "";
        try {
          domain = new URL(src.url).hostname.replace(/^www\./, "");
        } catch {
          domain = src.url;
        }
        uniqueSources.push({
          id: String(sourceIdCounter++),
          title: src.title,
          snippet: "",
          url: src.url,
          domain,
        });
      }
    }
  }

  // Step 2 - Synthesis Prompt Build:
  const synthesisInput = orderedSections.map(s => `=== SECTION: ${s.sectionTitle} ===
Agent: ${s.agentRole}
Confidence: ${s.confidenceScore}
Key Findings: ${s.keyFindings.join(' | ')}

${s.content}

Data Points: ${JSON.stringify(s.dataPoints)}`).join('\n\n');

  const userMessage = `Original Query: "${originalQuery}"
User Context: "${userMemory || "None"}"

Failed Sections: ${failedSections.length > 0 ? failedSections.join(", ") : "None"}

RESEARCH SECTIONS:
${synthesisInput}

Please synthesize the above sections into the final research report JSON format.`;

  const messages: LLMMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userMessage }
  ];

  let rawResponse = "";
  try {
    const response = await generateAIResponse({
      model: "nvidia/nemotron-3-super-120b-a12b",
      provider: "nvidia",
      messages,
      stream: false,
      maxTokens: 8000,
      temperature: 0.4,
      timeoutMs: 180_000,
      jsonMode: true,
      apiKeys
    });
    rawResponse = response.content;
  } catch (primaryError) {
    console.warn("[ReportSynthesis] Primary nemotron failed, trying OpenRouter fallback:", primaryError instanceof Error ? primaryError.message : primaryError);
    try {
      const fallbackResponse = await generateAIResponse({
        model: "nvidia/nemotron-3-super-120b-a12b:free",
        provider: "openrouter",
        messages,
        stream: false,
        maxTokens: 8000,
        temperature: 0.4,
        timeoutMs: 180_000,
        jsonMode: true,
        apiKeys
      });
      rawResponse = fallbackResponse.content;
    } catch (fallbackError) {
      console.error("[ReportSynthesis] Both primary and fallback failed:", fallbackError instanceof Error ? fallbackError.message : fallbackError);
      // Don't throw — return empty response so the fallback FinalReport construction below still works
      rawResponse = "";
    }
  }

  const parsed = (safeParseJSON(rawResponse) || {}) as Record<string, unknown>;

  // Construct FinalReport with fallbacks
  const parsed = safeParseJSON(rawResponse) || {};
  const finalReport: FinalReport = {
    reportId: (parsed.reportId as string) || crypto.randomUUID(),
    title: (parsed.title as string) || plan.reportTitle,
    subtitle: (parsed.subtitle as string) || "Generated Research Report",
    generatedAt: (parsed.generatedAt as string) || new Date().toISOString(),
    originalQuery,
    estimatedReadTime: (parsed.estimatedReadTime as string) || "15 min",
    totalWords: (parsed.totalWords as number) || orderedSections.reduce((acc, sec) => acc + sec.wordCount, 0),
    totalPages: Math.ceil(((parsed.totalWords as number) || 4000) / 500),
    sections: {
      executiveSummary: (parsed.sections?.executiveSummary as string) || "## Executive Summary\n\nData missing.",
      dynamic: (parsed.sections?.dynamic as { id: string; title: string; content: string; order: number }[]) || orderedSections.map((s, i) => ({
        id: s.sectionId,
        title: s.sectionTitle,
        content: s.content,
        order: i + 1
      })),
      crossSectionAnalysis: (parsed.sections?.crossSectionAnalysis as string) || "## Cross-Section Analysis\n\nData missing.",
      keyFindings: (parsed.sections?.keyFindings as string[]) || orderedSections.flatMap(s => s.keyFindings),
      conclusions: (parsed.sections?.conclusions as string) || "## Conclusions & Recommendations\n\nData missing.",
      confidenceAssessment: (parsed.sections?.confidenceAssessment as string) || "## Data Confidence Assessment\n\nData missing."
    },
    sources: uniqueSources,
    metadata: {
      totalAgentsUsed: plan.dynamicSections.length,
      successfulAgents: completedSections.length,
      failedAgents: failedSections.length,
      totalSourcesAnalyzed: uniqueSources.length,
      modelsUsed: parsed.metadata?.modelsUsed || ["nvidia/nemotron-3-super-120b-a12b"]
    }
  };

  return finalReport;
}
