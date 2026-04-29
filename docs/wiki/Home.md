<div align="center">

# 🔬 ResAgent Wiki

**Advanced Multi-Agent Research Orchestrator**

*Transforming raw queries into exhaustive, structured, and fact-checked intelligence reports using a fleet of specialized AI experts.*

---

[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![NVIDIA NIM](https://img.shields.io/badge/NVIDIA-NIM-76B900?style=flat-square&logo=nvidia)](https://www.nvidia.com/en-us/ai/)

</div>

---

## 👋 Welcome

**ResAgent** is a production-grade, multi-agent AI research system engineered for **depth**, **accuracy**, and **scale**. It orchestrates a **fleet of specialized AI agents** across a multi-phase pipeline to deliver exhaustive, citation-rich research reports in real-time via Server-Sent Events (SSE) streaming.

---

## 📚 Wiki Navigation

| Page | Description |
| :--- | :--- |
| [🚀 Getting Started](Getting-Started) | Installation, prerequisites, and first run |
| [🏗️ Architecture](Architecture) | System design, control plane, and data flow |
| [🤖 Agent Fleet](Agent-Fleet) | All specialized agents, models, and roles |
| [🔬 Research Modes](Research-Modes) | Chat, Plan, and Research mode deep-dives |
| [⚙️ Configuration](Configuration) | Environment variables and token governance |
| [📡 API Reference](API-Reference) | REST endpoints and SSE streaming contract |
| [❓ FAQ](FAQ) | Common questions and troubleshooting |

---

## ✨ Key Highlights

### 🌐 Intelligent Multi-Modal Data Retrieval
- **Targeted Web Search** via Perplexity Sonar API — searches triggered by refined research blueprints, not raw user input
- **PDF Parsing** — high-fidelity text extraction via `pdfjs-dist`
- **Word Documents** — semantic DOCX processing via `mammoth`
- **Structured Data** — CSV stream parsing via `PapaParse`
- **Image OCR** — WebAssembly-powered text extraction via `Tesseract.js`

### 🤖 7-Agent Specialized Fleet
Each agent is assigned the best-fit model dynamically. If NVIDIA NIM becomes unavailable, the system automatically switches to OpenRouter fallback **before** execution begins.

### 🛡️ Zero-Downtime Resilience
- **Health-Aware Control Plane** pings NIM endpoints with a 4-second timeout
- **Race-condition fallback** fires concurrent requests to OpenRouter if primary endpoints stall
- **Graceful degradation** via `withGracefulTimeout` (150-second ceiling per agent)

### 📡 100% SSE Real-Time Streaming
Every phase of the pipeline — from query analysis to final report assembly — streams live progress to the client UI.

---

## 📊 Project Stats at a Glance

| Metric | Value |
| :--- | :--- |
| Specialized AI Agents | **8+** running in parallel |
| LLMs Integrated | **15+** state-of-the-art models |
| Research Tiers | **3** — Corpus, Deep, Pro |
| Supported File Types | **4** — PDF, DOCX, CSV, Image (OCR) |
| Max Context Window | **131,072 tokens** |
| Agent Stagger Delay | **200ms** (prevents rate-limiting) |
| Agent Timeout | **150,000ms** with graceful fallback |

---

## 👤 Maintainer

**Girish Lade** — Full-Stack AI Solutions Architect & UI/UX Expert

- 🌐 [ladestack.in](https://ladestack.in)
- 💼 [LinkedIn](https://www.linkedin.com/in/girish-lade-075bba201/)
- 🐙 [GitHub](https://github.com/girishlade111)
- 📧 [girishlade@ladestack.in](mailto:girishlade@ladestack.in)

---

*© 2026 Lade Stack. Private and Proprietary. All rights reserved.*
