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

### ⚡ Next-Gen UI Experience
*   **Progressive Streaming:** Real-time Markdown reveal powered by Server-Sent Events (SSE).
*   **Citation Graph:** Visual relationship mapping between research sources and insights.
*   **Thinking Panel:** Transparent view into each agent's reasoning process and current task.
*   **Model Selector:** Hot-swappable model configurations for granular control.
*   **Multi-Format Export:** High-quality PDF (with auto-tables), Markdown, and TXT downloads.

---

## 🏗️ System Architecture

ResAgent utilizes an asynchronous state machine to manage complex multi-agent workflows.

```mermaid
graph TD
    subgraph UI ["User Interface Layer"]
        User(["🧑‍💻 User Query + Documents"])
        SSE["📡 SSE Stream Handler"]
        MD["✨ Progressive Markdown UI"]
    end

    subgraph Router ["Orchestration Layer"]
        Intent{"🧠 Intent Classifier"}
        Cache["💾 Query Cache"]
        Fallbacks{"🔄 Fallback Racer"}
    end

    subgraph Agents ["Specialized Agent Fleet (Parallel)"]
        QI["🕵️ Query Intel"]
        WS["🌐 Web Search"]
        AA["🔍 Analysis Agent"]
        FC["✅ Fact-Check"]
        CA["💻 Coding Agent"]
        SA["📝 Summary Agent"]
    end

    subgraph Assembly ["Finalization Layer"]
        RA["✍️ Report Synthesis Agent"]
        PDF["📑 PDF/MD Export Engine"]
    end

    User --> Intent
    Intent --> Cache
    Cache -->|Miss| QI
    QI --> WS
    WS --> AA & FC & CA & SA
    AA & FC & CA & SA --> Fallbacks
    Fallbacks --> RA
    RA --> SSE
    SSE --> MD
    MD --> PDF

    classDef default fill:#111,stroke:#333,color:#fff
    classDef highlight fill:#4c1d95,stroke:#a78bfa,color:#fff
    classDef agent fill:#0f766e,stroke:#2dd4bf,color:#fff
    classDef logic fill:#92400e,stroke:#fbbf24,color:#fff
    
    class User,MD highlight
    class QI,WS,AA,FC,CA,SA,RA agent
    class Intent,Fallbacks logic
```

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
