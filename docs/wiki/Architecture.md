# 🏗️ Architecture

> A deep-dive into ResAgent's Control Plane vs. Data Plane design, orchestration workflow, and resilience mechanisms.

---

## 🧩 High-Level Overview

ResAgent uses a **three-layer architecture**:

| Layer | Role |
| :--- | :--- |
| **Presentation Layer** | React 19 UI with Zustand state and SSE consumer |
| **Service Gateway** | Next.js App Router API route with SHA-256 caching |
| **Orchestration Engine** | Multi-phase, multi-agent pipeline (`lib/engine/`) |

---

## 🗺️ Full Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│               PRESENTATION LAYER (React 19)             │
│  Main Chat UI  →  SSE Consumer  →  MD Renderer  →  UI  │
└───────────────────────┬─────────────────────────────────┘
                        │ POST /api/research
┌───────────────────────▼─────────────────────────────────┐
│               SERVICE GATEWAY (Next.js)                  │
│  SHA-256 Cache Check  →  SSE Stream Controller          │
└───────────────────────┬─────────────────────────────────┘
                        │
         ┌──────────────▼──────────────────────────┐
         │         CONTROL PLANE (Logic)            │
         │  Query Intel Agent → Research Blueprint  │
         │  Model Selector → NIM Health Check       │
         └──────────────┬──────────────────────────┘
                        │
    ┌───────────────────▼──────────────────────────────┐
    │           DATA PLANE (Parallel Fleet)             │
    │  Analysis  Coding  Fact-Check  Summary  Web Srch  │
    └───────────────────┬──────────────────────────────┘
                        │
       ┌────────────────▼────────────────────────┐
       │         GROUNDING LAYER (RAG)            │
       │  Web Search  File Parser  Semantic Score │
       └────────────────┬────────────────────────┘
                        │
      ┌─────────────────▼────────────────────────┐
      │        RESILIENCE LAYER (Auto-Fallback)   │
      │  Race Condition  →  NIM  -.→  OpenRouter  │
      └─────────────────┬────────────────────────┘
                        │
         ┌──────────────▼──────────────────────┐
         │       FINALIZATION LAYER             │
         │  Report Synthesis Agent → Export     │
         └──────────────┬──────────────────────┘
                        │
              SSE Stream → Client
```

---

## ⚙️ Three-Phase Execution Model

The orchestrator (`lib/engine/orchestrator.ts`) runs three sequential macro-phases:

### Phase 1 — Intelligence (Sequential)

```
User Query
    │
    ├── SHA-256 Cache Check (queryHash = hash(query + mode))
    │       └── Cache HIT → Return immediately
    │
    ├── Memory Fetch (userId → Supabase/Redis)
    │
    ├── Query Intelligence Agent
    │       └── Outputs: dynamicSections[], researchType,
    │                    globalSearchContext, reportTitle, estimatedPages
    │
    └── Model Selector Agent
            └── Assigns primaryModel + fallbackModel per section
```

### Phase 2 — Retrieval & Research (Parallel)

```
Promise.allSettled([
    Web Search Agent        ─ Perplexity Sonar API
    Analysis Agent          ─ Pattern recognition
    Fact-Check Agent        ─ Claim verification
    Coding Agent            ─ Technical snippets
    Summary Agent           ─ Overview generation
    Section Research Agents ─ Per-section deep dives
])

Each agent:
    ├── Receives AgentContext (search results + files + plan)
    ├── 200ms stagger delay (prevents rate-limit spikes)
    ├── 150,000ms timeout with graceful fallback
    └── NIM → OpenRouter automatic failover
```

### Phase 3 — Synthesis (Sequential)

```
Report Synthesis Agent
    ├── Executive Summary
    ├── Dynamic Research Sections (compiled from Phase 2)
    ├── Cross-Section Analysis
    ├── Key Findings
    ├── Conclusions
    └── Confidence Assessment
         │
         ▼
    SSE stream → Client (Markdown rendered progressively)
```

---

## 🛡️ Control Plane — Health-Aware Model Routing

`lib/engine/agents/model-selector-agent.ts` implements a **pre-emptive health plane**:

1. **Task Classification** — every research section is typed into 8 categories:
   `web_search`, `financial_analysis`, `deep_reasoning`, `code_generation`, `fact_check`, `summarization`, `analysis`, `report`

2. **NIM Health Ping** — a lightweight request hits the NVIDIA NIM health endpoint with a **4-second timeout**.
   - If NIM responds correctly → assign primary NIM models
   - If NIM is slow/down → swap all assignments to OpenRouter fallbacks *before agents launch*

3. **Race-Condition Fallback** — even during execution, if a primary call stalls, a concurrent OpenRouter request is fired and whichever resolves first wins.

---

## 🧱 Grounding Layer — Semantic Blackboard (RAG)

`lib/engine/context-builder.ts` ensures zero hallucinations:

| Step | Description |
| :--- | :--- |
| **Chunking** | Uploaded files and web results are split into semantic chunks |
| **Relevance Scoring** | Chunks are scored by keyword density + proximity to research query |
| **Deduplication** | Web results are deduplicated by URL |
| **Token Budgeting** | 70% budget → local files; 30% budget → web results |

---

## 📡 SSE Streaming Contract

The API route (`app/api/research/route.ts`) pushes real-time events:

| Event Type | Payload | When Sent |
| :--- | :--- | :--- |
| `plan_ready` | Research plan JSON | After Query Intelligence completes |
| `models_assigned` | Model assignments per section | After Model Selector completes |
| `agent_update` | `{ agentName, status, percent }` | Each agent checkpoint |
| `phase_complete` | `{ phase, duration }` | End of each macro-phase |
| `complete` | Full report markdown + metadata | Pipeline complete |
| `error` | `{ code, message, retryable }` | On recoverable/fatal errors |

---

## 📁 Key Source Files

| File | Purpose |
| :--- | :--- |
| `lib/engine/orchestrator.ts` | Main 3-phase pipeline runner |
| `lib/engine/agents/` | All specialized agent implementations |
| `lib/engine/config.ts` | Token limits, retry config, model registry |
| `lib/engine/types.ts` | Shared TypeScript interfaces |
| `lib/engine/context-builder.ts` | RAG / semantic scoring |
| `lib/engine/errors.ts` | Typed error classification |
| `lib/engine/model-router.ts` | NIM ↔ OpenRouter routing logic |
| `lib/engine/query-router.ts` | Chat vs. Research classification |
| `lib/engine/planning-workflow.ts` | Plan Mode collaborative flow |
| `app/api/research/route.ts` | Next.js SSE API endpoint |

---

*Next: [Agent Fleet →](Agent-Fleet)*
