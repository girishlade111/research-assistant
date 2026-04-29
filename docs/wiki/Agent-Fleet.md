# 🤖 Agent Fleet

> Complete reference for all specialized AI agents in the ResAgent pipeline — their purpose, models, inputs, outputs, and failure behavior.

---

## Overview

ResAgent deploys a **7-agent specialized fleet**. Each agent is independently sandboxed, receives a typed `AgentContext`, and communicates exclusively via its return value — no shared mutable state.

All agents follow this lifecycle:

```
Receive AgentContext
    → Select primary model (NIM) or fallback (OpenRouter)
    → Execute with 150s timeout ceiling
    → Return typed result OR graceful partial result on failure
```

---

## Agent Registry

| # | Agent | Primary Model (NIM) | Fallback (OpenRouter) | Phase |
| :- | :--- | :--- | :--- | :--- |
| 1 | **Query Intelligence** | `mistral-large-3` | `gpt-oss-120b:free` | Phase 1 |
| 2 | **Model Selector** | *(heuristic + health check)* | — | Phase 1 |
| 3 | **Web Search** | `dracarys-70b` | `llama-3.3-70b:free` | Phase 2 |
| 4 | **Strategic Analysis** | `nemotron-3-super` | `gpt-oss-120b:free` | Phase 2 |
| 5 | **Fact-Check** | `mistral-large-3` | `gpt-oss-120b:free` | Phase 2 |
| 6 | **Code Generation** | `qwen3-coder-480b` | `qwen3-coder:free` | Phase 2 |
| 7 | **Summarization** | `minimax-m2.7` | `glm-4.5-air:free` | Phase 2 |
| 8 | **Report Synthesis** | `nemotron-3-super` | `nemotron-3:free` | Phase 3 |

---

## Agent Details

### 1. 🧠 Query Intelligence Agent

**File:** `lib/engine/agents/query-intelligence-agent.ts`

**Purpose:** Transforms the raw user query into a structured **Research Blueprint** that drives the entire pipeline.

**Inputs:**
- Raw user query string
- Research mode (`corpus` | `deep` | `pro`)
- Uploaded file metadata

**Outputs:**
```typescript
{
  dynamicSections: ResearchSection[];   // Per-section research tasks
  researchType: string;                 // e.g., "financial", "technical"
  globalSearchContext: string;          // Refined query for web search
  reportTitle: string;                  // Auto-generated report title
  estimatedPages: number;              // Estimated report length
}
```

**Notes:** This is the only Phase 1 agent that calls an LLM. Its output gates all subsequent agents.

---

### 2. ⚖️ Model Selector Agent

**File:** `lib/engine/agents/model-selector-agent.ts`

**Purpose:** Assigns the optimal AI model to each research section based on task type and live infrastructure health.

**Task Types Classified:**
`web_search` · `financial_analysis` · `deep_reasoning` · `code_generation` · `fact_check` · `summarization` · `analysis` · `report`

**Health Check:**
- Pings NVIDIA NIM health endpoint
- 4-second timeout
- If unhealthy → all sections switch to OpenRouter before any agent launches

**Outputs:**
```typescript
ModelAssignment[] // { sectionId, primaryModel, fallbackModel, maxTokens }
```

---

### 3. 🌐 Web Search Agent

**File:** `lib/engine/agents/web-search-agent.ts`

**Purpose:** Executes targeted web searches using the Perplexity Sonar API and returns structured, deduplicated source citations.

**Search Strategy:**
- Uses `globalSearchContext` (from Query Intelligence) not the raw user query
- Fires concurrent requests per section in `deep` and `pro` modes
- `corpus` mode: web search is skipped entirely

**Source Limits:**
| Mode | Web Sources |
| :--- | :--- |
| Corpus | 0 |
| Deep | 4 |
| Pro | 8+ |

**Outputs:**
```typescript
WebResult[] // { url, title, snippet, relevanceScore }
```

---

### 4. 📊 Strategic Analysis Agent

**File:** `lib/engine/agents/analysis-agent.ts`

**Purpose:** Performs pattern recognition, trend correlation, and multi-source synthesis across search results and uploaded files.

**Capabilities:**
- Cross-document correlation
- Temporal trend analysis
- Risk/opportunity identification
- Comparative benchmarking

**Context:** Receives full `AgentContext` including web results + file chunks + research blueprint.

---

### 5. ✅ Fact-Check Agent

**File:** `lib/engine/agents/fact-check-agent.ts`

**Purpose:** Verifies factual claims in the research sections against retrieved sources. Flags unsupported or contradicted statements.

**Output includes:**
- Claim-by-claim verification status (`verified` | `unverified` | `contradicted`)
- Source citations for each verified claim
- Confidence score per section

---

### 6. 💻 Code Generation Agent

**File:** `lib/engine/agents/coding-agent.ts`

**Purpose:** Generates production-ready technical code snippets, algorithms, or system designs relevant to the research query.

**Automatically activated when:**
- Query contains programming keywords
- Research type is `technical` or `software`
- User explicitly enables the Coding Agent toggle in the UI

**Model:** `qwen3-coder-480b` (480B parameter code-specialist model)

---

### 7. 📝 Summarization Agent

**File:** `lib/engine/agents/summary-agent.ts`

**Purpose:** Produces high-speed, concise overviews of each research section before deep analysis completes — enabling early streaming to the UI.

**Characteristics:**
- Fastest agent in the fleet (optimized for low latency)
- Output is used as the initial "skeleton" of the report while other agents finish
- Progressively replaced by detailed analysis in the final report

---

### 8. 📋 Report Synthesis Agent

**File:** `lib/engine/agents/report-synthesis-agent.ts`

**Purpose:** Assembles the final comprehensive research report from all agent outputs. Acts as the quality-control layer.

**Report Structure Produced:**
```markdown
# [Auto-generated Title]

## Executive Summary
## [Dynamic Section 1]
## [Dynamic Section 2]
...
## Cross-Section Analysis
## Key Findings
## Conclusions
## Confidence Assessment
## References & Citations
```

**Model:** `nemotron-3-super` — optimized for long-form markdown generation.

---

## Shared Agent Primitives

### `AgentContext` (all agents receive this)

```typescript
interface AgentContext {
  userQuery: string;
  researchMode: 'corpus' | 'deep' | 'pro';
  researchPlan: ResearchPlan;
  webResults: WebResult[];
  fileChunks: FileChunk[];
  modelAssignments: ModelAssignment[];
  streamCallback: StreamCallback;  // For SSE progress updates
}
```

### Timeout & Graceful Degradation

```typescript
withGracefulTimeout(agentPromise, 150_000, sectionId)
// On timeout → returns partial result with { timedOut: true, content: '...' }
```

### Stagger Delay

All Phase 2 agents are launched with a **200ms stagger** to prevent simultaneous rate-limit spikes across providers.

---

## Enabling / Disabling Agents in the UI

Users can toggle individual agents via the **Agent Panel** in the ResAgent interface:

| Toggle | Effect |
| :--- | :--- |
| Web Search | Enable/disable Perplexity API calls |
| Coding Agent | Include/exclude code snippet generation |
| Fact-Check | Enable/disable claim verification |
| Deep Reasoning | Include/exclude `kimi-k2-thinking` analysis pass |

> **Note:** Query Intelligence, Model Selector, and Report Synthesis agents are always active and cannot be disabled.

---

*Next: [Research Modes →](Research-Modes)*
