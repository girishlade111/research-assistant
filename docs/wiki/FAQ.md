# ❓ FAQ

> Frequently asked questions about ResAgent — setup, usage, agents, and troubleshooting.

---

## 🚀 Setup & Installation

### Q: What Node.js version is required?
**Node.js 20 or higher** is required. Confirm your version with:
```bash
node --version
```

### Q: Do I need all three API keys to run the app?
You need at least:
- **`NVIDIA_API_KEY`** — for primary inference
- **`OPENROUTER_API_KEY`** — for fallback inference

`SONAR_API_KEY` (Perplexity) is only required if you use **Deep** or **Pro** research modes with web search enabled. In **Corpus** mode, it is not needed.

### Q: Can I use ResAgent without NVIDIA NIM?
Yes. If NVIDIA NIM is unavailable (or you skip `NVIDIA_API_KEY`), the system's automatic fallback will route all agent requests through **OpenRouter** instead. Many OpenRouter models are free-tier.

### Q: The dev server starts but the research fails immediately — why?
1. Open `.env.local` and confirm all API keys are correct (no extra spaces or quotes)
2. Restart the dev server after editing `.env.local` — Next.js doesn't hot-reload env files
3. Check your NVIDIA NIM and OpenRouter account dashboards for quota/billing issues

---

## 🔬 Research Modes

### Q: Which mode should I use?
| Goal | Recommended Mode |
| :--- | :--- |
| Quick Q&A or definitions | **Chat** |
| Brainstorm a research plan | **Plan** |
| Analyze internal documents only | **Research → Corpus** |
| Mix of files + web sources | **Research → Deep** |
| Maximum depth and citations | **Research → Pro** |

### Q: How many web sources does each mode fetch?
| Mode | Web Sources |
| :--- | :--- |
| Corpus | 0 (no web search) |
| Deep | 4 |
| Pro | 8+ |

### Q: Can I use both uploaded files and web search together?
Yes — in **Deep** and **Pro** modes, uploaded files and web results are combined. Files receive **70% of the context budget** and web results receive **30%**, ensuring your local data is always prioritized.

---

## 🤖 Agents

### Q: What happens if an agent times out?
Each agent has a **150-second timeout ceiling**. If an agent exceeds this, it:
1. Returns a partial result with a "Data Limitations" notice
2. The pipeline continues with the partial content
3. The final report notes which sections had limited data

### Q: Can I disable individual agents?
Yes — use the **Agent Panel** in the UI or pass `enabledAgents` in the API request. Three agents are always active: Query Intelligence, Model Selector, and Report Synthesis.

### Q: Why does ResAgent sometimes use OpenRouter instead of NVIDIA NIM?
The **Model Selector Agent** runs a health check against NVIDIA NIM with a 4-second timeout before every research run. If NIM is slow or down, it pre-emptively routes all agents to OpenRouter to ensure reliability.

### Q: How does the Fact-Check Agent work?
The Fact-Check Agent receives the research sections and their source citations, then verifies each major claim against those sources. It outputs a confidence score per section and flags:
- ✅ **Verified** — claim supported by cited sources
- ⚠️ **Unverified** — no direct source found (may still be accurate)
- ❌ **Contradicted** — claim contradicts cited sources

---

## 📁 File Uploads

### Q: What file types are supported?
| Format | Support |
| :--- | :--- |
| PDF | ✅ Full text extraction |
| DOCX | ✅ Semantic HTML conversion |
| CSV | ✅ Stream parsing |
| PNG / JPG / WebP | ✅ OCR via Tesseract.js |
| TXT | ❌ Not yet supported |
| XLSX | ❌ Not yet supported |

### Q: Is there a file size limit?
There is no hard-coded file size limit, but very large files may hit the **131,072 token context ceiling**. The semantic scoring layer will automatically prioritize the most relevant chunks if the file exceeds the budget.

### Q: Why is my PDF not being read correctly?
Scanned PDFs (image-only PDFs) cannot be parsed by `pdfjs-dist`. Convert them to image files (PNG/JPG) and upload those instead — ResAgent will use WASM OCR via `Tesseract.js`.

---

## 📡 API & Streaming

### Q: Why does the API return a 401 error?
One or more API keys in `.env.local` are missing or invalid. Check:
- `NVIDIA_API_KEY` — starts with `nvapi-`
- `OPENROUTER_API_KEY` — starts with `sk-or-`
- `SONAR_API_KEY` — starts with `pplx-`

### Q: Can I use the API from an external frontend?
Yes. The `POST /api/research` endpoint is a standard HTTP SSE endpoint. Any client that can consume SSE streams (browser `fetch`, Node.js, Python `httpx`, etc.) can integrate with it.

### Q: How do I know when the research is complete?
Listen for the `complete` SSE event type. This is guaranteed to be the last event in a successful stream.

### Q: What does `retryable: true` mean in an error event?
It means the error is transient (e.g., rate limit, network glitch) and you can safely retry the same request after a short delay. `retryable: false` indicates a configuration issue (e.g., invalid API key) that must be fixed before retrying.

---

## 🏗️ Architecture & Performance

### Q: How long does a research run take?
| Mode | Typical Duration |
| :--- | :--- |
| Chat | 2–5 seconds |
| Plan | 5–15 seconds |
| Research (Corpus) | 20–60 seconds |
| Research (Deep) | 30–90 seconds |
| Research (Pro) | 60–150 seconds |

### Q: Is there caching?
Yes. Every research query is hashed with SHA-256. If an identical query+mode combination was run recently, the cached report is returned instantly. The default TTL is 3,600 seconds (1 hour).

### Q: Does ResAgent store my research data?
In the current version, memory and caching are **mocked** (no external database calls). No data is persisted outside of the current server process. Future versions will support Supabase + Redis for persistent memory.

### Q: Can I deploy ResAgent to Vercel?
Yes. ResAgent is a standard Next.js 16 App Router project and deploys cleanly to Vercel. Set your environment variables in the Vercel dashboard under **Project → Settings → Environment Variables**.

---

## 🛡️ Security

### Q: Are API keys exposed to the browser?
No. All API calls (to NVIDIA NIM, OpenRouter, Perplexity) are made **server-side** from the Next.js API route. Keys are never included in the client bundle.

### Q: Is my uploaded file data sent to any third-party?
Uploaded file content is parsed locally (via WASM in the browser or server-side). The **extracted text** (not the raw file) is included in the research context and sent to the AI providers for analysis.

---

*Back to [Home →](Home)*
