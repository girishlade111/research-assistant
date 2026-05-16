# ResAgent — Full Project Context Document
## AI Tools & Agents la Samjhavla Pahije: Complete App Architecture, Logic & Data Flow

---

## 1. PROJECT OVERVIEW

**ResAgent** ek production-grade **multi-agent AI research engine** aahe. He ek Next.js 16 web app aahe jo user queries la structured, fact-checked intelligence reports madhye convert karte.

- **Author**: Girish Lade
- **URL**: https://research-agent.vercel.app
- **Framework**: Next.js 16.2.4 + React 19 + TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui (base-nova style)
- **Deployment**: Vercel

### Core Value Proposition
User ek research query type karto → App 6-8 specialized AI agents simultaneously launch karto → Pratek agent web search + LLM synthesis karto → Sarva agents cha output ek single cohesive 4000-6000 word professional report madhye assemble hoto.

---

## 2. DIRECTORY STRUCTURE

```
research-assistant/
├── app/                              # Next.js App Router
│   ├── api/research/route.ts         # SINGLE API ENDPOINT — SSE streaming
│   ├── page.tsx                      # MAIN UI — Chat interface + all state
│   ├── layout.tsx                    # Root layout with SEO, fonts, JSON-LD
│   ├── globals.css                   # Tailwind + custom CSS variables
│   ├── about-us/page.tsx             # Static page
│   ├── privacy-policy/page.tsx       # Static page
│   ├── terms-and-conditions/page.tsx # Static page
│   ├── icon.tsx / icon.svg           # App icons
│
├── lib/engine/                       # CORE ENGINE — All AI logic here
│   ├── orchestrator.ts              # MAIN ORCHESTRATOR — 3-phase execution
│   ├── types.ts                     # ALL TYPE DEFINITIONS — 500+ lines
│   ├── config.ts                    # Model registry, token limits, retry config
│   ├── context-builder.ts           # Builds context from search results + files
│   ├── model-router.ts              # Selects primary + fallback models
│   ├── query-enhancer.ts            # Intent detection + query expansion
│   ├── query-router.ts              # Simple vs Research classification
│   ├── search-router.ts             # FAKE SEARCH — LLM-generated search results
│   ├── response-normalizer.ts       # Converts ResearchResult → UI sections
│   ├── report-assembler.ts          # Deterministic report assembly fallback
│   ├── planning-workflow.ts         # Planning mode conversation logic
│   ├── file-parser.ts               # PDF, DOCX, CSV, TXT, OCR parsing
│   ├── errors.ts                    # ResearchError class + classification
│
│   ├── agents/                      # ALL AGENT IMPLEMENTATIONS
│   │   ├── base-agent.ts            # callWithFallback, safeParseJSON, skippedResult
│   │   ├── query-intelligence-agent.ts  # Phase 1: Creates research plan
│   │   ├── model-selector-agent.ts      # Phase 1: Assigns models to sections
│   │   ├── web-search-agent.ts          # Phase 2: Search via LLM generation
│   │   ├── section-research-agent.ts    # Phase 2: Per-section research + synthesis
│   │   ├── report-synthesis-agent.ts    # Phase 3: Final report compilation
│   │   ├── analysis-agent.ts            # Deep analysis (2-stage)
│   │   ├── coding-agent.ts              # Code generation
│   │   ├── fact-check-agent.ts          # Claim verification (2-stage)
│   │   ├── summary-agent.ts             # Executive summary (2-stage)
│   │   └── report-agent.ts              # 4-stage report synthesis (legacy)
│
│   ├── config/
│   │   ├── model-config.ts          # SECTION_MODEL_MAP + NVIDIA/OpenRouter model IDs
│   │   └── fallback-config.ts       # AGENT_FALLBACK_CHAINS — 3-tier fallback per agent
│
│   ├── providers/
│   │   ├── nvidia.ts                # NVIDIA NIM API client (complete + stream + retry)
│   │   ├── openrouter.ts            # OpenRouter API client (complete + stream + retry + 429 rotation)
│   │   ├── index.ts                 # generateAIResponse — unified provider dispatch
│   │   ├── fallback-executor.ts     # executeWithFallback — 3-tier sequential fallback
│   │   └── sonar.ts                 # EMPTY STUB — Perplexity removed
│
│   └── debug/
│       └── api-test.ts              # Connection test for NVIDIA + OpenRouter
│
├── components/
│   ├── search/
│   │   ├── search-input.tsx         # Textarea + file upload + drag-drop
│   │   ├── search-controls.tsx      # Workflow mode + model selector + agent settings
│   │   ├── model-selector.tsx       # Model selection dropdown
│   │   ├── quick-search-modal.tsx   # Quick search modal
│   │   └── citation-graph-modal.tsx # Citation visualization
│   ├── response/
│   │   ├── response-area.tsx        # Renders ResponseSection[] with markdown
│   │   ├── source-card.tsx          # Individual source card
│   │   ├── source-modal.tsx         # Source detail modal
│   │   └── sources-section.tsx      # Sources list
│   ├── agents/
│   │   ├── agent-status-panel.tsx   # Real-time agent status display
│   │   ├── agent-settings-modal.tsx # Enable/disable agents
│   │   └── thinking-panel.tsx       # AI thinking steps display
│   ├── export/
│   │   └── export-buttons.tsx       # MD/PDF/TXT export buttons
│   ├── layout/
│   │   └── sidebar.tsx              # History sidebar + navigation
│   ├── profile/
│   │   └── profile-modal.tsx        # User profile modal
│   └── ui/                          # shadcn/ui components
│       ├── button.tsx, collapsible.tsx, dialog.tsx, dropdown-menu.tsx
│
├── hooks/
│   ├── use-cache.ts                 # localStorage cache + history (30min TTL)
│   ├── use-debounce.ts              # Debounce hook
│   └── use-mobile.ts                # Mobile detection
│
├── lib/
│   ├── utils.ts                     # cn() — clsx + tailwind-merge
│   ├── export-pdf.ts                # jsPDF report export
│   └── export/
│       └── pdf-exporter.ts          # PDF export utility
│
├── .env                             # Contains NVIDIA_API_KEY + OPENROUTER_API_KEY
├── package.json                     # Next.js 16, React 19, framer-motion, etc.
├── tsconfig.json                    # ES2017 target, bundler resolution
├── components.json                  # shadcn/ui config (base-nova)
├── AGENTS.md                        # Agent fleet manifest
├── CLAUDE.md                        # Development rules
└── README.md                        # Project documentation
```

---

## 3. ENVIRONMENT & API KEYS

```env
# .env (REQUIRED)
NVIDIA_API_KEY=nvapi-xxxx          # https://build.nvidia.com
OPENROUTER_API_KEY=sk-or-v1-xxxx   # https://openrouter.ai
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Optional
```

**Two API providers, zero search APIs:**
- **NVIDIA NIM** — Primary LLM provider (billed per token, high quality)
- **OpenRouter** — Fallback LLM provider (many free-tier models)

**No Perplexity, no Google Search, no Bing.** Search is entirely LLM-generated.

---

## 4. MODEL REGISTRY

### NVIDIA NIM Models (Primary)

| Model ID | Type | Context | Use Case |
|----------|------|---------|----------|
| `minimaxai/minimax-m2.7` | fast | 32K | Summary, quick routing |
| `moonshotai/kimi-k2-thinking` | reasoning | 32K | Query intelligence, report, fact-check |
| `abacusai/dracarys-llama-3.1-70b-instruct` | balanced | 32K | Web search, balanced research |
| `mistralai/mistral-large-3-675b-instruct-2512` | balanced | 32K | Query, fact-check |
| `deepseek-ai/deepseek-v3.2` | reasoning | 32K | Financial, technical analysis |
| `z-ai/glm4.7` | balanced | 32K | Market research |
| `qwen/qwen3-coder-480b-a35b-instruct` | coding | 32K | Code generation |
| `nvidia/nemotron-3-super-120b-a12b` | balanced | 32K | Report synthesis, analysis |

### OpenRouter Models (Fallback — Free Tiers)

| Model ID | Type | Context | Use Case |
|----------|------|---------|----------|
| `nvidia/nemotron-3-super-120b-a12b:free` | balanced | 32K | Report fallback |
| `qwen/qwen3-coder:free` | coding | 32K | Coding fallback |
| `meta-llama/llama-3.3-70b-instruct:free` | balanced | 131K | Search, balanced fallback |
| `openai/gpt-oss-120b:free` | reasoning | 32K | Query, analysis fallback |
| `z-ai/glm-4.5-air:free` | fast | 32K | Summary fallback |
| `google/gemma-4-31b-it:free` | fast | 32K | Summary fallback |
| `minimax/minimax-m2.5:free` | fast | 32K | Summary fallback |

---

## 5. TOKEN GOVERNANCE

```typescript
TOKEN_LIMITS = {
  contextWindow: 131072,        // Max input context
  maxResponseTokens: 32768,     // Max output
  agentMaxTokens: 16384,        // Per-agent budget
  reportMaxTokens: 32768,       // Report agent gets max
  wordsToTokenRatio: 1.3,       // Estimation ratio
}
```

---

## 6. COMPLETE DATA FLOW — User Query to Final Report

### Phase 0: Frontend (app/page.tsx)

```
User types query → SearchInput component → handleSubmit()
  │
  ├─ Check localStorage cache (use-cache.ts)
  │   └─ If cached: render immediately with progressive section reveal
  │
  ├─ POST /api/research with body:
  │   {
  │     query: string,
  │     workflowMode: "chat" | "planning" | "research",
  │     mode: "pro" | "deep" | "corpus",
  │     model: string,           // user-selected model ID
  │     stream: true,
  │     files: ParsedFile[],     // uploaded files
  │     conversationHistory: LLMMessage[],
  │     disabledAgents: AgentName[]
  │   }
  │
  └─ Read SSE stream → readStream() processes events:
      ├─ "route_decision" → simple/research badge
      ├─ "workflow_mode"  → mode auto-switch
      ├─ "status"         → progress messages
      ├─ "agent_status"   → per-agent status updates
      ├─ "thinking"       → AI thinking steps
      ├─ "token"          → streaming text chunks
      ├─ "result"         → final ResearchResult
      └─ "done"           → cleanup
```

### Phase 0.5: API Route (app/api/research/route.ts)

```typescript
POST /api/research →
  1. Validate query + API keys
  2. Create SSE stream (TransformStream)
  3. In background (async IIFE):
     a. [DEV ONLY] Run connection tests (api-test.ts)
     b. Call runResearchOrchestrator()
     c. Send "result" SSE event
     d. Close stream
  4. Return Response with SSE headers
```

**SSE Event Mapping (route.ts):**
```
Backend type field → SSE event name:
  "agent_update"     → "agent_status"
  "plan_ready"       → "status"
  "models_assigned"  → "status"
  "phase_complete"   → "status"
  "complete"         → "done"
  "error"            → "error"
  "result"           → "result"
  (anything else)    → "status"
```

### Phase 1: INITIALIZATION (Sequential) — orchestrator.ts

```
runResearchOrchestrator(input)
  │
  ├─ Step 1: Cache Check
  │   └─ Hash(query + mode) → check cache (currently returns null — mock)
  │
  ├─ Step 2: Memory Fetch
  │   └─ buildMemoryContext(userId) → "User prefers concise technical summaries."
  │
  ├─ Step 3: Query Intelligence Agent (query-intelligence-agent.ts)
  │   ├─ Input: userQuery + researchMode + userMemory
  │   ├─ Model: Mistral Large 3 (NVIDIA) → GPT-OSS 120B (OpenRouter fallback)
  │   ├─ Output: ResearchPlan {
  │   │     queryId, originalQuery, researchType,
  │   │     reportTitle, estimatedPages,
  │   │     fixedSections[3],        // Overview, Key Insights, Conclusion
  │   │     dynamicSections[6-8],    // Each with searchQueries[3]
  │   │     globalSearchContext,
  │   │     totalAgentsNeeded
  │   │   }
  │   └─ On failure: builds fallback plan with 3 generic sections
  │
  └─ Step 4: Model Selection (model-selector-agent.ts)
      ├─ For each dynamicSection:
      │   ├─ Classify section → SectionTaskType (regex on agentRole+focusArea)
      │   ├─ Look up model from SECTION_MODEL_MAP
      │   ├─ Apply query override rules (code/finance/compare/explain)
      │   └─ Check NVIDIA health → swap to fallback if down
      └─ Output: AgentModelAssignment[] per section
```

### Phase 2: PARALLEL RESEARCH (All agents simultaneous)

```
For each dynamicSection (staggered by 200ms):
  │
  └─ runSectionAgent(config) — section-research-agent.ts
      │
      ├─ Step 1: Web Search (search-router.ts)
      │   ├─ searchWithFallback(options, apiKeys)
      │   │   ├─ PRIMARY: NVIDIA NIM
      │   │   │   └─ searchViaNvidia() — uses Dracarys Llama 3.1 70B
      │   │   │       └─ LLM generates structured JSON search results
      │   │   │           [{title, url, snippet, domain, relevanceScore}]
      │   │   │
      │   │   └─ FALLBACK: OpenRouter
      │   │       └─ searchViaOpenRouter() — uses Llama 3.3 70B Free
      │   │           └─ Same LLM-generated search results
      │   │
      │   └─ IMPORTANT: URLs are LLM-hallucinated, NOT real web results
      │
      ├─ Step 2: Context Building
      │   └─ buildSearchContext(sources) → formatted string
      │
      ├─ Step 3: Section Synthesis
      │   ├─ System prompt defines agent role + output format
      │   ├─ executeWithFallback(agentType, params) — fallback-executor.ts
      │   │   ├─ Tier 1: NVIDIA primary model
      │   │   ├─ Tier 2: NVIDIA alternate model (on failure)
      │   │   └─ Tier 3: OpenRouter free model (on failure)
      │   └─ Output: JSON {content, keyFindings, dataPoints, sourcesUsed, confidenceScore}
      │
      └─ Step 4: Parse & Normalize
          └─ safeParseJSON() → extract structured data from LLM response
```

### Phase 3: REPORT SYNTHESIS (Sequential)

```
runReportSynthesisAgent(input) — report-synthesis-agent.ts
  │
  ├─ Sort sections by plan order
  ├─ Deduplicate sources by URL
  ├─ Build synthesis prompt with all section content
  │
  ├─ Call Nemotron 3 Super 120B (NVIDIA) — primary
  │   └─ Fallback: Nemotron 3 Super 120B Free (OpenRouter)
  │
  ├─ Parse JSON response → FinalReport {
  │     reportId, title, subtitle, generatedAt,
  │     estimatedReadTime, totalWords, totalPages,
  │     sections: {
  │       executiveSummary,    // 350-400 words
  │       dynamic[],           // Per-section content
  │       crossSectionAnalysis,// 300-400 words
  │       keyFindings[],       // Bullet points
  │       conclusions,         // 400-500 words
  │       confidenceAssessment
  │     },
  │     sources[],
  │     metadata: { totalAgentsUsed, successfulAgents, failedAgents, ... }
  │   }
  │
  └─ On failure: build report from raw sections (deterministic fallback)
```

### Phase 4: Response Assembly

```
orchestrator.ts returns ResearchResult:
  {
    overview, keyInsights, details, comparison,
    expertInsights, conclusion,
    sources, references,
    metadata: { model, provider, tokensUsed, durationMs, ... }
  }

API route sends as SSE "result" event

Frontend:
  ├─ toResponseSections(result) → ResponseSection[]
  │   ├─ {type: "heading", content: "Overview"}
  │   ├─ {type: "paragraph", content: overview}
  │   ├─ {type: "heading", content: "Key Insights"}
  │   ├─ {type: "bullets", items: keyInsights}
  │   ├─ ... (Analysis, Comparison, Code, Expert Insights, Conclusion, Fact Check, Sources)
  │
  ├─ Progressive reveal (150ms delay per section)
  ├─ Cache result in localStorage (30min TTL)
  └─ Add to history
```

---

## 7. AGENT FLEET — DETAILED

### 7.1 Query Intelligence Agent
- **File**: `lib/engine/agents/query-intelligence-agent.ts`
- **Model**: Mistral Large 3 (NVIDIA) → GPT-OSS 120B (OpenRouter)
- **Role**: Senior Research Director
- **Input**: Raw user query + research mode
- **Output**: `ResearchPlan` with 6-8 dynamic sections, each with 3 search queries
- **Retry**: On parse failure, retries with temperature 0.2

### 7.2 Model Selector Agent
- **File**: `lib/engine/agents/model-selector-agent.ts`
- **No LLM call** — pure regex + lookup logic
- **Classifies** each section's agentRole into a `SectionTaskType`
- **Maps** task type to model assignment from `SECTION_MODEL_MAP`
- **Health check**: Pings NVIDIA `/models` endpoint; swaps to fallback if down

### 7.3 Section Research Agent (The Workhorse)
- **File**: `lib/engine/agents/section-research-agent.ts`
- **This is the main agent** — runs per-section in parallel
- **Steps**:
  1. Execute search queries in parallel (LLM-generated results)
  2. Build search context string
  3. Call synthesis model (with 3-tier fallback)
  4. Parse JSON output into `SectionResult`
- **Timeout**: 150 seconds per agent
- **Output**: Section content (600-900 words), key findings, data points, confidence score

### 7.4 Report Synthesis Agent
- **File**: `lib/engine/agents/report-synthesis-agent.ts`
- **Model**: Nemotron 3 Super 120B (NVIDIA) → Free (OpenRouter)
- **Role**: Senior Research Editor
- **Input**: All section results + plan + query
- **Output**: FinalReport with executive summary, dynamic sections, cross-analysis, conclusions

### 7.5 Legacy Agents (Not used in main orchestrator flow)

These agents exist but are called by the legacy `report-agent.ts` flow, not the current orchestrator:

- **Analysis Agent** (`analysis-agent.ts`): 2-stage deep analysis. Nemotron 3 Super.
- **Coding Agent** (`coding-agent.ts`): Only activated when intent="coding". Qwen 3 Coder 480B.
- **Fact-Check Agent** (`fact-check-agent.ts`): 2-stage verification. Kimi K2 Thinking.
- **Summary Agent** (`summary-agent.ts`): 2-stage executive summary. MiniMax M2.7.
- **Report Agent** (`report-agent.ts`): 4-stage synthesis. Kimi K2 Thinking. Legacy — not used by orchestrator.

---

## 8. FALLBACK SYSTEM — 3-TIER

Each agent type has a 3-tier fallback chain defined in `config/fallback-config.ts`:

```
Tier 1: NVIDIA NIM (primary model)
  on failure (429, 500, 502, 503, 504, network error) ↓
Tier 2: NVIDIA NIM (alternate model)
  on failure ↓
Tier 3: OpenRouter (free model)
  on failure ↓
Return empty result (never crash)
```

**Retryable errors**: 429 (rate limit), 500, 502, 503, 504, network errors
**Fatal errors**: 400 (bad request) — but 401 still tries next tier

**Fallback executor** (`providers/fallback-executor.ts`):
- Sequential tier execution
- 500ms delay between Tier 1→2, 1000ms between Tier 2→3
- On all tiers failing: returns empty content (never throws)

### Fallback Chains per Agent Type:

| Agent Type | Tier 1 (NVIDIA) | Tier 2 (NVIDIA) | Tier 3 (OpenRouter) |
|-----------|-----------------|-----------------|---------------------|
| queryIntelligence | Mistral Large 3 | Nemotron 3 Super | GPT-OSS 120B Free |
| webSearch | Dracarys 70B | GLM 4.7 | GLM 4.5 Air Free |
| financialAnalysis | DeepSeek V3.2 | Kimi K2 Thinking | GPT-OSS 120B Free |
| riskAnalysis | Kimi K2 Thinking | DeepSeek V3.2 | GPT-OSS 120B Free |
| marketResearch | GLM 4.7 | Mistral Large 3 | Nemotron Free |
| technicalAnalysis | DeepSeek V3.2 | Nemotron 3 Super | GPT-OSS 120B Free |
| codeGeneration | Qwen 3 Coder 480B | DeepSeek V3.2 | Qwen 3 Coder Free |
| factChecking | Kimi K2 Thinking | Mistral Large 3 | GPT-OSS 120B Free |
| summarization | MiniMax M2.7 | GLM 4.7 | GLM 4.5 Air Free |
| reportSynthesis | Nemotron 3 Super | Mistral Large 3 | Nemotron Free |
| balancedResearch | Dracarys 70B | Nemotron 3 Super | Llama 3.3 70B Free |

---

## 9. SEARCH SYSTEM — CRITICAL DETAIL

**IMPORTANT**: The search system does NOT use real web search APIs. It uses LLMs to GENERATE search results.

### How search works:

1. `search-router.ts` sends a prompt to an LLM:
   ```
   "You are a research source generator. Produce N highly relevant search result entries.
   Return JSON array: [{title, url, snippet, domain}]"
   ```

2. The LLM generates **synthetic search results** — URLs are hallucinated
3. These are parsed into `SearchResult[]` objects
4. Downstream agents use these as "sources"

### Search flow:
```
searchWithFallback(options, apiKeys)
  ├─ PRIMARY: NVIDIA (Dracarys Llama 3.1 70B)
  │   └─ nvidiaComplete() → parseGeneratedResults()
  │
  └─ FALLBACK: OpenRouter (Llama 3.3 70B Free)
      └─ openrouterComplete() → parseGeneratedResults()
```

### Search modes:
- **pro**: Professional sources — docs, reports, news
- **deep**: Academic papers — arxiv, scholar, nature
- **corpus**: Scientific literature — pubmed, jstor, springer

---

## 10. QUERY ROUTING (Simple vs Research)

`query-router.ts` classifies queries into two categories:

### Heuristic fast-path (no API call):
- **Simple**: greetings, thanks, "what is X?", short questions < 30 chars
- **Research**: "report", "analysis", "compare", "research", "code", "how does X work"

### AI classifier (for uncertain cases):
- Uses OpenRouter (Llama 3.3 70B Free) → NVIDIA (MiniMax M2.7) fallback
- Returns `{complexity, reason, confidence}`
- Default fallback: "research" (safe default)

---

## 11. WORKFLOW MODES

The app has three workflow modes:

### Chat Mode
- Simple conversational responses
- No multi-agent research
- Direct LLM response

### Planning Mode (`planning-workflow.ts`)
- Interactive research planning
- LLM asks clarifying questions
- Builds structured research plan
- User says "start"/"go" → transitions to Research mode
- Uses Kimi K2 Thinking (NVIDIA) → GPT-OSS 120B (OpenRouter)

### Research Mode (Default)
- Full multi-agent pipeline
- 3-phase orchestrator execution
- Parallel agent research
- Structured report output

---

## 12. FILE PARSING

`file-parser.ts` supports:

| Extension | Parser | Library |
|-----------|--------|---------|
| `.pdf` | PDF text extraction | `pdfjs-dist` |
| `.doc`, `.docx` | Word text extraction | `mammoth` |
| `.csv` | CSV parsing | `papaparse` |
| `.txt`, `.md`, `.json` | Plain text | Native `File.text()` |
| `.png`, `.jpg`, `.jpeg` | OCR | `tesseract.js` |

Files are parsed client-side and sent as `FileContext[]` to the API.

---

## 13. CACHING & HISTORY

### Client-side (`hooks/use-cache.ts`):
- **Cache**: localStorage with 30-minute TTL
- **Key**: `hash(query + workflowMode + mode + model)`
- **History**: Up to 50 entries, deduped by query
- **History entry**: `{id, query, workflowMode, mode, timestamp, model}`

### Server-side (orchestrator.ts — MOCK):
- `getCachedResponse()` — always returns null (not implemented)
- `setCachedResponse()` — no-op
- `saveReport()` — no-op
- `buildMemoryContext()` — returns static string

---

## 14. EXPORT SYSTEM

### Markdown Export (`response-normalizer.ts`):
- `toExportMarkdown(result)` → full markdown with sections, sources, agent trace

### PDF Export (`lib/export-pdf.ts`):
- Uses `jsPDF`
- A4 portrait, 20mm margins
- Header with dark background
- Sections: Overview, Key Insights, Analysis, Comparison, Conclusion, Sources
- Footer with page numbers

### Text Export:
- Strips markdown formatting
- Plain text version

---

## 15. FRONTEND STATE MANAGEMENT

**All state lives in `app/page.tsx`** — no external state library (968 lines).

### Key state:
```typescript
// UI State
sidebarOpen, sidebarView, history

// Search State
query, workflowMode, mode, selectedModel, disabledAgents

// Chat State
messages: ChatMessage[]  // Array of user + assistant messages
abortRef                 // AbortController for fetch
revealTimersRef          // Progressive section reveal timers
```

### ChatMessage structure:
```typescript
{
  id, role, timestamp,
  query?, files?,                    // User message
  sections: ResponseSection[],       // Assistant message
  sources: ResearchSource[],
  fullResult: ResearchResult | null,
  streamingText: string,
  routeComplexity: "simple" | "research",
  agentStatuses: Record<AgentName, AgentState>,
  showAgentPanel, statusMessage,
  isStreaming, isLoading, error,
  thinkingSteps: ThinkingStep[],
  showThinking
}
```

---

## 16. SSE STREAMING PROTOCOL

### Backend to Frontend events:

| Event | Data | Description |
|-------|------|-------------|
| `route_decision` | `{complexity, reason}` | Simple vs Research |
| `workflow_mode` | `{mode, autoSwitched, reason}` | Mode change |
| `status` | `{phase, message/status}` | Progress updates |
| `agent_status` | `{agent, status, model, provider, durationMs, isFallback}` | Per-agent updates |
| `thinking` | `{id, phase, agent, text, timestamp}` | AI thinking steps |
| `token` | `{text}` | Streaming text chunks |
| `result` | `ResearchResult` | Final report |
| `done` | `{}` | Stream complete |
| `error` | `{message}` | Error occurred |

### Frontend SSE reader (`readStream` in page.tsx):
- Parses `event:` and `data:` lines
- Routes to appropriate callback
- Handles fallback for old format (no event prefix)

---

## 17. KNOWN ISSUES & ARCHITECTURAL NOTES

### Critical:
1. **Search is LLM-generated**: URLs are hallucinated, not real web results
2. **Server cache is mocked**: `getCachedResponse()` always returns null
3. **Memory is mocked**: `buildMemoryContext()` returns static string
4. **Save is mocked**: `saveReport()` is no-op
5. **Dual orchestrators**: `orchestrator.ts` (main) and `report-agent.ts` (legacy) exist
6. **SSE event mapping mismatch**: Backend sends `type` field, route.ts maps to event names

### Architectural:
7. **All state in page.tsx**: No state management library, 968 lines
8. **Progressive reveal**: Sections appear with 150ms stagger for visual effect
9. **3-tier fallback**: NVIDIA primary → NVIDIA alternate → OpenRouter free
10. **Token budgets**: High=16384, Medium=12288, Low=8192 per section
11. **Agent timeout**: 150s per section, graceful degradation on timeout
12. **OpenRouter 429 rotation**: On rate limit, cycles through 5 free models

---

## 18. KEY FUNCTION SIGNATURES (For AI Tools)

### Orchestrator
```typescript
runResearchOrchestrator(input: OrchestratorInput): Promise<ResearchResult>
```

### Providers
```typescript
generateAIResponse(args: GenerateAIResponseArgs): Promise<LLMResponse>
nvidiaComplete(apiKey: string, options: LLMRequestOptions): Promise<LLMResponse>
openrouterComplete(apiKey: string, options: LLMRequestOptions): Promise<LLMResponse>
executeWithFallback(agentType: string, params: AICallParams): Promise<AICallResult>
```

### Agents
```typescript
runQueryIntelligenceAgent(query, mode, apiKeys, input?): Promise<AgentResult & {plan, enhanced_query, subtopics, search_terms}>
selectModelsForPlan(plan, query, nvidiaApiKey?): Promise<AgentModelAssignment[]>
runSectionAgent(config: SectionAgentConfig): Promise<SectionResult>
runReportSynthesisAgent(input: ReportSynthesisInput): Promise<FinalReport>
```

### Search
```typescript
searchWithFallback(options: SearchOptions, apiKeys: ApiKeys): Promise<{results: SearchResult[], provider: "nvidia"|"openrouter"}>
```

### Context
```typescript
buildContext(searchResults, files, tokenLimit, query): BuiltContext
```

### Query Processing
```typescript
classifyQuery(query, apiKeys): Promise<QueryRouterResult>
enhanceQuery(query, mode): EnhancedQuery
```

---

## 19. COMPONENT ARCHITECTURE

### Page Layout (app/page.tsx)
```
<div className="flex h-full">
  <Sidebar />                    <!-- History + navigation -->
  <main>
    <div streak-container />     <!-- Background decoration -->
    <MobileMenuButton />         <!-- Mobile hamburger -->
    <div scroll-container>       <!-- Chat messages -->
      {messages.map(ChatMessageBubble)}
    </div>
    <div bottom-bar>             <!-- Floating search bar -->
      <SearchInput />            <!-- Textarea + file upload -->
      <SearchControls />         <!-- Mode + model + agents -->
    </div>
  </main>
</div>
```

### ChatMessageBubble renders:
- **User messages**: Query text + file attachments
- **Assistant messages**:
  - RoutingBadge (simple/research)
  - AgentStatusPanel (during loading)
  - ThinkingPanel (AI thinking steps)
  - StatusMessage (progress text)
  - StreamingText (raw streaming)
  - ResponseArea (structured sections)
  - MetadataBar (model, duration, intent)
  - SourcesSection (source cards)
  - ExportButtons (MD/PDF/TXT)

---

## 20. CSS & STYLING

- **Tailwind CSS 4** with CSS variables
- **Glassmorphism**: `glass-card`, `glass`, `glass-strong` classes
- **Animations**: framer-motion for all transitions
- **Fonts**: Inter (body), Playfair Display (headings), Geist Mono (code)
- **Dark theme**: Default with CSS variables
- **Custom effects**: `streak-container`, `gold-glow`, `border-shine`, `text-gradient`

---

## 21. DEPENDENCIES

### Core:
- `next` 16.2.4 — Framework
- `react` 19.2.4 — UI library
- `framer-motion` 12.38 — Animations

### AI/LLM:
- No AI SDK — raw `fetch()` to NVIDIA NIM and OpenRouter APIs

### File Processing:
- `pdfjs-dist` 5.6 — PDF parsing
- `mammoth` 1.12 — DOCX parsing
- `papaparse` 5.5 — CSV parsing
- `tesseract.js` 7.0 — OCR

### UI:
- `shadcn` 4.2 — Component library
- `lucide-react` 1.8 — Icons
- `react-markdown` 10.1 — Markdown rendering
- `remark-gfm` 4.0 — GitHub Flavored Markdown

### Export:
- `jspdf` 4.2 — PDF generation
- `jspdf-autotable` 5.0 — PDF tables
- `html-to-image` 1.11 — Screenshot export

---

## 22. DEVELOPMENT COMMANDS

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 23. QUICK REFERENCE FOR AI TOOLS

### When modifying agents:
- Edit files in `lib/engine/agents/`
- Each agent returns `AgentResult` with `{agent, output, model_used, provider, durationMs, isFallback, error}`
- Use `safeParseJSON()` for LLM response parsing
- Use `callWithFallback()` or `executeWithFallback()` for model calls

### When modifying search:
- `lib/engine/search-router.ts` — search logic
- `lib/engine/context-builder.ts` — context assembly
- Search is LLM-generated, not real web search

### When modifying the orchestrator:
- `lib/engine/orchestrator.ts` — main 3-phase flow
- Phase 1: Query Intelligence + Model Selection (sequential)
- Phase 2: Section Research (parallel, staggered)
- Phase 3: Report Synthesis (sequential)

### When modifying the UI:
- `app/page.tsx` — all state + main layout
- `components/response/response-area.tsx` — report rendering
- `components/search/search-input.tsx` — input component
- `components/agents/agent-status-panel.tsx` — agent status display

### When adding a new model:
1. Add to `MODEL_REGISTRY` in `lib/engine/config.ts`
2. Add to `NVIDIA_MODELS` or `OPENROUTER_MODELS` in `config/model-config.ts`
3. Update `SECTION_MODEL_MAP` for the relevant section type
4. Update `AGENT_FALLBACK_CHAINS` in `config/fallback-config.ts`

### When adding a new agent:
1. Create file in `lib/engine/agents/`
2. Import in `orchestrator.ts`
3. Add to `AgentName` type in `types.ts`
4. Add to `ALL_AGENTS` in `page.tsx`
5. Update `AGENT_FALLBACK_CHAINS` in `config/fallback-config.ts`

---

*This document captures the complete application architecture, data flow, and implementation details as of the current codebase state.*
