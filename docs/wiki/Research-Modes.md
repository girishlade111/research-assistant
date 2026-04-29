# 🔬 Research Modes

> ResAgent supports three distinct interaction modes — **Chat**, **Plan**, and **Research**. Each is optimized for a different type of user intent.

---

## Mode Comparison

| Feature | Chat | Plan | Research |
| :--- | :---: | :---: | :---: |
| Simple Q&A | ✅ | ❌ | ❌ |
| Collaborative planning | ❌ | ✅ | ❌ |
| Multi-agent pipeline | ❌ | ❌ | ✅ |
| Web search | ❌ | ❌ | ✅ (Deep/Pro) |
| File analysis | ❌ | ❌ | ✅ |
| SSE streaming | ✅ | ✅ | ✅ |
| LLM calls | 1 | 1–3 | 7+ |

---

## Mode 1 — 💬 Chat Mode

Chat Mode is for **simple, conversational queries** that can be answered in 1–3 sentences without multi-source research.

### Query Router

`lib/engine/query-router.ts` classifies every incoming query before a mode is chosen:

```
User Query
    │
    ├── Heuristic Fast-Path (no API call)
    │       ├── Pattern matching (regex)
    │       ├── Query length analysis
    │       └── Keyword detection
    │
    └── AI Classifier (uncertain queries only)
            ├── Primary: meta-llama/llama-3.3-70b-instruct:free (OpenRouter)
            └── Fallback: minimaxai/minimax-m2.7 (NVIDIA NIM)
```

**Classification output:**
```typescript
{
  complexity: 'simple' | 'research';
  reason: string;
  confidence: number; // 0.0 – 1.0
}
```

### Heuristic Rules

| Category | Examples | Classified As |
| :--- | :--- | :--- |
| Greetings | "hi", "hello", "thanks" | `simple` |
| Definitions | "what is X" (< 6 words) | `simple` |
| Quick facts | "capital of France" | `simple` |
| Reports / Analysis | "analyze the impact of X" | `research` |
| Comparisons | "compare X vs Y with examples" | `research` |
| Technical Research | "how does X architecture work" | `research` |

### Chat Response Flow

```
simple query → runPlanningChat() → Direct LLM call (no agents)
                                 → Streamed response via SSE
```

---

## Mode 2 — 🗺️ Plan Mode

Plan Mode enables **collaborative research planning**. The AI asks clarifying questions, iterates with the user, and produces a structured Research Roadmap before any agents launch.

### Planning Workflow

`lib/engine/planning-workflow.ts`

```
User Input
    │
    ├── runPlanningChat()          ← Generates clarifying questions
    │       ├── conversation history maintained across turns
    │       └── Streams response via SSE
    │
    ├── detectPlanningTransition() ← Has user said "let's start"?
    │       ├── Heuristic: keyword detection
    │       │       "start", "proceed", "go ahead", "ok", "continue"
    │       └── AI fallback (for ambiguous phrasing)
    │
    └── Plan Ready → User confirms → Switch to Research Mode
```

### Transition Detection

```typescript
// lib/engine/planning-workflow.ts
heuristicTransition(query) → { shouldBeginResearch: boolean, reason, confidence }
    └── if null → AI classifier fallback
```

### Research Roadmap Format

When the plan is finalized, the AI produces this structured output:

```markdown
### Research Objective
[Clear statement of what will be investigated]

### Research Roadmap
1. [Subtopic 1] — [Why it matters]
2. [Subtopic 2] — [Why it matters]
...

### Methodology & Sources
[Source types: academic, news, technical docs, etc.]

### Key Assumptions
[Any scope constraints or open questions]

### Ready to Research?
[CTA — asks user to confirm before launching agents]
```

---

## Mode 3 — 🔬 Research Mode (Main Pipeline)

Research Mode activates the **full 7-agent orchestrated pipeline** and delivers a comprehensive, citation-rich report.

### Research Tiers

| Tier | Web Sources | File Analysis | Deep Reasoning | Best For |
| :--- | :---: | :---: | :---: | :--- |
| **Corpus** | 0 | ✅ | ❌ | Internal document analysis |
| **Deep** | 4 | ✅ | ✅ | Mixed research with external sources |
| **Pro** | 8+ | ✅ | ✅ | Exhaustive multi-source research |

### File Upload

All three Research tiers support file uploads. Supported formats:

| Format | Library | Notes |
| :--- | :--- | :--- |
| PDF | `pdfjs-dist` | High-fidelity text + layout extraction |
| DOCX | `mammoth` | Semantic HTML conversion |
| CSV | `PapaParse` | Stream parsing for large datasets |
| Image (PNG/JPG) | `Tesseract.js` | WASM OCR for scanned documents |

Uploaded content receives **70% of the context window budget**, prioritizing your local data over web results.

### Pipeline Execution

See [Architecture](Architecture) for the full 3-phase flow.

### Selecting Specialized Agents

In Research Mode, the **Agent Panel** lets you customize which specialized agents run:

| Agent Toggle | Use When |
| :--- | :--- |
| 🌐 Web Search | You want real-time external data |
| 💻 Coding Agent | Your query is technical or involves code |
| ✅ Fact-Check | You need verified, citation-backed claims |
| 🧠 Deep Reasoning | Complex multi-step logic is required |
| 📝 Summarization | You want a fast overview before deep analysis |

### Report Export

Once the report is generated, you can export it:

| Format | Library | Notes |
| :--- | :--- | :--- |
| **Markdown (.md)** | Native | Full markdown with citations |
| **PDF (.pdf)** | `jspdf` + `jspdf-autotable` | Formatted PDF with tables |
| **Visual Snapshot** | `html-to-image` | PNG screenshot of the rendered report |

---

## Switching Modes

Use the **Mode Selector** in the top navigation bar to switch between Chat, Plan, and Research modes at any time. Conversation history is preserved within a session.

---

*Next: [Configuration →](Configuration)*
