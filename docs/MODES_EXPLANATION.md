# ResAgent - Application Architecture & Working Logic

## Overview

ResAgent ek multi-agent research system hai jo **NVIDIA NIM** aur **OpenRouter** AI providers use karta hai. Yeh teen modes support karta hai: **Chat**, **Plan**, aur **Research**.

---

## Mode 1: Chat Mode

### Working Logic

Chat Mode simple queries ke liye use hota hai. Yeh query type detect karta hai aur accordingly response deta hai.

```
User Query → Query Classification → Response
```

### Query Classification (`query-router.ts`)

Yeh system query ko do categories mein divide karta hai:

| Complexity | Description | Examples |
|------------|-------------|-----------|
| **simple** | 1-2 sentences mein answer | greetings, definitions, quick questions |
| **research** | Multi-source analysis | reports, analysis, comparisons, technical research |

#### Classification Methods

1. **Heuristic Fast-Path** (no API call - instant):
   - Pattern matching - regex based detection
   - Query length analysis
   - Certain keywords detection

2. **AI Classifier** (uncertain cases ke liye):
   - Free model: `meta-llama/llama-3.3-70b-instruct:free` (OpenRouter)
   - Fallback: `minimaxai/minimax-m2.7` (NVIDIA)

#### Flow

```
query-router.ts:144-179

heuristicClassify(query)
    ↓ (null detect hone par)
classifyViaOpenRouter / classifyViaNvidia
    ↓
{ complexity, reason, confidence }
```

### Direct Response

Simple queries ke liye system seedha chat response deta hai `planning-workflow.ts` ke `runPlanningChat()` function se. Isme koi agents launch naankar direct LLM call hota hai.

---

## Mode 2: Plan Mode

### Working Logic

Plan Mode collaborative research planning ke liye hai. Users ke saath clarifying questions karta hai aur ek structured research plan banata hai.

### Workflow (`planning-workflow.ts`)

```
User Input → Clarifying Questions ←→ Plan Refinement → Ready to Research
```

### Key Functions

#### 1. `runPlanningChat()` (line 266)
- User ke query par planning conversation generate karta hai
- System prompt use karta hai jo Planning Mode behavior define karta hai
- conversation history maintain karta hai

#### 2. `detectPlanningTransition()` (line 227)
- Detect karta hai ki user research start karna chahta hai ya abhi bhi planning phase mein hai

**Transition Detection:**
- **Begin Research**: "start", "proceed", "go ahead", "ok", "continue with research"
- **Stay Planning**: questions about plan, more brainstorming

```typescript
planning-workflow.ts:156-180

heuristicTransition(query) → AI classifier (fallback)
    ↓
{ shouldBeginResearch: boolean, reason, confidence }
```

### Plan Structure

Jab plan ready hota hai, yeh format use karta hai:

```
### Research Objective
[Clear statement of investigation]

### Research Roadmap
1. [Subtopic] - [Description]
2. [Subtopic] - [Description]
...

### Methodology & Sources
[Source types and analysis approaches]

### Key Assumptions
[Any constraints]

### Ready to Research?
[CTA - user se poochta hai to start]
```

---

## Mode 3: Research Mode (Main Pipeline)

### Architecture - Three Phase System

Research Mode ek sophisticated multi-agent pipeline hai jo 3 phases mein kaam karta hai.

```
Phase 1: Initialization
    ├── Cache Check
    ├── Memory Fetch
    ├── Query Intelligence Agent (plan generation)
    └── Model Selection
    
Phase 2: Parallel Research (all agents simultaneously)
    ├── Web Search Agent
    ├── Analysis Agent  
    ├── Fact-Check Agent
    ├── Coding Agent
    ├── Summary Agent
    └── Section Research Agent
    
Phase 3: Report Synthesis
    ├── Compile Sections
    ├── Cross-Section Analysis
    └── Final Report Generation
```

### Detailed Pipeline (`orchestrator.ts`)

#### Phase 1: Initialization (lines 94-135)

**Step 1 - Cache Check:**
```typescript
queryHash = generateHash(userQuery + researchMode)
cachedReport = getCachedResponse(queryHash)
```
- SHA-256 hash of query
- Redis/Upstash check (currently mocked)

**Step 2 - Memory Fetch:**
```typescript
userMemory = buildMemoryContext(userId)
```
- Supabase + Redis fetch (currently mocked)
- User preferences retrieve karta hai

**Step 3 - Query Intelligence Agent:**
```
runQueryIntelligenceAgent()
    ↓
Generates Research Plan with:
    - dynamicSections[]
    - researchType
    - globalSearchContext
    - reportTitle
    - estimatedPages
```

**Step 4 - Model Selection:**
```
selectModelsForPlan(plan, userQuery, nvidiaKey)
    ↓
Assigns AI models to each section:
    - primaryModel
    - fallbackModel
    - maxTokens
```

#### Phase 2: Parallel Research (lines 136-228)

**All Agents Launch Simultaneously:**
```typescript
Promise.allSettle(agentPromises)

Each Agent has:
- 150 second timeout
- Graceful error handling
- 200ms stagger delay
```

**Agent Types:**

| Agent | Purpose | Primary Model |
|-------|---------|-------------|
| **Query Intelligence** | Refine query, build plan | `kimi-k2-thinking` |
| **Web Search** | Real-time data retrieval | `dracarys-70b` |
| **Strategic Analysis** | Pattern recognition | `nemotron-3-super` |
| **Fact-Check** | Verify claims | `mistral-large-3` |
| **Coding** | Code generation | `qwen3-coder-480b` |
| **Summary** | Overview generation | `minimax-m2.7` |
| **Report** | Final markdown assembly | `kimi-k2-thinking` |

#### Phase 3: Report Synthesis (lines 230-286)

```typescript
runReportSynthesisAgent()
    ↓
Compiles:
    - Executive Summary
    - Dynamic Sections
    - Cross-Section Analysis
    - Key Findings
    - Conclusions
    - Confidence Assessment
```

### Timeout & Error Handling

```typescript
withGracefulTimeout(promise, 150000ms, section)

If timeout:
    - Returns partial content with error flag
    - Logs timeout details
    - Continues with other sections
```

---

## Key Components

### System Integration

```
app/api/research/route.ts
    ↓
runResearchOrchestrator()
    ↓
Query Intelligence → Model Selection → Parallel Agents → Report Synthesis
```

### Providers

| Provider | Models | Purpose |
|---------|--------|---------|
| **NVIDIA NIM** | kimik2-thinking, nemotron, dracarys, minimax-m2.7 | Primary |
| **OpenRouter** | llama-3.3-70b-free, gpt-oss-120b | Fallback |

### Context Building (`context-builder.ts`)

Yeh component search results aur uploaded files ko context format mein convert karta hai:

1. **File Processing** - chunks, scores by relevance
2. **Web Results** - deduplication by URL
3. **Ranking** - relevance score + content richness
4. **Token Allocation** - 70% files, 30% web results

---

## API Flow Diagram

```
User Query
    │
    ▼
┌─────────────────────┐
│  POST /api/research  │
└─────────────────────┘
    │
    ├── Validate API Keys
    │
    ▼
┌────────────────────────────────────────┐
│  runResearchOrchestrator()            │
└────────────────────────────────────────┘
    │
    ├─▶ Phase 1: INIT (sequential)
    │    ├─ Cache Check
    │    ├─ Memory Fetch
    │    ├─ Query Intelligence
    │    └─ Model Selection
    │
    ├─▶ Phase 2: PARALLEL AGENTS
    │    │  (Promise.allSettle)
    │    ├─ Section Agent 1 (Web Search)
    │    ├─ Section Agent 2 (Analysis)
    │    ├─ Section Agent 3 (Fact-Check)
    │    ├─ Section Agent 4 (Coding)
    │    └─ Section Agent N (Research)
    │
    └─▶ Phase 3: SYNTHESIS (sequential)
         └─ Report Assembly
              │
              ▼
         SSE Response ←── Report + Metadata + Sources
```

---

## Technical Highlights

### Token Management

| Limit | Value |
|-------|-------|
| System Context | 32,768 tokens |
| Max Report | 16,384 tokens |
| Per-Agent Cap | 8,192 tokens |

### Fallback Chain

1. **NVIDIA NIM** (primary)
2. **OpenRouter** (free fallback)
3. **Timeout Recovery** - graceful degradation

### SSE Progress Updates

Client ko real-time progress milta hai:

```typescript
onProgress({ phase, percent, status, type })
```

Types:
- `plan_ready` - Research plan created
- `models_assigned` - AI models selected
- `agent_update` - Individual agent progress
- `phase_complete` - Phase finished
- `complete` - Full report ready

---

## Summary

| Mode | Type | Flow | Key Files |
|------|------|------|-----------|
| **Chat** | Simple Q&A | Query Router → Direct LLM | `query-router.ts`, `planning-workflow.ts` |
| **Plan** | Collaborative | Planning Chat → Transition Detection → User Approval | `planning-workflow.ts` |
| **Research** | Multi-Agent | Init → Parallel Agents → Synthesis → Report | `orchestrator.ts` |

ResAgent ka architecture modular hai jahan har agent ek specific role perform karta hai, aur parallel execution se speed optimization hota hai.