# ⚙️ Configuration

> Complete reference for environment variables, token governance, retry behavior, and runtime configuration.

---

## Environment Variables

Create `.env.local` in the project root (copy from `env.example`):

```bash
cp env.example .env.local
```

### Required Variables

| Variable | Description | Where to Get |
| :--- | :--- | :--- |
| `NVIDIA_API_KEY` | Primary inference provider (NVIDIA NIM) | [build.nvidia.com](https://build.nvidia.com) |
| `OPENROUTER_API_KEY` | Fallback inference provider | [openrouter.ai/keys](https://openrouter.ai/keys) |
| `SONAR_API_KEY` | Web search via Perplexity Sonar API | [perplexity.ai/settings/api](https://www.perplexity.ai/settings/api) |

### Optional Variables

| Variable | Default | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Public base URL for the app |
| `LOG_LEVEL` | `info` | Logging verbosity: `debug` · `info` · `warn` · `error` |
| `CACHE_TTL_SECONDS` | `3600` | SHA-256 query cache TTL |

> **Security:** Never expose these keys on the client side. All API calls are made server-side from the Next.js API route.

---

## Token Governance

ResAgent uses a tiered token budget strategy to ensure reports are dense without blowing context windows.

### Global Limits (`lib/engine/config.ts`)

| Parameter | Value | Description |
| :--- | :--- | :--- |
| `MAX_CONTEXT_TOKENS` | **131,072** | Maximum context for massive document sets |
| `MAX_RESPONSE_TOKENS` | **32,768** | Total budget for the final synthesized report |
| `PER_AGENT_MAX_TOKENS` | **16,384** | Individual budget for each specialized sub-agent |
| `AGENT_TIMEOUT_MS` | **150,000** | Maximum agent duration before graceful failure |
| `NIM_HEALTH_CHECK_TIMEOUT_MS` | **4,000** | Max latency for NIM endpoint health ping |
| `AGENT_STAGGER_DELAY_MS` | **200** | Stagger between concurrent agent launches |

### Context Window Allocation (RAG Budget)

| Source | Budget Share |
| :--- | :--- |
| Uploaded files | **70%** |
| Web search results | **30%** |

This ensures local document content is always prioritized over external web data.

---

## Model Registry

All models and their assignments are defined in `lib/engine/config.ts`:

### NVIDIA NIM Models (Primary)

| Model ID | Used By |
| :--- | :--- |
| `mistral-large-3` | Query Intelligence, Fact-Check |
| `dracarys-70b` | Web Search |
| `deepseek-v3.2` | Financial Analysis |
| `kimi-k2-thinking` | Deep Reasoning |
| `qwen3-coder-480b` | Code Generation |
| `minimax-m2.7` | Summarization |
| `nemotron-3-super` | Report Synthesis, Analysis |

### OpenRouter Fallback Models

| Model ID | Replaces |
| :--- | :--- |
| `gpt-oss-120b:free` | Most NIM models |
| `llama-3.3-70b:free` | Web Search |
| `qwen3-coder:free` | Code Generation |
| `glm-4.5-air:free` | Summarization |
| `nemotron-3:free` | Report Synthesis |

---

## Retry Configuration (`RETRY_CONFIG`)

```typescript
// lib/engine/config.ts
export const RETRY_CONFIG = {
  maxRetries: 1,
  preferFallbackChain: true,  // Use OpenRouter on first failure
  retryDelayMs: 500,
};
```

**Behavior:**
1. Agent fires request to NVIDIA NIM
2. On timeout/error → immediately switches to OpenRouter (no retry to NIM)
3. If OpenRouter also fails → returns graceful partial result

---

## Research Mode Configuration

### Source Limits by Mode

| Mode | Web Sources | Agent Timeout |
| :--- | :---: | :---: |
| `corpus` | 0 | 150s |
| `deep` | 4 | 150s |
| `pro` | 8+ | 150s |

### Switching Modes at Runtime

Research mode is passed as a parameter to `POST /api/research`:

```json
{
  "query": "Your research query",
  "mode": "deep",
  "enabledAgents": ["web_search", "analysis", "fact_check", "coding", "summary"]
}
```

---

## Tailwind & UI Configuration

### Design Tokens (`app/globals.css`)

ResAgent uses Tailwind CSS v4 with custom design tokens:

```css
/* Glassmorphism utilities */
.glass        { background: rgba(255,255,255,0.05); backdrop-filter: blur(12px); }
.glass-card   { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); }
```

### shadcn/ui Configuration (`components.json`)

Components follow the shadcn/ui convention. To add a new component:

```bash
npx shadcn@latest add <component-name>
```

---

## Next.js Configuration (`next.config.ts`)

Key settings:
- **Turbopack** enabled for faster local development
- **App Router** used exclusively (no Pages Router)
- WASM support configured for `Tesseract.js` and `pdfjs-dist`

---

*Next: [API Reference →](API-Reference)*
