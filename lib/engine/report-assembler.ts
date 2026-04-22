import type {
  AgentContext,
  AgentResult,
  ResearchResult,
  ResearchSource,
  SearchResult,
} from "./types";

type JsonMap = Record<string, unknown>;

interface AssembleArgs {
  context: AgentContext;
  sources: ResearchSource[];
  searchResults: SearchResult[];
  queryResult: AgentResult;
  searchResult: AgentResult;
  analysisResult: AgentResult;
  summaryResult: AgentResult;
  factCheckResult: AgentResult;
  codingResult: AgentResult;
  reportResult: AgentResult;
}

function asObject(value: unknown): JsonMap {
  return value && typeof value === "object" ? (value as JsonMap) : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function hasEnoughDepth(text: string, minWords: number): boolean {
  return wordCount(text) >= minWords;
}

function takeFirst<T>(items: T[], count: number): T[] {
  return items.slice(0, count);
}

function joinBullets(items: string[]): string {
  return items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : "- No substantive items were returned by this stage.";
}

function joinNumbered(items: string[]): string {
  return items.length > 0
    ? items.map((item, index) => `${index + 1}. ${item}`).join("\n")
    : "1. No concrete next steps were returned by this stage.";
}

function formatSources(sources: ResearchSource[]): string {
  if (sources.length === 0) {
    return "- No external sources were successfully retrieved. The report relies more heavily on model reasoning and any attached files.";
  }

  return sources
    .map(
      (source, index) =>
        `- **[Source ${index + 1}] ${source.title}** (${source.domain || "unknown domain"})\n  - URL: ${source.url || "not provided"}\n  - Snippet: ${source.snippet || "No snippet provided."}`
    )
    .join("\n");
}

function buildMethodology(context: AgentContext, sources: ResearchSource[]): string {
  const fileNames =
    context.file_context.length > 0
      ? context.file_context.map((file) => `**${file.fileName}**`).join(", ")
      : "no attached files";

  return [
    "### Research Methodology & Scope",
    `This report was produced through a **multi-agent research workflow**. The pipeline first expanded the original user query into a richer research brief, then attempted to retrieve relevant external material, and finally ran specialized agents for analysis, executive synthesis, fact-checking, and code generation when relevant.`,
    `The working context included **${sources.length} retrieved sources**, **${context.subtopics.length} research subtopics**, and ${fileNames}. Each agent was asked to contribute structured output rather than free-form chat so the final report could preserve traceability across stages.`,
    `The methodology is therefore strongest when multiple retrieved sources agree with each other and with attached files. It is weaker when source coverage is sparse, when a provider call falls back, or when a stage returns partial output that needs to be reconstructed.`,
  ].join("\n\n");
}

function buildOverview(args: AssembleArgs): string {
  const summary = asObject(args.summaryResult.output);
  const analysis = asObject(args.analysisResult.output);
  const fact = asObject(args.factCheckResult.output);

  const keyPoints = takeFirst(asStringArray(summary.key_points), 6);
  const quickFacts = takeFirst(asStringArray(summary.quick_facts), 6);
  const caveats = takeFirst(asStringArray(analysis.caveats), 4);
  const verifiedClaims = takeFirst(asStringArray(fact.verified_claims), 4);

  return [
    "### Executive Summary",
    asString(summary.overview) ||
      `The research request focused on **${args.context.query}**. The pipeline expanded the question into a structured brief covering scope, mechanism, impact, evidence quality, and future outlook, then used those dimensions to drive the analysis, summary, verification, and report synthesis stages.`,
    "### Key Findings At A Glance",
    joinBullets(keyPoints.length > 0 ? keyPoints : asStringArray(args.reportResult.output && asObject(args.reportResult.output).key_insights)),
    "### Source-Supported Facts",
    joinBullets(quickFacts.length > 0 ? quickFacts : verifiedClaims),
    buildMethodology(args.context, args.sources),
    "### Reliability & Confidence Statement",
    `The current reliability signal from the fact-check stage is **${String(fact.reliability_label ?? "Unknown")}** with a score of **${String(fact.reliability_score ?? 0)} / 100**. The strongest support generally comes from the most concrete retrieved sources and any repeated patterns across agent outputs. The main caveats are:\n${joinBullets(caveats)}`,
  ].join("\n\n");
}

function buildDetails(args: AssembleArgs): string {
  const query = asObject(args.queryResult.output);
  const summary = asObject(args.summaryResult.output);
  const analysis = asObject(args.analysisResult.output);
  const fact = asObject(args.factCheckResult.output);
  const coding = asObject(args.codingResult.output);

  const subtopics = asStringArray(query.subtopics);
  const concepts = asStringArray(query.key_concepts);
  const patterns = asStringArray(analysis.patterns);
  const caveats = asStringArray(analysis.caveats);
  const quickFacts = asStringArray(summary.quick_facts);
  const actionItems = asStringArray(summary.action_items);
  const warnings = asStringArray(fact.warnings);
  const contradictions = asStringArray(fact.contradictions);
  const verifiedClaims = asStringArray(fact.verified_claims);
  const unverifiedClaims = asStringArray(fact.unverified_claims);

  const chapters = [
    [
      "### Chapter 1: Foundational Context & Background",
      asString(args.context.enhanced_query) ||
        `The query intelligence stage reframed the user request into a deeper research directive. It identified the main research vectors, the likely intent of the query, and the concepts that need to be tracked across the rest of the pipeline.`,
      "#### Priority Subtopics",
      joinBullets(subtopics),
      "#### Core Concepts",
      joinBullets(takeFirst(concepts, 10)),
    ].join("\n\n"),
    [
      "### Chapter 2: Evidence Base & Source Inventory",
      "The following source inventory is the factual substrate used by the downstream agents. It captures what the search stage was able to retrieve and what each source appears to contribute.",
      formatSources(args.sources),
      quickFacts.length > 0 ? `#### Quick Facts Extracted\n${joinBullets(quickFacts)}` : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
    [
      "### Chapter 3: Technical / Mechanistic Deep Dive",
      asString(analysis.analysis) || "The analysis stage did not return a full narrative, so this section remains limited to the structured findings captured elsewhere in the pipeline.",
    ].join("\n\n"),
    [
      "### Chapter 4: Patterns, Trends & Comparative Findings",
      patterns.length > 0 ? `#### Cross-Source Patterns\n${joinBullets(patterns)}` : "#### Cross-Source Patterns\n- No explicit pattern list was returned by the analysis stage.",
      asString(analysis.comparison) ? `#### Comparative Analysis\n${asString(analysis.comparison)}` : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
    [
      "### Chapter 5: Verification, Contradictions & Evidence Quality",
      asString(fact.fact_check_summary) || "The fact-check stage returned limited narrative output.",
      `#### Verified Claims\n${joinBullets(verifiedClaims)}`,
      `#### Unverified Claims\n${joinBullets(unverifiedClaims)}`,
      `#### Contradictions\n${joinBullets(contradictions)}`,
    ].join("\n\n"),
    [
      "### Chapter 6: Risk Assessment & Caveats",
      `#### Analytical Caveats\n${joinBullets(caveats)}`,
      `#### Fact-Check Warnings\n${joinBullets(warnings)}`,
    ].join("\n\n"),
    [
      "### Chapter 7: Operational Recommendations",
      "This chapter converts the earlier findings into actionable decisions and priorities.",
      joinNumbered(actionItems),
    ].join("\n\n"),
    coding.code
      ? [
          "### Chapter 8: Technical Implementation Notes",
          `The coding stage was activated because the query was classified as **${args.context.intent}** and returned implementation guidance in **${asString(coding.language) || "an unspecified language"}**.`,
          asString(coding.explanation) || "No detailed implementation narrative was returned.",
          asString(coding.usage_example) ? `#### Usage & Integration\n${asString(coding.usage_example)}` : "",
          asString(coding.alternatives) ? `#### Alternatives\n${asString(coding.alternatives)}` : "",
        ]
          .filter(Boolean)
          .join("\n\n")
      : [
          "### Chapter 8: Future Outlook & Strategic Roadmap",
          "The strategic horizon should be read through the combined lens of the analysis, summary, and fact-check stages. The core issue is not only what is true now, but which indicators will matter next and where evidence is still thin.",
          `Immediate indicators to track include source quality, newly published evidence, and whether the current contradictions narrow or widen over time. Medium-term planning should revisit the subtopics highlighted by the query intelligence stage and update the evidence base as more authoritative material appears.`,
        ].join("\n\n"),
  ];

  return chapters.join("\n\n---\n\n");
}

function buildComparison(args: AssembleArgs): string {
  const analysis = asObject(args.analysisResult.output);
  const summary = asObject(args.summaryResult.output);
  const fact = asObject(args.factCheckResult.output);

  const actionItems = takeFirst(asStringArray(summary.action_items), 4);
  const warnings = takeFirst(asStringArray(fact.warnings), 4);

  return [
    "### Comparative Assessment",
    asString(analysis.comparison) ||
      "The analysis stage did not return a full comparison block, so this section compares the available strategic options using the summary, verification, and source-quality signals produced elsewhere in the pipeline.",
    "#### Decision Criteria",
    "- **Evidence strength**: How well-supported is each position by retrieved material and cross-agent agreement?",
    "- **Practical feasibility**: How realistic is implementation under real operational constraints?",
    "- **Risk exposure**: What warnings, contradictions, or unverified claims make the option fragile?",
    "- **Strategic upside**: What long-term advantage does the option offer if the current assumptions hold?",
    actionItems.length > 0 ? `#### High-Value Actions\n${joinBullets(actionItems)}` : "",
    warnings.length > 0 ? `#### Risk Modifiers\n${joinBullets(warnings)}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function buildExpertInsights(args: AssembleArgs): string[] {
  const query = asObject(args.queryResult.output);
  const analysis = asObject(args.analysisResult.output);
  const summary = asObject(args.summaryResult.output);
  const fact = asObject(args.factCheckResult.output);

  const insights = [
    `**Scope Drives Depth**: The final report quality is tightly coupled to the breadth of the query-intelligence stage. In this run, the pipeline identified **${args.context.subtopics.length || asStringArray(query.subtopics).length || 0} subtopics**, which created the structure for all later reasoning.`,
    `**Synthesis Is Stronger Than Any Single Stage**: The summary stage surfaces the decision-facing story, but it becomes materially more trustworthy only when the analysis and fact-check stages reinforce the same findings.`,
    `**Evidence Quality Is the Real Bottleneck**: The reliability assessment of **${String(fact.reliability_label ?? "Unknown")}** indicates that report confidence is constrained more by source quality and verification coverage than by language-model fluency.`,
    `**Patterns Matter More Than Isolated Facts**: The most actionable conclusions come from repeated patterns across sources and agents, not from one-off statements or isolated snippets.`,
    `**Operational Recommendations Need Verification Weighting**: Recommendations should be prioritized by both impact and evidence strength. A high-upside action with thin validation should not be framed the same way as a well-supported operational next step.`,
    `**Contradictions Are Productive Signals**: Disagreement across sources is not just a weakness; it often reveals changing definitions, different time windows, or contested assumptions that require explicit handling in the report.`,
    `**The Pipeline Benefits From Attached Files**: When user-supplied material is present, it grounds the analysis and reduces dependence on generic web retrieval. This run included **${args.context.file_context.length} attached files**.`,
    `**Report Quality Requires Recovery Logic**: Because each stage depends on structured model output, deterministic assembly inside the application is necessary to preserve a usable report when any single agent fails or underdelivers.`,
  ];

  const patternInsights = takeFirst(asStringArray(analysis.patterns), 2).map(
    (pattern) => `**Pattern-Derived Insight**: ${pattern}`
  );
  const summaryInsights = takeFirst(asStringArray(summary.key_points), 2).map(
    (point) => `**Decision-Facing Insight**: ${point}`
  );

  return [...insights, ...patternInsights, ...summaryInsights].slice(0, 12);
}

function buildConclusion(args: AssembleArgs): string {
  const summary = asObject(args.summaryResult.output);
  const fact = asObject(args.factCheckResult.output);
  const keyPoints = takeFirst(asStringArray(summary.key_points), 6);
  const actionItems = takeFirst(asStringArray(summary.action_items), 6);

  return [
    "### Summary of Key Findings",
    joinBullets(keyPoints),
    "### Actionable Recommendations",
    joinNumbered(actionItems),
    "### Areas For Further Research",
    `1. Re-run the research with refreshed sources if the topic is time-sensitive or currently changing.`,
    `2. Resolve the remaining contradictions captured by the fact-check stage before treating contested claims as settled.`,
    `3. Expand the evidence base with more primary sources, official documentation, or user-provided files where possible.`,
    "### Final Assessment",
    `The current evidence supports a report-level judgment of **${String(fact.reliability_label ?? "Unknown")} reliability** with a score of **${String(fact.reliability_score ?? 0)} / 100**. The strongest findings are the ones repeated across the summary, analysis, and fact-check stages; the weakest findings are those that rely on sparse sourcing or unresolved contradictions.`,
  ].join("\n\n");
}

function buildFactCheckSummary(args: AssembleArgs): string {
  const fact = asObject(args.factCheckResult.output);
  const contradictions = takeFirst(asStringArray(fact.contradictions), 3);
  const warnings = takeFirst(asStringArray(fact.warnings), 4);

  return [
    `**Reliability: ${String(fact.reliability_label ?? "Unknown")} (${String(fact.reliability_score ?? 0)} / 100)**`,
    asString(fact.fact_check_summary) || "The fact-check stage returned limited narrative output, so this condensed section emphasizes the structured reliability signals that were available.",
    contradictions.length > 0 ? `**Contradictions**\n${joinBullets(contradictions)}` : "",
    warnings.length > 0 ? `**Warnings**\n${joinBullets(warnings)}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function buildCodeBlock(args: AssembleArgs): string | undefined {
  const coding = asObject(args.codingResult.output);
  const code = asString(coding.code);
  if (!code) return undefined;

  const language = asString(coding.language);
  const explanation = asString(coding.explanation);

  return `\`\`\`${language}\n${code}\n\`\`\`\n\n${explanation}`.trim();
}

function buildKeyInsights(args: AssembleArgs): string[] {
  const query = asObject(args.queryResult.output);
  const summary = asObject(args.summaryResult.output);
  const analysis = asObject(args.analysisResult.output);
  const fact = asObject(args.factCheckResult.output);
  const coding = asObject(args.codingResult.output);

  const insights = [
    ...takeFirst(asStringArray(query.subtopics), 3).map(
      (item) => `**Research Scope** (Source: Query Intelligence Agent) — ${item}`
    ),
    ...takeFirst(asStringArray(summary.key_points), 4).map(
      (item) => `**Strategic Finding** (Source: Summary Agent) — ${item}`
    ),
    ...takeFirst(asStringArray(analysis.patterns), 4).map(
      (item) => `**Analytical Pattern** (Source: Analysis Agent) — ${item}`
    ),
    ...takeFirst(asStringArray(fact.verified_claims), 3).map(
      (item) => `**Verification Result** (Source: Fact-Check Agent) — ${item}`
    ),
  ];

  if (asString(coding.code)) {
    insights.push(
      `**Implementation Guidance** (Source: Coding Agent) — The pipeline returned concrete code output together with explanation, integration guidance, and pitfalls, which means the research request included an actionable technical dimension.`
    );
  }

  return insights.slice(0, 18);
}

export function buildAssembledResearchResult(
  args: AssembleArgs,
  metadata: ResearchResult["metadata"]
): ResearchResult {
  return {
    overview: buildOverview(args),
    keyInsights: buildKeyInsights(args),
    details: buildDetails(args),
    comparison: buildComparison(args),
    expertInsights: buildExpertInsights(args),
    conclusion: buildConclusion(args),
    code: buildCodeBlock(args),
    factCheck: buildFactCheckSummary(args),
    sources: args.sources,
    references: args.sources,
    agentResults: [
      args.queryResult,
      args.searchResult,
      args.analysisResult,
      args.summaryResult,
      args.codingResult,
      args.factCheckResult,
      args.reportResult,
    ],
    metadata,
  };
}

export function shouldUseAssembledReport(reportOutput: unknown): boolean {
  const report = asObject(reportOutput);
  const overview = asString(report.overview);
  const details = asString(report.details);
  const insights = asStringArray(report.key_insights);
  const conclusion = asString(report.conclusion);

  if (!hasEnoughDepth(overview, 250)) return true;
  if (!hasEnoughDepth(details, 1000)) return true;
  if (insights.length < 6) return true;
  if (!hasEnoughDepth(conclusion, 120)) return true;

  return false;
}
