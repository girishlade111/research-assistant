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
