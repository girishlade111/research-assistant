# Skills

This document details the specialized skills and agent capabilities of the ResAgent multi-agent research system.

---

## Agent Fleet Overview

ResAgent uses a fleet of 7 specialized AI agents, each optimized for specific tasks. Agents run in parallel during the synthesis phase for maximum efficiency.

| # | Agent | Purpose | Primary Model | Fallback Model |
|---|-------|---------|--------------|---------------|
| 1 | **Query Intelligence** | Refines prompts & builds research plans | `kimi-k2-thinking` | `gpt-oss-120b:free` |
| 2 | **Web Search** | Real-time data retrieval | `dracarys-70b` | `llama-3.3-70b:free` |
| 3 | **Strategic Analysis** | Pattern recognition & correlation | `nemotron-3-super` | `nemotron-3:free` |
| 4 | **Fact-Check** | Verify claims against sources | `mistral-large-3` | `gpt-oss-120b:free` |
| 5 | **Coding** | Technical snippet generation | `qwen3-coder-480b` | `qwen3-coder:free` |
| 6 | **Summary** | Overview generation | `minimax-m2.7` | `glm-4.5-air:free` |
| 7 | **Report** | Final synthesis & quality control | `kimi-k2-thinking` | `gpt-oss-120b:free` |

---

## Task Types

Each agent is assigned a specific task type based on the research section requirements:

| Task Type | Description | Used By |
|----------|-------------|--------|
| `search` | Web search & data retrieval | Web Search Agent |
| `query` | Query refinement & planning | Query Intelligence Agent |
| `analysis` | Pattern recognition & correlation | Strategic Analysis Agent |
| `coding` | Technical snippet generation | Coding Agent |
| `summary` | High-speed overview | Summary Agent |
| `fact-check` | Verification against sources | Fact-Check Agent |
| `report` | Final markdown assembly | Report Agent |
| `default` | General purpose | Any agent |

---

## Intent Types

The system classifies user queries into intent types to route to appropriate agents:

| Intent | Description |
|--------|-------------|
| `coding` | Code generation, algorithms, technical implementation |
| `research` | In-depth research with sources |
| `comparison` | Comparing options, pros/cons |
| `explanation` | Understanding concepts |
| `factual` | Specific facts, dates, numbers |
| `general` | General conversation |

---

## Research Modes

ResAgent supports three research modes:

| Mode | Description | Sources |
|------|-------------|----------|
| **Corpus** | File-only research | User-uploaded PDFs, DOCX, Images |
| **Deep** | Files + targeted search | 4 web sources |
| **Pro** | Exhaustive research | 8+ web sources + deep reasoning |

---

## How It Works

### Three-Phase Execution:

1. **Intelligence Phase** - Query Intelligence Agent refines the query and creates a research blueprint with dynamic sections

2. **Retrieval Phase** - Concurrent execution:
   - Web search runs in parallel
   - File parsing (PDF/DOCX/OCR) runs concurrently
   - Results are chunked and scored for relevance

3. **Synthesis Phase** - Parallel agent execution:
   - All section agents work simultaneously
   - Results are aggregated
   - Report Synthesis Agent merges into final output

---

## Provider Architecture

### Primary: NVIDIA NIM
- High-performance inference
- 4ms health check timeout
- Automatic fallback on failure

### Fallback: OpenRouter
- Free-tier resilient models
- Used when primary fails or timeouts

---

## Reliability Features

| Feature | Description |
|--------|-------------|
| **Auto-Fallback** | If NVIDIA NIM fails, switches to OpenRouter automatically |
| **Concurrency** | Agents run in parallel via `Promise.all` |
| **Graceful Timeout** | 150s timeout per agent with partial results |
| **Token Budgeting** | 70% for local files, 30% for web results |
| **Semantic Grounding** | Content is scored for relevance before use |

---

## Token Limits

| Limit | Value | Description |
|-------|-------|-------------|
| **System Context** | 32,768 tokens | Global context window |
| **Max Report** | 16,384 tokens | Final report output |
| **Per Agent** | 8,192 tokens | Individual agent budget |
| **Health Check** | 4,000ms | Primary endpoint timeout |

---

## File Support

ResAgent can parse and process:

| File Type | Library | Purpose |
|----------|---------|---------|
| PDF | `pdfjs-dist` | High-fidelity text extraction |
| DOCX | `mammoth` | Semantic HTML conversion |
| CSV | `PapaParse` | Stream parsing |
| Images | `Tesseract.js` | OCR/WASM text extraction |

---

## Output Formats

Final reports can be exported as:

- **Markdown** (.md)
- **PDF** (via jspdf + autotable)

---

## Agent Detailed Specifications

### 1. Query Intelligence Agent

**Purpose**: Refines raw user queries and creates a structured research blueprint.

**Key Responsibilities**:
- Intent classification (coding, research, comparison, explanation, factual, general)
- Query expansion with relevant keywords and subtopics
- Dynamic section planning based on research type
- Token budget estimation

**Function**: `runQueryIntelligenceAgent(query, searchMode, apiKeys, context)`

**Input**: Raw user query + uploaded files context
**Output**: Research plan with dynamic sections, enhanced query, subtopics

---

### 2. Web Search Agent

**Purpose**: Real-time data retrieval from the web using Perplexity Sonar API.

**Key Responsibilities**:
- Concurrent search requests across multiple sources
- Result ranking by relevance and recency
- Source citation extraction
- Snippet generation for context

**Function**: Performs search using `dracarys-70b` model
**Search Provider**: Perplexity Sonar API
**Max Sources**: 8 (Pro mode), 4 (Deep mode)

---

### 3. Strategic Analysis Agent

**Purpose**: Pattern recognition and correlation analysis.

**Key Responsibilities**:
- Trend identification from data
- Correlation mapping between entities
- Risk assessment
- Comparative analysis

**Model**: `nemotron-3-super` (primary), `nemotron-3:free` (fallback)

---

### 4. Fact-Check Agent

**Purpose**: Verifies claims against source materials.

**Key Responsibilities**:
- Claim extraction from generated content
- Source verification
- Accuracy scoring
- Flagging unverified statements

**Model**: `mistral-large-3` (primary), `gpt-oss-120b:free` (fallback)

---

### 5. Coding Agent

**Purpose**: Technical snippet and algorithm generation.

**Key Responsibilities**:
- Code generation in multiple languages
- Algorithm explanation
- Optimization suggestions
- Bug detection and fixes

**Model**: `qwen3-coder-480b` (primary), `qwen3-coder:free` (fallback)
**Supported Languages**: TypeScript, JavaScript, Python, Go, Rust, C++

---

### 6. Summary Agent

**Purpose**: High-speed overview generation.

**Key Responsibilities**:
- Key finding extraction
- Concise summarization
- Bullet point generation
- Executive summary creation

**Model**: `minimax-m2.7` (primary), `glm-4.5-air:free` (fallback)

---

### 7. Report Synthesis Agent

**Purpose**: Final markdown assembly and quality control.

**Key Responsibilities**:
- Merging all agent outputs
- Format standardization
- Citation integration
- Final QA check

**Model**: `kimi-k2-thinking` (primary), `gpt-oss-120b:free` (fallback)

---

## Model Registry

### NVIDIA NIM Models (Primary)

| Model | Context | Purpose |
|-------|---------|---------|
| `kimi-k2-thinking` | 131K | Reasoning & planning |
| `dracarys-70b` | 131K | Web search |
| `nemotron-3-super` | 131K | Strategic analysis |
| `mistral-large-3` | 131K | General tasks |
| `qwen3-coder-480b` | 131K | Code generation |
| `minimax-m2.7` | 131K | Summarization |

### OpenRouter Models (Fallback)

| Model | Context | Purpose |
|-------|---------|---------|
| `gpt-oss-120b:free` | 32K | General tasks |
| `llama-3.3-70b:free` | 32K | Search fallback |
| `nemotron-3:free` | 32K | Analysis |
| `qwen3-coder:free` | 32K | Code |
| `glm-4.5-air:free` | 32K | Summary |

---

## API Integration

### Environment Variables Required

```env
# Primary (NVIDIA NIM)
NVIDIA_API_KEY=nvapi-...

# Fallback (OpenRouter)
OPENROUTER_API_KEY=sk-or-...

# Web Search (Perplexity)
SONAR_API_KEY=pplx-...
```

### Health Check

- **Endpoint**: NVIDIA NIM health API
- **Timeout**: 4,000ms
- **Failure Action**: Auto-swap to OpenRouter

---

## MCP Integration

ResAgent supports Model Context Protocol (MCP) servers for extended capabilities.

### Available MCP Servers

| Server | Purpose | Install |
|--------|---------|---------|
| **filesystem** | Local file operations | `npx @modelcontextprotocol/server-filesystem` |
| **fetch** | Web content fetching | `npx @modelcontextprotocol/server-fetch` |
| **brave-search** | Real-time web search | `npx @anthropic/server-brave-search` |
| **github** | GitHub API operations | `npx @github/mcp-server` |
| **postgres** | PostgreSQL queries | `npx @modelcontextprotocol/server-postgres` |
| **sqlite** | SQLite databases | `npx @modelcontextprotocol/server-sqlite` |
| **memory** | Knowledge graph | `npx @modelcontextprotocol/server-memory` |
| **slack** | Slack messaging | `npx @modelcontextprotocol/server-slack` |
| **notion** | Notion workspace | `npx notion-mcp-server` |
| **puppeteer** | Browser automation | `npx @anthropic/server-puppeteer` |
| **playwright** | Browser automation (advanced) | `npx @playwright/mcp` |
| **browserbase** | Cloud browser automation | `npx @browserbase/mcp-server` |
| **cloudflare-browser** | Cloudflare browser | `npx @cloudflare/mcp-browser` |
| **playwright** | Browser testing | `npx @playwright/mcp-server` |
| **google-search** | Google search | `npx @mcp-server/google-search-mcp` |
| **google-maps** | Google Maps API | `npx @modelcontextprotocol/server-google-maps` |
| **google-workspace** | Google Docs/Sheets/Calend... | `npx @google-workspace/mcp` |
| **gcloud** | Google Cloud CLI | `npx @google-cloud/gcloud-mcp` |
| **aws** | AWS services | `npx @awslabs/mcp-server` |
| **aws-kb-retrieval** | AWS Bedrock KB | `npx @modelcontextprotocol/server-aws-kb-retrieval` |
| **aws-iac** | AWS IaC | `uvx awslabs-aws-iac-mcp-server` |
| **aws-docs** | AWS documentation | `uvx awslabs-aws-docs-mcp-server` |
| **azure** | Azure services | `npx @azure/mcp` |
| **azure-ai** | Azure OpenAI | `npx @azure/ai-mcp` |
| **azure-vm** | Azure Virtual Machines | `npx @azure/mcp vm` |
| **netlify** | Netlify deployments | `npx @netlify/mcp` |
| **firebase** | Firebase services | `npx firebase-tools mcp` |
| **supabase** | Supabase database | `npx @supabase/mcp-server-supabase` |
| **figma** | Figma designs | `npx figma-developer-mcp` |
| **openai** | OpenAI chat models | `npx @mzxrai/mcp-openai` |
| **openai-full** | Full OpenAI API | `npx openai-mcp-server` |
| **appwrite** | Appwrite backend | `uvx mcp-server-appwrite` |
| **appwrite-docs** | Appwrite docs | `uvx mcp-server-appwrite` |
| **google-sheets** | Google Sheets | `npx @modelcontextprotocol/server-gspread` |
| **excel** | Excel files | `uvx excel-mcp` |
| **mcp-everything** | Test server (all features) | `npx @modelcontextprotocol/server-everything` |
| **anthropic-sdk** | Build MCP servers | `npm i @anthropic-ai/sdk` |

### MCP API Endpoint

```
POST /api/mcp
```

**Request:**
```json
{
  "server": "filesystem",
  "tool": "read_file",
  "args": { "path": "/uploads/document.pdf" }
}
```

### MCP Environment Variables

```env
GITHUB_TOKEN=ghp_...
BRAVE_API_KEY=...
DATABASE_URL=postgresql://...
SLACK_BOT_TOKEN=xoxb-...
NOTION_API_KEY=secret_...
```