# Skills

This document details the specialized skills and agent capabilities of the ResAgent multi-agent research system.

---

## Agent Fleet Overview

ResAgent uses a fleet of 7 specialized AI agents, each optimized for specific tasks. Agents run in parallel during the synthesis phase for maximum efficiency.

| # | Agent | Purpose | Primary Model | Fallback Model |
|---|-------|---------|--------------|---------------|
| 1 | **Query Intelligence** | Refines prompts & builds research plans | `kimi-k2-thinking` | `gpt-oss-120b:free` |
| 2 | **Web Search** | Real-time data retrieval | `dracarys-70b` | `llama-3.3-70b:free` |
| 3 | **Strategic Analysis** | Pattern recognition & correlation | `nemotron-3-super` | `nemotron-3:free` |
| 4 | **Fact-Check** | Verify claims against sources | `mistral-large-3` | `gpt-oss-120b:free` |
| 5 | **Coding** | Technical snippet generation | `qwen3-coder-480b` | `qwen3-coder:free` |
| 6 | **Summary** | Overview generation | `minimax-m2.7` | `glm-4.5-air:free` |
| 7 | **Report** | Final synthesis & quality control | `kimi-k2-thinking` | `gpt-oss-120b:free` |

---

## Task Types

Each agent is assigned a specific task type based on the research section requirements:

| Task Type | Description | Used By |
|----------|-------------|--------|
| `search` | Web search & data retrieval | Web Search Agent |
| `query` | Query refinement & planning | Query Intelligence Agent |
| `analysis` | Pattern recognition & correlation | Strategic Analysis Agent |
| `coding` | Technical snippet generation | Coding Agent |
| `summary` | High-speed overview | Summary Agent |
| `fact-check` | Verification against sources | Fact-Check Agent |
| `report` | Final markdown assembly | Report Agent |
| `default` | General purpose | Any agent |

---

## Intent Types

The system classifies user queries into intent types to route to appropriate agents:

| Intent | Description |
|--------|-------------|
| `coding` | Code generation, algorithms, technical implementation |
| `research` | In-depth research with sources |
| `comparison` | Comparing options, pros/cons |
| `explanation` | Understanding concepts |
| `factual` | Specific facts, dates, numbers |
| `general` | General conversation |

---

## Research Modes

ResAgent supports three research modes:

| Mode | Description | Sources |
|------|-------------|----------|
| **Corpus** | File-only research | User-uploaded PDFs, DOCX, Images |
| **Deep** | Files + targeted search | 4 web sources |
| **Pro** | Exhaustive research | 8+ web sources + deep reasoning |

---

## How It Works

### Three-Phase Execution:

1. **Intelligence Phase** - Query Intelligence Agent refines the query and creates a research blueprint with dynamic sections

2. **Retrieval Phase** - Concurrent execution:
   - Web search runs in parallel
   - File parsing (PDF/DOCX/OCR) runs concurrently
   - Results are chunked and scored for relevance

3. **Synthesis Phase** - Parallel agent execution:
   - All section agents work simultaneously
   - Results are aggregated
   - Report Synthesis Agent merges into final output

---

## Provider Architecture

### Primary: NVIDIA NIM
- High-performance inference
- 4ms health check timeout
- Automatic fallback on failure

### Fallback: OpenRouter
- Free-tier resilient models
- Used when primary fails or timeouts

---

## Reliability Features

| Feature | Description |
|--------|-------------|
| **Auto-Fallback** | If NVIDIA NIM fails, switches to OpenRouter automatically |
| **Concurrency** | Agents run in parallel via `Promise.all` |
| **Graceful Timeout** | 150s timeout per agent with partial results |
| **Token Budgeting** | 70% for local files, 30% for web results |
| **Semantic Grounding** | Content is scored for relevance before use |

---

## Token Limits

| Limit | Value | Description |
|-------|-------|-------------|
| **System Context** | 32,768 tokens | Global context window |
| **Max Report** | 16,384 tokens | Final report output |
| **Per Agent** | 8,192 tokens | Individual agent budget |
| **Health Check** | 4,000ms | Primary endpoint timeout |

---

## File Support

ResAgent can parse and process:

| File Type | Library | Purpose |
|----------|---------|---------|
| PDF | `pdfjs-dist` | High-fidelity text extraction |
| DOCX | `mammoth` | Semantic HTML conversion |
| CSV | `PapaParse` | Stream parsing |
| Images | `Tesseract.js` | OCR/WASM text extraction |

---

## Output Formats

Final reports can be exported as:

- **Markdown** (.md)
- **PDF** (via jspdf + autotable)