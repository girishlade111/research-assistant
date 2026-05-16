<div align="center">

# ResAgent

### Multi-Agent AI Research Assistant

An advanced, multi-agent orchestration engine that transforms raw queries into structured, citation-backed research reports — powered by NVIDIA NIM and OpenRouter LLMs with real-time SSE streaming.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Private-red)](#)

</div>

---

## Table of Contents

- [Features](#features)
- [System Architecture](#system-architecture)
- [Dev Stack](#dev-stack)
- [Agent Fleet](#agent-fleet)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Configuration](#configuration)
- [Token Governance](#token-governance)
- [API Reference](#api-reference)
- [Scripts](#scripts)
- [Security](#security)
- [Contributing](#contributing)

---

## Features

### Core Research Engine

- **Multi-Agent Orchestration** — 7 specialized AI agents work in parallel across a 3-phase pipeline (Intelligence → Retrieval → Synthesis) to produce comprehensive research reports
- **3 Research Modes** — Choose between `corpus` (AI-knowledge only), `deep` (moderate web research), or `pro` (maximum agent capabilities with 8+ sources)
- **Real-Time SSE Streaming** — Live streaming of agent statuses, thinking steps, and report content directly to the UI with zero polling
- **Intelligent Query Expansion** — The Query Intelligence agent classifies intent (`coding`, `research`, `comparison`, `explanation`, `factual`, `general`) and generates subtopics and optimized search terms automatically
- **Dynamic Report Planning** — Generates structured research plans with fixed and dynamic sections, estimated page counts, and per-section agent assignments

### AI Provider Integration

- **Dual-Provider Architecture** — Primary execution on **NVIDIA NIM** (high-quality, billed per token) with automatic failover to **OpenRouter** (free-tier models for resiliency)
- **Smart Model Routing** — Task-aware model selection: reasoning models for analysis, coding models for snippets, fast models for summaries, balanced models for search
- **Automatic Fallback Chain** — If a primary model fails, the system seamlessly shifts to the best available OpenRouter free-tier equivalent without user intervention
- **15+ Model Registry** — Curated models including Kimi K2 Thinking, DeepSeek V3.2, Qwen 3 Coder 480B, Mistral Large 3, Nemotron 3 Super, Llama 3.3 70B, and more

### Document & File Processing

- **Multi-Format File Parsing** — Upload and parse **PDF** (via pdf.js), **DOCX** (via Mammoth), **CSV** (via PapaParse), and **images** (via Tesseract.js OCR)
- **Local Processing** — Document parsing runs locally or via WebAssembly (WASM) to minimize data transit and protect privacy
- **Context Grounding** — Uploaded file content is injected into the agent context pipeline, ensuring all agents reference your documents

### UI & Export

- **Glassmorphism UI** — Modern, animated interface built with Tailwind CSS 4, Framer Motion, and shadcn/ui components
- **Agent Status Panel** — Real-time visibility into which agents are running, their assigned models, providers, durations, and fallback status
- **Thinking Panel** — Transparent view of the AI's reasoning process with timestamped thinking steps per phase
- **Citation Graph** — Interactive visualization of source relationships and relevance scores
- **PDF Export** — Generate downloadable PDF reports with formatted tables via jsPDF + autoTable
- **Source Cards** — Each source is displayed with title, snippet, domain, and relevance score for easy verification

### Reliability & Performance

- **Retry Logic** — 1 retry max with 500ms base delay and 2s cap before triggering fallback
- **Concurrency** — Phase 3 agents run in parallel via `Promise.all` to minimize time-to-first-token (TTFT)
- **Error Classification** — Structured error handling via `lib/engine/errors.ts` with user-facing error messages
- **Caching Hooks** — Built-in `use-cache` and `use-debounce` hooks for UI performance optimization

---

## System Architecture

```mermaid
flowchart TB
    subgraph Client["Client Layer"]
        UI["Next.js 16 UI<br/>React 19 + Tailwind 4"]
        SSE["SSE Consumer<br/>Real-time streaming"]
    end

    subgraph API["API Layer"]
        Route["/api/research<br/>Route Handler"]
    end

    subgraph Orchestrator["Orchestrator Engine"]
        direction TB
        P1["Phase 1: Intelligence"]
        P2["Phase 2: Retrieval"]
        P3["Phase 3: Synthesis"]
    end

    subgraph Agents["Agent Fleet"]
        QI["Query Intelligence<br/>kimi-k2-thinking"]
        WS["Web Search<br/>dracarys-70b"]
        SA["Strategic Analysis<br/>nemotron-3-super"]
        FC["Fact-Check<br/>mistral-large-3"]
        CG["Coding<br/>qwen3-coder-480b"]
        SM["Summary<br/>minimax-m2.7"]
        RP["Report Synthesis<br/>kimi-k2-thinking"]
    end

    subgraph Providers["LLM Providers"]
        NVIDIA["NVIDIA NIM<br/>Primary"]
        OPENR["OpenRouter<br/>Fallback"]
    end

    subgraph Files["File Parser"]
        PDF["PDF (pdf.js)"]
        DOCX["DOCX (Mammoth)"]
        CSV["CSV (PapaParse)"]
        OCR["OCR (Tesseract.js)"]
    end

    UI -->|"User Query + Files"| Route
    Route --> Orchestrator

    P1 -->|"Classify Intent<br/>Expand Query"| QI
    P1 --> P2

    P2 -->|"Concurrent Search"| WS
    P2 -->|"Parse Uploads"| Files
    P2 --> P3

    P3 -->|"Parallel Execution"| SA
    P3 -->|"Parallel Execution"| FC
    P3 -->|"Parallel Execution"| CG
    P3 -->|"Parallel Execution"| SM
    P3 -->|"Sequential"| RP

    Agents -->|"Primary"| NVIDIA
    NVIDIA -.|"On Failure"| OPENR

    RP -->|"Final Report"| SSE
    SSE -->|"Live Updates"| UI

    style Client fill:#1e1e2e,stroke:#89b4fa,color:#cdd6f4
    style API fill:#1e1e2e,stroke:#a6e3a1,color:#cdd6f4
    style Orchestrator fill:#1e1e2e,stroke:#f9e2af,color:#cdd6f4
    style Agents fill:#1e1e2e,stroke:#cba6f7,color:#cdd6f4
    style Providers fill:#1e1e2e,stroke:#f38ba8,color:#cdd6f4
    style Files fill:#1e1e2e,stroke:#94e2d5,color:#cdd6f4
```

### Orchestration Flow

```
Phase 1: Intelligence          Phase 2: Retrieval           Phase 3: Synthesis
┌─────────────────────┐       ┌─────────────────────┐      ┌──────────────────────┐
│ Query Intelligence   │       │ Web Search Agent     │      │ Analysis Agent       │
│ • Intent Classification│     │ • Concurrent Queries │      │ Fact-Check Agent     │
│ • Query Expansion    │──────▶│ File Parser          │─────▶│ Coding Agent         │
│ • Subtopic Generation│       │ • PDF / DOCX / CSV   │      │ Summary Agent        │
│ • Research Plan      │       │ • OCR (Images)       │      │      │               │
└─────────────────────┘       └─────────────────────┘      │      ▼               │
                                                           │ Report Synthesis     │
                                                           │ • Final Assembly     │
                                                           └──────────────────────┘
```

---

## Dev Stack

| Layer | Technology | Version | Purpose |
|:------|:-----------|:--------|:--------|
| **Framework** | Next.js (App Router) | `16.2.4` | Full-stack React framework with server components and API routes |
| **UI Library** | React | `19.2.4` | Component-based UI with concurrent features |
| **Language** | TypeScript | `5.x` | Type-safe development with strict mode |
| **Styling** | Tailwind CSS | `4.0` | Utility-first CSS with `tw-animate-css` animations |
| **Components** | shadcn/ui + Radix | `4.2.0` | Accessible, composable UI primitives |
| **Animations** | Framer Motion | `12.38` | Physics-based animations and transitions |
| **PDF Parsing** | pdf.js | `5.6.205` | Client-side PDF text extraction |
| **DOCX Parsing** | Mammoth | `1.12.0` | Convert DOCX to HTML/text |
| **CSV Parsing** | PapaParse | `5.5.3` | Fast CSV parsing with header detection |
| **OCR** | Tesseract.js | `7.0.0` | WebAssembly-based optical character recognition |
| **Markdown** | react-markdown + remark-gfm | `10.1.0` | Render markdown with GitHub-flavored extensions |
| **PDF Export** | jsPDF + autoTable | `4.2.1` | Generate downloadable PDF reports |
| **Icons** | Lucide React | `1.8.0` | Consistent icon system |
| **CSS Utils** | clsx + tailwind-merge + CVA | — | Conditional class composition |
| **Primary LLM** | NVIDIA NIM | — | High-quality inference (Kimi K2, DeepSeek, Qwen, Mistral, Nemotron) |
| **Fallback LLM** | OpenRouter | — | Free-tier model fallback (Llama 3.3, Gemma 4, GPT-OSS) |
| **Search** | Perplexity Sonar | — | Real-time web search with citation support |

---

## Agent Fleet

| Agent | Role | Primary Model | Fallback Model | Phase |
|:------|:-----|:-------------|:---------------|:------|
| **Query Intelligence** | Intent classification, query expansion, research plan generation | `kimi-k2-thinking` | `gpt-oss-120b:free` | 1 |
| **Web Search** | Concurrent real-time web data retrieval | `dracarys-70b` | `llama-3.3-70b:free` | 2 |
| **Strategic Analysis** | Pattern recognition, correlation analysis, deep reasoning | `nemotron-3-super` | `nemotron-3-super:free` | 3 |
| **Fact-Check** | Automated verification of claims against sources | `mistral-large-3` | `llama-3.3-70b:free` | 3 |
| **Coding** | Technical snippet generation and code analysis | `qwen3-coder-480b` | `qwen3-coder:free` | 3 |
| **Summary** | High-speed overview and key insight extraction | `minimax-m2.7` | `gemma-4-31b:free` | 3 |
| **Report Synthesis** | Final markdown assembly, quality control, and formatting | `kimi-k2-thinking` | `gpt-oss-120b:free` | 3 |

---

## Project Structure

```
research-assistant/
├── app/
│   ├── api/
│   │   └── research/
│   │       └── route.ts              # Research API endpoint (SSE + JSON)
│   ├── about-us/
│   │   └── page.tsx                  # About page
│   ├── privacy-policy/
│   │   └── page.tsx                  # Privacy policy page
│   ├── terms-and-conditions/
│   │   └── page.tsx                  # Terms page
│   ├── globals.css                   # Design tokens + glassmorphism styles
│   ├── layout.tsx                    # Root layout with metadata
│   ├── page.tsx                      # Main research interface
│   └── icon.tsx                      # Dynamic favicon
├── components/
│   ├── agents/
│   │   ├── agent-settings-modal.tsx  # Agent configuration UI
│   │   ├── agent-status-panel.tsx    # Real-time agent status display
│   │   └── thinking-panel.tsx        # AI reasoning transparency
│   ├── export/
│   │   └── export-buttons.tsx        # PDF/clipboard export controls
│   ├── layout/
│   │   └── sidebar.tsx               # Navigation sidebar
│   ├── profile/
│   │   └── profile-modal.tsx         # User profile & API key management
│   ├── response/
│   │   ├── response-area.tsx         # Main response renderer
│   │   ├── source-card.tsx           # Individual source display
│   │   ├── source-modal.tsx          # Source detail modal
│   │   └── sources-section.tsx       # Sources collection
│   ├── search/
│   │   ├── citation-graph-modal.tsx  # Citation relationship graph
│   │   ├── model-selector.tsx        # LLM model picker
│   │   ├── quick-search-modal.tsx    # Quick search overlay
│   │   ├── search-controls.tsx       # Mode & settings controls
│   │   └── search-input.tsx          # Main query input
│   └── ui/
│       ├── button.tsx                # shadcn Button
│       ├── collapsible.tsx           # shadcn Collapsible
│       ├── dialog.tsx                # shadcn Dialog
│       └── dropdown-menu.tsx         # shadcn DropdownMenu
├── hooks/
│   ├── use-cache.ts                  # Response caching hook
│   ├── use-debounce.ts               # Input debouncing hook
│   └── use-mobile.ts                 # Mobile detection hook
├── lib/
│   ├── engine/
│   │   ├── agents/
│   │   │   ├── base-agent.ts         # Base agent class
│   │   │   ├── analysis-agent.ts     # Strategic analysis
│   │   │   ├── coding-agent.ts       # Code generation
│   │   │   ├── fact-check-agent.ts   # Claim verification
│   │   │   ├── model-selector-agent.ts # Model assignment
│   │   │   ├── query-intelligence-agent.ts # Intent & planning
│   │   │   ├── report-agent.ts       # Report generation
│   │   │   ├── report-synthesis-agent.ts # Final synthesis
│   │   │   ├── section-research-agent.ts # Per-section research
│   │   │   ├── summary-agent.ts      # Overview generation
│   │   │   └── web-search-agent.ts   # Web retrieval
│   │   ├── config/
│   │   │   ├── fallback-config.ts    # Fallback chain configuration
│   │   │   └── model-config.ts       # Model registry & routing
│   │   ├── providers/
│   │   │   ├── nvidia.ts             # NVIDIA NIM provider
│   │   │   ├── openrouter.ts         # OpenRouter provider
│   │   │   ├── sonar.ts              # Perplexity Sonar search
│   │   │   ├── fallback-executor.ts  # Automatic failover logic
│   │   │   └── index.ts              # Provider exports
│   │   ├── config.ts                 # Global config (tokens, modes, models)
│   │   ├── context-builder.ts        # Agent context assembly
│   │   ├── errors.ts                 # Error classification
│   │   ├── file-parser.ts            # Multi-format file parsing
│   │   ├── model-router.ts           # Task-to-model routing
│   │   ├── orchestrator.ts           # Main 3-phase orchestrator
│   │   ├── planning-workflow.ts      # Research plan execution
│   │   ├── query-enhancer.ts         # Query enhancement logic
│   │   ├── query-router.ts           # Complexity-based routing
│   │   ├── report-assembler.ts       # Report section assembly
│   │   ├── response-normalizer.ts    # Response normalization
│   │   ├── search-router.ts          # Search provider routing
│   │   └── types.ts                  # TypeScript type definitions
│   ├── export/
│   │   └── pdf-exporter.ts           # PDF generation
│   ├── export-pdf.ts                 # PDF export utilities
│   └── utils.ts                      # General utilities
├── .env.example                      # Environment template
├── .env.mcp.example                  # MCP server configuration template
├── AGENTS.md                         # Agent fleet operations manifest
├── CLAUDE.md                         # Development guide for AI assistants
├── SECURITY.md                       # Security policy & vulnerability reporting
├── components.json                   # shadcn/ui configuration
├── eslint.config.mjs                 # ESLint flat config
├── next.config.ts                    # Next.js configuration
├── package.json                      # Dependencies & scripts
├── postcss.config.mjs                # PostCSS configuration
└── tsconfig.json                     # TypeScript configuration
```

---

## Getting Started

### Prerequisites

- **Node.js** `18.17` or later
- **npm** `9.x` or later
- API keys from [NVIDIA NIM](https://build.nvidia.com) and [OpenRouter](https://openrouter.ai)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/research-assistant.git
cd research-assistant

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local with your API keys (see Environment Variables section)

# 4. Start the development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Quick Usage

1. **Type your research query** in the search input (e.g., "Compare quantum computing approaches in 2026")
2. **Select a research mode**: `corpus` (fast, no web), `deep` (moderate), or `pro` (comprehensive)
3. **Optionally upload files** (PDF, DOCX, CSV, or images) for context-grounded research
4. **Watch the agents work** in real-time via the Agent Status Panel and Thinking Panel
5. **Export your report** as PDF or copy to clipboard

---

## Environment Variables

Create a `.env.local` file in the project root:

```bash
# ── Required ──────────────────────────────────────────────────────

# NVIDIA NIM API Key — Primary LLM provider
# Get yours at: https://build.nvidia.com
NVIDIA_API_KEY=nvapi-xxxxxxxxxxxx

# OpenRouter API Key — Fallback LLM provider
# Get yours at: https://openrouter.ai
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxx

# ── Optional ──────────────────────────────────────────────────────

# Application base URL (default: http://localhost:3000)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Security Note:** Never commit `.env.local` to version control. The `.gitignore` is pre-configured to exclude all environment files. If you accidentally expose a key, revoke it immediately.

---

## Configuration

### Research Modes

| Mode | Max Sources | Description |
|:-----|:-----------|:------------|
| `corpus` | 0 | Fast report using pure AI knowledge. No web search. Best for quick overviews. |
| `deep` | 4 | Moderate web research combined with AI analysis. Balanced speed and depth. |
| `pro` | 8 | Comprehensive deep research using maximum agent capabilities. Slowest but most thorough. |

### Token Limits

| Parameter | Limit | Description |
|:----------|:------|:------------|
| Context Window | `131,072` | Maximum input context across all agents |
| Max Response | `32,768` | Maximum output tokens per response |
| Per-Agent Cap | `16,384` | Token budget per individual agent |
| Report Agent | `32,768` | Dedicated budget for final report synthesis |
| Words-to-Token Ratio | `1.3` | Conversion factor for token estimation |

### Retry Configuration

| Parameter | Value | Description |
|:----------|:------|:------------|
| Max Retries | `1` | Single retry before fallback trigger |
| Base Delay | `500ms` | Initial retry delay |
| Max Delay | `2,000ms` | Maximum retry backoff cap |

---

## Token Governance

ResAgent enforces strict token budgets to ensure report density without sacrificing analytical depth:

| Rule | Limit |
|:-----|:------|
| **System Context** | 32,768 Tokens |
| **Max Report** | 16,384 Tokens |
| **Per-Agent Cap** | 8,192 Tokens |

Tokens are managed at the orchestrator level. Each agent receives its budget in the `AgentContext` and must stay within limits. The report agent gets the largest allocation for final synthesis.

---

## API Reference

### `POST /api/research`

Initiates a research session. Supports both SSE streaming and JSON response modes.

**Request Body:**

```typescript
{
  query: string;                    // Research query (required)
  mode: "corpus" | "deep" | "pro"; // Research mode
  workflowMode?: "chat" | "planning" | "research";
  model?: string;                   // Override model selection
  stream?: boolean;                 // Enable SSE streaming (default: true)
  files?: FileContext[];            // Uploaded files for context
  conversationHistory?: LLMMessage[]; // Multi-turn conversation context
  disabledAgents?: AgentName[];     // Agents to skip
}
```

**SSE Events (when `stream: true`):**

| Event Type | Description |
|:-----------|:------------|
| `status` | Agent status updates (pending → running → done/failed) |
| `plan_ready` | Research plan generated with sections |
| `models_assigned` | Model assignments per section |
| `agent_update` | Individual agent progress |
| `phase_complete` | Phase transition (1 → 2 → 3) |
| `complete` | Final report assembled |
| `error` | Error occurred |

---

## Scripts

| Command | Description |
|:--------|:------------|
| `npm run dev` | Start development server at `localhost:3000` |
| `npm run build` | Create production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint with flat config |

---

## Security

- **API Keys** — Stored in environment variables, never hardcoded. `.gitignore` excludes all `.env*` files
- **Local Processing** — Document parsing (PDF, DOCX, OCR) runs via WebAssembly to minimize data transit
- **No Persistence** — ResAgent does not store uploaded documents or search history by default
- **Secret Masking** — Logs and SSE streams never leak raw API keys or sensitive credentials
- **Input Sanitization** — All user input is sanitized before being passed to LLM prompts

For vulnerability reports, see [SECURITY.md](./SECURITY.md).

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- **TypeScript** — Strict mode, all types defined in `lib/engine/types.ts`
- **Components** — Feature-based structure under `components/`, using shadcn/ui + Radix
- **Agents** — Extend `BaseAgent` or follow the functional runner pattern
- **Styling** — Tailwind 4 utilities with glassmorphism (`.glass`, `.glass-card`)
- **Streaming** — All research logic must support SSE via `StreamCallback`

---

<div align="center">

**Built by [Girish Lade](https://ladestack.in)** · [LinkedIn](https://www.linkedin.com/in/girish-lade-075bba201/)

</div>
