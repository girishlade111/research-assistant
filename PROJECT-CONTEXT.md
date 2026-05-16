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
type SearchMode = "pro" | "deep" | "corpus"
type WorkflowMode = "chat" | "planning" | "research"
type IntentType = "coding" | "research" | "comparison" | "explanation" | "factual" | "general"
```

### 4.2 Provider Types
```typescript
type ModelProvider = "nvidia" | "openrouter"
type SearchProvider = "nvidia" | "openrouter"
```

### 4.3 Task Types (for model routing)
```typescript
type TaskType = "search" | "query" | "analysis" | "coding" | "summary" | "fact-check" | "report" | "default"
```

### 4.4 Agent Names
```typescript
type AgentName = "web-search-agent" | "query-intelligence-agent" | "analysis-agent" |
                 "coding-agent" | "summary-agent" | "fact-check-agent" | "report-agent"
type AgentStatus = "pending" | "running" | "done" | "failed" | "skipped"
```

### 4.5 AgentContext (shared input to all agents)
```typescript
interface AgentContext {
  query: string;              // Original user query
  enhanced_query: string;     // Expanded query with mode/intent suffix
  intent: IntentType;         // Detected intent
  subtopics: string[];        // Generated subtopics
  search_terms: string[];     // Search terms from plan
  web_results: SearchResult[];// Retrieved search results
  file_context: FileContext[];// Uploaded file contents
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
  queryId: string;                    // Slug from query
  originalQuery: string;
  researchType: ResearchType;         // financial|technical|scientific|news|comparative|general
  reportTitle: string;
  estimatedPages: number;             // Minimum 7
  fixedSections: FixedSection[];      // Always 3: overview, keyInsights, conclusion
  dynamicSections: DynamicSection[];  // 6-8 query-specific sections
  globalSearchContext: string;
  totalAgentsNeeded: number;
}

interface FixedSection {
  id: string;       // "overview" | "keyInsights" | "conclusion"
  title: string;
  order: number;    // 1, 99, 100
}

interface DynamicSection {
  id: string;                    // "section_<topic>"
  agentRole: string;             // "Financial Analysis Specialist"
  sectionTitle: string;          // "Revenue Analysis"
  focusArea: string;             // What this section investigates
  priority: "high" | "medium" | "low";
  searchQueries: string[];       // 3 specific search queries
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

type SectionTaskType = "web_search" | "deep_reasoning" | "code_generation" |
                       "fast_summary" | "financial_analysis" | "report_compilation" |
                       "fact_checking" | "balanced_research"
```

### 4.9 SectionResult (Phase 2 output per section)
```typescript
interface SectionResult {
  sectionId: string;
  sectionTitle: string;
  agentRole: string;
  content: string;               // 600-900 words of markdown
  keyFindings: string[];
  dataPoints: SectionDataPoint[];
  sourcesUsed: SectionSourceRef[];
  confidenceScore: number;       // 0-1
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
  type?: "plan_ready" | "models_assigned" | "agent_update" | "phase_complete" | "complete" | "error";
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
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
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
  provider?: SearchProvider;
  search_terms?: string[];
}
```

### 4.16 API Types
```typescript
interface ApiKeys {
  nvidiaKey?: string;
  openrouterKey?: string;
}

interface ResearchRequest {
  query: string;
  workflowMode?: WorkflowMode;
  mode: SearchMode;
  model?: string;
  stream?: boolean;
  files?: FileContext[];
  conversationHistory?: LLMMessage[];
  disabledAgents?: AgentName[];
}

interface ResearchApiResponse {
  success: boolean;
  data?: ResearchResult;
  error?: string;
}

interface OrchestratorInput {
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
```

================================================================================
## SECTION 5: COMPLETE WORKING LOGIC — STEP BY STEP
================================================================================

### 5.1 USER SUBMITS QUERY (page.tsx)

```
1. User types query in SearchInput component
2. User clicks submit or presses Enter
3. handleSubmit() is called:
   a. Check if query is empty or loading → return if so
   b. Create user ChatMessage { role: "user", query, files }
   c. Build conversationHistory from existing messages
   d. Check localStorage cache via getCached()
      - If cache hit: create assistant message, reveal sections with 150ms delay
      - If cache miss: continue to step e
   e. Create assistant placeholder ChatMessage
   f. POST to /api/research with body:
      {
        query: currentQuery,
        workflowMode: "research" | "planning" | "chat",
        mode: "pro" | "deep" | "corpus",
        model: selectedModel,  // NOTE: ignored by API
        stream: true,
        files: ParsedFile[],
        conversationHistory: LLMMessage[],
        disabledAgents: AgentName[]  // NOTE: ignored by API
      }
   g. Read response Content-Type:
      - If "application/json": parse ResearchApiResponse, reveal sections
      - If "text/event-stream": call readStream()
```

### 5.2 SSE STREAM READER (page.tsx — readStream function)

```
readStream(response, callbacks):
  1. Get ReadableStream reader from response.body
  2. Loop: reader.read() until done
  3. Decode chunks with TextDecoder
  4. Split by newline, parse SSE format:
     - Lines starting with "event: " → set currentEvent
     - Lines starting with "data: " → JSON.parse, route by currentEvent
  5. Event routing:
     - "status" → callbacks.onStatus(phase, message)
     - "token" → callbacks.onToken(text)
     - "result" → callbacks.onResult(ResearchResult)
     - "error" → callbacks.onError(message)
     - "done" → callbacks.onDone()
     - "agent_status" → callbacks.onAgentStatus(AgentStatusEvent)
     - "route_decision" → callbacks.onRouteDecision(RouteDecision)
     - "workflow_mode" → callbacks.onWorkflowMode(WorkflowModeEvent)
     - "thinking" → callbacks.onThinking(ThinkingStep)
```

### 5.3 API ROUTE (app/api/research/route.ts)

```
POST handler:
  1. Parse request body: { query, userId, conversationId, mode }
  2. Get API keys from process.env: { nvidiaKey, openrouterKey }
  3. Validate: return 503 if no API keys, 400 if no query
  4. Create SSE stream: TransformStream + TextEncoder
  5. Define sendSSE(data) → writes "data: JSON\n\n" to stream
  6. Start background async execution:
     a. If development: run API connectivity tests, send debug event
     b. Call runResearchOrchestrator({
          userQuery, userId, conversationId,
          researchMode: mode || 'deep',
          apiKeys,
          onProgress: sendSSE
        })
     c. Send result event: { type: "result", data: finalReport }
     d. On error: send error or warning event
     e. Finally: close writer
  7. Return Response with SSE headers:
     Content-Type: text/event-stream
     Cache-Control: no-cache
     Connection: keep-alive
     X-Accel-Buffering: no
```

### 5.4 ORCHESTRATOR (lib/engine/orchestrator.ts)

```
runResearchOrchestrator(input):

  PHASE 1: INITIALIZATION
  ─────────────────────────
  Step 1: Cache Check
    - Generate SHA-256 hash of query + researchMode
    - Call getCachedResponse(hash) → always returns null (mock)
    - If cached: return immediately with 100% progress

  Step 2: Memory Fetch
    - Call buildMemoryContext(userId) → returns hardcoded string (mock)
    - Result: "User prefers concise technical summaries."

  Step 3: Query Intelligence Agent
    - Send progress: { phase: 1, percent: 5, status: "Analyzing query..." }
    - Call runQueryIntelligenceAgent(userQuery, searchMode, apiKeys, { userQuery, userMemory, researchMode })
    - searchMode = researchMode === "deep" ? "deep" : "pro"
    - If error or no plan: throw Error
    - Extract: plan, enhanced_query, subtopics, search_terms
    - Send progress: { phase: 1, percent: 10, type: "plan_ready" }

  Step 4: Model Selection
    - Call selectModelsForPlan(plan, userQuery, apiKeys.nvidiaKey)
    - Returns AgentModelAssignment[] (one per dynamicSection)
    - Send progress: { phase: 1, percent: 15, type: "models_assigned" }

  PHASE 2: PARALLEL RESEARCH
  ────────────────────────────
  Step 5: Launch Section Agents
    - Send progress: { phase: 2, percent: 18, status: "Launching agents..." }
    - For each dynamicSection (with index):
      a. Find modelAssignment for this section (or use default)
      b. Create launchAgent() async function:
         - Stagger: wait index * 200ms
         - Call runSectionAgent({ section, assignedModel, originalQuery, globalSearchContext, apiKeys, researchMode, onProgress })
      c. Wrap with withGracefulTimeout(launchAgent(), 150_000, section)
         - On timeout: return SectionResult with error and placeholder content
    - Execute all with Promise.allSettled(agentPromises)

  Step 6: Collect Results
    - Filter fulfilled results → allSections
    - Separate completed (content > 50 chars, modelUsed !== "none") vs failed
    - Send progress: { phase: 2, percent: 70, type: "phase_complete" }

  PHASE 3: REPORT SYNTHESIS
  ──────────────────────────
  Step 7: Report Synthesis Agent
    - Send progress: { phase: 3, percent: 80, status: "Compiling report..." }
    - Call runReportSynthesisAgent({ plan, completedSections, failedSections, originalQuery, userMemory, apiKeys })
    - If synthesis fails: build fallback report from raw sections

  Step 8: Build ResearchResult
    - Map FinalReport fields to ResearchResult format
    - Calculate totalTokensUsed and totalDurationMs

  Step 9: Save & Cache
    - Send progress: { phase: 3, percent: 95, status: "Saving..." }
    - Call saveReport() → no-op (mock)
    - Call setCachedResponse() → no-op (mock)

  Step 10: Return
    - Send progress: { phase: 3, percent: 100, type: "complete" }
    - Return ResearchResult
```

### 5.5 QUERY INTELLIGENCE AGENT (query-intelligence-agent.ts)

```
runQueryIntelligenceAgent(query, mode, apiKeys, input):

  1. Select model: selectModel("query", query)
     - Primary: mistralai/mistral-large-3-675b-instruct-2512
     - Fallback: openai/gpt-oss-120b:free

  2. Build messages:
     - System: SYSTEM_PROMPT (Senior Research Director instructions)
     - User: "USER QUERY: ...\nRESEARCH MODE: ...\nUSER CONTEXT: ..."

  3. Call callWithFallback("query-intelligence-agent", primary, fallback, messages, 16384 tokens, apiKeys, { jsonMode: true, temperature: 0.4 })

  4. Parse response: safeParseJSON(result.content)

  5. If parse fails or no dynamicSections:
     - Retry with assistant message + error correction prompt
     - Parse again

  6. If still fails: use buildFallbackPlan(query)
     - Returns 3 simple sections: Background, Analysis, Trends

  7. Normalize: normalizeResearchPlan(parsed, query)
     - Validates all fields
     - Ensures minimum 7 estimatedPages
     - Maps dynamicSections with proper types

  8. Return: { plan, enhanced_query, subtopics, search_terms, agent, model_used, etc. }
```

### 5.6 MODEL SELECTOR AGENT (model-selector-agent.ts)

```
selectModelsForPlan(plan, query, nvidiaApiKey):

  1. Detect query override: detectQueryOverride(query)
     - Tests query against QUERY_OVERRIDE_RULES regex patterns
     - Returns SectionTaskType or null

  2. For each dynamicSection:
     a. classifySectionTask(section)
        - Concatenate: agentRole + focusArea + sectionTitle
        - Test against ROLE_KEYWORDS regex patterns
        - Fallback: requiresWebSearch → "web_search", priority → task type
     b. resolveModelEntry(taskType, queryOverride)
        - Map taskType → sectionKey via TASK_TYPE_TO_SECTION
        - Look up SECTION_MODEL_MAP[sectionKey]
     c. resolveMaxTokens(section, entry)
        - Priority budget: high=16384, medium=12288, low=8192
        - Take max of priority budget and entry.defaultMaxTokens

  3. NVIDIA health check: checkNvidiaHealth(apiKey)
     - GET https://integrate.api.nvidia.com/v1/models
     - 4s timeout, 60s cache
     - If unhealthy: swap primary ↔ fallback for all NVIDIA-primary assignments

  4. Return AgentModelAssignment[]
```

### 5.7 SECTION RESEARCH AGENT (section-research-agent.ts)

```
runSectionAgent(config):

  Step 1: Web Search
    - If researchMode === "fast": use only first search query
    - Else: use all 3 search queries
    - executeSearchQueries(queries, existingResults, apiKeys):
      a. For each query: searchWithTimeout(query, apiKeys)
         - Calls searchWithFallback() from search-router.ts
         - 20s timeout per query
      b. Promise.allSettled() — all queries in parallel
      c. Deduplicate by URL, cap at 15 sources
    - If search fails: use existingResults or empty array

  Step 2: Context Building
    - buildSearchContext(sources):
      - If no sources: "No web search results available..."
      - Else: format as "SOURCE [title] (url):\nsnippet"

  Step 3: Section Synthesis
    - buildSystemPrompt(section, query):
      - "You are a {agentRole} working as part of a multi-agent research team."
      - Instructions: extract relevant info, analyze deeply, find patterns
      - Output format: JSON with sectionId, content, keyFindings, dataPoints, etc.
    - Call executeWithFallback(agentRole, { systemPrompt, userMessage, temperature: 0.3, maxTokens: 8192 })
      - Looks up AGENT_FALLBACK_CHAINS[agentRole]
      - **PROBLEM**: agentRole is dynamic (e.g., "Financial Analysis Specialist")
        but AGENT_FALLBACK_CHAINS has static keys like "financialAnalysis"
      - If no match: throws "No fallback chain defined"
      - **THIS IS WHY SECTIONS FAIL**

  Step 4: Parse & Validate
    - parseAndNormalize(raw, section):
      - safeParseJSON(raw) → extract JSON
      - If valid: normalize all fields (keyFindings, dataPoints, sourcesUsed, etc.)
      - If invalid: treat entire response as content text

  Step 5: Progress Callback
    - emitProgress(config, { status, wordCount, sourcesFound, confidence })

  Return: SectionResult
```

### 5.8 REPORT SYNTHESIS AGENT (report-synthesis-agent.ts)

```
runReportSynthesisAgent(input):

  1. Order sections by plan.dynamicSections order

  2. Deduplicate sources by URL

  3. Build synthesis prompt:
     - System: SYSTEM_PROMPT (Senior Research Editor)
     - User: all section content + data points + key findings

  4. Call generateAIResponse():
     - Primary: nvidia/nemotron-3-super-120b-a12b, maxTokens: 8000
     - **PROBLEM**: config says reportMaxTokens: 32768 but code uses 8000
     - Fallback: nvidia/nemotron-3-super-120b-a12b:free (OpenRouter)

  5. Parse: safeParseJSON(rawResponse)

  6. Build FinalReport:
     - Map parsed sections to ReportSections
     - If any field missing: use fallback values

  7. Return: FinalReport
```

================================================================================
## SECTION 6: MODEL REGISTRY — COMPLETE
================================================================================

### NVIDIA NIM Models (Primary Platform)
| Model ID | Type | Context | Cost Priority | Used By |
|----------|------|---------|---------------|---------|
| minimaxai/minimax-m2.7 | fast | 32K | 1 | Summary Agent |
| moonshotai/kimi-k2-thinking | reasoning | 32K | 2 | Report, Fact-Check, Risk Analysis |
| abacusai/dracarys-llama-3.1-70b-instruct | balanced | 32K | 2 | Web Search, Default |
| mistralai/mistral-large-3-675b-instruct-2512 | balanced | 32K | 3 | Query Intelligence, Fact-Check |
| deepseek-ai/deepseek-v3.2 | reasoning | 32K | 3 | Financial, Technical Analysis |
| z-ai/glm4.7 | balanced | 32K | 2 | Market Research |
| qwen/qwen3-coder-480b-a35b-instruct | coding | 32K | 3 | Code Generation |
| nvidia/nemotron-3-super-120b-a12b | balanced | 32K | 2 | Report Synthesis |

### OpenRouter Models (Fallback, Free Tier)
| Model ID | Type | Context | Cost Priority | Used By |
|----------|------|---------|---------------|---------|
| nvidia/nemotron-3-super-120b-a12b:free | balanced | 32K | 1 | Report Synthesis fallback |
| qwen/qwen3-coder:free | coding | 32K | 1 | Code Generation fallback |
| meta-llama/llama-3.3-70b-instruct:free | balanced | 131K | 1 | Web Search, Default fallback |
| openai/gpt-oss-120b:free | reasoning | 32K | 1 | Query, Financial, Technical fallback |
| z-ai/glm-4.5-air:free | fast | 32K | 1 | Summary fallback |
| google/gemma-4-31b-it:free | fast | 32K | 1 | Summary fallback |
| minimax/minimax-m2.5:free | fast | 32K | 1 | Summary fallback |

### Section Model Map (model-config.ts)
```
queryIntelligence:  primary=nvidia/mistral,      fallback=or/gptOss,      tokens=16384
webSearch:          primary=nvidia/dracarys,      fallback=or/llama,       tokens=16384
financialAnalysis:  primary=nvidia/deepseek,      fallback=or/gptOss,      tokens=16384
marketResearch:     primary=nvidia/glm,           fallback=or/nemotron,    tokens=16384
riskAnalysis:       primary=nvidia/kimi,          fallback=or/gptOss,      tokens=16384
technicalAnalysis:  primary=nvidia/deepseek,      fallback=or/gptOss,      tokens=16384
codeGeneration:     primary=nvidia/qwen,          fallback=or/qwen,        tokens=32768
factChecking:       primary=nvidia/kimi,          fallback=or/gptOss,      tokens=16384
summarization:      primary=nvidia/minimax,       fallback=or/glmAir,      tokens=16384
reportSynthesis:    primary=nvidia/nemotron,      fallback=or/nemotron,    tokens=32768
```

### 3-Tier Fallback Chains (fallback-config.ts)
```
queryIntelligence:  [nvidia/mistral, nvidia/nemotron, or/gptOss]
webSearch:          [nvidia/dracarys, nvidia/glm, or/glmAir]
financialAnalysis:  [nvidia/deepseek, nvidia/kimi, or/gptOss]
riskAnalysis:       [nvidia/kimi, nvidia/deepseek, or/gptOss]
marketResearch:     [nvidia/glm, nvidia/mistral, or/nemotron]
technicalAnalysis:  [nvidia/deepseek, nvidia/nemotron, or/gptOss]
codeGeneration:     [nvidia/qwen, nvidia/deepseek, or/qwen]
factChecking:       [nvidia/kimi, nvidia/mistral, or/gptOss]
summarization:      [nvidia/minimax, nvidia/glm, or/glmAir]
reportSynthesis:    [nvidia/nemotron, nvidia/mistral, or/nemotron]
```

================================================================================
## SECTION 7: TOKEN GOVERNANCE
================================================================================

| Component | Config Value | Actual Usage |
|-----------|-------------|--------------|
| Context Window | 131,072 tokens | Used by context-builder.ts |
| Max Response | 32,768 tokens | Config only |
| Agent Max | 16,384 tokens | Used by orchestrator for query intelligence |
| Report Max | 32,768 tokens | **BUT report-synthesis-agent.ts hardcodes 8000** |
| Per-Section | 8,192 tokens | Used by section-research-agent.ts |
| Words→Tokens | 1.3 ratio | Used for estimation |

================================================================================
## SECTION 8: SSE EVENT FORMAT — THE MISMATCH
================================================================================

### What Orchestrator Sends (via sendSSE in route.ts):
```
data: {"type":"progress","phase":1,"percent":5,"status":"Analyzing query..."}

data: {"type":"progress","phase":1,"percent":10,"status":"Research plan created","type":"plan_ready"}

data: {"type":"result","data":{...ResearchResult...}}

data: {"type":"error","message":"..."}
```

### What Frontend Expects (readStream in page.tsx):
```
event: status
data: {"phase":"1","message":"Analyzing query..."}

event: result
data: {...ResearchResult...}

event: error
data: {"message":"..."}
```

### The Problem:
- Orchestrator sends `data: {"type":"progress",...}` (type field inside data)
- Frontend reads `event: status` (SSE event prefix)
- **These don't match** — frontend never routes progress events correctly
- The `event:` prefix is never set by the orchestrator

================================================================================
## SECTION 9: ALL KNOWN BUGS AND ISSUES
================================================================================

### BUG 1: Fallback Chain Key Mismatch (CRITICAL)
**File**: section-research-agent.ts line 355, fallback-executor.ts line 38
**Problem**: executeWithFallback() is called with `section.agentRole` as the key
(e.g., "Financial Analysis Specialist"), but AGENT_FALLBACK_CHAINS has static keys
like "financialAnalysis". These never match.
**Impact**: Most section agents fail silently, returning empty content.
**Fix**: Either map agentRole to a known key, or add a default fallback chain.

### BUG 2: SSE Event Format Mismatch (CRITICAL)
**File**: route.ts line 37-38, page.tsx line 91-131
**Problem**: sendSSE() writes `data: {"type":"...",...}\n\n` but readStream() expects
`event: ...\ndata: {...}\n\n` format.
**Impact**: Progress updates, agent status, thinking steps never display in UI.
**Fix**: Either change sendSSE to use `event:` prefix, or change readStream to read `type` field.

### BUG 3: Search is AI-Generated (DESIGN ISSUE)
**File**: search-router.ts
**Problem**: No real web search. LLM generates fake search results with made-up URLs.
**Impact**: Sources in reports may be fabricated. URLs may not exist.
**Fix**: Integrate real search API (Tavily, SerpAPI, Brave Search).

### BUG 4: Report Synthesis Token Limit (MODERATE)
**File**: report-synthesis-agent.ts line 160
**Problem**: maxTokens hardcoded to 8000, but config.ts says reportMaxTokens: 32768.
**Impact**: Reports are shorter and less detailed than intended.
**Fix**: Change maxTokens to 16384 or 32768.

### BUG 5: Mock Infrastructure (DESIGN)
**File**: orchestrator.ts lines 17-33
**Problem**: getCachedResponse, setCachedResponse, buildMemoryContext, saveReport are all no-ops.
**Impact**: No caching, no persistence, no user memory.
**Fix**: Connect real Redis/Supabase or implement in-memory cache.

### BUG 6: Frontend Props Not Passed to API (MODERATE)
**File**: route.ts line 16, orchestrator.ts
**Problem**: API receives workflowMode, disabledAgents, conversationHistory, files but
doesn't forward them to the orchestrator. Orchestrator ignores these fields.
**Impact**: File uploads, conversation history, agent toggling don't work.
**Fix**: Pass all props through to orchestrator.

### BUG 7: selectedModel Ignored (MINOR)
**File**: route.ts, orchestrator.ts
**Problem**: Frontend sends selectedModel but API ignores it. Model selection is entirely server-side.
**Impact**: User model choice has no effect.
**Fix**: Either remove from UI or wire up to orchestrator.

### BUG 8: Planning Mode Not Connected (MINOR)
**File**: planning-workflow.ts, route.ts
**Problem**: Planning mode exists but is never called from the API route.
**Impact**: Planning workflow mode does nothing.
**Fix**: Add planning mode routing to API route.

### BUG 9: Legacy Agents Unused (MINOR)
**Files**: web-search-agent.ts, analysis-agent.ts, coding-agent.ts, fact-check-agent.ts, summary-agent.ts, report-agent.ts
**Problem**: These agents exist but are not called by the current orchestrator.
**Impact**: Dead code, but report-assembler.ts depends on them.
**Fix**: Either integrate or remove.

### BUG 10: .env.example Incomplete (MINOR)
**File**: .env.example
**Problem**: Only shows NEXT_PUBLIC_APP_URL, not NVIDIA_API_KEY or OPENROUTER_API_KEY.
**Impact**: New developers won't know what env vars to set.
**Fix**: Add all required env vars to .env.example.

================================================================================
## SECTION 10: ENVIRONMENT VARIABLES
================================================================================

```
# REQUIRED — Get from https://build.nvidia.com
NVIDIA_API_KEY=nvapi-xxxxxxxxxxxx

# REQUIRED — Get from https://openrouter.ai
OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxx

# OPTIONAL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

================================================================================
## SECTION 11: COMMANDS
================================================================================

```bash
npm install          # Install all dependencies
npm run dev          # Start dev server on localhost:3000
npm run build        # Production build (may show warnings)
npm run start        # Start production server
npm run lint         # Run ESLint
```

================================================================================
## SECTION 12: HOW TO FIX — PRIORITY ORDER
================================================================================

### PRIORITY 1: Fix Fallback Chain Mismatch (CRITICAL)
The section-research-agent.ts calls executeWithFallback() with dynamic agentRole strings
that don't match AGENT_FALLBACK_CHAINS keys. This causes most sections to fail.

**Solution A**: Add a mapping function in section-research-agent.ts:
```typescript
function mapAgentRoleToChainKey(agentRole: string): keyof typeof AGENT_FALLBACK_CHAINS {
  const role = agentRole.toLowerCase();
  if (role.includes("financial")) return "financialAnalysis";
  if (role.includes("market")) return "marketResearch";
  if (role.includes("risk")) return "riskAnalysis";
  if (role.includes("technical")) return "technicalAnalysis";
  if (role.includes("code")) return "codeGeneration";
  if (role.includes("fact")) return "factChecking";
  if (role.includes("summar")) return "summarization";
  if (role.includes("report")) return "reportSynthesis";
  if (role.includes("search")) return "webSearch";
  return "balancedResearch"; // default
}
```

**Solution B**: Add a default chain in AGENT_FALLBACK_CHAINS:
```typescript
balancedResearch: {
  tiers: [
    { platform: 'nvidia', modelId: 'abacusai/dracarys-llama-3.1-70b-instruct', maxTokens: 16384 },
    { platform: 'nvidia', modelId: 'nvidia/nemotron-3-super-120b-a12b', maxTokens: 16384 },
    { platform: 'openrouter', modelId: 'meta-llama/llama-3.3-70b-instruct:free', maxTokens: 8192 }
  ]
}
```

### PRIORITY 2: Fix SSE Event Format (CRITICAL)
Change sendSSE in route.ts to emit proper SSE events:
```typescript
const sendSSE = (event: string, data: object) => {
  writer.write(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
};
```
Then call: sendSSE("progress", { phase, message }) instead of sendSSE({ type: "progress", ... })

### PRIORITY 3: Increase Report Token Budget
In report-synthesis-agent.ts line 160, change maxTokens from 8000 to 16384.

### PRIORITY 4: Wire Up Missing Props
In route.ts, pass files, conversationHistory, disabledAgents to the orchestrator.
In orchestrator.ts, accept and use these fields.

### PRIORITY 5: Add Real Search
Replace AI-generated search in search-router.ts with a real search API.

### PRIORITY 6: Update .env.example
Add NVIDIA_API_KEY and OPENROUTER_API_KEY to .env.example.

================================================================================
## SECTION 13: DATA FLOW DIAGRAM (COMPLETE)
================================================================================

```
USER TYPES QUERY
       │
       ▼
┌─────────────────┐
│   page.tsx      │
│   handleSubmit()│
└────────┬────────┘
         │
         ├── Check localStorage cache ──→ Cache HIT → revealSections() → DONE
         │
         ▼ Cache MISS
┌─────────────────┐
│   POST          │
│   /api/research │
└────────┬────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│   route.ts                                                    │
│   Creates SSE stream, calls runResearchOrchestrator()         │
└────────┬─────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│   orchestrator.ts — runResearchOrchestrator()                 │
│                                                               │
│   PHASE 1: INITIALIZATION                                     │
│   ├── Cache check (mock → null)                               │
│   ├── Memory fetch (mock → hardcoded string)                  │
│   ├── Query Intelligence Agent                                │
│   │   └── LLM call → ResearchPlan (6-8 sections)              │
│   └── Model Selector Agent                                    │
│       └── classifySectionTask() → AgentModelAssignment[]      │
│                                                               │
│   PHASE 2: PARALLEL RESEARCH                                  │
│   ├── Section Agent 1 ──┐                                     │
│   ├── Section Agent 2 ──┤                                     │
│   ├── Section Agent 3 ──┤ Promise.allSettled()                │
│   ├── Section Agent 4 ──┤                                     │
│   ├── Section Agent 5 ──┤                                     │
│   └── Section Agent N ──┘                                     │
│       Each agent:                                             │
│       ├── searchWithFallback() → SearchResult[]               │
│       ├── buildSearchContext() → string                       │
│       ├── executeWithFallback() → LLM response               │
│       └── parseAndNormalize() → SectionResult                │
│                                                               │
│   PHASE 3: REPORT SYNTHESIS                                   │
│   ├── Report Synthesis Agent                                  │
│   │   └── LLM call → FinalReport                              │
│   ├── Build ResearchResult                                    │
│   └── Return via SSE                                          │
└────────┬─────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│   page.tsx      │
│   readStream()  │
│   ├── onResult  │ → toResponseSections() → revealSections()
│   ├── onError   │ → display error
│   └── onDone    │ → finalize message
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   ChatMessage   │
│   Bubble renders│
│   ├── AgentStatusPanel (if research mode)
│   ├── ThinkingPanel (if thinking steps)
│   ├── ResponseArea (sections with Markdown)
│   ├── SourcesSection (collapsible sources)
│   └── ExportButtons (MD/PDF/TXT)
└─────────────────┘
```

================================================================================
## SECTION 14: FRONTEND STATE MANAGEMENT
================================================================================

### State Variables in page.tsx:
```typescript
// UI State
const [sidebarOpen, setSidebarOpen] = useState(false)
const [sidebarView, setSidebarView] = useState<"home" | "history">("home")
const [history, setHistory] = useState<HistoryEntry[]>([])

// Search State
const [query, setQuery] = useState("")
const [workflowMode, setWorkflowMode] = useState<WorkflowMode>("research")
const [mode, setMode] = useState<SearchMode>("pro")
const [selectedModel, setSelectedModel] = useState("balanced-1")
const [disabledAgents, setDisabledAgents] = useState<AgentName[]>([])

// Chat State
const [messages, setMessages] = useState<ChatMessage[]>([])
const abortRef = useRef<AbortController | null>(null)
const revealTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])
const scrollAnchorRef = useRef<HTMLDivElement>(null)
const scrollContainerRef = useRef<HTMLDivElement>(null)
const isNearBottomRef = useRef(true)

// Mobile
const [viewportBottom, setViewportBottom] = useState(0)
```

### Derived State:
```typescript
const hasMessages = messages.length > 0
const lastMessage = messages[messages.length - 1]
const isAnyLoading = lastMessage?.role === "assistant" && (lastMessage.isLoading || lastMessage.isStreaming)
const showHero = !hasMessages && !isAnyLoading
```

### Key Callbacks:
- handleSubmit(files) — submit query, check cache, call API, handle SSE
- handleNewThread() — abort, clear messages, reset
- handleSelectHistory(query, workflowMode, mode) — load from history
- handleToggleAgent(agent) — enable/disable agent
- toggleThinking(messageId) — expand/collapse thinking panel
- handleExport(result, format) — export to MD/PDF/TXT
- updateLastAssistant(updater) — update last assistant message
- revealSections(sections, sources) — progressive reveal with 150ms delay

================================================================================
## SECTION 15: CSS DESIGN SYSTEM
================================================================================

### Glass Effects:
- `.glass` — semi-transparent background with blur
- `.glass-card` — card-style glass with border
- `.glass-strong` — more opaque glass for bottom bar
- `.border-shine` — animated border highlight
- `.gold-glow` — golden glow effect for hero state

### Color System:
- `--background` — main background (dark: #0a0a0a, light: #ffffff)
- `--foreground` — main text
- `--primary` — accent color (blue/purple)
- `--secondary` — secondary accent
- `--muted-foreground` — dimmed text
- `--accent` — subtle background accent
- `--border` — border color
- `--destructive` — error/red color

### Typography:
- `--font-inter` — body text (Inter)
- `--font-playfair` — headings (Playfair Display)
- `--font-geist-mono` — code/monospace (Geist Mono)

### Animations:
- `animate-pulse` — pulsing dot for loading
- `streak-container` + `streak-1/2/3` — decorative streak effects
- Framer Motion: fade-in, slide-up, stagger reveals

================================================================================
## SECTION 16: CURRENT STATE SUMMARY
================================================================================

### What Works:
- Multi-agent architecture is fully implemented
- 3-phase orchestrator with parallel section research
- SSE streaming from API to frontend
- Fallback chains at multiple levels
- File parsing for PDF, DOCX, CSV, TXT, images
- Export to Markdown, PDF, TXT
- Client-side caching with localStorage
- History management
- Responsive UI with glassmorphism design
- Agent status panel with real-time progress
- Thinking panel for AI reasoning transparency
- Agent settings modal to enable/disable agents
- Error classification with user-friendly messages
- Graceful degradation for timeouts

### What Doesn't Work:
- Search generates fake/hallucinated results (not real web search)
- SSE events don't match frontend expectations (progress never displays)
- Fallback chain keys don't match agent roles (sections fail silently)
- Report synthesis limited to 8000 tokens (should be 32768)
- File uploads, conversation history, disabled agents not passed through
- Planning mode not connected
- Server-side caching and persistence are mocked
- Legacy agents are dead code
- .env.example is incomplete

================================================================================
END OF PROJECT CONTEXT
================================================================================
