<div align="center">

# 🔬 ResAgent — Advanced Multi-Agent Research Orchestrator

[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![NVIDIA NIM](https://img.shields.io/badge/NVIDIA-NIM-76B900?style=for-the-badge&logo=nvidia)](https://www.nvidia.com/en-us/ai/)

**Next-Generation Multi-Agent Research Engine**  
*Transform raw queries into exhaustive, structured, and fact-checked intelligence reports.*

[Project Overview](#-project-overview) • [Key Features](#-key-features) • [System Architecture](#-system-architecture) • [Dev Stack](#-development-stack) • [Installation](#-installation--setup) • [Configuration](#-configuration) • [Project Stats](#-project-stats--metrics) • [Usage Guide](#-usage-guide)

</div>

---

## 📋 Project Overview

**ResAgent** is a production-grade, multi-agent AI research system engineered for **depth**, **accuracy**, and **scale**. It orchestrates a **fleet of specialized AI agents** across a multi-phase pipeline to deliver exhaustive, citation-rich research reports in real-time.

> [!IMPORTANT]
> **ResAgent** features **Dynamic Model Routing** with automatic fallback to high-capacity context models (up to **131,072 tokens**). A unique race-condition fallback mechanism ensures zero downtime by firing concurrent requests to OpenRouter if primary endpoints stall.

---

## ✨ Key Features

### 🌐 Intelligent Data Retrieval
*   **Targeted Augmentation:** Concurrent web searches triggered by refined research blueprints.
*   **Multi-Modal Intake:** Seamlessly ingest and parse complex local files:
    *   **PDF Parsing:** High-fidelity text extraction via `pdfjs-dist`.
    *   **Word Documents:** Comprehensive DOCX processing via `mammoth`.
    *   **Structured Data:** CSV and datasheet handling with `PapaParse`.
    *   **Image OCR:** WebAssembly-powered text extraction from images via `Tesseract.js`.

### 🤖 Specialized Agent Fleet
| Agent | Primary Role | Primary Model (NVIDIA NIM) | Fallback (OpenRouter) |
| :--- | :--- | :--- | :--- |
| **Query Intelligence** | Refines and enhances raw user prompts | `mistral-large-3` | `gpt-oss-120b:free` |
| **Web Search** | Concurrent real-time data retrieval | `dracarys-70b` | `llama-3.3-70b:free` |
| **Analysis** | Pattern recognition & correlation analysis | `nemotron-3-super` | `nemotron-3:free` |
| **Fact-Check** | Automated verification of claims vs sources | `mistral-large-3` | `llama-3.3-70b:free` |
| **Coding** | Specialized technical snippet generation | `qwen3-coder-480b` | `qwen3-coder:free` |
| **Summary** | High-speed overview generation | `minimax-m2.7` | `gemma-4-31b:free` |
| **Report** | Final markdown assembly & quality control | `kimi-k2-thinking` | `gpt-oss-120b:free` |

---

## 🏗️ System Architecture

ResAgent utilizes a sophisticated **Control Plane vs. Data Plane** architecture to manage high-concurrency multi-agent workflows.

### 🧩 Granular Orchestration Workflow

```mermaid
flowchart TB
    subgraph Client ["<b>1. Presentation Layer (React 19)</b>"]
        UI["Main Chat UI"]
        State["Zustand State Manager"]
        SSE_Rec["SSE Stream Consumer"]
        MD_Render["Progressive MD Renderer"]
    end

    subgraph API ["<b>2. Service Gateway (Next.js)</b>"]
        Route["POST /api/research"]
        Cache["SHA-256 Hashing & Cache Look-up"]
        SSE_Push["SSE Stream Controller"]
    end

    subgraph Control_Plane ["<b>3. Control Plane (Logic & Intelligence)</b>"]
        direction TB
        QI["🕵️ Query Intelligence Agent"]
        BP["📋 Research Blueprint Generation"]
        MS["⚖️ Model Selector Agent"]
        Assignments["🎯 Agent-to-Model Mapping"]
        Health["🛡️ Health Check (NVIDIA NIM)"]
    end

    subgraph Data_Plane ["<b>4. Data Plane (Parallel Fleet)</b>"]
        direction TB
        Parallel["⚡ Parallel Execution Engine"]
        subgraph SubAgents ["Fleet Instances"]
            A1["🔍 Analysis Agent"]
            A2["💻 Coding Agent"]
            A3["✅ Fact-Check Agent"]
            A4["📝 Summary Agent"]
        end
    end

    subgraph Grounding ["<b>5. Grounding Layer (RAG & WASM)</b>"]
        direction LR
        WS["🌐 Web Search (Perplexity)"]
        OCR["📄 OCR / PDF Parser (WASM)"]
        Semantic["🧠 Semantic Chunking & Scoring"]
    end

    subgraph Resilience ["<b>6. Resilience Layer (Auto-Fallback)</b>"]
        Race["🔄 Fallback Race Condition"]
        NIM["Primary: NVIDIA NIM"]
        OR["Fallback: OpenRouter"]
    end

    subgraph Assembly ["<b>7. Finalization Layer</b>"]
        RS["✍️ Report Synthesis Agent"]
        Export["📑 MD/PDF Export Engine"]
    end

    %% Flow Connections
    UI -->|JSON Request| Route
    Route --> Cache
    Cache -->|Miss| Control_Plane
    
    QI --> BP
    BP --> MS
    MS --> Health
    Health --> Assignments
    Assignments --> Parallel
    
    Parallel --> SubAgents
    Grounding -->|Augmented Context| SubAgents
    
    SubAgents --> Race
    Race --> NIM
    Race -.->|Timeout > 60s| OR
    
    Race --> Assembly
    RS --> SSE_Push
    SSE_Push -->|data: { type: 'agent_update' }| SSE_Rec
    SSE_Rec --> State
    State --> MD_Render
    MD_Render --> UI

    %% Styling
    classDef client fill:#0f172a,stroke:#38bdf8,color:#fff
    classDef api fill:#1e1b4b,stroke:#818cf8,color:#fff
    classDef control fill:#312e81,stroke:#a5b4fc,color:#fff
    classDef data fill:#064e3b,stroke:#34d399,color:#fff
    classDef grounding fill:#78350f,stroke:#fbbf24,color:#fff
    classDef resilience fill:#701a75,stroke:#f0abfc,color:#fff
    classDef assembly fill:#92400e,stroke:#f59e0b,color:#fff

    class UI,State,SSE_Rec,MD_Render client
    class Route,Cache,SSE_Push api
    class QI,BP,MS,Assignments,Health control
    class Parallel,A1,A2,A3,A4 data
    class WS,OCR,Semantic grounding
    class Race,NIM,OR resilience
    class RS,Export assembly
```

---

### 🛡️ Technical Deep Dives

#### 1. The Model Routing & Health Plane
Unlike static LLM implementations, ResAgent employs a **Health-Aware Control Plane** (`model-selector-agent.ts`):
*   **Dynamic Task Classification:** Every research section is classified into 8 specialized task types (e.g., `web_search`, `financial_analysis`, `code_generation`).
*   **Pre-emptive Health Checks:** The system pings the **NVIDIA NIM health endpoint** with a 4s timeout. If latency exceeds this threshold or the service returns a non-200 status, the Control Plane automatically swaps primary assignments to OpenRouter fallbacks *before* the expensive research phase begins.

#### 2. Resilient Parallelization Framework
The engine leverages Node.js asynchronous primitives and `Promise.allSettled` to manage the agent fleet:
*   **Non-Blocking Aggregation:** Web searching and local document parsing run concurrently. Document parsing is handled via **WebAssembly (WASM)** threads, offloading CPU-intensive OCR tasks from the main event loop.
*   **Graceful Degradation:** Each agent is wrapped in a `withGracefulTimeout` wrapper. If a sub-agent stalls (90s ceiling), the system returns a partial result with a clear "Data Limitations" notice, ensuring the final report is delivered even if one "expert" fails.

#### 3. WASM-Powered Grounding Layer (RAG)
To ensure zero hallucinations, the system uses a **Semantic Blackboard Architecture** (`context-builder.ts`):
*   **Semantic Scoring:** Text extracted from files and web results is chunked and scored against the research query using keyword density and relevance proximity.
*   **Token Budgeting (70/30 Split):** The system intelligently allocates context window space, prioritizing local file content (70% budget) over web search results (30% budget) to ensure groundedness in user-provided data.

#### 4. The SSE Streaming Pipeline
The system utilizes a **Structured Event-Stream Protocol** to maintain high-fidelity UI synchronization:
*   **Event Typing:** The stream emits typed events (`agent_update`, `plan_ready`, `models_assigned`, `debug`) that allow the UI to animate specific agents, update progress bars, and reveal Markdown sections progressively without a full page re-render.
*   **Progressive Markdown Reveal:** Using a memoized Markdown renderer on the frontend, the stream allows users to read sections as they are generated by individual sub-agents.

---

## 🛠️ Development Stack

### Frontend Core
- **Framework:** Next.js 16.2.4 (App Router, Turbopack)
- **Library:** React 19.2.4 (Concurrent Rendering)
- **Styling:** Tailwind CSS v4 + `tw-animate-css`
- **Animations:** Framer Motion 12.38.0
- **Components:** shadcn/ui + Base UI

### AI & Orchestration
- **Inference:** NVIDIA NIM (Primary), OpenRouter (Fallback)
- **Web Search:** Perplexity Sonar API
- **Data Parsing:** pdfjs-dist, Mammoth, PapaParse, Tesseract.js (WASM)
- **Streaming:** Native Server-Sent Events (SSE)

---

## 🚀 Installation & Setup

### 1. Clone & Install
```bash
git clone https://github.com/girishlade111/research-assistant.git
cd research-assistant
npm install
```

### 2. Configure Environment
Create a `.env.local` in the root:
```env
NVIDIA_API_KEY=nvapi-your-key
OPENROUTER_API_KEY=sk-or-your-key
PERPLEXITY_API_KEY=pplx-your-key
```

---

## ⚙️ Configuration & Stats

### Token Governance
| Parameter | Value | Description |
| :--- | :--- | :--- |
| **Global Context** | 131,072 | Support for massive document sets |
| **Max Response** | 32,768 | Budget for ultra-detailed reports |
| **Per-Agent Cap** | 16,384 | Ensures depth in analysis |
| **Race Timeout** | 60,000ms | Max wait before fallback trigger |

### Project Metrics
- **7** Specialized Agents
- **15** High-Performance LLMs Integrated
- **3** Specialized Search Tiers (Corpus, Deep, Pro)
- **4** File Types Parsed (PDF, DOCX, CSV, Image)
- **< 3s** Latency for Simple Chat interactions

---

## 📖 Usage Guide

1.  **Select Mode:** Choose between **Corpus** (pure AI), **Deep** (4 sources), or **Pro** (8 sources).
2.  **Toggle Agents:** Customize your pipeline by enabling/disabling specific agents.
3.  **Upload Context:** Drop in your PDFs or images to ground the research in your data.
4.  **Execute:** Hit search and watch the real-time agent progression.
5.  **Visualize:** Use the **Citation Graph** to see how insights are connected.
6.  **Export:** Download your findings in high-fidelity PDF or Markdown formats.

---

<div align="center">

### **Created by Girish Lade**
*UI/UX Developer & AI Systems Engineer*

<br/>

[Website](https://ladestack.in) • [LinkedIn](https://www.linkedin.com/in/girish-lade-075bba201/) • [GitHub](https://github.com/girishlade111)

</div>

---

## 📄 License
**Private and Proprietary.** Powered by the **Lade Stack** ecosystem.
