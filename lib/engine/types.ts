// ── Intent & Mode ──────────────────────────────────────────────

export type SearchMode = "pro" | "deep" | "corpus";
export type WorkflowMode = "chat" | "planning" | "research";

export type IntentType =
  | "coding"
  | "research"
  | "comparison"
  | "explanation"
  | "factual"
  | "general";

// ── Providers ──────────────────────────────────────────────────

export type ModelProvider = "nvidia" | "openrouter";

export type SearchProvider = "nvidia" | "openrouter";

// ── Task Types (for model routing) ─────────────────────────────

export type TaskType =
  | "search"
  | "query"
  | "analysis"
  | "coding"
  | "summary"
  | "fact-check"
  | "report"
  | "default";

// ── Agent Names ────────────────────────────────────────────────

export type AgentName =
  | "web-search-agent"
  | "query-intelligence-agent"
  | "analysis-agent"
  | "coding-agent"
  | "summary-agent"
  | "fact-check-agent"
  | "report-agent";

export type AgentStatus = "pending" | "running" | "done" | "failed" | "skipped";

// ── Agent Context (shared input to all agents) ─────────────────

export interface AgentContext {
  query: string;
  enhanced_query: string;
  intent: IntentType;
  subtopics: string[];
  search_terms: string[];
  web_results: SearchResult[];
  file_context: FileContext[];
  conversationHistory?: LLMMessage[];
}

// ── Agent Result ───────────────────────────────────────────────

export interface AgentResult {
  agent: AgentName;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  output: Record<string, any>;
  model_used: string;
  provider: string;
  durationMs: number;
  isFallback: boolean;
  error?: string;
}

// ── Agent Status Event (SSE) ───────────────────────────────────

export interface AgentStatusEvent {
  agent: AgentName;
  status: AgentStatus;
  model?: string;
  provider?: string;
  durationMs?: number;
  isFallback?: boolean;
  error?: string;
}

// ── Query Enhancement ──────────────────────────────────────────

export interface EnhancedQuery {
  original: string;
  enhanced: string;
  intent: IntentType;
  subtopics: string[];
}

// ── Research Plan (Query Intelligence Agent output) ────────────

export type ResearchType =
  | "financial"
  | "technical"
  | "scientific"
  | "news"
  | "comparative"
  | "general";

export type SectionPriority = "high" | "medium" | "low";
export type OutputLength = "long" | "medium" | "short";

export interface FixedSection {
  id: string;
  title: string;
  order: number;
}

export interface DynamicSection {
  id: string;
  agentRole: string;
  sectionTitle: string;
  focusArea: string;
  priority: SectionPriority;
  searchQueries: string[];
  outputLength: OutputLength;
  requiresWebSearch: boolean;
}

export interface ResearchPlan {
  queryId: string;
  originalQuery: string;
  researchType: ResearchType;
  reportTitle: string;
  estimatedPages: number;
  fixedSections: FixedSection[];
  dynamicSections: DynamicSection[];
  globalSearchContext: string;
  totalAgentsNeeded: number;
}

export interface QueryIntelligenceInput {
  userQuery: string;
  userMemory: string;
  researchMode: "fast" | "deep";
}

// ── Model Selector Agent ──────────────────────────────────────

export type SectionTaskType =
  | "web_search"
  | "deep_reasoning"
  | "code_generation"
  | "fast_summary"
  | "financial_analysis"
  | "report_compilation"
  | "fact_checking"
  | "balanced_research";

export interface ModelAssignment {
  platform: "nvidia" | "openrouter";
  modelId: string;
}

export interface AgentModelAssignment {
  sectionId: string;
  agentRole: string;
  primaryModel: ModelAssignment;
  fallbackModel: ModelAssignment;
  taskType: SectionTaskType;
  maxTokens: number;
}

// ── Section Research Agent ─────────────────────────────────────

export interface SectionDataPoint {
  metric: string;
  value: string;
  year?: string;
  source?: string;
}

export interface SectionSourceRef {
  title: string;
  url: string;
  relevance: "high" | "medium" | "low";
}

export interface SectionResult {
  sectionId: string;
  sectionTitle: string;
  agentRole: string;
  content: string;
  keyFindings: string[];
  dataPoints: SectionDataPoint[];
  sourcesUsed: SectionSourceRef[];
  confidenceScore: number;
  dataQuality: "rich" | "moderate" | "limited";
  wordCount: number;
  modelUsed: string;
  provider: string;
  isFallback: boolean;
  durationMs: number;
  tokensUsed: number;
  error?: string;
}

export interface SectionProgressEvent {
  sectionId: string;
  status: "searching" | "synthesizing" | "complete" | "failed";
  agentRole: string;
  wordCount?: number;
  sourcesFound?: number;
  confidence?: number;
  error?: string;
}

export interface SectionAgentConfig {
  section: DynamicSection;
  assignedModel: AgentModelAssignment;
  originalQuery: string;
  globalSearchContext: string;
  existingSearchResults?: SearchResult[];
  apiKeys: ApiKeys;
  onProgress?: (event: SectionProgressEvent) => void;
}

// ── Search ─────────────────────────────────────────────────────

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  domain: string;
  relevanceScore: number;
}

export interface SearchOptions {
  query: string;
  enhanced_query?: string;
  mode: SearchMode;
  maxResults: number;
  provider?: SearchProvider;
  search_terms?: string[];
}

// ── Files ──────────────────────────────────────────────────────

export interface FileContext {
  fileName: string;
  fileType: string;
  content: string;
}

// ── Model Routing ──────────────────────────────────────────────

export interface ResolvedModel {
  id: string;
  provider: "nvidia" | "openrouter";
  type: "fast" | "reasoning" | "coding" | "balanced";
  context_length: number;
  cost_priority: number;
  displayName: string;
}

export interface ModelFallbackChain {
  primary: ResolvedModel;
  fallbacks: ResolvedModel[];
}

// ── Standard LLM Response (all providers return this) ──────────

export interface LLMResponse {
  content: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model_used: string;
  provider: string;
}

export interface LLMStreamChunk {
  delta: string;
  done: boolean;
  model?: string;
  provider?: ModelProvider;
}

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMRequestOptions {
  model: string;
  messages: LLMMessage[];
  maxTokens: number;
  temperature: number;
  stream?: boolean;
  jsonMode?: boolean;
  timeoutMs?: number;
}

// ── Context ────────────────────────────────────────────────────

export interface BuiltContext {
  text: string;
  sourceCount: number;
  estimatedTokens: number;
  sources: SearchResult[];
}

// ── Response ───────────────────────────────────────────────────

export interface ResearchSource {
  id: string;
  title: string;
  snippet: string;
  url: string;
  domain: string;
}

export interface ResearchResult {
  overview: string;
  keyInsights: string[];
  details: string;
  comparison: string;
  expertInsights: string[];
  conclusion: string;
  // New fields for multi-agent
  code?: string;
  factCheck?: string;
  sources: ResearchSource[];
  references: ResearchSource[];
  agentResults?: AgentResult[];
  metadata: {
    model: string;
    provider: string;
    searchProvider: string;
    intent: IntentType;
    workflowMode?: WorkflowMode;
    switchedFromPlanning?: boolean;
    tokensUsed: number;
    durationMs: number;
    isFallback?: boolean;
    agentTrace?: AgentStatusEvent[];
  };
}

// ── Orchestrator ───────────────────────────────────────────────

export interface ResearchOptions {
  workflowMode?: WorkflowMode;
  mode: SearchMode;
  userModelId?: string;
  maxSources?: number;
  maxTokens?: number;
  files?: FileContext[];
  conversationHistory?: LLMMessage[];
  disabledAgents?: AgentName[];
}

export type StreamCallback = (chunk: string, done: boolean) => void;

export type AgentStatusCallback = (event: AgentStatusEvent) => void;

// ── Thinking Events (SSE) ─────────────────────────────────────

export interface ThinkingStep {
  id: string;
  phase: string;
  agent?: AgentName;
  text: string;
  timestamp: number;
}

export type ThinkingCallback = (step: ThinkingStep) => void;

// ── Orchestrator (New Parallel Engine) ─────────────────────────

export interface OrchestratorProgressEvent {
  phase: 1 | 2 | 3;
  type?: "plan_ready" | "models_assigned" | "agent_update" | "phase_complete" | "complete" | "error";
  percent: number;
  status: string;
  sectionId?: string;
  agentRole?: string;
  completedSections?: string[];
  failedSections?: number;
  error?: string;
}

export interface OrchestratorInput {
  userQuery: string;
  userId?: string;
  conversationId?: string;
  researchMode: "fast" | "deep";
  mode?: SearchMode;
  files?: FileContext[];
  conversationHistory?: LLMMessage[];
  disabledAgents?: AgentName[];
  apiKeys: ApiKeys;
  onProgress: (event: OrchestratorProgressEvent) => void;
  onChunk?: StreamCallback;
  onAgentStatus?: AgentStatusCallback;
  onThinking?: ThinkingCallback;
}

// ── API Route ──────────────────────────────────────────────────

export interface ResearchRequest {
  query: string;
  workflowMode?: WorkflowMode;
  mode: SearchMode;
  model?: string;
  stream?: boolean;
  files?: FileContext[];
  conversationHistory?: LLMMessage[];
  disabledAgents?: AgentName[];
}

export interface ResearchApiResponse {
  success: boolean;
  data?: ResearchResult;
  error?: string;
}

// ── API Keys ───────────────────────────────────────────────────

export interface ApiKeys {
  nvidiaKey?: string;
  openrouterKey?: string;
}

// ── Response Section (UI-compatible) ───────────────────────────

export interface ResponseSection {
  type: "heading" | "paragraph" | "bullets" | "code" | "fact_check";
  content: string;
  items?: string[];
  language?: string;
}

// ── Chat Message (multi-turn conversation) ─────────────────────

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  timestamp: number;

  // User message fields
  query?: string;
  files?: FileContext[];

  // Assistant message fields
  sections: ResponseSection[];
  sources: ResearchSource[];
  fullResult: ResearchResult | null;
  streamingText: string;
  routeComplexity: "simple" | "research" | null;
  agentStatuses: Partial<Record<AgentName, AgentState>>;
  showAgentPanel: boolean;
  statusMessage: string | null;
  isStreaming: boolean;
  isLoading: boolean;
  error: string | null;
  thinkingSteps: ThinkingStep[];
  showThinking: boolean;
}

export type AgentState = {
  status: AgentStatus;
  model?: string;
  provider?: string;
  durationMs?: number;
  isFallback?: boolean;
  error?: string;
};

// ── Report Synthesis Agent ─────────────────────────────────────

export interface ReportSections {
  executiveSummary: string;
  dynamic: { id: string; title: string; content: string; order: number }[];
  crossSectionAnalysis: string;
  keyFindings: string[];
  conclusions: string;
  confidenceAssessment: string;
}

export interface ReportMetadata {
  totalAgentsUsed: number;
  successfulAgents: number;
  failedAgents: number;
  totalSourcesAnalyzed: number;
  modelsUsed: string[];
}

export interface FinalReport {
  reportId: string;
  title: string;
  subtitle: string;
  generatedAt: string;
  originalQuery: string;
  estimatedReadTime: string;
  totalWords: number;
  totalPages: number;
  sections: ReportSections;
  sources: ResearchSource[];
  metadata: ReportMetadata;
}
