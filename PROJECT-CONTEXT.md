# ResAgent — Complete Project Context for AI

## 1. PROJECT OVERVIEW
- **Name**: ResAgent (Research Agent)
- **Purpose**: Multi-agent AI research engine that transforms user queries into structured, fact-checked intelligence reports
- **Framework**: Next.js 16.2.4 (App Router) + React 19.2.4
- **Styling**: Tailwind CSS 4.0 + tw-animate-css + shadcn/ui
- **Deployment**: Vercel (https://research-agent.vercel.app)
- **Author**: Girish Lade

## 2. TECHNOLOGY STACK
| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Framer Motion, Lucide Icons |
| Backend | Next.js API Routes (App Router) |
| AI Providers | NVIDIA NIM (Primary), OpenRouter (Fallback) |
| Streaming | Server-Sent Events (SSE) |
| File Parsing | pdfjs-dist (PDF), mammoth (DOCX), tesseract.js (OCR), papaparse (CSV) |
| Export | jspdf (PDF), react-markdown (MD) |
| State | React useState/useCallback/useRef (no Redux/Zustand) |

## 3. ARCHITECTURE — MULTI-AGENT SYSTEM

### 3.1 Three-Phase Execution Model
```
PHASE 1: INITIALIZATION (Sequential)
  ├── Cache Check (Redis/Upstash mock)
  ├── Memory Fetch (Supabase mock)
  ├── Query Intelligence Agent → generates ResearchPlan
  └── Model Selector Agent → assigns models to sections

PHASE 2: PARALLEL RESEARCH (All agents simultaneous)
  ├── Section Research Agent 1 (web search + synthesis)
  ├── Section Research Agent 2
  ├── Section Research Agent 3
  ├── ... (6-8 agents in parallel)
  └── Section Research Agent N

PHASE 3: REPORT SYNTHESIS (Sequential)
  ├── Report Synthesis Agent → compiles all sections into FinalReport
  ├── Save & Cache
  └── Return ResearchResult via SSE
```

### 3.2 Data Flow
```
User Query (page.tsx)
  → POST /api/research (route.ts)
    → runResearchOrchestrator (orchestrator.ts)
      → runQueryIntelligenceAgent → ResearchPlan
      → selectModelsForPlan → AgentModelAssignment[]
      → Promise.allSettled(runSectionAgent[]) → SectionResult[]
      → runReportSynthesisAgent → FinalReport
    → SSE stream back to client
  → readStream() in page.tsx
  → toResponseSections() → UI rendering
```

## 4. FILE STRUCTURE
```
research-assistant/
├── app/
│   ├── api/research/route.ts          # POST /api/research — SSE endpoint
│   ├── page.tsx                        # Main UI — chat interface
│   ├── layout.tsx                      # Root layout with fonts & metadata
│   ├── globals.css                     # Tailwind + design tokens
│   ├── about-us/page.tsx
│   ├── privacy-policy/page.tsx
│   └── terms-and-conditions/page.tsx
├── lib/
│   ├── engine/
│   │   ├── orchestrator.ts             # Main orchestrator (3-phase pipeline)
│   │   ├── types.ts                    # ALL TypeScript types
│   │   ├── config.ts                   # Model registry, token limits, mode config
│   │   ├── config/
│   │   │   ├── model-config.ts
│   │   │   └── fallback-config.ts      # 3-tier fallback chains per agent role
│   │   ├── agents/
│   │   │   ├── base-agent.ts           # callWithFallback(), safeParseJSON()
│   │   │   ├── query-intelligence-agent.ts  # Phase 1: creates ResearchPlan
│   │   │   ├── model-selector-agent.ts     # Phase 1: assigns models
│   │   │   ├── section-research-agent.ts   # Phase 2: web search + synthesis
│   │   │   ├── report-synthesis-agent.ts   # Phase 3: final report compilation
│   │   │   ├── web-search-agent.ts
│   │   │   ├── analysis-agent.ts
│   │   │   ├── coding-agent.ts
│   │   │   ├── fact-check-agent.ts
│   │   │   ├── summary-agent.ts
│   │   │   └── report-agent.ts
│   │   ├── providers/
│   │   │   ├── index.ts                # generateAIResponse() — router
│   │   │   ├── nvidia.ts               # NVIDIA NIM API client
│   │   │   ├── openrouter.ts           # OpenRouter API client
│   │   │   ├── fallback-executor.ts    # 3-tier sequential fallback executor
│   │   │   └── sonar.ts               # EMPTY STUB (removed)
│   │   ├── search-router.ts            # AI-powered search (generates results)
│   │   ├── model-router.ts             # TaskType → Model mapping
│   │   ├── query-enhancer.ts
│   │   ├── query-router.ts
│   │   ├── context-builder.ts
│   │   ├── response-normalizer.ts
│   │   ├── report-assembler.ts
│   │   ├── file-parser.ts
│   │   ├── errors.ts                   # ResearchError class
│   │   └── debug/api-test.ts
│   ├── export/
│   │   └── pdf-exporter.ts
│   └── export-pdf.ts
├── components/
│   ├── agents/
│   │   ├── agent-settings-modal.tsx
│   │   ├── agent-status-panel.tsx
│   │   └── thinking-panel.tsx
│   ├── export/export-buttons.tsx
│   ├── layout/sidebar.tsx
│   ├── profile/profile-modal.tsx
│   ├── response/
│   │   ├── response-area.tsx
│   │   ├── source-card.tsx
│   │   ├── source-modal.tsx
│   │   └── sources-section.tsx
│   ├── search/
│   │   ├── citation-graph-modal.tsx
│   │   ├── model-selector.tsx
│   │   ├── quick-search-modal.tsx
│   │   ├── search-controls.tsx
│   │   └── search-input.tsx
│   └── ui/ (shadcn components)
├── hooks/
│   ├── use-cache.ts
│   ├── use-debounce.ts
│   └── use-mobile.ts
├── .env                                # NVIDIA_API_KEY, OPENROUTER_API_KEY
├── .env.local
├── package.json
├── tsconfig.json
├── next.config.ts
└── AGENTS.md                           # Agent Fleet Operations manifesto
```

## 5. AGENT FLEET (7 Agents)

### 5.1 Query Intelligence Agent
- **File**: `lib/engine/agents/query-intelligence-agent.ts`
- **Role**: Senior Research Director — analyze query, produce structured ResearchPlan
- **Primary Model**: mistralai/mistral-large-3-675b-instruct-2512 (NVIDIA)
- **Fallback**: openai/gpt-oss-120b:free (OpenRouter)
- **Output**: ResearchPlan with 6-8 dynamicSections, each with searchQueries
- **Key Logic**: Generates JSON plan, normalizes it, has fallback plan if all fails

### 5.2 Model Selector Agent
- **File**: `lib/engine/agents/model-selector-agent.ts`
- **Role**: Assigns primary + fallback models to each section based on task type
- **Input**: ResearchPlan
- **Output**: AgentModelAssignment[]

### 5.3 Section Research Agent (Phase 2 — runs 6-8 times in parallel)
- **File**: `lib/engine/agents/section-research-agent.ts`
- **Role**: Per-section specialist — does web search then synthesizes content
- **Steps**:
  1. Execute search queries (parallel, via search-router.ts)
  2. Build search context from results
  3. Call synthesis model (via fallback-executor.ts)
  4. Parse JSON response into SectionResult
- **Timeout**: 150s per agent
- **Output**: SectionResult with content, keyFindings, dataPoints, sourcesUsed

### 5.4 Report Synthesis Agent
- **File**: `lib/engine/agents/report-synthesis-agent.ts`
- **Role**: Senior Research Editor — compiles all sections into FinalReport
- **Primary Model**: nvidia/nemotron-3-super-120b-a12b
- **Fallback**: nvidia/nemotron-3-super-120b-a12b:free (OpenRouter)
- **Output**: FinalReport with executiveSummary, dynamic sections, conclusions, sources

### 5.5 Other Agents (exist as files but NOT used in current orchestrator)
- web-search-agent.ts, analysis-agent.ts, coding-agent.ts, fact-check-agent.ts, summary-agent.ts, report-agent.ts

## 6. PROVIDER SYSTEM

### 6.1 NVIDIA NIM
- **Base URL**: https://integrate.api.nvidia.com/v1
- **Auth**: Bearer token via NVIDIA_API_KEY
- **Timeout**: 90s default
- **Retry**: 1 retry with exponential backoff

### 6.2 OpenRouter
- **Base URL**: https://openrouter.ai/api/v1
- **Auth**: Bearer token via OPENROUTER_API_KEY
- **Headers**: HTTP-Referer, X-Title
- **Free Model Rotation**: On 429, rotates through 5 free models
- **jsonMode**: Uses response_format: { type: "json_object" }

### 6.3 Fallback Strategy (3-Tier)
- **File**: `lib/engine/config/fallback-config.ts` + `lib/engine/providers/fallback-executor.ts`
- Each agent role has 3 tiers: Tier1 (NVIDIA primary) → Tier2 (NVIDIA alt) → Tier3 (OpenRouter free)
- Sequential execution with 500ms/1000ms delays between tiers
- If all tiers fail, returns empty content (does NOT throw)

### 6.4 Search System
- **File**: `lib/engine/search-router.ts`
- **Method**: AI-POWERED (not real web search!)
- The LLM generates structured search results (title, url, snippet, domain)
- Primary: NVIDIA dracarys-llama-3.1-70b-instruct
- Fallback: OpenRouter meta-llama/llama-3.3-70b-instruct:free
- **IMPORTANT**: This is NOT real web search — it generates plausible-looking results

## 7. MODEL REGISTRY
```
NVIDIA Models:
  - minimaxai/minimax-m2.7 (fast, summary)
  - moonshotai/kimi-k2-thinking (reasoning, report)
  - abacusai/dracarys-llama-3.1-70b-instruct (balanced, search)
  - mistralai/mistral-large-3-675b-instruct-2512 (balanced, fact-check, query)
  - deepseek-ai/deepseek-v3.2 (reasoning, analysis)
  - z-ai/glm4.7 (balanced)
  - qwen/qwen3-coder-480b-a35b-instruct (coding)
  - nvidia/nemotron-3-super-120b-a12b (balanced, report synthesis)

OpenRouter Models (free tier):
  - nvidia/nemotron-3-super-120b-a12b:free
  - qwen/qwen3-coder:free
  - meta-llama/llama-3.3-70b-instruct:free
  - openai/gpt-oss-120b:free
  - z-ai/glm-4.5-air:free
  - google/gemma-4-31b-it:free
  - minimax/minimax-m2.5:free
```

## 8. TOKEN GOVERNANCE
```
System Context:     32,768 tokens
Max Report:         16,384 tokens (config says 32,768)
Per-Agent Cap:      8,192 tokens (config says 16,384)
Report Agent:       32,768 tokens
Context Window:     131,072 tokens
```

## 9. API ROUTE — /api/research
- **File**: `app/api/research/route.ts`
- **Method**: POST
- **Input**: { query, userId, conversationId, mode }
- **Output**: SSE stream with events:
  - `debug` — API connection tests (dev only)
  - `progress` — { phase, percent, status }
  - `result` — final ResearchResult
  - `error` — error message
  - `warning` — partial failure warning

## 10. FRONTEND — page.tsx
- **Chat Interface**: Multi-turn conversation with ChatMessage[]
- **SSE Reader**: readStream() parses SSE events
- **Progressive Section Reveal**: Sections appear with 150ms delay
- **Cache**: useResearchCache hook (localStorage)
- **Export**: MD, PDF, TXT formats
- **Mobile**: Responsive with visualViewport handling

## 11. ENVIRONMENT VARIABLES REQUIRED
```
NVIDIA_API_KEY=your_nvidia_nim_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 12. KNOWN ISSUES / POTENTIAL PROBLEMS

### 12.1 Search is AI-Generated (Not Real Web Search)
- search-router.ts does NOT perform real web searches
- It asks an LLM to "generate" search results
- This means sources may be fabricated/hallucinated
- URLs may not be real or accessible

### 12.2 Mock Infrastructure
- Cache (getCachedResponse/setCachedResponse) — returns null always
- Memory (buildMemoryContext) — returns hardcoded string
- Save (saveReport) — no-op
- No real database connected

### 12.3 Fallback Chain Mismatch
- section-research-agent.ts uses `executeWithFallback()` from fallback-executor.ts
- But fallback-executor.ts keys on agent role names like "Financial Analysis Specialist"
- These are DYNAMIC from the Query Intelligence Agent output
- If the role name doesn't match AGENT_FALLBACK_CHAINS keys, it will throw "No fallback chain defined"
- The orchestrator catches this and returns empty content

### 12.4 SSE Event Format Mismatch
- Orchestrator sends: `sendSSE({ type: "progress", phase, percent, status })`
- Frontend expects: `event: status\ndata: { phase, message }`
- The orchestrator sends `type` field, but frontend reads `event:` prefix
- This means progress updates may not display correctly

### 12.5 Model ID Format Inconsistency
- Some models use "provider/model" format (nvidia/nemotron-3-super-120b-a12b)
- OpenRouter free models use ":free" suffix
- The findModel() helper tries to handle this but may miss edge cases

### 12.6 Report Synthesis MaxTokens
- report-synthesis-agent.ts calls generateAIResponse with maxTokens: 8000
- But config.ts says reportMaxTokens: 32768
- This limits report quality significantly

## 13. HOW TO FIX / IMPROVE

### Priority 1: Make Search Real
- Replace AI-generated search with real search API (SerpAPI, Tavily, Brave Search, or Bing)
- Keep AI-generated as fallback only

### Priority 2: Fix SSE Event Format
- Orchestrator should send: `event: status\ndata: {...}\n\n`
- Currently sends: `data: {"type":"progress",...}\n\n`
- Frontend expects `event:` prefix for routing

### Priority 3: Fix Fallback Chain
- Add a generic fallback chain in AGENT_FALLBACK_CHAINS for unknown agent roles
- Or use the model assignment from Model Selector Agent directly

### Priority 4: Connect Real Infrastructure
- Redis/Upstash for caching
- Supabase for user memory and report storage
- Or remove mock functions and use simpler in-memory cache

### Priority 5: Increase Report Token Budget
- Change report-synthesis-agent.ts maxTokens from 8000 to 16384 or 32768
- This will produce richer, more detailed reports

### Priority 6: Add Error Recovery
- When Query Intelligence fails, the fallback plan is too simple (3 sections)
- Improve fallback plan to have 6 sections minimum
- Add retry logic for report synthesis

## 14. COMMANDS
```bash
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint
```

## 15. CURRENT STATE
- The app builds and runs
- The multi-agent architecture is fully implemented
- BUT: Search generates fake results, SSE events may not route correctly to frontend
- The orchestrator pipeline works end-to-end but may produce empty sections if fallback chains don't match
- UI is polished with glassmorphism design, sidebar, chat interface, export features
