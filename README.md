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

### 🔹 Core Execution Phases

*   **Phase 1: Intelligence Generation** — Deconstructs raw user intent into structured research vectors using reasoning-optimized models.
*   **Phase 2: Data Aggregation** — Executes concurrent web searches and parses multi-modal document uploads (PDF, OCR, CSV).
*   **Phase 3: Parallel Synthesis** — Runs Analysis, Summary, Fact-Check, and Coding agents simultaneously with dynamic model routing.
*   **Phase 4: Massive Report Assembly** — Compiles all outputs into a 5-6 page cohesive research document via SSE streaming.

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

ResAgent is built on a decoupled, event-driven architecture that prioritizes parallel execution and fault tolerance.

### 🧩 High-Level Data Flow

```mermaid
graph TB
    subgraph Client ["Frontend (React 19)"]
        UI["Main Chat UI"]
        SSE_Rec["SSE Event Listener"]
        State["Zustand Global State"]
    end

    subgraph API ["Serverless Gateway (Next.js)"]
        Route["POST /api/research"]
        SSE_Stream["SSE Stream Controller"]
        Auth["API Key Validator"]
    end

    subgraph Core ["Orchestration Engine (Node.js)"]
        direction TB
        Orch["Research Orchestrator"]
        subgraph P1 ["Phase 1: Intelligence"]
            QI["Query Intel Agent"]
            Plan["Research Blueprint"]
        end
        subgraph P2 ["Phase 2: Aggregation"]
            WS["Web Search Agent"]
            File["File Parser (OCR/PDF)"]
        end
        subgraph P3 ["Phase 3: Parallel Synthesis"]
            direction LR
            AA["Analysis Agent"]
            FC["Fact-Check Agent"]
            CA["Coding Agent"]
            SA["Summary Agent"]
        end
        subgraph P4 ["Phase 4: Finalization"]
            RS["Report Synthesis Agent"]
        end
    end

    subgraph External ["Inference Providers"]
        NVIDIA["NVIDIA NIM (Primary)"]
        OR["OpenRouter (Fallback)"]
        Sonar["Perplexity Sonar"]
    end

    UI -->|JSON| Route
    Route --> Auth
    Auth --> Orch
    
    Orch --> QI --> Plan
    Plan --> WS & File
    WS & File --> AA & FC & CA & SA
    
    AA & FC & CA & SA -->|Race Condition| RS
    RS --> SSE_Stream
    SSE_Stream -->|data: { agent_update }| SSE_Rec
    SSE_Rec --> State --> UI

    AA & FC & CA & SA -.->|Timeout > 60s| NVIDIA & OR
```

### 🛠️ Detailed Component Breakdown

#### 1. Server-Sent Events (SSE) Pipeline
The system uses a **unidirectional SSE stream** to provide real-time feedback. Unlike standard REST, this allows the orchestrator to "push" updates as individual agents complete their tasks, ensuring the user is never left with a static loading spinner.

#### 2. Four-Phase Orchestration Logic
*   **Initialization:** Generates a SHA-256 hash of the query for instant Redis-backed cache lookup. If a miss occurs, the **Model Selector Agent** assigns specific LLMs to each research vector based on task complexity.
*   **Parallelization:** Utilizes `Promise.allSettled` to launch all Phase 3 agents simultaneously. This architecture ensures that a slow-running Coding agent doesn't block the progress of the Fact-Check or Analysis agents.
*   **Graceful Degradation:** Each agent is wrapped in a `withGracefulTimeout` wrapper. If an agent fails or stalls (default 90s), the system returns a placeholder error block for that section rather than crashing the entire report.
*   **Synthesis & Assembly:** The **Report Synthesis Agent** acts as a "Chief Editor," merging heterogeneous JSON outputs into a cohesive, logically flowing Markdown document.

#### 3. Reliability & Fallback Strategy
*   **The Fallback Racer:** If the primary NVIDIA NIM endpoint returns a 5xx error or stalls, the system concurrently fires the same request to an OpenRouter fallback. The orchestrator accepts the first successful response.
*   **Context Grounding:** Every agent receives a dynamic `AgentContext` object containing strictly parsed search results and OCR-extracted text, preventing "hallucination" by forcing the model to cite its provided sources.

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

### 3. Launch Development
```bash
npm run dev
# Open http://localhost:3000
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
