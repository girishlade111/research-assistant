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
graph TD
    classDef user fill:#2d3748,stroke:#4a5568,color:#fff;
    classDef router fill:#805ad5,stroke:#553c9a,color:#fff;
    classDef agent fill:#319795,stroke:#44337a,color:#fff;
    classDef search fill:#38a169,stroke:#276749,color:#fff;
    classDef report fill:#dd6b20,stroke:#9b2c2c,color:#fff;
    classDef ui fill:#000000,stroke:#2d3748,color:#fff,stroke-width:2px;

    A([User Query + Files]):::user --> B{Intent Router & Cache Check}:::router
    
    B -->|Direct Match| C[Simple Chat Interface]:::ui
    B -->|Deep Research Mode| D[Multi-Agent Orchestrator]:::router
    
    subgraph "Phase 1: Intelligence Generation"
        D --> E[Query Intelligence Agent]:::agent
        E -->|Expands Context| F([Enhanced Research Blueprint])
    end
    
    subgraph "Phase 2: Data Aggregation"
        F --> G[Web Search Agent]:::search
        G -->|Concurrent Perplexity/LLM Search| H([Web Sources Aggregator])
        A -->|OCR/WASM Parsing| I([Local File Context])
    end
    
    subgraph "Phase 3: Parallel Synthesis & Verification"
        H & I --> J[Analysis Agent]:::agent
        H & I --> K[Summary Agent]:::agent
        H & I --> L[Fact-Check Agent]:::agent
        H & I --> M[Coding Agent]:::agent
    end
    
    subgraph "Phase 4: Massive Report Generation"
        J & K & L & M --> N[Report Synthesis Agent]:::report
        N -->|Compiles 5-6 Pages| O([Final JSON Structure])
    end
    
    O --> P[React Server-Sent Events (SSE) Stream]:::ui
    P --> Q[Progressive Markdown UI Reveal]:::ui
```

### **The Execution Loop**
1. **Blueprint Generation**: The *Query Intelligence Agent* breaks the query into 8-12 self-contained research vectors.
2. **Parallel Processing**: The *Summary*, *Analysis*, *Fact-Check*, and *Coding* agents run simultaneously. Each agent has an isolated `8192` token budget to generate at least one full page of deeply reasoned content.
3. **Fallback Race Condition**: If a primary NVIDIA NIM model fails to respond within 60 seconds, the orchestrator triggers an OpenRouter fallback model concurrently, accepting whichever finishes first.
4. **Final Synthesis**: The *Report Agent* absorbs all upstream data (utilizing a massive `32,768` token budget) to draft a 4000-6000 word, highly sectioned master document.

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
