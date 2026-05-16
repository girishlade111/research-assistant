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

---

## SECTION A: COMPLETE TYPE DEFINITIONS (from `lib/engine/types.ts`)

### A.1 Intent & Mode Types (lines 1-12)

```typescript
export type SearchMode = "pro" | "deep" | "corpus";
export type WorkflowMode = "chat" | "planning" | "research";

export type IntentType =
  | "coding"
  | "research"
  | "comparison"
  | "explanation"
  | "factual"
  | "general";
```

- `SearchMode` — Controls search depth: `pro` for professional sources, `deep` for academic, `corpus` for scientific literature
- `WorkflowMode` — Three UI modes: `chat` for simple conversation, `planning` for interactive research planning, `research` for full multi-agent pipeline
- `IntentType` — Classifies the user's intent for routing to appropriate agents

### A.2 Provider Types (lines 14-18)

```typescript
export type ModelProvider = "nvidia" | "openrouter";
export type SearchProvider = "nvidia" | "openrouter";
```

- `ModelProvider` — The two LLM API providers (NVIDIA NIM is primary, OpenRouter is fallback)
- `SearchProvider` — Same two providers for search (search is LLM-generated, not real web search)

### A.3 Task Types (lines 20-31)

```typescript
export type TaskType =
  | "search"
  | "query"
  | "analysis"
  | "coding"
  | "summary"
  | "fact-check"
  | "report"
  | "default";
```

- Used by `model-router.ts` to select the appropriate model for each task category

### A.4 Agent Names (lines 33-43)

```typescript
export type AgentName =
  | "web-search-agent"
  | "query-intelligence-agent"
  | "analysis-agent"
  | "coding-agent"
  | "summary-agent"
  | "fact-check-agent"
  | "report-agent";

export type AgentStatus = "pending" | "running" | "done" | "failed" | "skipped";
```

- `AgentName` — Identifies each agent in the fleet. Used for SSE events, UI status tracking, and agent configuration
- `AgentStatus` — Lifecycle states for each agent during execution

### A.5 Agent Context (lines 46-56)

```typescript
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
```

- Shared input structure passed to all legacy agents (not used by the new orchestrator section agents)
- `enhanced_query` — Expanded query from Query Intelligence Agent
- `subtopics` — Research dimensions identified by the planning stage
- `search_terms` — Optimized search terms for the search router

### A.6 Agent Result (lines 60-69)

```typescript
export interface AgentResult {
  agent: AgentName;
  output: Record<string, any>;
  model_used: string;
  provider: string;
  durationMs: number;
  isFallback: boolean;
  error?: string;
}
```

- Universal return type for all legacy agents
- `output` — Arbitrary JSON payload specific to each agent
- `isFallback` — True if the fallback model was used instead of primary

### A.7 Agent Status Event (SSE) (lines 73-81)

```typescript
export interface AgentStatusEvent {
  agent: AgentName;
  status: AgentStatus;
  model?: string;
  provider?: string;
  durationMs?: number;
  isFallback?: boolean;
  error?: string;
}
```

- Sent via SSE from backend to frontend for real-time agent status updates

### A.8 Query Enhancement (lines 85-90)

```typescript
export interface EnhancedQuery {
  original: string;
  enhanced: string;
  intent: IntentType;
  subtopics: string[];
}
```

- Output of the query enhancement stage (used by legacy flow)

### A.9 Research Plan (lines 94-138)

```typescript
export type ResearchType =
  | "financial" | "technical" | "scientific"
  | "news" | "comparative" | "general";

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
```

- `ResearchPlan` — The complete output of the Query Intelligence Agent. Contains 3 fixed sections (Overview, Key Insights, Conclusion) and 6-8 dynamic sections
- `DynamicSection` — Each dynamic section gets its own research agent with 3 search queries
- `SectionPriority` — Controls token budget: high=16384, medium=12288, low=8192

### A.10 Model Selector Types (lines 142-164)

```typescript
export type SectionTaskType =
  | "web_search" | "deep_reasoning" | "code_generation"
  | "fast_summary" | "financial_analysis" | "report_compilation"
  | "fact_checking" | "balanced_research";

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
```

- `SectionTaskType` — Classified from section's agentRole/focusArea via regex patterns in `model-selector-agent.ts`
- `AgentModelAssignment` — Per-section model assignment with primary + fallback and token budget

### A.11 Section Research Types (lines 168-221)

```typescript
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
  researchMode?: "fast" | "deep";
  files?: FileContext[];
  conversationHistory?: LLMMessage[];
  onProgress?: (event: SectionProgressEvent) => void;
}
```

- `SectionResult` — Complete output of a section research agent, including content, findings, data points, and metadata
- `SectionAgentConfig` — Full configuration for running a section agent, including model assignment, search results, and progress callback

### A.12 Search Types (lines 225-240)

```typescript
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
```

- `SearchResult` — Individual search result. Note: URLs are LLM-hallucinated, not real web results
- `relevanceScore` — Assigned during generation (1 - index * 0.08)

### A.13 File Types (lines 244-248)

```typescript
export interface FileContext {
  fileName: string;
  fileType: string;
  content: string;
}
```

- Parsed file content sent from client to API. Content is extracted client-side by `file-parser.ts`

### A.14 Model Routing Types (lines 252-264)

```typescript
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
```

- `ResolvedModel` — A fully resolved model with all metadata from the MODEL_REGISTRY
- `ModelFallbackChain` — Primary model + ordered fallback list

### A.15 LLM Response Types (lines 268-299)

```typescript
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
```

- `LLMResponse` — Standard response from all providers (NVIDIA and OpenRouter)
- `LLMRequestOptions` — Input options for provider calls. `jsonMode` adds `response_format: { type: "json_object" }`

### A.16 Context Types (lines 303-308)

```typescript
export interface BuiltContext {
  text: string;
  sourceCount: number;
  estimatedTokens: number;
  sources: SearchResult[];
}
```

- Output of `buildContext()` in `context-builder.ts`. Contains formatted context text with file content and web results

### A.17 Response Types (lines 312-345)

```typescript
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

- `ResearchResult` — The final output structure returned by the orchestrator and sent to the frontend
- `metadata.agentTrace` — Array of all agent status events for the Agent Status Panel

### A.18 Orchestrator Types (lines 349-407)

```typescript
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

export interface ThinkingStep {
  id: string;
  phase: string;
  agent?: AgentName;
  text: string;
  timestamp: number;
}

export type ThinkingCallback = (step: ThinkingStep) => void;

export interface OrchestratorProgressEvent {
  phase: 1 | 2 | 3;
  type?: "status" | "plan_ready" | "models_assigned" | "agent_update" | "phase_complete" | "complete" | "error";
  percent: number;
  status: string;
  sectionId?: string;
  agentRole?: string;
  completedSections?: string[];
  failedSections?: number;
  error?: string;
  [key: string]: unknown;
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
```

- `OrchestratorInput` — Complete input to `runResearchOrchestrator()`. Contains all user context, API keys, and callback hooks
- `OrchestratorProgressEvent` — Progress events sent via `onProgress` callback, which the API route maps to SSE events

### A.19 API Route Types (lines 411-427)

```typescript
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
```

- `ResearchRequest` — POST body to `/api/research`
- `ResearchApiResponse` — JSON response for non-streaming requests

### A.20 API Key Types (lines 430-433)

```typescript
export interface ApiKeys {
  nvidiaKey?: string;
  openrouterKey?: string;
}
```

- Optional keys — system gracefully degrades if one is missing

### A.21 UI Types (lines 437-478)

```typescript
export interface ResponseSection {
  type: "heading" | "paragraph" | "bullets" | "code" | "fact_check";
  content: string;
  items?: string[];
  language?: string;
}

export interface ChatMessage {
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

export type AgentState = {
  status: AgentStatus;
  model?: string;
  provider?: string;
  durationMs?: number;
  isFallback?: boolean;
  error?: string;
};
```

- `ResponseSection` — UI-renderable section. `toResponseSections()` converts `ResearchResult` into `ResponseSection[]`
- `ChatMessage` — Complete state for a single message in the chat UI. Both user and assistant messages use this type

### A.22 Report Synthesis Types (lines 482-511)

```typescript
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
```

- `FinalReport` — Output of the Report Synthesis Agent. Contains all sections, sources, and metadata
- `ReportSections.dynamic` — Array of section content ordered by the research plan

---

## SECTION B: COMPLETE PROMPT TEMPLATES

### B.1 Query Intelligence Agent Prompt (`query-intelligence-agent.ts` lines 11-68)

```
You are a Senior Research Director and Query Intelligence Specialist.
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
- estimatedPages: Based on dynamicSections count — each high=1.5 pages, medium=1 page, low=0.5 pages, plus 2 pages for fixed sections
```

### B.2 Section Research Agent Prompt Builder (`section-research-agent.ts` lines 30-71)

```typescript
function buildSystemPrompt(section: DynamicSection, originalQuery: string): string {
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
```

### B.3 Report Synthesis Agent Prompt (`report-synthesis-agent.ts` lines 22-91)

```
You are a Senior Research Editor and Report Compiler at a top-tier
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
    "executiveSummary": "## Executive Summary\n\n...",
    "dynamic": [
      { "id": "section_1", "title": "...", "content": "...", "order": 1 }
    ],
    "crossSectionAnalysis": "## Cross-Section Analysis\n\n...",
    "keyFindings": ["finding 1", "finding 2"],
    "conclusions": "## Conclusions & Recommendations\n\n...",
    "confidenceAssessment": "## Data Confidence Assessment\n\n..."
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
}
```

### B.4 Analysis Agent Prompts (`analysis-agent.ts`)

**Stage 1 — Foundation & Technical:**
```
You are the Deep Analysis Agent. Your job is to perform rigorous, multi-dimensional research analysis.

You receive web search results, file context, and an enhanced query. Your job is to perform DEEP ANALYSIS — not summarization. Synthesize across sources, identify patterns, evaluate evidence quality, and provide original insights.

WORD COUNT TARGET: 1000-1500 words total.

STAGE 1: Foundation & Technical (Target: 600-800 words)

MANDATORY OUTPUT FIELDS:
1. "analysis_part_1": MINIMUM 600 words. Must contain:
   - ### Foundational Context & Landscape Overview
   - ### Technical & Mechanistic Deep Dive

Return ONLY valid JSON:
{
  "analysis_part_1": "string"
}
```

**Stage 2 — Impact & Evaluation:**
```
STAGE 2: Impact & Evaluation (Target: 600-800 words)

MANDATORY OUTPUT FIELDS:
1. "analysis_part_2": MINIMUM 400 words. Must contain:
   - ### Multi-Dimensional Impact Analysis
   - ### Critical Evaluation & Evidence Assessment
   - ### Future Outlook & Strategic Implications

2. "patterns": MINIMUM 5-8 items. Non-obvious connections.
3. "comparison": MINIMUM 300-500 words. Structured comparison.
4. "confidence": "high" | "medium" | "low".
5. "caveats": MINIMUM 5-8 items. Critical risks.

Return ONLY valid JSON:
{
  "analysis_part_2": "string",
  "patterns": ["string", "..."],
  "comparison": "string",
  "confidence": "high|medium|low",
  "caveats": ["string", "..."]
}
```

### B.5 Coding Agent Prompt (`coding-agent.ts` lines 11-97)

```
You are the Coding Agent — a senior software engineer in a multi-agent research pipeline. You are activated ONLY when the user's query involves code generation, debugging, implementation, or algorithm design. Your job is to produce production-quality code with comprehensive technical documentation.

ROLE & RESPONSIBILITY
You produce the "code" section of the final research report. Your code must be complete, runnable, and well-documented.

OUTPUT SPECIFICATION (ALL FIELDS MANDATORY):
1. "language" (string): The primary programming language used.
2. "code" (string, MUST be complete and runnable): Include ALL imports, types, helpers. Handle edge cases.
3. "explanation" (string, MINIMUM 800-1200 words): Architecture Overview, Implementation Walkthrough, Integration Guide, Testing Strategy.
4. "usage_example" (string, MINIMUM 200-400 words): Basic, advanced, error handling examples.
5. "pitfalls" (array, MINIMUM 5-8 items): Format: "**[Category — Title]**: Danger and mitigation"
6. "alternatives" (string, MINIMUM 200-400 words): 2-3 alternative approaches with pros/cons.

Return ONLY valid JSON.
```

### B.6 Fact-Check Agent Prompts (`fact-check-agent.ts`)

**Stage 1 — Claims & Contradictions:**
```
You are the Fact-Check Agent. Your job is to rigorously validate claims, detect contradictions, and assess source reliability.

WORD COUNT TARGET: 800-1200 words total.

STAGE 1: Claims & Contradictions (Target: 400-600 words)

MANDATORY OUTPUT FIELDS:
1. "verified_claims": MINIMUM 8-12 items.
2. "unverified_claims": MINIMUM 3-6 items.
3. "contradictions": MINIMUM 2-4 items.

Return ONLY valid JSON:
{
  "verified_claims": ["string", "..."],
  "unverified_claims": ["string", "..."],
  "contradictions": ["string", "..."]
}
```

**Stage 2 — Summary & Reliability:**
```
STAGE 2: Summary & Reliability (Target: 600-800 words)

MANDATORY OUTPUT FIELDS:
1. "fact_check_summary": MINIMUM 600 words. Must contain:
   - ### Overall Reliability Assessment
   - ### Evidence Strength Analysis
   - ### Source Quality Assessment
   - ### Critical Warnings & Bias Detection
   - ### Recommendations for Readers

2. "warnings": MINIMUM 5-8 items.
3. "reliability_score": number (0-100).
4. "reliability_label": "High" | "Medium-High" | "Medium" | "Medium-Low" | "Low"

Return ONLY valid JSON.
```

### B.7 Summary Agent Prompts (`summary-agent.ts`)

**Stage 1 — Executive Summary & Themes:**
```
You are the Executive Summary Agent. Your job is to distill complex research findings into a comprehensive, well-structured executive briefing.

WORD COUNT TARGET: 800-1200 words total.

STAGE 1: Executive Summary & Themes (Target: 600-800 words)

MANDATORY OUTPUT FIELDS:
1. "overview_part_1": MINIMUM 600 words. Must contain:
   - ### Executive Summary (Bottom line + Urgency + Top findings)
   - ### Key Themes & Thematic Analysis (4-6 major themes with evidence)

Return ONLY valid JSON.
```

**Stage 2 — Strategy, Facts & Actions:**
```
STAGE 2: Strategy, Facts & Actions (Target: 600-800 words)

MANDATORY OUTPUT FIELDS:
1. "overview_part_2": MINIMUM 300 words. Must contain:
   - ### Strategic Implications & Recommendations
   - ### Outlook & Conclusion

2. "key_points": MINIMUM 8-12 items. Substantive findings (2-3 sentences each).
3. "quick_facts": MINIMUM 10-15 items. Specific data/stats.
4. "action_items": MINIMUM 5-8 items. Ranked by priority.

Return ONLY valid JSON.
```

### B.8 Report Agent Prompts (`report-agent.ts`)

**Stage 1 — Overview & Key Insights (1000-1500 words):**
```
You are the Report Synthesis Agent — the FINAL stage of a multi-agent research pipeline. Your mission is to synthesize ALL specialized agent outputs into a massive, publication-quality research report spanning 5-6 full pages.

SYNTHESIS RULES:
1. DO NOT simply concatenate. Cross-reference agents.
2. MAINTAIN A COHESIVE NARRATIVE.
3. USE RICH FORMATTING.
4. WORD COUNT TARGET: 4000-6000 words total across all sections.

STAGE 1: Overview & Key Insights (Target: 1000-1500 words)

MANDATORY OUTPUT FIELDS:
1. "overview": MINIMUM 800-1000 words.
2. "key_insights": MINIMUM 12-18 items.
```

**Stage 2 — Core Analysis Chapters 1-4 (1500-2000 words):**
```
STAGE 2: Core Analysis (Chapters 1-4) (Target: 1500-2000 words)
1. "details_part_1": MINIMUM 1500 words. Chapters: Foundational Context, Technical Deep Dive, Impact Assessment, Evidence Analysis.
```

**Stage 3 — Advanced Analysis Chapters 5-8 (1500-2000 words):**
```
STAGE 3: Advanced Analysis (Chapters 5-8) (Target: 1500-2000 words)
1. "details_part_2": MINIMUM 1500 words. Chapters: Patterns & Trends, Comparative Analysis, Risk Assessment, Future Outlook.
```

**Stage 4 — Synthesis & Conclusion (1000-1500 words):**
```
STAGE 4: Synthesis & Conclusion (Target: 1000-1500 words)
1. "comparison": 400-600 words.
2. "expert_insights": 8-12 items.
3. "conclusion": 400-600 words.
4. "fact_check_summary": 200-400 words.
5. "reliability_score": number (0-100).
```

### B.9 Search Router Prompt (`search-router.ts` lines 62-98)

```
You are a research source generator. Your job is to produce {maxResults} highly relevant, diverse, and authoritative search result entries for the given research query.

MODE: {Academic/In-depth | Scientific Literature | Professional Research}
{mode-specific instructions}

{search terms from upstream agent}

REQUIREMENTS FOR EACH SOURCE:
- "title": A specific, descriptive title
- "url": A realistic, well-formed URL from a real domain
- "snippet": A detailed 2-4 sentence excerpt with SUBSTANTIVE information
- "domain": The domain name only

SOURCE DIVERSITY REQUIREMENTS:
- Include at least 2 different source types
- No more than 2 results from the same domain
- Each snippet should cover a DIFFERENT aspect
- Snippets must contain SPECIFIC information

Return ONLY a valid JSON array of exactly {maxResults} objects.
```

### B.10 Query Router Prompt (`query-router.ts` lines 18-39)

```
You are a query classifier. Classify the user's query into exactly one category:

"simple" — for:
- Casual conversation / greetings
- Very short factual questions answerable in 1-2 sentences
- Questions about basic definitions or simple concepts
- Opinion requests, jokes, or personal questions to an AI
- Quick calculations or unit conversions

"research" — for:
- Requests for comprehensive reports, analysis, or deep dives
- Multi-faceted questions requiring multiple sources
- Technical research, academic topics, or industry analysis
- Comparisons, trend analysis, or market research
- Questions explicitly asking for a "report", "summary", "analysis"
- Coding help, code generation, debugging requests
- Questions about recent events, current data, or statistics

Return ONLY a JSON object: {"complexity":"simple"|"research","reason":"one sentence","confidence":0.0-1.0}
```

### B.11 Planning Mode Prompt (`planning-workflow.ts` lines 11-58)

```
You are **ResAgent Planning Mode** — an expert strategic research planner.

Your role is to collaborate with the user to craft a precise, high-impact research plan before deploying the multi-agent research pipeline.

# PLANNING STRATEGY
1. **Understand the Goal**: Read the user's request carefully. If unclear, ask focused clarifying questions (max 2-3 at a time).
2. **Ask Smart Questions**: Identify gaps in the request. Ask about:
   - Scope: "Should we focus on X or also cover Y?"
   - Depth: "Do you need a high-level overview or deep technical analysis?"
   - Audience: "Is this for a technical audience or general stakeholders?"
   - Constraints: "Any specific sources, timeframes, or perspectives to prioritize?"
3. **Build the Plan Iteratively**: As the user answers, refine the research blueprint.
4. **Propose a Final Plan**: When you have enough clarity, present a structured research plan.

# RESPONSE BEHAVIOR
- If the user's request is **vague or broad**: Ask 2-3 targeted clarifying questions.
- If the user's request is **clear and specific**: Create the research plan directly.
- If the user **provides answers to your questions**: Refine and present the updated plan.
- If the user has **prior conversation context**: Build upon it, don't repeat.
- **Always end with a clear call-to-action**: Ask the user if the plan looks good and if they'd like to proceed.

# PLAN FORMAT (when ready)
### Research Objective
### Research Roadmap
### Methodology & Sources
### Key Assumptions
### Ready to Research?

# RULES
- Do NOT perform actual research — only plan.
- Use clean markdown with headers and bullets.
- Be professional, insightful, and proactive.
- When the plan is complete, always ask if the user wants to start research.
```

### B.12 Planning Transition Prompt (`planning-workflow.ts` lines 61-78)

```
You are a Workflow Orchestrator.

Analyze the latest user message to decide if it's time to trigger the Multi-Agent Research Pipeline.

TRIGGER CRITERIA (decision: "begin_research"):
- Explicit confirmation: "go", "start", "proceed", "begin", "do it", "yes".
- Indirect intent: "looks good", "continue with that", "let's see the report", "analyze this now".
- Casual agreement: "ok", "cool", "alright".
- Transition from planning to action in any language.

STAY CRITERIA (decision: "stay_planning"):
- User asks a question about the plan.
- User adds more constraints or subtopics.
- User is still exploring or brainstorming.
- User says "wait", "not yet", or "hold on".

Return ONLY valid JSON:
{"decision":"begin_research"|"stay_planning","reason":"brief explanation","confidence":0.0-1.0}
```

---

## SECTION C: EXACT FUNCTION IMPLEMENTATIONS (Critical Paths)

### C.1 `runResearchOrchestrator()` — `lib/engine/orchestrator.ts` lines 90-349

```typescript
export async function runResearchOrchestrator(input: OrchestratorInput): Promise<ResearchResult> {
  const orchestratorStart = Date.now();
  const { userQuery, userId, conversationId, researchMode, apiKeys, onProgress, files = [], conversationHistory = [], disabledAgents = [] } = input;

  // ━━━ PHASE 1: INITIALIZATION (Sequential) ━━━
  let plan: ResearchPlan;
  let modelAssignments: Awaited<ReturnType<typeof selectModelsForPlan>>;
  let userMemory: string;
  let queryHash: string;

  try {
    // Step 1: Cache Check (mock — always returns null)
    queryHash = generateHash(userQuery + (researchMode || ""));
    const cachedReport = await getCachedResponse(queryHash);
    if (cachedReport) {
      onProgress({ phase: 3, percent: 100, status: "Returning cached report...", type: "complete" });
      return cachedReport;
    }

    // Step 2: Memory Fetch (mock — returns static string)
    userMemory = await buildMemoryContext(userId);

    // Step 3: Query Intelligence Agent
    onProgress({ phase: 1, percent: 5, status: "Analyzing query and building research plan...", type: "status" });
    const searchMode = researchMode === "deep" ? "deep" : "pro";
    const queryResult = await runQueryIntelligenceAgent(userQuery, searchMode, apiKeys, {
      userQuery, userMemory, researchMode,
    });

    if (queryResult.error || !queryResult.plan) {
      throw new Error(queryResult.error || "Failed to generate research plan");
    }

    plan = queryResult.plan;
    onProgress({ phase: 1, percent: 10, status: "Research plan created", type: "plan_ready" });

    // Step 4: Model Selection
    modelAssignments = await selectModelsForPlan(plan, userQuery, apiKeys.nvidiaKey);
    onProgress({ phase: 1, percent: 15, status: "AI models assigned", type: "models_assigned" });
  } catch (phase1Error) {
    throw phase1Error;
  }

  // ━━━ PHASE 2: PARALLEL RESEARCH (All agents simultaneous) ━━━
  onProgress({ phase: 2, percent: 18, status: "Launching parallel research agents...", type: "status" });
  const totalAgents = plan.dynamicSections.length;
  let completedCount = 0;
  const STAGGER_DELAY_MS = 200;

  const agentPromises = plan.dynamicSections.map((section, index) => {
    const modelAssignment = modelAssignments.find(m => m.sectionId === section.id) || {
      sectionId: section.id, agentRole: section.agentRole,
      primaryModel: { platform: "nvidia", modelId: "abacusai/dracarys-llama-3.1-70b-instruct" },
      fallbackModel: { platform: "openrouter", modelId: "meta-llama/llama-3.3-70b-instruct:free" },
      taskType: "balanced_research", maxTokens: 8000,
    };

    const launchAgent = async (): Promise<SectionResult> => {
      if (index > 0) await new Promise(r => setTimeout(r, index * STAGGER_DELAY_MS));
      return runSectionAgent({
        section, assignedModel: modelAssignment, originalQuery: userQuery,
        globalSearchContext: plan.globalSearchContext, apiKeys, researchMode, files, conversationHistory,
        onProgress: (agentProgress) => {
          if (agentProgress.status === "complete") completedCount++;
          onProgress({ phase: 2, type: "agent_update", sectionId: section.id,
            agentRole: section.agentRole, status: agentProgress.status,
            percent: 15 + Math.round((completedCount / totalAgents) * 55) });
        }
      });
    };
    return withGracefulTimeout(launchAgent(), 150_000, section);
  });

  const results = await Promise.allSettled(agentPromises);
  const allSections = results
    .filter((r): r is PromiseFulfilledResult<SectionResult> => r.status === "fulfilled")
    .map(r => r.value).filter(s => s !== null && s !== undefined);

  const completedSections = allSections.filter(s => s.content && s.content.length > 50 && s.modelUsed !== "none");
  const failedSections = [
    ...allSections.filter(s => !s.content || s.content.length <= 50 || s.modelUsed === "none")
      .map(s => ({ sectionId: s.sectionId, error: s.error ?? "No content produced" })),
    ...results.map((r, i) => r.status === "rejected" ? { sectionId: plan.dynamicSections[i].id, error: String(r.reason) } : null)
      .filter(Boolean) as { sectionId: string; error: string }[],
  ];

  onProgress({ phase: 2, percent: 70,
    status: `Research complete: ${completedSections.length}/${plan.dynamicSections.length} sections`,
    type: "phase_complete", completedSections: completedSections.map(s => s.sectionTitle),
    failedSections: failedSections.length });

  // ━━━ PHASE 3: REPORT SYNTHESIS (Sequential) ━━━
  const sectionsForReport = allSections.length > 0 ? allSections : completedSections;
  onProgress({ phase: 3, percent: 80, status: "Compiling final report..." });

  let finalReport: Awaited<ReturnType<typeof runReportSynthesisAgent>>;
  try {
    finalReport = await runReportSynthesisAgent({
      plan, completedSections: sectionsForReport, failedSections: failedSections.map(f => f.sectionId),
      originalQuery: userQuery, userMemory, apiKeys
    });
  } catch (reportErr) {
    // Deterministic fallback: assemble report from raw sections
    finalReport = {
      reportId: crypto.randomUUID(), title: plan.reportTitle,
      subtitle: "Generated Research Report", generatedAt: new Date().toISOString(),
      originalQuery: userQuery,
      estimatedReadTime: `${Math.ceil(sectionsForReport.reduce((a, s) => a + s.wordCount, 0) / 200)} min`,
      totalWords: sectionsForReport.reduce((a, s) => a + s.wordCount, 0),
      totalPages: Math.ceil(sectionsForReport.reduce((a, s) => a + s.wordCount, 0) / 500),
      sections: {
        executiveSummary: `## Executive Summary\n\nThis report compiles findings from ${sectionsForReport.length} research sections on "${userQuery}".`,
        dynamic: sectionsForReport.map((s, i) => ({ id: s.sectionId, title: s.sectionTitle, content: s.content, order: i + 1 })),
        crossSectionAnalysis: "", keyFindings: sectionsForReport.flatMap(s => s.keyFindings),
        conclusions: `## Conclusions\n\nPlease review individual sections above for detailed findings.`,
        confidenceAssessment: "",
      },
      sources: sectionsForReport.flatMap(s => s.sourcesUsed)
        .filter((src, i, arr) => arr.findIndex(x => x.url === src.url) === i)
        .map((src, i) => ({ id: String(i + 1), title: src.title, snippet: "", url: src.url, domain: "" })),
      metadata: {
        totalAgentsUsed: plan.dynamicSections.length, successfulAgents: completedSections.length,
        failedAgents: failedSections.length,
        totalSourcesAnalyzed: sectionsForReport.flatMap(s => s.sourcesUsed).length,
        modelsUsed: [...new Set(sectionsForReport.map(s => s.modelUsed).filter(m => m !== "none"))],
      },
    };
  }

  // Assemble final ResearchResult
  const totalTokensUsed = allSections.reduce((sum, s) => sum + (s.tokensUsed ?? 0), 0);
  const totalDurationMs = Date.now() - orchestratorStart;

  const researchResult: ResearchResult = {
    overview: finalReport.sections.executiveSummary,
    keyInsights: finalReport.sections.keyFindings,
    details: finalReport.sections.dynamic.map(d => `## ${d.title}\n\n${d.content}`).join("\n\n") + "\n\n" + finalReport.sections.crossSectionAnalysis + "\n\n" + finalReport.sections.confidenceAssessment,
    comparison: "", expertInsights: [], conclusion: finalReport.sections.conclusions,
    sources: finalReport.sources, references: [],
    metadata: {
      model: finalReport.metadata.modelsUsed[0] || "nvidia/nemotron-3-super-120b-a12b",
      provider: "nvidia", searchProvider: "multi", intent: "research",
      tokensUsed: totalTokensUsed, durationMs: totalDurationMs,
    }
  };

  await saveReport(userId, conversationId, researchResult);
  await setCachedResponse(queryHash, researchResult, 3600);
  onProgress({ phase: 3, percent: 100, status: "Report ready!", type: "complete" });
  return researchResult;
}
```

### C.2 `runSectionAgent()` — `lib/engine/agents/section-research-agent.ts` lines 338-505

```typescript
export async function runSectionAgent(config: SectionAgentConfig): Promise<SectionResult> {
  const start = Date.now();
  const { section, assignedModel, originalQuery, apiKeys, researchMode } = config;

  // Fast mode: only use first search query
  const queriesToRun = researchMode === "fast" ? section.searchQueries.slice(0, 1) : section.searchQueries;

  // Step 1: Web Search
  emitProgress(config, { status: "searching" });
  let searchResults: SearchResult[];
  try {
    searchResults = section.requiresWebSearch
      ? await executeSearchQueries(queriesToRun, config.existingSearchResults ?? [], apiKeys)
      : config.existingSearchResults ?? [];
  } catch (searchErr) {
    searchResults = config.existingSearchResults ?? [];
  }

  // Step 2: Context Building
  const searchContext = buildSearchContext(searchResults);

  // Step 3: Section Synthesis via executeWithFallback
  emitProgress(config, { status: "synthesizing", sourcesFound: searchResults.length });
  const systemPrompt = buildSystemPrompt(section, originalQuery);

  let llmResult: { content: string; modelUsed: string; provider: string; isFallback: boolean; tokensUsed: number };
  try {
    const userMessage = `${searchContext}\n\nAnalyze and write your section`;
    const chainKey = mapAgentRoleToChainKey(section.agentRole);
    const result = await executeWithFallback(chainKey, {
      systemPrompt, userMessage, temperature: 0.3,
      maxTokens: config.assignedModel?.maxTokens || 8192
    });

    if (!result.content && result.modelUsed === 'none') throw new Error('All fallback tiers failed');

    llmResult = {
      content: result.content, modelUsed: result.modelUsed,
      provider: result.platform, isFallback: result.isFallback, tokensUsed: result.tokensUsed
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Section synthesis failed";
    emitProgress(config, { status: "failed", error: errMsg });
    return {
      sectionId: section.id, sectionTitle: section.sectionTitle, agentRole: section.agentRole,
      content: `Data limitations: unable to generate content for "${section.sectionTitle}".`,
      keyFindings: [], dataPoints: [],
      sourcesUsed: searchResults.slice(0, 5).map(s => ({ title: s.title, url: s.url, relevance: "low" as const })),
      confidenceScore: 0.1, dataQuality: "limited", wordCount: 0,
      modelUsed: "none", provider: "none", isFallback: false,
      durationMs: Date.now() - start, tokensUsed: 0, error: errMsg,
    };
  }

  // Step 4: Parse & Validate
  const parsed = parseAndNormalize(llmResult.content, section);

  const result: SectionResult = {
    ...parsed, modelUsed: llmResult.modelUsed, provider: llmResult.provider,
    isFallback: llmResult.isFallback, durationMs: Date.now() - start, tokensUsed: llmResult.tokensUsed,
  };

  emitProgress(config, { status: "complete", wordCount: result.wordCount,
    sourcesFound: result.sourcesUsed.length, confidence: result.confidenceScore });

  return result;
}
```

### C.3 `executeWithFallback()` — `lib/engine/providers/fallback-executor.ts` lines 33-142

```typescript
export async function executeWithFallback(
  agentType: keyof typeof AGENT_FALLBACK_CHAINS,
  params: AICallParams
): Promise<AICallResult> {
  const chain = AGENT_FALLBACK_CHAINS[agentType];
  if (!chain) throw new Error(`No fallback chain defined for: ${agentType}`);

  const allTierResults: TierAttempt[] = [];

  for (let tierIndex = 0; tierIndex < chain.tiers.length; tierIndex++) {
    const tier = chain.tiers[tierIndex];
    const tierNumber = tierIndex + 1;
    const startTime = Date.now();

    try {
      const result = await callModelByPlatform(tier, params);
      const latencyMs = Date.now() - startTime;

      allTierResults.push({ tier: tierNumber, platform: tier.platform, modelId: tier.modelId, success: true, latencyMs });

      return {
        content: result.content, modelUsed: tier.modelId, platform: tier.platform,
        tierUsed: tierNumber, isFallback: tierNumber > 1, latencyMs,
        tokensUsed: result.tokensUsed || 0, allTierResults
      };
    } catch (error: unknown) {
      const latencyMs = Date.now() - startTime;
      const err = error as { status?: number; statusCode?: number; message?: string } | null;
      const errorCode = err?.status || err?.statusCode || 0;
      const errorMessage = err?.message || 'Unknown error';

      allTierResults.push({ tier: tierNumber, platform: tier.platform, modelId: tier.modelId,
        success: false, errorCode, errorMessage, latencyMs });

      const isLastTier = tierIndex === chain.tiers.length - 1;
      if (isLastTier) {
        // All tiers failed — return empty result (never throw)
        return {
          content: '', modelUsed: 'none', platform: 'none', tierUsed: 0,
          isFallback: true, latencyMs: Date.now() - startTime, tokensUsed: 0, allTierResults
        };
      }

      // Delay before next tier: 500ms for Tier1→2, 1000ms for Tier2→3
      const delay = tierIndex === 0 ? 500 : 1000;
      await new Promise(r => setTimeout(r, delay));
    }
  }

  throw new Error('Fallback chain exhausted');
}
```

### C.4 `callWithFallback()` — `lib/engine/agents/base-agent.ts` lines 23-120

```typescript
export async function callWithFallback(
  agent: AgentName, primary: ResolvedModel, fallback: ResolvedModel,
  messages: LLMMessage[], maxTokens: number, apiKeys: ApiKeys,
  opts?: { temperature?: number; jsonMode?: boolean }
): Promise<CallWithFallbackResult> {
  const isReport = agent === "report-agent";
  const timeoutMs = isReport ? REPORT_TIMEOUT_MS : PRIMARY_TIMEOUT_MS; // 180s or 90s

  const callModel = (model: ResolvedModel, overrideTimeout?: number) =>
    generateAIResponse({
      model: model.id, provider: model.provider, messages, stream: false,
      apiKeys, maxTokens, temperature: opts?.temperature ?? 0.3,
      timeoutMs: overrideTimeout ?? timeoutMs, jsonMode: opts?.jsonMode,
    });

  const primaryPromise = callModel(primary);

  // 1. Try primary within race window (45s)
  try {
    const res = await Promise.race([
      primaryPromise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("__RACE_TIMEOUT__")), FALLBACK_RACE_MS)),
    ]);
    return { content: res.content, model_used: primary.id, provider: primary.provider,
      isFallback: false, usage: res.usage };
  } catch (primaryErr) {
    const isRaceTimeout = primaryErr instanceof Error && primaryErr.message === "__RACE_TIMEOUT__";

    if (isRaceTimeout) {
      // Primary still running — race it against fallback (first to succeed wins)
      const primaryWrapped = primaryPromise.then(res => ({
        content: res.content, model_used: primary.id, provider: primary.provider,
        isFallback: false, usage: res.usage }));
      const fallbackWrapped = callModel(fallback).then(res => ({
        content: res.content, model_used: fallback.id, provider: fallback.provider,
        isFallback: true, usage: res.usage }));

      try {
        const winner = await Promise.any([primaryWrapped, fallbackWrapped]);
        return winner;
      } catch (aggErr) {
        throw new Error(`[${agent}] Both primary and fallback failed after race`);
      }
    }

    // Primary genuinely failed — try fallback
    try {
      const res = await callModel(fallback);
      return { content: res.content, model_used: fallback.id, provider: fallback.provider,
        isFallback: true, usage: res.usage };
    } catch (fallbackErr) {
      throw new Error(`[${agent}] Both primary and fallback failed`);
    }
  }
}
```

### C.5 `safeParseJSON()` — `lib/engine/agents/base-agent.ts` lines 138-166

```typescript
export function safeParseJSON(raw: string): Record<string, unknown> | null {
  const trimmed = raw.trim();

  // Direct parse
  try { return JSON.parse(trimmed); } catch { /* continue */ }

  // Normalize: strip BOM, fix trailing commas
  const normalized = trimmed
    .replace(/^\uFEFF/, "")
    .replace(/,\s*([}\]])/g, "$1");

  try { return JSON.parse(normalized); } catch { /* continue */ }

  // Fence extraction: ```json ... ```
  const fence = normalized.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) { try { return JSON.parse(fence[1]); } catch { /* continue */ } }

  // First brace block: { ... }
  const brace = normalized.match(/\{[\s\S]*\}/);
  if (brace) { try { return JSON.parse(brace[0]); } catch { /* continue */ } }

  // First { to last } (bounded to 100KB)
  const first = normalized.indexOf("{");
  const last = normalized.lastIndexOf("}");
  if (first !== -1 && last > first && (last - first) < 100_000) {
    const candidate = normalized.slice(first, last + 1).replace(/,\s*([}\]])/g, "$1");
    try { return JSON.parse(candidate); } catch { /* continue */ }
  }

  return null;
}
```

### C.6 `searchWithFallback()` — `lib/engine/search-router.ts` lines 143-190

```typescript
export async function searchWithFallback(
  options: SearchOptions, apiKeys: ApiKeys
): Promise<{ results: SearchResult[]; provider: "nvidia" | "openrouter" }> {
  const { mode } = options;

  // Primary: NVIDIA NIM search (Dracarys Llama 3.1 70B)
  if (apiKeys.nvidiaKey) {
    try {
      const results = await searchViaNvidia(apiKeys.nvidiaKey,
        options.enhanced_query || options.query, options.search_terms || [],
        options.maxResults, mode);
      if (results.length > 0) return { results, provider: "nvidia" };
    } catch (err) {
      console.warn("[search-router] NVIDIA search failed, trying OpenRouter:", err);
    }
  }

  // Fallback: OpenRouter search (Llama 3.3 70B Free)
  if (apiKeys.openrouterKey) {
    try {
      const results = await searchViaOpenRouter(apiKeys.openrouterKey,
        options.enhanced_query || options.query, options.search_terms || [],
        options.maxResults, mode);
      if (results.length > 0) return { results, provider: "openrouter" };
    } catch (error) {
      console.warn("[search-router] OpenRouter search failed:", error);
    }
  }

  // Both failed — return empty
  return { results: [], provider: "openrouter" };
}
```

### C.7 `parseGeneratedResults()` — `lib/engine/search-router.ts` lines 8-45

```typescript
function parseGeneratedResults(content: string, maxResults: number): SearchResult[] {
  // Try JSON first
  try {
    const fence = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    const raw = fence ? fence[1] : content;
    const parsed = JSON.parse(raw);
    const items: unknown[] = Array.isArray(parsed) ? parsed : parsed.results ?? parsed.sources ?? [];
    return items.slice(0, maxResults).map((r: unknown, i: number) => {
      const item = r as Record<string, string>;
      return {
        title: item.title ?? `Source ${i + 1}`,
        url: item.url ?? "",
        snippet: item.snippet ?? item.summary ?? item.description ?? "",
        domain: item.domain ?? extractDomain(item.url ?? ""),
        relevanceScore: 1 - i * 0.08,
      };
    });
  } catch {
    // Fall back to line-by-line parsing of numbered lists
    const lines = content.split("\n").filter(Boolean);
    const results: SearchResult[] = [];
    for (const line of lines) {
      const urlMatch = line.match(/https?:\/\/[^\s)"<>]+/);
      if (urlMatch) {
        const url = urlMatch[0];
        results.push({
          title: extractTitleFromUrl(url), url,
          snippet: line.replace(url, "").replace(/^\s*[\-\*\d.]+\s*/, "").trim().slice(0, 250),
          domain: extractDomain(url), relevanceScore: 1 - results.length * 0.08,
        });
      }
      if (results.length >= maxResults) break;
    }
    return results;
  }
}
```

### C.8 `classifyQuery()` — `lib/engine/query-router.ts` lines 144-179

```typescript
export async function classifyQuery(query: string, apiKeys: ApiKeys): Promise<QueryRouterResult> {
  // 1. Try heuristic first (instant, no API cost)
  const heuristic = heuristicClassify(query);
  if (heuristic) return { complexity: heuristic, reason: "Heuristic match", confidence: 0.95 };

  // 2. Use AI classifier (prefer OpenRouter free model to save NVIDIA quota)
  if (apiKeys.openrouterKey) {
    try { return await classifyViaOpenRouter(apiKeys.openrouterKey, query); } catch { /* fall through */ }
  }

  // 3. Fallback to NVIDIA fast model (MiniMax M2.7)
  if (apiKeys.nvidiaKey) {
    try { return await classifyViaNvidia(apiKeys.nvidiaKey, query); } catch { /* fall through */ }
  }

  // 4. Ultimate fallback — treat as research (safe default)
  return { complexity: "research", reason: "Classifier unavailable", confidence: 0.5 };
}
```

### C.9 `heuristicClassify()` — `lib/engine/query-router.ts` lines 117-140

```typescript
function heuristicClassify(query: string): QueryComplexity | null {
  const trimmed = query.trim();
  if (trimmed.length < 4) return "simple";

  // Simple patterns: greetings, thanks, basic questions
  for (const pat of SIMPLE_PATTERNS) {
    if (pat.test(trimmed)) return "simple";
  }

  // Research patterns: report, analysis, compare, code, etc.
  for (const pat of RESEARCH_PATTERNS) {
    if (pat.test(trimmed)) return "research";
  }

  // Medium length with question mark — could go either way
  if (trimmed.length < 30 && trimmed.split(" ").length < 6) return "simple";
  // Long queries default to research
  if (trimmed.length > 80) return "research";

  return null; // Uncertain — use AI classifier
}
```

### C.10 `buildContext()` — `lib/engine/context-builder.ts` lines 95-171

```typescript
export function buildContext(
  searchResults: SearchResult[], files: FileContext[],
  tokenLimit: number = TOKEN_LIMITS.contextWindow, query: string
): BuiltContext {
  // Step 1: Process and rank files by query relevance
  const allChunks: Chunk[] = [];
  for (const file of files) {
    const textChunks = chunkText(file.content); // 500-word chunks
    for (const text of textChunks) {
      allChunks.push({ fileName: file.fileName, text, score: scoreChunk(text, query) });
    }
  }
  allChunks.sort((a, b) => b.score - a.score);

  // Step 2: Deduplicate web results by URL
  let results = deduplicateByUrl(searchResults);
  // Step 3: Rank by relevance score (desc), then snippet length
  results = rankByRelevance(results);

  // Step 4: Trim to token budget
  const includedResults: SearchResult[] = [];
  const includedChunks: Chunk[] = [];
  let totalTokens = 0;

  // Files get up to 70% of token limit
  for (const chunk of allChunks) {
    const entryText = `[File: ${chunk.fileName}]\n${chunk.text}\n---\n`;
    const entryTokens = estimateTokens(entryText);
    if (totalTokens + entryTokens > tokenLimit * 0.7) continue;
    includedChunks.push(chunk);
    totalTokens += entryTokens;
  }

  // Web results fill the rest
  for (const result of results) {
    const entryText = `[Source] ${result.title}\nURL: ${result.url}\n${result.snippet}\n---\n`;
    const entryTokens = estimateTokens(entryText);
    if (totalTokens + entryTokens > tokenLimit) break;
    includedResults.push(result);
    totalTokens += entryTokens;
  }

  const text = formatAsContext(includedResults, includedChunks);

  // Merge file and web sources for UI
  const uniqueFiles = new Set(includedChunks.map(c => c.fileName));
  const fileSources = Array.from(uniqueFiles).map((fileName, idx) => ({
    title: fileName, url: `file://${fileName}`,
    snippet: `Content from uploaded file: ${fileName}`,
    domain: "Local File", relevanceScore: 1
  }));
  const allSources = [...fileSources, ...includedResults];

  return { text, sourceCount: allSources.length, estimatedTokens: totalTokens, sources: allSources as SearchResult[] };
}
```

### C.11 `selectModel()` — `lib/engine/model-router.ts` lines 8-29

```typescript
export function selectModel(taskType: TaskType, query?: string, depth?: number): ModelFallbackChain {
  const map = AGENT_MODEL_MAP[taskType] ?? AGENT_MODEL_MAP["default"];
  const primary = [...MODEL_REGISTRY.nvidia, ...MODEL_REGISTRY.openrouter].find(m => m.id === map.primary)
    ?? MODEL_REGISTRY.nvidia[0];
  const fallback = [...MODEL_REGISTRY.nvidia, ...MODEL_REGISTRY.openrouter].find(
    m => m.id === map.fallback || m.id === map.fallback.replace(":free", "") + ":free"
  ) ?? MODEL_REGISTRY.openrouter[0];
  return { primary, fallbacks: [fallback] };
}
```

### C.12 `selectModelsForPlan()` — `lib/engine/agents/model-selector-agent.ts` lines 149-182

```typescript
export async function selectModelsForPlan(
  plan: ResearchPlan, query: string, nvidiaApiKey?: string
): Promise<AgentModelAssignment[]> {
  const queryOverride = detectQueryOverride(query);

  const assignments: AgentModelAssignment[] = plan.dynamicSections.map(section => {
    const baseTaskType = classifySectionTask(section);
    const { entry, effectiveTaskType } = resolveModelEntry(baseTaskType, queryOverride);
    const maxTokens = resolveMaxTokens(section, entry);
    return {
      sectionId: section.id, agentRole: section.agentRole,
      primaryModel: { ...entry.primary }, fallbackModel: { ...entry.fallback },
      taskType: effectiveTaskType, maxTokens,
    };
  });

  // Non-blocking health check — if NVIDIA is down, swap all NVIDIA-primary to fallbacks
  const healthy = await checkNvidiaHealth(nvidiaApiKey);
  if (!healthy) {
    return assignments.map(a =>
      a.primaryModel.platform === "nvidia" ? swapToFallback(a) : a
    );
  }
  return assignments;
}
```

### C.13 `classifySectionTask()` — `lib/engine/agents/model-selector-agent.ts` lines 36-50

```typescript
function classifySectionTask(section: DynamicSection): SectionTaskType {
  const blob = `${section.agentRole} ${section.focusArea} ${section.sectionTitle}`.toLowerCase();

  for (const [pattern, taskType] of ROLE_KEYWORDS) {
    if (pattern.test(blob)) return taskType;
  }

  if (section.requiresWebSearch) return "web_search";

  switch (section.priority) {
    case "high":   return "deep_reasoning";
    case "low":    return "fast_summary";
    default:       return "balanced_research";
  }
}
```

### C.14 `normalizeResponse()` — `lib/engine/response-normalizer.ts` lines 125-177

```typescript
export function normalizeResponse(
  rawText: string, searchResults: SearchResult[], metadata: ResearchResult["metadata"]
): ResearchResult {
  const sources = convertSources(searchResults);

  // Try JSON parsing first
  const json = tryExtractJson(rawText);
  if (json) {
    return {
      overview: String(json.overview ?? json.summary ?? ""),
      keyInsights: toStringArray(json.key_insights ?? json.keyInsights),
      details: String(json.details ?? json.analysis ?? ""),
      comparison: String(json.comparison ?? ""),
      expertInsights: toStringArray(json.expert_insights ?? json.expertInsights),
      conclusion: String(json.conclusion ?? json.takeaway ?? ""),
      sources, references: sources, metadata,
    };
  }

  // Fall back to structured text parsing
  const parsed = parseStructuredText(rawText);
  if (!parsed.overview && !parsed.details) {
    return {
      overview: rawText.slice(0, 500), keyInsights: [],
      details: rawText.length > 500 ? rawText.slice(500) : "",
      comparison: "", expertInsights: [], conclusion: "",
      sources, references: sources, metadata,
    };
  }

  return {
    overview: parsed.overview ?? "", keyInsights: parsed.keyInsights ?? [],
    details: parsed.details ?? "", comparison: parsed.comparison ?? "",
    expertInsights: parsed.expertInsights ?? [], conclusion: parsed.conclusion ?? "",
    sources, references: sources, metadata,
  };
}
```

### C.15 `toResponseSections()` — `lib/engine/response-normalizer.ts` lines 181-239

```typescript
export function toResponseSections(result: ResearchResult): ResponseSection[] {
  const sections: ResponseSection[] = [];

  if (result.overview) {
    sections.push({ type: "heading", content: "🔍 Overview" });
    sections.push({ type: "paragraph", content: result.overview });
  }
  if (result.keyInsights.length > 0) {
    sections.push({ type: "heading", content: "⚡ Key Insights" });
    sections.push({ type: "bullets", content: "", items: result.keyInsights });
  }
  if (result.details) {
    sections.push({ type: "heading", content: "📊 Analysis" });
    sections.push({ type: "paragraph", content: result.details });
  }
  if (result.comparison) {
    sections.push({ type: "heading", content: "⚖️ Comparison" });
    sections.push({ type: "paragraph", content: result.comparison });
  }
  if (result.code) {
    sections.push({ type: "heading", content: "💻 Code" });
    sections.push({ type: "code", content: result.code });
  }
  if (result.expertInsights.length > 0) {
    sections.push({ type: "heading", content: "🧠 Expert Insights" });
    sections.push({ type: "bullets", content: "", items: result.expertInsights });
  }
  if (result.conclusion) {
    sections.push({ type: "heading", content: "🚀 Conclusion" });
    sections.push({ type: "paragraph", content: result.conclusion });
  }
  if (result.factCheck) {
    sections.push({ type: "heading", content: "🔍 Fact Check" });
    sections.push({ type: "fact_check", content: result.factCheck });
  }
  if (result.references.length > 0) {
    sections.push({ type: "heading", content: "📚 Sources" });
    sections.push({ type: "bullets", content: "",
      items: result.references.map(ref => `[${ref.id}] ${ref.title} — ${ref.domain} (${ref.url})`) });
  }
  return sections;
}
```

### C.16 `readStream()` — `app/page.tsx` lines 61-151

```typescript
async function readStream(
  response: Response,
  callbacks: {
    onStatus: (phase: string, message: string) => void;
    onToken: (text: string) => void;
    onResult: (result: ResearchResult) => void;
    onError: (message: string) => void;
    onDone: () => void;
    onAgentStatus: (event: AgentStatusEvent) => void;
    onRouteDecision: (decision: RouteDecision) => void;
    onWorkflowMode: (event: WorkflowModeEvent) => void;
    onThinking: (step: ThinkingStep) => void;
  }
) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response stream");
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      let currentEvent = "";
      for (const line of lines) {
        if (line.startsWith("event: ")) {
          currentEvent = line.slice(7).trim();
        } else if (line.startsWith("data: ")) {
          const data = line.slice(6);
          try {
            const parsed = JSON.parse(data);
            if (currentEvent) {
              switch (currentEvent) {
                case "status": callbacks.onStatus(parsed.phase, parsed.message ?? parsed.status); break;
                case "token": callbacks.onToken(parsed.text); break;
                case "result": callbacks.onResult(parsed as ResearchResult); break;
                case "error": callbacks.onError(parsed.message); break;
                case "done": callbacks.onDone(); break;
                case "agent_status": callbacks.onAgentStatus(parsed as AgentStatusEvent); break;
                case "route_decision": callbacks.onRouteDecision(parsed as RouteDecision); break;
                case "workflow_mode": callbacks.onWorkflowMode(parsed as WorkflowModeEvent); break;
                case "thinking": callbacks.onThinking(parsed as ThinkingStep); break;
              }
            } else {
              // Fallback — old format with no `event:` prefix
              if (parsed.type === "result" || parsed.data) {
                callbacks.onResult((parsed.data ?? parsed) as ResearchResult);
              } else if (parsed.type === "error") {
                callbacks.onError(parsed.message ?? "Unknown error");
              } else if (parsed.phase !== undefined) {
                callbacks.onStatus(parsed.phase, parsed.status ?? parsed.message ?? "");
              }
            }
          } catch { /* skip malformed JSON */ }
          currentEvent = "";
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
```

### C.17 `handleSubmit()` — `app/page.tsx` lines 570-793

```typescript
const handleSubmit = useCallback(async (files: ParsedFile[] = []) => {
  if (!query.trim() || isAnyLoading) return;
  const currentQuery = query.trim();

  // Append user message
  const userMsg: ChatMessage = { id: generateId(), role: "user", timestamp: Date.now(),
    query: currentQuery, files: files.length > 0 ? files : undefined,
    sections: [], sources: [], fullResult: null, streamingText: "",
    routeComplexity: null, agentStatuses: {}, showAgentPanel: false,
    statusMessage: null, isStreaming: false, isLoading: false, error: null,
    thinkingSteps: [], showThinking: false };

  const conversationHistory = toConversationHistory(messages);

  // Check Cache First
  const cached = getCached(currentQuery, workflowMode, mode, selectedModel);
  if (cached && files.length === 0) {
    const allSections = toResponseSections(cached);
    const assistantMsg = createAssistantMessage({ fullResult: cached, isLoading: false, isStreaming: true });
    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setQuery("");
    setTimeout(() => revealSections(allSections, cached.sources), 50);
    return;
  }

  // Append assistant placeholder
  const assistantMsg = createAssistantMessage();
  setMessages(prev => [...prev, userMsg, assistantMsg]);
  setQuery("");

  // Abort Previous Request
  abortRef.current?.abort();
  const abort = new AbortController();
  abortRef.current = abort;

  try {
    const res = await fetch("/api/research", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: currentQuery, workflowMode, mode, model: selectedModel,
        stream: true, files, conversationHistory, disabledAgents }),
      signal: abort.signal,
    });

    // Non-Streaming JSON Response
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const data: ResearchApiResponse = await res.json();
      if (!data.success || !data.data) throw new Error(data.error ?? "Request failed");
      const allSections = toResponseSections(data.data);
      setCached(currentQuery, workflowMode, mode, selectedModel, data.data);
      updateLastAssistant(() => ({ fullResult: data.data, isLoading: false, isStreaming: true }));
      revealSections(allSections, data.data.sources);
      return;
    }

    // SSE Streaming Response
    updateLastAssistant(() => ({ isLoading: false, isStreaming: true }));
    await readStream(res, {
      onRouteDecision: ({ complexity }) => { /* update UI */ },
      onWorkflowMode: ({ mode: next }) => { setWorkflowMode(next); },
      onStatus: (_phase, message) => { updateLastAssistant(() => ({ statusMessage: message })); },
      onToken: (text) => { updateLastAssistant(msg => ({ streamingText: msg.streamingText + text })); },
      onResult: (result) => {
        const allSections = toResponseSections(result);
        setCached(currentQuery, result.metadata.workflowMode ?? workflowMode, mode, selectedModel, result);
        updateLastAssistant(() => ({ streamingText: "", fullResult: result, sections: allSections, sources: result.sources }));
      },
      onError: (message) => { updateLastAssistant(() => ({ error: message, isLoading: false, isStreaming: false })); },
      onDone: () => { updateLastAssistant(() => ({ isStreaming: false, isLoading: false })); },
      onAgentStatus: (event) => { /* update agent statuses */ },
      onThinking: (step) => { updateLastAssistant(msg => ({ thinkingSteps: [...msg.thinkingSteps, step] })); },
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return;
    updateLastAssistant(() => ({ isLoading: false, isStreaming: false, error: err instanceof Error ? err.message : "Something went wrong" }));
  }
}, [query, workflowMode, mode, selectedModel, isAnyLoading, messages, getCached, setCached, getHistory, disabledAgents, updateLastAssistant, revealSections]);
```

### C.18 `sendSSE()` — `app/api/research/route.ts` lines 38-63

```typescript
const sendSSE = (data: Record<string, unknown>, eventName?: string) => {
  if (isClosed) return;
  try {
    // Map backend `type` literals to the small set of event names
    // the frontend readStream() switch handles.
    const type = (data.type as string) || '';
    const event = eventName || (
      type === 'agent_update' ? 'agent_status' :
      type === 'plan_ready' ? 'status' :
      type === 'models_assigned' ? 'status' :
      type === 'phase_complete' ? 'status' :
      type === 'complete' ? 'done' :
      type === 'error' ? 'error' :
      type === 'warning' ? 'status' :
      type === 'result' ? 'result' :
      'status'
    );
    const sseString = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    writer.write(encoder.encode(sseString));
  } catch (err) {
    isClosed = true;
  }
};
```

### C.19 `nvidiaComplete()` and `nvidiaWithRetry()` — `lib/engine/providers/nvidia.ts`

**`nvidiaComplete()` (lines 59-85):**
```typescript
export async function nvidiaComplete(apiKey: string, options: LLMRequestOptions): Promise<LLMResponse> {
  const res = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
    method: "POST", headers: buildHeaders(apiKey),
    body: JSON.stringify(buildBody({ ...options, stream: false })),
    signal: makeSignal(options.timeoutMs),
  });
  if (!res.ok) throw handleErrorStatus(res.status);
  const data = await res.json();
  const choice = data.choices?.[0];
  return {
    content: choice?.message?.content ?? "",
    model_used: data.model ?? options.model,
    provider: "nvidia",
    usage: { prompt_tokens: data.usage?.prompt_tokens ?? 0,
      completion_tokens: data.usage?.completion_tokens ?? 0,
      total_tokens: data.usage?.total_tokens ?? 0 }
  };
}
```

**`nvidiaWithRetry()` (lines 154-184):**
```typescript
export async function nvidiaWithRetry(apiKey: string, options: LLMRequestOptions, onChunk?: StreamCallback): Promise<LLMResponse> {
  let lastError: ResearchError | null = null;
  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      if (options.stream && onChunk) return await nvidiaStream(apiKey, options, onChunk);
      return await nvidiaComplete(apiKey, options);
    } catch (err) {
      lastError = err instanceof ResearchError ? err : new ResearchError(String(err), "unknown", { provider: "nvidia" });
      if (!lastError.retryable || attempt === RETRY_CONFIG.maxRetries) break;
      const delay = Math.min(RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt), RETRY_CONFIG.maxDelayMs);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError ?? new ResearchError("NVIDIA: all retries exhausted", "unknown", { provider: "nvidia" });
}
```

### C.20 `openrouterComplete()` and `openrouterWithRetry()` — `lib/engine/providers/openrouter.ts`

**`openrouterComplete()` (lines 63-99):**
```typescript
export async function openrouterComplete(apiKey: string, options: LLMRequestOptions): Promise<LLMResponse> {
  const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST", headers: buildHeaders(apiKey),
    body: JSON.stringify(buildBody({ ...options, stream: false })),
    signal: makeSignal(options.timeoutMs),
  });
  if (!res.ok) throw handleErrorStatus(res.status);
  const data = await res.json();
  if (data.error) throw new ResearchError(`OpenRouter: ${data.error.message ?? data.error}`, "provider_down", { provider: "openrouter" });
  const choice = data.choices?.[0];
  return {
    content: choice?.message?.content ?? "", model_used: data.model ?? options.model,
    provider: "openrouter",
    usage: { prompt_tokens: data.usage?.prompt_tokens ?? 0,
      completion_tokens: data.usage?.completion_tokens ?? 0,
      total_tokens: data.usage?.total_tokens ?? 0 }
  };
}
```

**`openrouterWithRetry()` (lines 178-231) — includes 429 rotation:**
```typescript
export async function openrouterWithRetry(apiKey: string, options: LLMRequestOptions, onChunk?: StreamCallback): Promise<LLMResponse> {
  let lastError: ResearchError | null = null;
  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      if (options.stream && onChunk) return await openrouterStream(apiKey, options, onChunk);
      return await openrouterComplete(apiKey, options);
    } catch (err) {
      lastError = err instanceof ResearchError ? err : new ResearchError(String(err), "unknown", { provider: "openrouter" });

      // On 429: rotate through ALL alternate free models
      if (lastError.statusCode === 429 || lastError.kind === "rate_limit") {
        const alternates = FREE_MODEL_ROTATION.filter(m => m !== options.model);
        for (const alternateModel of alternates) {
          try {
            const altOptions = { ...options, model: alternateModel };
            if (altOptions.stream && onChunk) return await openrouterStream(apiKey, altOptions, onChunk);
            return await openrouterComplete(apiKey, altOptions);
          } catch (altErr) {
            const altError = altErr instanceof ResearchError ? altErr : new ResearchError(String(altErr), "unknown", { provider: "openrouter" });
            lastError = altError;
            if (altError.statusCode !== 429 && altError.kind !== "rate_limit") break;
          }
        }
        break;
      }

      if (!lastError.retryable || attempt === RETRY_CONFIG.maxRetries) break;
      const delay = Math.min(RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt), RETRY_CONFIG.maxDelayMs);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError ?? new ResearchError("OpenRouter: all retries exhausted", "unknown", { provider: "openrouter" });
}
```

### C.21 `generateAIResponse()` — `lib/engine/providers/index.ts` lines 19-51

```typescript
export async function generateAIResponse({
  model, provider, messages, stream, apiKeys, onChunk,
  maxTokens, temperature, timeoutMs, jsonMode,
}: GenerateAIResponseArgs): Promise<LLMResponse> {
  const options = {
    model, messages,
    maxTokens: maxTokens ?? TOKEN_LIMITS.agentMaxTokens,
    temperature: temperature ?? 0.3,
    stream, timeoutMs, jsonMode,
  };

  if (provider === "nvidia") {
    if (!apiKeys.nvidiaKey) throw new Error("Missing NVIDIA API key");
    return nvidiaWithRetry(apiKeys.nvidiaKey, options, onChunk);
  } else if (provider === "openrouter") {
    if (!apiKeys.openrouterKey) throw new Error("Missing OpenRouter API key");
    return openrouterWithRetry(apiKeys.openrouterKey, options, onChunk);
  }

  // Default fallback to OpenRouter
  if (!apiKeys.openrouterKey) throw new Error("Missing OpenRouter API key");
  return openrouterWithRetry(apiKeys.openrouterKey, options, onChunk);
}
```

---

## ADDITIONAL DETAILED SECTIONS

---

### A1. ERROR HANDLING SYSTEM (lib/engine/errors.ts — Complete)

#### A1.1 ErrorKind Enum
```typescript
export type ErrorKind =
  | "rate_limit"       // 429 — retryable
  | "auth"             // 401/403 — NOT retryable
  | "network"          // fetch failure, timeout — retryable
  | "provider_down"    // 502/503/504 — retryable
  | "token_exceeded"   // context length exceeded — NOT retryable
  | "parse_error"      // JSON parse failure — retryable
  | "unknown";         // catch-all
```

#### A1.2 ResearchError Class
```typescript
export class ResearchError extends Error {
  readonly kind: ErrorKind;
  readonly provider?: string;      // "nvidia" | "openrouter"
  readonly statusCode?: number;    // HTTP status code
  readonly retryable: boolean;     // Auto-calculated from kind + statusCode
}
```

#### A1.3 classifyError() — Full Pattern Matching
```typescript
export function classifyError(error: unknown, provider?: string): ResearchError {
  if (error instanceof ResearchError) return error;

  // AbortSignal.timeout() throws DOMException with name "TimeoutError"
  if (error instanceof DOMException && error.name === "TimeoutError")
    return new ResearchError("Request timed out", "network", { provider });

  if (error instanceof Error && error.name === "AbortError")
    return new ResearchError("Request aborted", "network", { provider });

  if (error instanceof TypeError && error.message.includes("fetch"))
    return new ResearchError("Network error", "network", { provider });

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("rate limit") || msg.includes("429"))
      return new ResearchError("Rate limit exceeded", "rate_limit", { provider, statusCode: 429 });
    if (msg.includes("unauthorized") || msg.includes("401") || msg.includes("api key"))
      return new ResearchError("Authentication failed", "auth", { provider, statusCode: 401 });
    if (msg.includes("502") || msg.includes("503") || msg.includes("504"))
      return new ResearchError("Provider temporarily unavailable", "provider_down", { provider });
    if (msg.includes("context length") || msg.includes("max_tokens") || msg.includes("token limit"))
      return new ResearchError("Context window exceeded", "token_exceeded", { provider });
    if (msg.includes("invalid json") || msg.includes("unexpected token"))
      return new ResearchError("Failed to parse model response", "parse_error", { provider });
    return new ResearchError(error.message, "unknown", { provider });
  }

  return new ResearchError("An unknown error occurred", "unknown", { provider });
}
```

#### A1.4 userFacingMessage() — Complete Mapping
```typescript
export function userFacingMessage(error: ResearchError): string {
  switch (error.kind) {
    case "rate_limit":     return "Too many requests — retrying with a different provider...";
    case "auth":           return "API key is missing or invalid. Please check your configuration.";
    case "network":        return "Could not connect to the service. Check your internet connection.";
    case "provider_down":  return "The AI provider is temporarily down. Trying an alternative...";
    case "token_exceeded": return "The query is too complex. Try a shorter or simpler question.";
    case "parse_error":    return "Failed to process the response. Trying again...";
    default:               return "Something went wrong. Please try again.";
  }
}
```

#### A1.5 Error Propagation Flow
```
API call fails
  ↓
classifyError(error, provider) → ResearchError
  ↓
If retryable && attempts remaining → retry with backoff
  ↓
If not retryable OR retries exhausted:
  ├─ In base-agent.ts callWithFallback() → try fallback model
  ├─ In fallback-executor.ts → try next tier
  └─ In orchestrator.ts → return partial result with error field
```

---

### A2. COMPLETE PROMPT TEMPLATES (All Agents)

#### A2.1 Analysis Agent — Stage 1 Prompt
```
You are the Deep Analysis Agent. Your job is to perform rigorous,
multi-dimensional research analysis. WORD COUNT TARGET: 1000-1500 words.

STAGE 1: Foundation & Technical (Target: 600-800 words)

MANDATORY OUTPUT FIELDS:
1. "analysis_part_1": MINIMUM 600 words. Must contain:
   - ### Foundational Context & Landscape Overview
   - ### Technical & Mechanistic Deep Dive

Return ONLY valid JSON:
{ "analysis_part_1": "string" }
```

#### A2.2 Analysis Agent — Stage 2 Prompt
```
STAGE 2: Impact & Evaluation (Target: 600-800 words)

MANDATORY OUTPUT FIELDS:
1. "analysis_part_2": MINIMUM 400 words. Must contain:
   - ### Multi-Dimensional Impact Analysis
   - ### Critical Evaluation & Evidence Assessment
   - ### Future Outlook & Strategic Implications

2. "patterns": MINIMUM 5-8 items. Non-obvious connections.
3. "comparison": MINIMUM 300-500 words. Structured comparison.
4. "confidence": "high" | "medium" | "low".
5. "caveats": MINIMUM 5-8 items. Critical risks.

Return ONLY valid JSON:
{
  "analysis_part_2": "string",
  "patterns": ["string", "..."],
  "comparison": "string",
  "confidence": "high|medium|low",
  "caveats": ["string", "..."]
}
```

#### A2.3 Fact-Check Agent — Stage 1 Prompt
```
You are the Fact-Check Agent. WORD COUNT TARGET: 800-1200 words.

STAGE 1: Claims & Contradictions (Target: 400-600 words)

MANDATORY OUTPUT FIELDS:
1. "verified_claims": MINIMUM 8-12 items.
2. "unverified_claims": MINIMUM 3-6 items.
3. "contradictions": MINIMUM 2-4 items.

Return ONLY valid JSON:
{
  "verified_claims": ["string", "..."],
  "unverified_claims": ["string", "..."],
  "contradictions": ["string", "..."]
}
```

#### A2.4 Fact-Check Agent — Stage 2 Prompt
```
STAGE 2: Summary & Reliability (Target: 600-800 words)

MANDATORY OUTPUT FIELDS:
1. "fact_check_summary": MINIMUM 600 words. Must contain:
   - ### Overall Reliability Assessment
   - ### Evidence Strength Analysis
   - ### Source Quality Assessment
   - ### Critical Warnings & Bias Detection
   - ### Recommendations for Readers

2. "warnings": MINIMUM 5-8 items.
3. "reliability_score": number (0-100).
4. "reliability_label": "High" | "Medium-High" | "Medium" | "Medium-Low" | "Low"
```

#### A2.5 Summary Agent — Stage 1 Prompt
```
You are the Executive Summary Agent. WORD COUNT TARGET: 800-1200 words.

STAGE 1: Executive Summary & Themes (Target: 600-800 words)

MANDATORY OUTPUT FIELDS:
1. "overview_part_1": MINIMUM 600 words. Must contain:
   - ### Executive Summary (Bottom line + Urgency + Top findings)
   - ### Key Themes & Thematic Analysis (4-6 major themes with evidence)

Return ONLY valid JSON:
{ "overview_part_1": "string" }
```

#### A2.6 Summary Agent — Stage 2 Prompt
```
STAGE 2: Strategy, Facts & Actions (Target: 600-800 words)

MANDATORY OUTPUT FIELDS:
1. "overview_part_2": MINIMUM 300 words. Must contain:
   - ### Strategic Implications & Recommendations
   - ### Outlook & Conclusion

2. "key_points": MINIMUM 8-12 items. Substantive findings (2-3 sentences each).
3. "quick_facts": MINIMUM 10-15 items. Specific data/stats.
4. "action_items": MINIMUM 5-8 items. Ranked by priority.

Return ONLY valid JSON:
{
  "overview_part_2": "string",
  "key_points": ["string", "..."],
  "quick_facts": ["string", "..."],
  "action_items": ["string", "..."]
}
```

#### A2.7 Coding Agent System Prompt (Full)
```
You are the Coding Agent — a senior software engineer in a multi-agent
research pipeline. You are activated ONLY when the user's query involves
code generation, debugging, implementation, or algorithm design.

OUTPUT SPECIFICATION (ALL FIELDS MANDATORY):

1. "language" (string): Primary programming language.

2. "code" (string, MUST be complete and runnable):
   - Include ALL necessary imports, type definitions, and helper functions.
   - Handle edge cases: null/undefined, empty collections, boundary conditions.
   - Include inline comments for non-obvious logic.

3. "explanation" (string, MINIMUM 800-1200 words):
   ### Architecture Overview (200-300 words)
   ### Implementation Walkthrough (250-350 words)
   ### Integration Guide (150-250 words)
   ### Testing Strategy (150-250 words)

4. "usage_example" (string, MINIMUM 200-400 words):
   Basic usage, advanced usage, error handling examples.

5. "pitfalls" (array, MINIMUM 5-8 items):
   "**[Category: Security/Performance/Compatibility] — [Title]**: Danger and mitigation"

6. "alternatives" (string, MINIMUM 200-400 words):
   2-3 alternative implementations with pros/cons.
```

#### A2.8 Report Agent — Stage 1 Prompt (Legacy)
```
You are the Report Synthesis Agent — the FINAL stage of a multi-agent
research pipeline. WORD COUNT TARGET: 4000-6000 words total.

STAGE 1: Overview & Key Insights (Target: 1000-1500 words)

MANDATORY OUTPUT FIELDS:
1. "overview": MINIMUM 800-1000 words. Include:
   - ### Executive Summary
   - ### Research Methodology & Scope
   - ### Key Findings at a Glance (5-7 bold findings)
   - ### Reliability & Confidence Statement

2. "key_insights": MINIMUM 12-18 items.
   Format: "**[Insight Title]** (Source: [Agent Name]) — [3-4 sentence explanation]."
```

#### A2.9 Report Agent — Stage 2 Prompt (Legacy)
```
STAGE 2: Core Analysis (Chapters 1-4) (Target: 1500-2000 words)

MANDATORY OUTPUT FIELD:
1. "details_part_1": MINIMUM 1500 words. Must contain:
   - ### Chapter 1: Foundational Context & Background
   - ### Chapter 2: Technical / Mechanistic Deep Dive
   - ### Chapter 3: Multi-Dimensional Impact Assessment
   - ### Chapter 4: Evidence Analysis & Source Review
```

#### A2.10 Report Agent — Stage 3 Prompt (Legacy)
```
STAGE 3: Advanced Analysis (Chapters 5-8) (Target: 1500-2000 words)

MANDATORY OUTPUT FIELD:
1. "details_part_2": MINIMUM 1500 words. Must contain:
   - ### Chapter 5: Patterns, Trends & Emerging Insights
   - ### Chapter 6: Comparative Analysis
   - ### Chapter 7: Risk Assessment & Caveats
   - ### Chapter 8: Future Outlook & Strategic Roadmap
```

#### A2.11 Report Agent — Stage 4 Prompt (Legacy)
```
STAGE 4: Synthesis & Conclusion (Target: 1000-1500 words)

MANDATORY OUTPUT FIELDS:
1. "comparison": MINIMUM 400-600 words.
2. "expert_insights": MINIMUM 8-12 items.
3. "conclusion": MINIMUM 400-600 words.
4. "fact_check_summary": 200-400 words.
5. "reliability_score": number (0-100).
```

#### A2.12 Search Router System Prompt (Full)
```
You are a research source generator. Your job is to produce {maxResults}
highly relevant, diverse, and authoritative search result entries for the
given research query.

MODE: {mode === "deep" ? "Academic/In-depth" : mode === "corpus" ? "Scientific Literature" : "Professional Research"}

{modeInstructions[mode]}

{searchTerms.length > 0 ? `Optimized search terms: ${searchTerms.join(", ")}` : ""}

REQUIREMENTS FOR EACH SOURCE:
- "title": A specific, descriptive title
- "url": A realistic, well-formed URL from a real domain
- "snippet": A detailed 2-4 sentence excerpt with SUBSTANTIVE information
- "domain": The domain name only

SOURCE DIVERSITY REQUIREMENTS:
- Include at least 2 different source types
- No more than 2 results from the same domain
- Each snippet should cover a DIFFERENT aspect
- Snippets must contain SPECIFIC information — not vague summaries

Return ONLY a valid JSON array of exactly ${maxResults} objects.
```

#### A2.13 Query Router System Prompt (Full)
```
You are a query classifier. Classify the user's query into exactly one category:

"simple" — for:
- Casual conversation / greetings (hi, hello, how are you, thanks)
- Very short factual questions answerable in 1-2 sentences
- Questions about basic definitions or simple concepts
- Opinion requests, jokes, or personal questions to an AI
- Quick calculations or unit conversions
- Questions with an obvious, immediate answer

"research" — for:
- Requests for comprehensive reports, analysis, or deep dives
- Multi-faceted questions requiring multiple sources
- Technical research, academic topics, or industry analysis
- Comparisons, trend analysis, or market research
- Questions explicitly asking for a "report", "summary", "analysis"
- Coding help, code generation, debugging requests
- Questions about recent events, current data, or statistics

Return ONLY a JSON object:
{"complexity":"simple"|"research","reason":"one sentence","confidence":0.0-1.0}
No other text.
```

---

### A3. SECTION MODEL MAP (Complete — lib/engine/config/model-config.ts)

```typescript
export const SECTION_MODEL_MAP: Record<string, SectionModelEntry> = {
  queryIntelligence: {
    primary:  { platform: "nvidia",     modelId: "mistralai/mistral-large-3-675b-instruct-2512" },
    fallback: { platform: "openrouter", modelId: "openai/gpt-oss-120b:free" },
    defaultMaxTokens: 16384,
  },
  webSearch: {
    primary:  { platform: "nvidia",     modelId: "abacusai/dracarys-llama-3.1-70b-instruct" },
    fallback: { platform: "openrouter", modelId: "meta-llama/llama-3.3-70b-instruct:free" },
    defaultMaxTokens: 16384,
  },
  financialAnalysis: {
    primary:  { platform: "nvidia",     modelId: "deepseek-ai/deepseek-v3.2" },
    fallback: { platform: "openrouter", modelId: "openai/gpt-oss-120b:free" },
    defaultMaxTokens: 16384,
  },
  marketResearch: {
    primary:  { platform: "nvidia",     modelId: "z-ai/glm4.7" },
    fallback: { platform: "openrouter", modelId: "nvidia/nemotron-3-super-120b-a12b:free" },
    defaultMaxTokens: 16384,
  },
  riskAnalysis: {
    primary:  { platform: "nvidia",     modelId: "moonshotai/kimi-k2-thinking" },
    fallback: { platform: "openrouter", modelId: "openai/gpt-oss-120b:free" },
    defaultMaxTokens: 16384,
  },
  technicalAnalysis: {
    primary:  { platform: "nvidia",     modelId: "deepseek-ai/deepseek-v3.2" },
    fallback: { platform: "openrouter", modelId: "openai/gpt-oss-120b:free" },
    defaultMaxTokens: 16384,
  },
  codeGeneration: {
    primary:  { platform: "nvidia",     modelId: "qwen/qwen3-coder-480b-a35b-instruct" },
    fallback: { platform: "openrouter", modelId: "qwen/qwen3-coder:free" },
    defaultMaxTokens: 32768,
  },
  factChecking: {
    primary:  { platform: "nvidia",     modelId: "moonshotai/kimi-k2-thinking" },
    fallback: { platform: "openrouter", modelId: "openai/gpt-oss-120b:free" },
    defaultMaxTokens: 16384,
  },
  summarization: {
    primary:  { platform: "nvidia",     modelId: "minimaxai/minimax-m2.7" },
    fallback: { platform: "openrouter", modelId: "z-ai/glm-4.5-air:free" },
    defaultMaxTokens: 16384,
  },
  reportSynthesis: {
    primary:  { platform: "nvidia",     modelId: "nvidia/nemotron-3-super-120b-a12b" },
    fallback: { platform: "openrouter", modelId: "nvidia/nemotron-3-super-120b-a12b:free" },
    defaultMaxTokens: 32768,
  },
};
```

### TASK_TYPE_TO_SECTION Mapping
```typescript
export const TASK_TYPE_TO_SECTION: Record<SectionTaskType, keyof typeof SECTION_MODEL_MAP> = {
  web_search:         "webSearch",
  deep_reasoning:     "riskAnalysis",
  code_generation:    "codeGeneration",
  fast_summary:       "summarization",
  financial_analysis: "financialAnalysis",
  report_compilation: "reportSynthesis",
  fact_checking:      "factChecking",
  balanced_research:  "marketResearch",
};
```

### PRIORITY_TOKEN_BUDGET
```typescript
export const PRIORITY_TOKEN_BUDGET: Record<string, number> = {
  high:   16384,
  medium: 12288,
  low:    8192,
};
```

### QUERY_OVERRIDE_RULES (All 4)
```typescript
export const QUERY_OVERRIDE_RULES: QueryOverrideRule[] = [
  {
    pattern: /\b(code|function|algorithm|script|implement|debug|program|api)\b/i,
    forcedTaskType: "code_generation",
    sectionKey: "codeGeneration",
  },
  {
    pattern: /\b(invest|stock|revenue|profit|valuation|earnings|dividend|market\s*cap|ipo|fund)\b/i,
    forcedTaskType: "financial_analysis",
    sectionKey: "financialAnalysis",
  },
  {
    pattern: /\b(compare|vs\.?|versus|difference|benchmark|head[\s-]?to[\s-]?head)\b/i,
    forcedTaskType: "balanced_research",
    sectionKey: "marketResearch",
  },
  {
    pattern: /\b(why|explain|reason|cause|how\s+does|mechanism|principle)\b/i,
    forcedTaskType: "deep_reasoning",
    sectionKey: "riskAnalysis",
  },
];
```

---

### A4. AGENT ROLE CLASSIFICATION (Complete)

#### A4.1 ROLE_KEYWORDS (model-selector-agent.ts)
```typescript
const ROLE_KEYWORDS: [RegExp, SectionTaskType][] = [
  [/\b(search|web|scraping|crawl|source[\s-]?gather)\b/i,                    "web_search"],
  [/\b(financ|revenue|profit|valuation|earning|market\s*cap|investment)\b/i,  "financial_analysis"],
  [/\b(code|develop|program|implement|algorithm|engineer|debug|software)\b/i, "code_generation"],
  [/\b(risk|threat|vulnerabilit|security|compliance|audit)\b/i,              "deep_reasoning"],
  [/\b(fact[\s-]?check|verify|valid|accuracy|claim|reliab)\b/i,              "fact_checking"],
  [/\b(summar|brief|overview|executive|digest|synopsis|highlight)\b/i,       "fast_summary"],
  [/\b(report|synthes|compil|aggregate|final[\s-]?document)\b/i,             "report_compilation"],
  [/\b(reason|think|analy[sz]|deep[\s-]?dive|investigat|root[\s-]?cause)\b/i,"deep_reasoning"],
  [/\b(market|trend|forecast|competitive|landscape|industry|sector)\b/i,     "balanced_research"],
  [/\b(technic|architect|infrastructure|system[\s-]?design|stack|framework)\b/i,"deep_reasoning"],
];
```

#### A4.2 mapAgentRoleToChainKey() (section-research-agent.ts)
```typescript
function mapAgentRoleToChainKey(agentRole: string): keyof typeof AGENT_FALLBACK_CHAINS {
  const role = agentRole.toLowerCase();

  if (role.includes("financial") || role.includes("valuation") ||
      role.includes("revenue") || role.includes("investment") ||
      role.includes("earning") || role.includes("profit"))
    return "financialAnalysis";

  if (role.includes("market") || role.includes("forecast") ||
      role.includes("consumer") || role.includes("demand") ||
      role.includes("competit") || role.includes("landscape") ||
      role.includes("benchmark") || role.includes("industry"))
    return "marketResearch";

  if (role.includes("risk") || role.includes("threat") ||
      role.includes("regulat") || role.includes("policy") ||
      role.includes("compliance") || role.includes("esg") ||
      role.includes("sustainab") || role.includes("supply chain"))
    return "riskAnalysis";

  if (role.includes("tech") || role.includes("engineer") ||
      role.includes("architect") || role.includes("battery") ||
      role.includes("infrastructure") || role.includes("platform"))
    return "technicalAnalysis";

  if (role.includes("code") || role.includes("coding") ||
      role.includes("developer") || role.includes("software") ||
      role.includes("programming"))
    return "codeGeneration";

  if (role.includes("fact") || role.includes("verify") ||
      role.includes("check") || role.includes("validate"))
    return "factChecking";

  if (role.includes("summar") || role.includes("overview") ||
      role.includes("brief"))
    return "summarization";

  if (role.includes("report") || role.includes("compil") ||
      role.includes("synthesis") || role.includes("editor"))
    return "reportSynthesis";

  if (role.includes("search") || role.includes("web") ||
      role.includes("source") || role.includes("retriev"))
    return "webSearch";

  return "webSearch";  // Default — never fail
}
```

---

### A5. NVIDIA HEALTH CHECK (Complete)

```typescript
const HEALTH_CHECK_TIMEOUT_MS = 4000;
const HEALTH_CACHE_TTL_MS = 60_000;  // 1 minute

let _nvidiaHealthy: boolean | null = null;
let _lastCheckMs = 0;

async function checkNvidiaHealth(apiKey: string | undefined): Promise<boolean> {
  if (!apiKey) return false;

  const now = Date.now();
  if (_nvidiaHealthy !== null && now - _lastCheckMs < HEALTH_CACHE_TTL_MS) {
    return _nvidiaHealthy;  // Use cached result
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS);

    const res = await fetch(`${NVIDIA_BASE_URL}/models`, {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
    });

    clearTimeout(timer);
    _nvidiaHealthy = res.ok;
  } catch {
    _nvidiaHealthy = false;
  }

  _lastCheckMs = Date.now();
  return _nvidiaHealthy;
}

// If NVIDIA down, swap primary ↔ fallback for all NVIDIA-primary assignments
function swapToFallback(assignment: AgentModelAssignment): AgentModelAssignment {
  return {
    ...assignment,
    primaryModel: assignment.fallbackModel,
    fallbackModel: assignment.primaryModel,
  };
}

// In selectModelsForPlan():
const healthy = await checkNvidiaHealth(nvidiaApiKey);
if (!healthy) {
  return assignments.map(a =>
    a.primaryModel.platform === "nvidia" ? swapToFallback(a) : a
  );
}
```

---

### A6. OPENROUTER 429 ROTATION (Complete)

```typescript
const FREE_MODEL_ROTATION = [
  "z-ai/glm-4.5-air:free",
  "google/gemma-4-31b-it:free",
  "minimax/minimax-m2.5:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "openai/gpt-oss-120b:free",
];

// In openrouterWithRetry():
// When primary model returns 429:
// 1. Get alternates: FREE_MODEL_ROTATION.filter(m => m !== currentModel)
// 2. For each alternate:
//    a. Try the alternate model
//    b. If success → return immediately
//    c. If fails with non-429 → break (stop trying more)
//    d. If fails with 429 → continue to next alternate
// 3. If all alternates exhausted → throw last error
```

---

### A7. CONTEXT BUILDER INTERNALS (Complete)

#### A7.1 Token Estimation
```typescript
function estimateTokens(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.ceil(words * 1.3);  // TOKEN_LIMITS.wordsToTokenRatio
}
```

#### A7.2 Chunking Algorithm
```typescript
function chunkText(text: string, maxWords: number = 500): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(" "));
  }
  return chunks;
}
```

#### A7.3 Chunk Scoring (Keyword Frequency)
```typescript
function scoreChunk(chunk: string, query: string): number {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  const chunkLower = chunk.toLowerCase();
  let score = 0;
  for (const term of queryTerms) {
    const regex = new RegExp(term, "gi");
    const matches = chunkLower.match(regex);
    if (matches) score += matches.length;  // Count occurrences
  }
  return score;
}
```

#### A7.4 Token Budget Allocation
```
Total token budget: 131,072 tokens (contextWindow)
  ├─ Files: up to 70% = 91,750 tokens
  │   └─ Sorted by scoreChunk() (highest relevance first)
  └─ Web results: remaining 30% = 39,322 tokens
      └─ Sorted by relevanceScore (descending), then snippet length
```

---

### A8. REPORT ASSEMBLER DETAILS (Complete)

#### A8.1 buildOverview() Structure
```
### Executive Summary
{summary.overview || generated fallback text}

### Key Findings At A Glance
- {summary.key_points[0-5]}

### Source-Supported Facts
- {summary.quick_facts[0-5] || fact.verified_claims[0-3]}

### Research Methodology & Scope
"This report was produced through a multi-agent research pipeline..."
"The working context included {sources.length} retrieved sources,
 {subtopics.length} research subtopics, and {fileNames}."

### Reliability & Confidence Statement
"The current reliability signal is {fact.reliability_label} with a
 score of {fact.reliability_score} / 100."
```

#### A8.2 buildDetails() 8-Chapter Structure
```
### Chapter 1: Foundational Context & Background
{context.enhanced_query}
Priority Subtopics: {query.subtopics bullets}
Core Concepts: {query.key_concepts[0-9] bullets}

### Chapter 2: Evidence Base & Source Inventory
Source list with titles, URLs, domains, snippets
Quick Facts: {summary.quick_facts bullets}

### Chapter 3: Technical / Mechanistic Deep Dive
{analysis.analysis}

### Chapter 4: Patterns, Trends & Comparative Findings
Cross-Source Patterns: {analysis.patterns bullets}
Comparative Analysis: {analysis.comparison text}

### Chapter 5: Verification, Contradictions & Evidence Quality
{fact.fact_check_summary}
Verified Claims: {fact.verified_claims bullets}
Unverified Claims: {fact.unverified_claims bullets}
Contradictions: {fact.contradictions bullets}

### Chapter 6: Risk Assessment & Caveats
Analytical Caveats: {analysis.caveats bullets}
Fact-Check Warnings: {fact.warnings bullets}

### Chapter 7: Operational Recommendations
{summary.action_items numbered list}

### Chapter 8: Technical Implementation Notes OR Future Outlook
If coding.code exists: {coding.explanation + usage_example + alternatives}
Else: Generated strategic roadmap text
```

#### A8.3 shouldUseAssembledReport() Thresholds
```typescript
export function shouldUseAssembledReport(reportOutput: unknown): boolean {
  if (wordCount(overview) < 250) return true;    // Overview too short
  if (wordCount(details) < 1000) return true;     // Details too short
  if (key_insights.length < 6) return true;        // Not enough insights
  if (wordCount(conclusion) < 120) return true;    // Conclusion too short
  return false;  // Report agent output is good enough
}
```

---

### A9. PLANNING WORKFLOW DETAILS (Complete)

#### A9.1 Planning System Prompt
```
You are **ResAgent Planning Mode** — an expert strategic research planner.

Your role is to collaborate with the user to craft a precise, high-impact
research plan before deploying the multi-agent research pipeline.

# PLANNING STRATEGY
1. Understand the Goal
2. Ask Smart Questions (Scope, Depth, Audience, Constraints)
3. Build the Plan Iteratively
4. Propose a Final Plan

# RESPONSE BEHAVIOR
- If vague: Ask 2-3 clarifying questions. Do NOT create plan yet.
- If clear: Create plan directly.
- If user answers: Refine and present updated plan.
- Always end with call-to-action.

# PLAN FORMAT
### Research Objective
### Research Roadmap
### Methodology & Sources
### Key Assumptions
### Ready to Research?
```

#### A9.2 Transition Detection
```typescript
const beginPatterns = [
  /\b(start|begin|proceed|continue|go ahead|move forward)\b.*\b(research|analysis)\b/i,
  /\b(now|okay|ok|alright|fine)\b.*\b(research|analyze|do it)\b/i,
  /\b(research|analyze|investigate)\b.*\b(this|it|topic)\b/i,
  /\bgo ahead\b/i, /\bdo the research\b/i, /\bstart researching\b/i,
];

const stayPatterns = [
  /\b(plan|planning|outline|brainstorm|scope|clarify|refine)\b/i,
  /\bwhat should\b/i, /\bhow should we\b/i, /\bbefore we research\b/i,
];
```

#### A9.3 Provider Priority
```
1. NVIDIA (Kimi K2 Thinking) — primary
2. OpenRouter (GPT-OSS 120B Free) — fallback
```

---

### A10. HOOKS DETAILS (hooks/use-cache.ts)

#### A10.1 Hash Algorithm
```typescript
function hashKey(query: string, workflowMode: WorkflowMode, mode: SearchMode, model: string): string {
  const raw = `${query.trim().toLowerCase()}|${workflowMode}|${mode}|${model}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
  }
  return "resagent_cache_" + Math.abs(hash).toString(36);
}
```

#### A10.2 Cache Entry Structure
```typescript
interface CacheEntry {
  result: ResearchResult;
  timestamp: number;
  query: string;
  workflowMode: WorkflowMode;
  mode: SearchMode;
}
```

#### A10.3 History Entry Structure
```typescript
interface HistoryEntry {
  id: string;           // Date.now().toString(36)
  query: string;
  workflowMode: WorkflowMode;
  mode: SearchMode;
  timestamp: number;
  model: string;
}
```

#### A10.4 History Dedup Logic
```typescript
// Remove existing entry with same query (case-insensitive)
const filtered = history.filter(
  h => h.query.toLowerCase() !== entry.query.toLowerCase()
);
filtered.unshift(entry);  // Add to front
localStorage.setItem("resagent_history", JSON.stringify(filtered.slice(0, 50)));
```

---

### A11. FILE PARSER DETAILS (lib/engine/file-parser.ts)

#### A11.1 Supported Extensions
```typescript
const SUPPORTED = {
  pdf: parsePDF,           // pdfjs-dist
  doc: parseWord,          // mammoth
  docx: parseWord,         // mammoth
  csv: parseCSV,           // papaparse
  txt: parseText,          // File.text()
  md: parseText,           // File.text()
  json: parseText,         // File.text()
  png: parseImageOCR,      // tesseract.js
  jpg: parseImageOCR,      // tesseract.js
  jpeg: parseImageOCR,     // tesseract.js
};
```

#### A11.2 PDF Worker Setup
```typescript
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
```

#### A11.3 OCR Configuration
```typescript
const result = await Tesseract.recognize(url, 'eng', {
  logger: (m) => console.log(m)  // Progress logging
});
```

---

### A12. COMPONENT PROPS (All Interfaces)

#### A12.1 SearchInputProps
```typescript
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (files: ParsedFile[]) => void;
  isLoading: boolean;
  workflowMode?: WorkflowMode;
}
```

#### A12.2 SearchControlsProps
```typescript
interface SearchControlsProps {
  workflowMode: WorkflowMode;
  onWorkflowModeChange: (mode: WorkflowMode) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  disabledAgents: AgentName[];
  onToggleAgent: (agent: AgentName) => void;
  onSetDisabledAgents: (agents: AgentName[]) => void;
}
```

#### A12.3 ResponseAreaProps
```typescript
interface ResponseAreaProps {
  sections: ResponseSection[];
  isStreaming: boolean;
}
```

---

### A13. SSE WIRE FORMAT (Exact)

#### A13.1 Backend Format (route.ts sendSSE)
```
event: {eventName}\n
data: {JSON.stringify(data)}\n\n
```

#### A13.2 Event Name Derivation
```typescript
const event = eventName || (
  type === 'agent_update' ? 'agent_status' :
  type === 'plan_ready' ? 'status' :
  type === 'models_assigned' ? 'status' :
  type === 'phase_complete' ? 'status' :
  type === 'complete' ? 'done' :
  type === 'error' ? 'error' :
  type === 'warning' ? 'status' :
  type === 'result' ? 'result' :
  'status'
);
```

#### A13.3 Frontend Parsing (page.tsx readStream)
```
For each line:
  If starts with "event: " → set currentEvent
  If starts with "data: " → parse JSON, route by currentEvent:
    "status"         → onStatus(parsed.phase, parsed.message)
    "token"          → onToken(parsed.text)
    "result"         → onResult(parsed)
    "error"          → onError(parsed.message)
    "done"           → onDone()
    "agent_status"   → onAgentStatus(parsed)
    "route_decision" → onRouteDecision(parsed)
    "workflow_mode"  → onWorkflowMode(parsed)
    "thinking"       → onThinking(parsed)
```

---

### A14. COMPLETE CONFIGURATION VALUES

#### A14.1 API Endpoints
```typescript
NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1"
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
```

#### A14.2 Retry Config
```typescript
RETRY_CONFIG = { maxRetries: 1, baseDelayMs: 500, maxDelayMs: 2000 }
```

#### A14.3 All Timeouts
```
PRIMARY_TIMEOUT_MS = 90_000      (90s — per model call)
FALLBACK_RACE_MS = 45_000        (45s — start fallback race)
REPORT_TIMEOUT_MS = 180_000      (3min — report agent)
AGENT_TIMEOUT_MS = 150_000       (150s — per section agent)
SEARCH_QUERY_TIMEOUT_MS = 20_000 (20s — per search query)
DEFAULT_TIMEOUT_MS = 90_000      (90s — API default)
HEALTH_CHECK_TIMEOUT_MS = 4_000  (4s — NVIDIA health ping)
STAGGER_DELAY_MS = 200           (200ms — between agent launches)
HEALTH_CACHE_TTL_MS = 60_000     (1min — health check cache)
MAX_CACHE_AGE_MS = 1_800_000     (30min — client cache TTL)
```

#### A14.4 Token Limits
```typescript
TOKEN_LIMITS = {
  contextWindow: 131072,        // 128K
  maxResponseTokens: 32768,     // 32K
  agentMaxTokens: 16384,        // 16K
  reportMaxTokens: 32768,       // 32K
  wordsToTokenRatio: 1.3,
}
```

#### A14.5 Mode Config
```typescript
MODE_CONFIG = {
  corpus: { maxSources: 0, description: "Pure AI knowledge. No web search." },
  deep:   { maxSources: 4, description: "Moderate web research + AI analysis." },
  pro:    { maxSources: 8, description: "Comprehensive deep research." },
}
```

---

### A15. DATA TRANSFORMATION PIPELINE (Visual)

```
User Query (string)
    │
    ▼
classifyQuery() ──→ "simple" ──→ Direct LLM response
    │
    ▼ "research"
runQueryIntelligenceAgent()
    │
    ▼ ResearchPlan
selectModelsForPlan()
    │
    ▼ AgentModelAssignment[]
    │
    ├─── Section 1 ──→ searchWithFallback() ──→ SearchResult[]
    │                   buildSearchContext() ──→ string
    │                   executeWithFallback() ──→ SectionResult
    │
    ├─── Section 2 ──→ (same pipeline)
    │
    ├─── Section 3 ──→ (same pipeline)
    │
    ├─── ... (6-8 sections in parallel)
    │
    ▼ All SectionResult[]
runReportSynthesisAgent()
    │
    ▼ FinalReport
Convert to ResearchResult
    │
    ▼ SSE "result" event
Frontend toResponseSections()
    │
    ▼ ResponseSection[]
ReactMarkdown renders
```

---

*End of complete expanded context document.*
