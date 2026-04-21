<div align="center">

# 🔬 ResAgent: Advanced Multi-Agent Research Orchestrator

[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![NVIDIA NIM](https://img.shields.io/badge/NVIDIA-NIM-76B900?style=for-the-badge&logo=nvidia)](https://www.nvidia.com/en-us/ai/)

**Next-Generation Multi-Agent Research Engine**  
*Transforming raw queries into massive, structured, and fact-checked intelligence reports spanning 5-6 pages.*

[Explore the Codebase](#-project-structure) • [System Architecture](#-system-architecture--flow) • [Getting Started](#-getting-started) • [Creator Info](#-connect--contact)

</div>

---

## 🌟 Executive Summary

**ResAgent** is a deeply orchestrated **multi-agent AI research system** built for scale and precision. By leveraging a network of specialized AI agents working concurrently, the system dynamically fetches, synthesizes, analyzes, and verifies complex data structures. 

The final output is an exhaustive, beautifully formatted **4000-6000 word research report**, complete with comprehensive fact-checks, citation graphs, and actionable code generation when requested.

> **💡 Key Highlight:** ResAgent utilizes **Dynamic Model Routing**, seamlessly falling back to high-capacity context models (up to **131,072 tokens**) if the primary endpoints encounter rate limits. This guarantees uninterrupted, massive report generation under heavy network or processing loads.

---

## 🚀 Core Features & Capabilities

### 🌐 Intelligent Data Retrieval
*   **Targeted Augmentation**: Performs concurrent, heavily optimized web searches triggered by a dedicated Query Intelligence Agent rather than raw user input, resulting in highly relevant source aggregation.
*   **Citation Mapping**: Builds visual relationship nodes across all referenced sources, enabling deep-dive verification.

### 🤖 Specialized Fleet Operations
*   **Query Intelligence Agent**: Automatically breaks down and expands simple user queries into massive, multi-layered research directives.
*   **Deep Analysis Agent**: Uses advanced reasoning models (e.g., `NVIDIA/Nemotron-3-Super`) to extract profound, non-obvious patterns from raw data streams.
*   **Rigorous Fact-Checking Agent**: Cross-references every retrieved claim against trusted web data, scoring reliability (0-100) and flagging potential contradictions or outdated facts.
*   **Production-Grade Coding Agent**: Analyzes system architecture and generates edge-case-handled code snippets (e.g., via `Qwen-3-Coder`) when the primary intent is software development.
*   **Master Synthesis Agent**: The orchestrator (`MoonshotAI/Kimi-K2-Thinking`) compiles all upstream data from the sub-agents into a massive 6-8 chapter report without losing context.

### 📄 Multi-Modal Document Intake
*   **Universal File Support**: Seamlessly parse complex user-uploaded documents to build local context constraints.
    *   **PDFs**: Accelerated parsing via `pdf.js`.
    *   **DOCX/Word**: Structure-preserving extraction via `mammoth`.
    *   **Data Sheets**: Fast CSV handling via `PapaParse`.
    *   **Images**: High-accuracy local OCR via `Tesseract.js`.

### 🌊 Next-Gen UI & Streaming
*   **Dynamic SSE Streaming**: Highly optimized React frontend displaying real-time agent progression, latency metrics, and progressive Markdown reveal without freezing the main UI thread.
*   **Interactive Tool Modals**: Features such as **Quick Search**, **Citation Graph**, and a customizable **Developer Profile** are easily accessible directly from the application's sidebar, providing an immersive User Experience.

---

## 🏗️ System Architecture & Flow (Deep Dive)

The system operates on an advanced asynchronous state machine. It forces extensive query analysis *before* execution to eliminate hallucinatory drift and ensure maximum research depth.

```mermaid
flowchart TB
    classDef user fill:#0f172a,stroke:#334155,stroke-width:2px,color:#f8fafc,rx:5,ry:5;
    classDef router fill:#4c1d95,stroke:#5b21b6,stroke-width:2px,color:#f8fafc,rx:5,ry:5;
    classDef agent fill:#0f766e,stroke:#115e59,stroke-width:2px,color:#f8fafc,rx:5,ry:5;
    classDef search fill:#166534,stroke:#14532d,stroke-width:2px,color:#f8fafc,rx:5,ry:5;
    classDef report fill:#9a3412,stroke:#7c2d12,stroke-width:2px,color:#f8fafc,rx:5,ry:5;
    classDef ui fill:#020617,stroke:#1e293b,stroke-width:2px,color:#38bdf8,rx:5,ry:5;
    classDef fallback fill:#86198f,stroke:#581c87,stroke-width:2px,color:#f8fafc,stroke-dasharray: 5 5;

    A(["🧑‍💻 User Query + Documents"]):::user --> B{"🧠 Intent Router & Cache Check"}:::router
    
    B -->|"Direct Match (Cache/Simple)"| C["💬 Simple Chat Interface"]:::ui
    B -->|"Deep Research Mode"| D["⚙️ Multi-Agent Orchestrator"]:::router
    
    subgraph Phase1 ["Phase 1: Intelligence Generation"]
        direction TB
        D --> E["🕵️ Query Intelligence Agent"]:::agent
        E -->|"Expands & Structurizes"| F(["📋 Enhanced Research Blueprint"]):::user
    end
    
    subgraph Phase2 ["Phase 2: Aggregation & Context Building"]
        direction LR
        F --> G["🌐 Web Search Agent"]:::search
        G -->|"Perplexity / LLM Search"| H(["🕸️ Web Sources Aggregator"]):::user
        A -.->|"OCR / WASM Parsing"| I(["📄 Local File Context"]):::user
    end
    
    Phase1 --> Phase2
    
    subgraph Phase3 ["Phase 3: Parallel Synthesis & Verification"]
        direction TB
        H & I --> J["🔍 Analysis Agent"]:::agent
        H & I --> K["📝 Summary Agent"]:::agent
        H & I --> L["✅ Fact-Check Agent"]:::agent
        H & I --> M["💻 Coding Agent"]:::agent
        
        J & K & L & M -.->|"Timeout > 60s"| Z{"🔄 Fallback Race Condition"}:::fallback
        Z -.->|"OpenRouter Backup"| J & K & L & M
    end
    
    Phase2 --> Phase3
    
    subgraph Phase4 ["Phase 4: Massive Report Generation"]
        direction TB
        J & K & L & M --> N["✍️ Report Synthesis Agent"]:::report
        N -->|"Compiles 5-6 Pages"| O(["📑 Final JSON Structure"]):::user
    end
    
    Phase3 --> Phase4
    
    O --> P["📡 React Server-Sent Events (SSE) Stream"]:::ui
    P --> Q["✨ Progressive Markdown UI Reveal"]:::ui
```

### **The Orchestration Execution Loop (Technical Breakdown)**

The orchestrator guarantees performance, context retention, and quality through a strict, multi-phase pipeline managed by a centralized **State Machine**. The entire process is wrapped in a Server-Sent Events (SSE) stream, transmitting raw tokens, latency metrics, and agent statuses to the client as they occur.

#### **Phase 0: Intent Routing & Context Hydration**
*   **Action**: Before any heavy lifting, the system evaluates the user query against a local Redis/LRU cache.
*   **Routing**: Simple queries (e.g., "What is the capital of France?") are routed to a lightweight, single-pass LLM to save compute. Complex queries ("Analyze the impact of AGI on cryptographic algorithms") trigger the **Deep Research Mode**.
*   **File Ingestion**: If the user uploaded files, WebAssembly (WASM) workers parse PDFs, DOCX, CSV, and perform OCR on images. This data is converted to pure markdown strings.

#### **Phase 1: Blueprint Generation (The Query Intelligence Agent)**  
*   **Role**: To prevent LLM "hallucination," the engine never feeds a raw query directly into a search engine. 
*   **Process**: The **Query Intelligence Agent** (typically powered by a reasoning model) deconstructs the user's intent. It identifies missing context, determines required technical depth, and generates a structured JSON array containing 8-12 highly specific research vectors (e.g., historical context, technical implementation, counter-arguments, financial implications).

#### **Phase 2: Data Aggregation & Deduplication**  
*   **Role**: Gathering raw, verifiable facts from the live internet.
*   **Process**: The research vectors are fired concurrently into the **Web Search Agent** (utilizing tools like Perplexity Sonar or direct Google/Bing API integration with an LLM summarizer). 
*   **Vector Database (Memory)**: The returned URLs and text snippets are merged with the local uploaded documents. The system runs a rapid similarity check to deduplicate redundant information, resulting in an enormous, clean **Temporary Context Pool**.

#### **Phase 3: Parallel Processing & Verification (The Core Engine)**  
*   **Role**: Analyzing the massive context pool from four distinct, specialized perspectives simultaneously.
*   **Execution**: The *Summary*, *Analysis*, *Fact-Check*, and *Coding* agents are spawned in parallel. Each agent is fed the entire Context Pool alongside its specific system prompt.
*   **Resource Allocation**: Each agent operates in an isolated execution thread with an `8192` token maximum output budget, forcing deep, non-truncated reasoning.
*   **The Fallback Race Condition (Fault Tolerance)**: To prevent a single slow API from stalling the 6-page report, the orchestrator implements a hard 60-second timeout. If a primary NVIDIA NIM model (e.g., `Llama-3-70B`) is hanging, it concurrently fires an identical request to an OpenRouter fallback model. The orchestrator accepts whichever Promise resolves first, immediately terminating the slower thread.

#### **Phase 4: Final Synthesis & Formatting**  
*   **Role**: Compiling the divergent agent outputs into a single, cohesive, beautifully formatted document.
*   **Process**: Once all parallel agents resolve, their massive outputs (often totaling 15,000+ words) are stitched together into a structured prompt.
*   **Synthesis**: The **Report Agent** (utilizing a massive `32,768` token context window model like `MoonshotAI/Kimi-K2-Thinking`) acts as the Chief Editor. It rewrites the content into a 4000-6000 word, highly-sectioned master document with an executive summary, table of contents, and perfectly cited references. 
*   **Streaming**: The final markdown is streamed token-by-token to the Next.js frontend, where a memoized React-Markdown parser progressively reveals the text without causing UI frame drops.

---

## 🛠️ Developer Stack & Dependencies

### **Frontend & UI layer**
*   **Core Framework**: `Next.js 16.2.4` (App Router configuration, powered by Turbopack)
*   **UI Library**: `React 19.2.4` (Concurrent features enabled)
*   **Styling Engine**: `Tailwind CSS v4.0`, utilizing `clsx` and `tailwind-merge` for dynamic classes.
*   **Fluid Animations**: `Framer Motion 12.38`
*   **Markdown Parsing**: `React-Markdown 10.1` (Heavily memoized to prevent expensive re-renders during high-speed SSE streaming)
*   **Iconography**: `Lucide React`

### **Backend Orchestration & Engine**
*   **Orchestration API**: Custom asynchronous multi-agent pipeline housed in Node.js/Next.js edge and serverless API routes.
*   **Primary AI Infrastructure**: `NVIDIA NIM` (Integrate API for ultra-low latency inference)
*   **Fallback AI Infrastructure**: `OpenRouter` (Free and enterprise tier models for redundancy)
*   **Document Parsing Suite**: `pdfjs-dist` (PDF), `mammoth` (Word/DOCX), `papaparse` (CSV), `tesseract.js` (Image OCR via WebAssembly).

---

## ⚙️ System Configurations & Token Stats

The engine is heavily optimized to manage massive context windows without failing. Below are the internal hard-coded thresholds:

| Configuration Area | Specification | Description |
| :--- | :--- | :--- |
| **Max Global Context** | `131,072 Tokens` | Supports massive document ingestion via Llama 3.3 70B fallback models. |
| **Report Generation Budget** | `32,768 Tokens` | Ensures the Report Agent never truncates the final 6-page synthesis document. |
| **Agent Budget (Per Agent)** | `8,192 Tokens` | Strict budget enforcing deep, one-page minimal outputs per sub-agent. |
| **Fallback Race Timeout** | `60,000 ms` | Primary models are raced against fallbacks if slow, capping at an absolute 120s max. |

---

## 🚀 Getting Started (Local Development)

Follow these instructions to spin up the local development environment and run the orchestrator on your machine.

### **1. System Requirements**
*   `Node.js` v18.17.0 or higher
*   `npm` v9.0 or higher
*   Git

### **2. Installation**
Clone the repository and install the high-performance dependencies:
```bash
git clone https://github.com/girishlade111/research-assistant.git
cd research-agent
npm install
```

### **3. Environment Configuration**
The system relies on primary and fallback AI endpoints to function. Create a `.env.local` file in the root directory and add the following keys:
```env
# REQUIRED: Primary high-speed reasoning endpoints
NVIDIA_API_KEY=your_nvidia_nim_key_here

# OPTIONAL: Web Search augmentation
PERPLEXITY_API_KEY=your_perplexity_sonar_key_here

# OPTIONAL: Massive context fallback endpoints
OPENROUTER_API_KEY=your_openrouter_key_here
```

### **4. Running the Engine**
Start the application using the ultra-fast Turbopack compiler:
*   `npm run dev` — Starts the local development server on `http://localhost:3000`.
*   `npm run build` — Generates the optimized production static and dynamic builds.
*   `npm run start` — Boots the production server.
*   `npm run lint` — Validates strict TypeScript and ESLint standards across the codebase.

---

## 📁 Project Structure

```text
research-agent/
├── app/
│   ├── api/research/      # Primary SSE stream and multi-agent orchestrator endpoint
│   └── page.tsx           # React UI: Chat bubbles, Progressive Reveal, and global State
├── components/
│   ├── agents/            # Agent status trackers and visual progression panels
│   ├── profile/           # Developer profile modal UI
│   ├── response/          # React-Markdown Memoized rendering & intelligence sources UI
│   ├── search/            # Quick Search and Citation Graph modal UIs
│   └── layout/            # Sidebar and responsive navigation wrappers
├── hooks/                 # Custom React hooks (use-cache, use-debounce, use-mobile)
├── lib/
│   ├── engine/            # 🧠 The Core Brain
│   │   ├── agents/        # System prompts and specific logic for all 6 agents
│   │   ├── providers/     # Fetch handlers and router logic for NVIDIA and OpenRouter
│   │   ├── config.ts      # Global limits, timeouts, and Model Registries
│   │   └── orchestrator.ts# Parallel execution and fallback race conditions
│   └── utils.ts           # Global UI utilities and styling mergers
```

---

## 🌐 Connect & Contact

<div align="center">

### **Created by Girish Lade**
*UI/UX Developer, AI Engineer, and Founder of Lade Stack.*

[![Website](https://img.shields.io/badge/Website-ladestack.in-6366F1?style=for-the-badge&logo=safari&logoColor=white)](https://ladestack.in)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Girish_Lade-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/girish-lade-075bba201/)
[![GitHub](https://img.shields.io/badge/GitHub-girishlade111-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/girishlade111)

[![Instagram](https://img.shields.io/badge/Instagram-@girish__lade__-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/girish_lade_/)
[![CodePen](https://img.shields.io/badge/CodePen-Girish_Lade-000000?style=for-the-badge&logo=codepen&logoColor=white)](https://codepen.io/Girish-Lade-the-looper)
[![Email](https://img.shields.io/badge/Email-admin@ladestack.in-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:admin@ladestack.in)

</div>

---

## 📄 License

This project is private and proprietary. All rights reserved. Powered by the **Lade Stack** ecosystem.
