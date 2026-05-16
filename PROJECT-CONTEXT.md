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
