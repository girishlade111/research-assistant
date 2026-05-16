# ResAgent — ULTIMATE DETAILED PROJECT CONTEXT FOR AI

# Every structure, every function, every data flow explained

================================================================================

## SECTION 1: PROJECT IDENTITY

================================================================================

**Name**: ResAgent (Research Agent)
**Version**: 0.1.0
**Purpose**: Multi-agent AI research engine. User types a query → system orchestrates 7+ specialized AI agents in parallel → produces a structured, fact-checked intelligence report (7-15 pages).
**Framework**: Next.js 16.2.4 (App Router) + React 19.2.4
**Styling**: Tailwind CSS 4.0 + tw-animate-css + shadcn/ui (glassmorphism design)
**Deployment**: Vercel — https://research-agent.vercel.app
**Author**: Girish Lade (https://ladestack.in)
**Repository**: research-assistant (local)

================================================================================

## SECTION 2: COMPLETE TECHNOLOGY STACK

================================================================================

### Frontend

- React 19.2.4 (useState, useCallback, useRef, useEffect, memo)
- Framer Motion 12.38 (page transitions, micro-interactions, staggered reveals)
- Lucide React 1.8 (icons)
- React Markdown 10.1 + remark-gfm 4.0 (Markdown rendering with GitHub Flavored Markdown)
- class-variance-authority + clsx + tailwind-merge (className utilities)
- No Redux, no Zustand — all state is local React state

### Backend

- Next.js API Routes (App Router, Route Handlers)
- Server-Sent Events (SSE) for real-time streaming
- Node.js crypto module for SHA-256 hashing

### AI Providers

- NVIDIA NIM (primary) — https://integrate.api.nvidia.com/v1
- OpenRouter (fallback) — https://openrouter.ai/api/v1
- No OpenAI, no Anthropic, no Google AI

### File Processing

- pdfjs-dist 5.6 (PDF text extraction)
- mammoth 1.12 (DOCX text extraction)
- papaparse 5.5 (CSV parsing)
- tesseract.js 7.0 (Image OCR — English)
- Supports: PDF, DOCX, CSV, TXT, MD, JSON, PNG, JPG

### Export

- jspdf 4.2 + jspdf-autotable 5.0 (PDF generation)
- html-to-image 1.11 (screenshot export)
- Markdown and TXT export (client-side Blob)

### Database/Cache

- ALL MOCK — no real database connected
- getCachedResponse() → always returns null
- buildMemoryContext() → returns hardcoded string
- saveReport() → no-op function
- Client-side: localStorage (30min TTL, 50 max entries)

================================================================================

## SECTION 3: COMPLETE FILE TREE WITH PURPOSE

================================================================================

```
research-assistant/
│
├── app/                                    # Next.js App Router directory
│   ├── api/
│   │   └── research/
│   │       └── route.ts                    # POST /api/research — THE ONLY API ENDPOINT
│   │                                        # Accepts: { query, userId, conversationId, mode }
│   │                                        # Returns: SSE stream with events
│   │                                        # Calls: runResearchOrchestrator()
│   │
│   ├── page.tsx                            # MAIN UI (955 lines)
│   │                                        # Chat interface with multi-turn conversation
│   │                                        # SSE stream reader (readStream function)
│   │                                        # Progressive section reveal (150ms delay)
│   │                                        # Cache check before API call
│   │                                        # Export handler (MD/PDF/TXT)
│   │                                        # Mobile viewport fix
│   │
│   ├── layout.tsx                          # Root layout
│   │                                        # Fonts: Inter, Playfair_Display, Geist_Mono
│   │                                        # SEO metadata (OpenGraph, Twitter Cards)
│   │                                        # JSON-LD structured data
│   │
│   ├── globals.css                         # Design system
│   │                                        # Matte black/white theme
│   │                                        # Glass effects (.glass, .glass-card, .glass-strong)
│   │                                        # Metallic gradients, streak decorations
│   │                                        # Custom scrollbars, animations
│   │
│   ├── icon.svg / icon.tsx                 # App icons
│   ├── about-us/page.tsx                   # About page (static)
│   ├── privacy-policy/page.tsx             # Privacy policy (static)
│   └── terms-and-conditions/page.tsx       # Terms (static)
│
├── lib/
│   ├── engine/                             # CORE ENGINE — all AI logic lives here
│   │   │
│   │   ├── orchestrator.ts                 # MAIN ORCHESTRATOR (326 lines)
│   │   │                                    # runResearchOrchestrator(input) → ResearchResult
│   │   │                                    # Phase 1: Cache → Memory → Query Intelligence → Model Selection
│   │   │                                    # Phase 2: Promise.allSettled(runSectionAgent[])
│   │   │                                    # Phase 3: Report Synthesis → Save → Return
│   │   │                                    # Uses withGracefulTimeout (150s per section)
│   │   │                                    # Staggered agent launch (200ms delay between agents)
│   │   │
│   │   ├── types.ts                        # ALL TYPESCRIPT TYPES (507 lines)
│   │   │                                    # See Section 5 for complete type catalog
│   │   │
│   │   ├── config.ts                       # CORE CONFIGURATION (233 lines)
│   │   │                                    # API endpoints, retry config, token limits
│   │   │                                    # MODEL_REGISTRY (8 NVIDIA + 7 OpenRouter models)
│   │   │                                    # AGENT_MODEL_MAP (task type → primary/fallback)
│   │   │                                    # MODE_CONFIG (corpus/deep/pro settings)
│   │   │                                    # getFallbackChain(), findModel()
│   │   │
│   │   ├── config/
│   │   │   ├── model-config.ts             # SECTION-LEVEL MODEL MAPPING (143 lines)
│   │   │   │                                # NVIDIA_MODELS constant (8 model IDs)
│   │   │   │                                # OPENROUTER_MODELS constant (7 model IDs)
│   │   │   │                                # SECTION_MODEL_MAP (10 named roles → primary/fallback/tokens)
│   │   │   │                                # TASK_TYPE_TO_SECTION (8 task types → section keys)
│   │   │   │                                # PRIORITY_TOKEN_BUDGET (high=16384, medium=12288, low=8192)
│   │   │   │                                # QUERY_OVERRIDE_RULES (4 regex patterns → forced task types)
│   │   │   │
│   │   │   └── fallback-config.ts          # 3-TIER FALLBACK CHAINS (106 lines)
│   │   │                                    # AGENT_FALLBACK_CHAINS (10 named chains, 3 tiers each)
│   │   │                                    # FallbackTier: { platform, modelId, maxTokens }
│   │   │                                    # RETRYABLE_ERRORS: [429, 500, 502, 503, 504]
│   │   │                                    # FATAL_ERRORS: [400]
│   │   │
│   │   ├── agents/                         # ALL AGENT IMPLEMENTATIONS
│   │   │   │
│   │   │   ├── base-agent.ts               # SHARED AGENT UTILITIES (167 lines)
│   │   │   │                                # callWithFallback(agent, primary, fallback, messages, maxTokens, apiKeys, opts)
│   │   │   │                                #   → Race-based: try primary 45s, then race primary vs fallback
│   │   │   │                                #   → First to succeed wins
│   │   │   │                                # safeParseJSON(raw) → Record<string, unknown> | null
│   │   │   │                                #   → Tries: direct parse → fence extraction → brace block → first/last brace
│   │   │   │                                # skippedResult(agent) → AgentResult with error: "skipped"
│   │   │   │
│   │   │   ├── query-intelligence-agent.ts # PHASE 1 AGENT (320 lines)
│   │   │   │                                # runQueryIntelligenceAgent(query, mode, apiKeys, input)
│   │   │   │                                #   → Calls LLM with SYSTEM_PROMPT (Senior Research Director)
│   │   │   │                                #   → Expects JSON: { queryId, originalQuery, researchType, reportTitle,
│   │   │   │                                #     estimatedPages, fixedSections[], dynamicSections[], globalSearchContext }
│   │   │   │                                #   → normalizeResearchPlan() validates and cleans raw JSON
│   │   │   │                                #   → buildFallbackPlan() if all fails (3 simple sections)
│   │   │   │                                #   → Returns: { plan, enhanced_query, subtopics[], search_terms[] }
│   │   │   │
│   │   │   ├── model-selector-agent.ts     # PHASE 1 AGENT (190 lines)
│   │   │   │                                # selectModelsForPlan(plan, query, nvidiaApiKey)
│   │   │   │                                #   → classifySectionTask(section) — regex-based keyword matching
│   │   │   │                                #   → resolveModelEntry(taskType, queryOverride) — static map lookup
│   │   │   │                                #   → detectQueryOverride(query) — regex patterns from QUERY_OVERRIDE_RULES
│   │   │   │                                #   → checkNvidiaHealth(apiKey) — ping /models endpoint (4s timeout, 60s cache)
│   │   │   │                                #   → If NVIDIA down, swap primary ↔ fallback for all assignments
│   │   │   │                                #   → Returns: AgentModelAssignment[] (one per dynamicSection)
│   │   │   │
│   │   │   ├── section-research-agent.ts   # PHASE 2 AGENT (513 lines) — THE WORKHORSE
│   │   │   │                                # runSectionAgent(config: SectionAgentConfig)
│   │   │   │                                # Step 1: executeSearchQueries() — parallel web search
│   │   │   │                                #   → searchWithTimeout(query, apiKeys) — 20s per query
│   │   │   │                                #   → searchWithFallback() from search-router.ts
│   │   │   │                                #   → Deduplicates by URL, caps at 15 sources
│   │   │   │                                # Step 2: buildSearchContext(sources) — format as text
│   │   │   │                                # Step 3: callSynthesisModel() — LLM call
│   │   │   │                                #   → buildSystemPrompt(section, query) — specialist role prompt
│   │   │   │                                #   → executeWithFallback() from fallback-executor.ts
│   │   │   │                                # Step 4: parseAndNormalize(raw, section) — extract JSON
│   │   │   │                                # Step 5: emitProgress() — callback to orchestrator
│   │   │   │                                # Returns: SectionResult
│   │   │   │
│   │   │   ├── report-synthesis-agent.ts   # PHASE 3 AGENT (246 lines)
│   │   │   │                                # runReportSynthesisAgent(input: ReportSynthesisInput)
│   │   │   │                                #   → Orders sections by plan.dynamicSections order
│   │   │   │                                #   → Deduplicates sources by URL
│   │   │   │                                #   → Builds synthesis prompt with all section content
│   │   │   │                                #   → Calls generateAIResponse() with primary model
│   │   │   │                                #   → Falls back to OpenRouter if primary fails
│   │   │   │                                #   → safeParseJSON() to extract FinalReport
│   │   │   │                                #   → Falls back to raw section assembly if parse fails
│   │   │   │                                # Returns: FinalReport
│   │   │   │
│   │   │   ├── web-search-agent.ts         # LEGACY — NOT USED by current orchestrator
│   │   │   ├── analysis-agent.ts           # LEGACY — NOT USED by current orchestrator
│   │   │   ├── coding-agent.ts             # LEGACY — NOT USED by current orchestrator
│   │   │   ├── fact-check-agent.ts         # LEGACY — NOT USED by current orchestrator
│   │   │   ├── summary-agent.ts            # LEGACY — NOT USED by current orchestrator
│   │   │   └── report-agent.ts             # LEGACY — NOT USED by current orchestrator
│   │   │
│   │   ├── providers/                      # AI PROVIDER CLIENTS
│   │   │   │
│   │   │   ├── index.ts                    # generateAIResponse() — CENTRAL ROUTER (52 lines)
│   │   │   │                                # Takes: { model, provider, messages, stream, apiKeys, maxTokens, temperature, timeoutMs, jsonMode }
│   │   │   │                                # Routes to: nvidiaWithRetry() or openrouterWithRetry()
│   │   │   │                                # Default: 8192 maxTokens, 0.3 temperature
│   │   │   │
│   │   │   ├── nvidia.ts                   # NVIDIA NIM CLIENT (229 lines)
│   │   │   │                                # nvidiaComplete(apiKey, options) — non-streaming
│   │   │   │                                # nvidiaStream(apiKey, options, onChunk) — streaming
│   │   │   │                                # nvidiaWithRetry(apiKey, options, onChunk) — retry wrapper
│   │   │   │                                # callNvidiaModel(params) — standalone helper
│   │   │   │                                # Base URL: https://integrate.api.nvidia.com/v1
│   │   │   │                                # Default timeout: 90s
│   │   │   │                                # Retry: 1 retry with exponential backoff (500ms base, 2s max)
│   │   │   │
│   │   │   ├── openrouter.ts               # OPENROUTER CLIENT (277 lines)
│   │   │   │                                # openrouterComplete(apiKey, options) — non-streaming
│   │   │   │                                # openrouterStream(apiKey, options, onChunk) — streaming
│   │   │   │                                # openrouterWithRetry(apiKey, options, onChunk) — retry + rotation
│   │   │   │                                # callOpenRouterModel(params) — standalone helper
│   │   │   │                                # Base URL: https://openrouter.ai/api/v1
│   │   │   │                                # Headers: HTTP-Referer, X-Title
│   │   │   │                                # On 429: rotates through 5 free models
│   │   │   │                                # FREE_MODEL_ROTATION: [glm-4.5-air, gemma-4, minimax-m2.5, nemotron, gpt-oss]
│   │   │   │                                # jsonMode: response_format: { type: "json_object" }
│   │   │   │
│   │   │   ├── fallback-executor.ts        # 3-TIER SEQUENTIAL FALLBACK (163 lines)
│   │   │   │                                # executeWithFallback(agentType, params)
│   │   │   │                                #   → Looks up AGENT_FALLBACK_CHAINS[agentType]
│   │   │   │                                #   → Iterates tiers[0], tiers[1], tiers[2] sequentially
│   │   │   │                                #   → 500ms delay between tier 1→2, 1000ms between 2→3
│   │   │   │                                #   → If all fail: returns { content: '', modelUsed: 'none' }
│   │   │   │                                #   → Does NOT throw on failure
│   │   │   │                                # callModelByPlatform(tier, params) — routes to nvidia or openrouter
│   │   │   │
│   │   │   └── sonar.ts                    # EMPTY STUB — Perplexity removed
│   │   │
│   │   ├── search-router.ts                # SEARCH SYSTEM (191 lines)
│   │   │                                    # IMPORTANT: NOT REAL WEB SEARCH — AI-generated results
│   │   │                                    # searchWithFallback(options, apiKeys) → { results, provider }
│   │   │                                    #   → Tries NVIDIA search first (dracarys-llama-3.1-70b)
│   │   │                                    #   → Falls back to OpenRouter (llama-3.3-70b:free)
│   │   │                                    # searchViaNvidia() / searchViaOpenRouter()
│   │   │                                    #   → buildSearchMessages() — prompt asking LLM to generate results
│   │   │                                    #   → parseGeneratedResults() — extracts JSON or numbered list
│   │   │                                    # Returns: SearchResult[] with title, url, snippet, domain
│   │   │                                    # URLs may be hallucinated/fabricated
│   │   │
│   │   ├── model-router.ts                 # MODEL SELECTION HELPERS (78 lines)
│   │   │                                    # selectModel(taskType, query) → ModelFallbackChain
│   │   │                                    # autoSelectModel(query) — keyword-based model selection
│   │   │                                    # selectModelByUserId(userModelId, query) — user override
│   │   │                                    # getNextFallback(chain, failedModelIds) — iterate fallbacks
│   │   │
│   │   ├── query-enhancer.ts               # QUERY ENHANCEMENT (133 lines)
│   │   │                                    # detectIntent(query) → IntentType (regex-based)
│   │   │                                    #   Patterns: coding, comparison, research, explanation, factual, general
│   │   │                                    # expandQuery(query, mode, intent) → enhanced query string
│   │   │                                    #   Adds mode prefix ("Provide comprehensive analysis...")
│   │   │                                    #   Adds intent suffix ("Include code examples...")
│   │   │                                    # generateSubtopics(query, intent) → string[]
│   │   │                                    # enhanceQuery(query, mode) → EnhancedQuery
│   │   │
│   │   ├── query-router.ts                 # QUERY COMPLEXITY CLASSIFIER (180 lines)
│   │   │                                    # classifyQuery(query, apiKeys) → QueryRouterResult
│   │   │                                    #   Step 1: heuristicClassify() — regex patterns (instant)
│   │   │                                    #     SIMPLE_PATTERNS: greetings, thanks, simple questions
│   │   │                                    #     RESEARCH_PATTERNS: report, analysis, compare, code, etc.
│   │   │                                    #   Step 2: If uncertain → classifyViaOpenRouter() (free model)
│   │   │                                    #   Step 3: If OpenRouter fails → classifyViaNvidia() (minimax)
│   │   │                                    #   Step 4: Default → "research" (safe default)
│   │   │                                    # Returns: { complexity: "simple"|"research", reason, confidence }
│   │   │
│   │   ├── context-builder.ts              # CONTEXT ASSEMBLY (172 lines)
│   │   │                                    # buildContext(searchResults, files, tokenLimit, query)
│   │   │                                    #   → Chunk files (500 words per chunk)
│   │   │                                    #   → Score chunks by query term frequency
│   │   │                                    #   → Deduplicate web results by URL
│   │   │                                    #   → Rank by relevance score
│   │   │                                    #   → Trim to token budget (70% for files, 30% for web)
│   │   │                                    #   → formatAsContext() — "=== FILE CONTENT ===" + "=== WEB RESULTS ==="
│   │   │                                    # Returns: BuiltContext { text, sourceCount, estimatedTokens, sources }
│   │   │
│   │   ├── response-normalizer.ts          # OUTPUT NORMALIZATION (304 lines)
│   │   │                                    # normalizeResponse(rawText, searchResults, metadata) → ResearchResult
│   │   │                                    #   → Tries JSON extraction first
│   │   │                                    #   → Falls back to parseStructuredText() (header-based parsing)
│   │   │                                    #   → Falls back to wrapping raw text
│   │   │                                    # toResponseSections(result) → ResponseSection[]
│   │   │                                    #   → Maps ResearchResult fields to UI sections:
│   │   │                                    #     Overview, Key Insights, Analysis, Comparison, Code,
│   │   │                                    #     Expert Insights, Conclusion, Fact Check, Sources
│   │   │                                    # toExportMarkdown(result) → string (export-ready markdown)
│   │   │
│   │   ├── report-assembler.ts             # LEGACY REPORT ASSEMBLER (374 lines)
│   │   │                                    # buildAssembledResearchResult(args, metadata) → ResearchResult
│   │   │                                    #   → Takes outputs from ALL 7 legacy agents
│   │   │                                    #   → Builds 8-chapter report with methodology, findings, etc.
│   │   │                                    #   → NOT used by current orchestrator
│   │   │                                    # shouldUseAssembledReport(reportOutput) → boolean
│   │   │
│   │   ├── file-parser.ts                  # FILE PARSING (101 lines)
│   │   │                                    # parseFile(file: File) → ParsedFile { fileName, fileType, content }
│   │   │                                    #   → PDF: pdfjs-dist (getTextContent per page)
│   │   │                                    #   → DOCX: mammoth.extractRawText()
│   │   │                                    #   → CSV: PapaParse (join rows with commas)
│   │   │                                    #   → TXT/MD/JSON: file.text()
│   │   │                                    #   → PNG/JPG: tesseract.js OCR (English)
│   │   │
│   │   ├── planning-workflow.ts            # PLANNING MODE (308 lines)
│   │   │                                    # runPlanningChat(query, apiKeys, history, onChunk) → ResearchResult
│   │   │                                    #   → Collaborative planning with user
│   │   │                                    #   → Asks clarifying questions
│   │   │                                    #   → Builds research plan iteratively
│   │   │                                    # detectPlanningTransition(query, apiKeys, history)
│   │   │                                    #   → Heuristic: regex for "start", "go ahead", etc.
│   │   │                                    #   → AI: classifies "begin_research" vs "stay_planning"
│   │   │                                    # NOT connected to current API route
│   │   │
│   │   ├── errors.ts                       # ERROR CLASSIFICATION (102 lines)
│   │   │                                    # ResearchError class (extends Error)
│   │   │                                    #   kind: ErrorKind (rate_limit, auth, network, provider_down, etc.)
│   │   │                                    #   retryable: boolean (auto-calculated)
│   │   │                                    # classifyError(error, provider) → ResearchError
│   │   │                                    # userFacingMessage(error) → string
│   │   │
│   │   └── debug/
│   │       └── api-test.ts                 # API CONNECTIVITY TESTS (158 lines)
│   │                                        # testNvidiaConnection(apiKeys) → DebugTestResult
│   │                                        # testOpenRouterConnection(apiKeys) → DebugTestResult
│   │                                        # runAllConnectionTests(apiKeys) → DebugTestResult[]
│   │                                        # Only runs in development mode
│   │
│   ├── export/
│   │   └── pdf-exporter.ts                 # ADVANCED PDF EXPORT (not used by UI)
│   └── export-pdf.ts                       # SIMPLE PDF EXPORT (used by UI)
│
├── components/
│   ├── agents/
│   │   ├── agent-status-panel.tsx          # Real-time agent pipeline status with progress bar
│   │   ├── thinking-panel.tsx              # AI thinking steps display (collapsible)
│   │   └── agent-settings-modal.tsx        # Enable/disable individual agents
│   ├── export/
│   │   └── export-buttons.tsx              # Export to MD/PDF/TXT buttons
│   ├── layout/
│   │   └── sidebar.tsx                     # Navigation sidebar with history
│   ├── profile/
│   │   └── profile-modal.tsx               # User profile modal
│   ├── response/
│   │   ├── response-area.tsx               # Main response renderer (371 lines)
│   │   │                                    # Renders ResponseSection[] with Markdown
│   │   │                                    # Custom markdown components (h1-h6, code, table, etc.)
│   │   │                                    # CodeBlock sub-component with copy button
│   │   │                                    # FactCheckBlock with reliability indicators
│   │   │                                    # Progressive animation (150ms delay per section)
│   │   ├── source-card.tsx                 # Individual source card
│   │   ├── source-modal.tsx                # Source detail modal
│   │   └── sources-section.tsx             # Collapsible sources panel
│   ├── search/
│   │   ├── search-input.tsx                # Textarea with file upload, drag-and-drop
│   │   ├── search-controls.tsx             # Workflow mode, model selector, agent settings
│   │   ├── model-selector.tsx              # Model picker dropdown
│   │   ├── quick-search-modal.tsx          # Quick search modal
│   │   └── citation-graph-modal.tsx        # Citation graph visualization
│   └── ui/                                 # shadcn/ui primitives
│       ├── button.tsx
│       ├── collapsible.tsx
│       ├── dialog.tsx
│       └── dropdown-menu.tsx
│
├── hooks/
│   ├── use-cache.ts                        # localStorage cache + history (145 lines)
│   │                                        # getCached(query, workflowMode, mode, model) → ResearchResult | null
│   │                                        # setCached(query, workflowMode, mode, model, result)
│   │                                        # getHistory() → HistoryEntry[]
│   │                                        # deleteHistoryItem(id) → HistoryEntry[]
│   │                                        # clearHistory() — clears all cache + history
│   │                                        # Hash: djb2-like algorithm, prefix "resagent_cache_"
│   │                                        # TTL: 30 minutes, Max entries: 50
│   ├── use-debounce.ts                     # Generic debounce hook
│   └── use-mobile.ts                       # Mobile breakpoint detection (768px)
│
├── .env                                    # NVIDIA_API_KEY, OPENROUTER_API_KEY
├── .env.local                              # Same + NEXT_PUBLIC_APP_URL
├── .env.example                            # Only NEXT_PUBLIC_APP_URL
├── package.json                            # Dependencies and scripts
├── tsconfig.json                           # TypeScript config
├── next.config.ts                          # Empty/default
├── postcss.config.mjs                      # @tailwindcss/postcss
├── eslint.config.mjs                       # Next.js + TypeScript
├── components.json                         # shadcn/ui config
├── AGENTS.md                               # Agent Fleet Operations manifesto
├── CLAUDE.md                               # Project guide for AI assistants
├── SKILLS.md                               # Skills documentation
├── README.md                               # Project README
├── SECURITY.md                             # Security documentation
└── PROJECT-CONTEXT.md                      # THIS FILE
```

================================================================================

## SECTION 4: COMPLETE TYPE SYSTEM (types.ts — 507 lines)

================================================================================

### 4.1 Intent & Mode Types

```typescript
type SearchMode = "pro" | "deep" | "corpus";
type WorkflowMode = "chat" | "planning" | "research";
type IntentType =
  | "coding"
  | "research"
  | "comparison"
  | "explanation"
  | "factual"
  | "general";
```

### 4.2 Provider Types

```typescript
type ModelProvider = "nvidia" | "openrouter";
type SearchProvider = "nvidia" | "openrouter";
```

### 4.3 Task Types (for model routing)

```typescript
type TaskType =
  | "search"
  | "query"
  | "analysis"
  | "coding"
  | "summary"
  | "fact-check"
  | "report"
  | "default";
```

### 4.4 Agent Names

```typescript
type AgentName =
  | "web-search-agent"
  | "query-intelligence-agent"
  | "analysis-agent"
  | "coding-agent"
  | "summary-agent"
  | "fact-check-agent"
  | "report-agent";
type AgentStatus = "pending" | "running" | "done" | "failed" | "skipped";
```

### 4.5 AgentContext (shared input to all agents)

```typescript
interface AgentContext {
  query: string; // Original user query
  enhanced_query: string; // Expanded query with mode/intent suffix
  intent: IntentType; // Detected intent
  subtopics: string[]; // Generated subtopics
  search_terms: string[]; // Search terms from plan
  web_results: SearchResult[]; // Retrieved search results
  file_context: FileContext[]; // Uploaded file contents
  conversationHistory?: LLMMessage[]; // Multi-turn history
}
```

### 4.6 AgentResult (output from any agent)

```typescript
interface AgentResult {
  agent: AgentName;
  output: Record<string, any>; // Agent-specific structured output
  model_used: string;
  provider: string;
  durationMs: number;
  isFallback: boolean;
  error?: string;
}
```

### 4.7 ResearchPlan (Query Intelligence Agent output)

```typescript
interface ResearchPlan {
  queryId: string; // Slug from query
  originalQuery: string;
  researchType: ResearchType; // financial|technical|scientific|news|comparative|general
  reportTitle: string;
  estimatedPages: number; // Minimum 7
  fixedSections: FixedSection[]; // Always 3: overview, keyInsights, conclusion
  dynamicSections: DynamicSection[]; // 6-8 query-specific sections
  globalSearchContext: string;
  totalAgentsNeeded: number;
}

interface FixedSection {
  id: string; // "overview" | "keyInsights" | "conclusion"
  title: string;
  order: number; // 1, 99, 100
}

interface DynamicSection {
  id: string; // "section_<topic>"
  agentRole: string; // "Financial Analysis Specialist"
  sectionTitle: string; // "Revenue Analysis"
  focusArea: string; // What this section investigates
  priority: "high" | "medium" | "low";
  searchQueries: string[]; // 3 specific search queries
  outputLength: "long" | "medium" | "short";
  requiresWebSearch: boolean;
}
```

### 4.8 Model Assignment Types

```typescript
interface ModelAssignment {
  platform: "nvidia" | "openrouter";
  modelId: string;
}

interface AgentModelAssignment {
  sectionId: string;
  agentRole: string;
  primaryModel: ModelAssignment;
  fallbackModel: ModelAssignment;
  taskType: SectionTaskType;
  maxTokens: number;
}

type SectionTaskType =
  | "web_search"
  | "deep_reasoning"
  | "code_generation"
  | "fast_summary"
  | "financial_analysis"
  | "report_compilation"
  | "fact_checking"
  | "balanced_research";
```

### 4.9 SectionResult (Phase 2 output per section)

```typescript
interface SectionResult {
  sectionId: string;
  sectionTitle: string;
  agentRole: string;
  content: string; // 600-900 words of markdown
  keyFindings: string[];
  dataPoints: SectionDataPoint[];
  sourcesUsed: SectionSourceRef[];
  confidenceScore: number; // 0-1
  dataQuality: "rich" | "moderate" | "limited";
  wordCount: number;
  modelUsed: string;
  provider: string;
  isFallback: boolean;
  durationMs: number;
  tokensUsed: number;
  error?: string;
}

interface SectionDataPoint {
  metric: string;
  value: string;
  year?: string;
  source?: string;
}

interface SectionSourceRef {
  title: string;
  url: string;
  relevance: "high" | "medium" | "low";
}
```

### 4.10 FinalReport (Phase 3 output)

```typescript
interface FinalReport {
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

interface ReportSections {
  executiveSummary: string;
  dynamic: { id: string; title: string; content: string; order: number }[];
  crossSectionAnalysis: string;
  keyFindings: string[];
  conclusions: string;
  confidenceAssessment: string;
}

interface ReportMetadata {
  totalAgentsUsed: number;
  successfulAgents: number;
  failedAgents: number;
  totalSourcesAnalyzed: number;
  modelsUsed: string[];
}
```

### 4.11 ResearchResult (final API response)

```typescript
interface ResearchResult {
  overview: string;
  keyInsights: string[];
  details: string;
  comparison: string;
  expertInsights: string[];
  conclusion: string;
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
```

### 4.12 SSE Event Types

```typescript
interface AgentStatusEvent {
  agent: AgentName;
  status: AgentStatus;
  model?: string;
  provider?: string;
  durationMs?: number;
  isFallback?: boolean;
  error?: string;
}

interface ThinkingStep {
  id: string;
  phase: string;
  agent?: AgentName;
  text: string;
  timestamp: number;
}

interface OrchestratorProgressEvent {
  phase: 1 | 2 | 3;
  type?:
    | "plan_ready"
    | "models_assigned"
    | "agent_update"
    | "phase_complete"
    | "complete"
    | "error";
  percent: number;
  status: string;
  sectionId?: string;
  agentRole?: string;
  completedSections?: string[];
  failedSections?: number;
  error?: string;
}
```

### 4.13 Chat Message Types

```typescript
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  timestamp: number;
  query?: string;
  files?: FileContext[];
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

interface ResponseSection {
  type: "heading" | "paragraph" | "bullets" | "code" | "fact_check";
  content: string;
  items?: string[];
  language?: string;
}
```

### 4.14 LLM Types

```typescript
interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface LLMResponse {
  content: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model_used: string;
  provider: string;
}

interface LLMRequestOptions {
  model: string;
  messages: LLMMessage[];
  maxTokens: number;
  temperature: number;
  stream?: boolean;
  jsonMode?: boolean;
  timeoutMs?: number;
}
```

### 4.15 File & Search Types

```typescript
interface FileContext {
  fileName: string;
  fileType: string;
  content: string;
}

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  domain: string;
  relevanceScore: number;
}

interface SearchOptions {
  query: string;
  enhanced_query?: string;
  mode: SearchMode;
  maxResults: number;
els_assigned"
    | "agent_update"
    | "phase_complete"
    | "complete"
    | "error";
  percent: number;
  status: string;
  sectionId?: string;
  agentRole?: string;
  completedSections?: string[];
  failedSections?: number;
  error?: string;
}
```

### 4.13 Chat Message Types

```typescript
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  timestamp: number;
  query?: string;
  files?: FileContext[];
  sections: ResponseSection[];
  sources: ResearchSource[];
  fullResult: ResearchResult | null;

```
