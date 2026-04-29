# 🚀 Getting Started

> Get ResAgent running on your local machine in under 5 minutes.

---

## 📋 Prerequisites

Before you begin, make sure you have the following:

| Requirement | Minimum Version | Notes |
| :--- | :--- | :--- |
| **Node.js** | 20+ | LTS recommended |
| **NPM** | 10+ | Ships with Node.js 20 |
| **NVIDIA NIM API Key** | — | Primary inference provider |
| **OpenRouter API Key** | — | Fallback inference provider |
| **Perplexity API Key** | — | Web search (Sonar API) |

---

## 📥 Step 1 — Clone the Repository

```bash
git clone https://github.com/girishlade111/research-assistant.git
cd research-assistant
```

---

## 📦 Step 2 — Install Dependencies

```bash
npm install
```

This installs all required packages including:
- Next.js 16.2.4, React 19.2.4
- Tailwind CSS v4, Framer Motion
- `pdfjs-dist`, `mammoth`, `PapaParse`, `Tesseract.js`
- `jspdf`, `jspdf-autotable`, `html-to-image`

---

## 🔑 Step 3 — Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
cp env.example .env.local
```

Then open `.env.local` and fill in your API keys:

```env
# ─── Primary Inference Platform ─────────────────────────────────────────────
NVIDIA_API_KEY=nvapi-your-key-here

# ─── Fallback Inference Platform ─────────────────────────────────────────────
OPENROUTER_API_KEY=sk-or-your-key-here

# ─── Web Search (Perplexity Sonar) ───────────────────────────────────────────
SONAR_API_KEY=pplx-your-key-here
```

> **⚠️ Never commit `.env.local` to version control.** It is already in `.gitignore`.

### Where to Get API Keys

| Service | URL |
| :--- | :--- |
| NVIDIA NIM | [build.nvidia.com](https://build.nvidia.com) |
| OpenRouter | [openrouter.ai/keys](https://openrouter.ai/keys) |
| Perplexity | [perplexity.ai/settings/api](https://www.perplexity.ai/settings/api) |

---

## ▶️ Step 4 — Launch the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You should see the ResAgent chat interface.

---

## 🏗️ Step 5 — Production Build (Optional)

To build and run a production-optimized version:

```bash
npm run build
npm start
```

---

## 🔍 Step 6 — Verify Your Setup

1. Type a simple query in the chat box (e.g., *"What is machine learning?"*)
2. The **Thinking Panel** should appear, showing agent activity in real-time
3. A full research report should stream back within 30–120 seconds (depending on research mode)

If agents fail to respond, check your API keys in `.env.local` and ensure the NVIDIA NIM endpoints are reachable.

---

## 🧹 Linting

```bash
npm run lint
```

ResAgent uses ESLint with the Next.js recommended config (`eslint.config.mjs`).

---

## 📁 Project Structure Overview

```
research-assistant/
├── app/                  # Next.js App Router pages & API routes
│   ├── api/research/     # Main SSE research endpoint
│   └── globals.css       # Tailwind design tokens & glassmorphism utilities
├── components/           # Feature-based React components
├── lib/
│   └── engine/           # Core orchestration logic
│       ├── orchestrator.ts       # Main research pipeline
│       ├── agents/               # Specialized agent implementations
│       ├── types.ts              # Shared TypeScript types
│       ├── errors.ts             # Error classification
│       └── context-builder.ts   # RAG / semantic scoring
├── docs/                 # Documentation & wiki source files
├── public/               # Static assets
└── env.example           # Environment variable template
```

---

## 🆘 Troubleshooting

| Problem | Solution |
| :--- | :--- |
| `npm install` fails | Ensure Node.js 20+ is installed: `node --version` |
| API keys not recognized | Restart the dev server after editing `.env.local` |
| NVIDIA NIM timeout | The system will automatically fall back to OpenRouter |
| Port 3000 in use | Run `npm run dev -- -p 3001` to use a different port |
| OCR not working | Ensure `Tesseract.js` WASM files are correctly bundled (`npm install`) |

---

*Next: [Architecture →](Architecture)*
