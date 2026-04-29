# 📡 API Reference

> Complete reference for ResAgent's REST endpoint and Server-Sent Events (SSE) streaming contract.

---

## Base URL

| Environment | Base URL |
| :--- | :--- |
| Development | `http://localhost:3000` |
| Production | Your deployed domain |

---

## Endpoints

### `POST /api/research`

The primary endpoint. Accepts a research query and streams back real-time progress and the final report via SSE.

**File:** `app/api/research/route.ts`

#### Request

```http
POST /api/research
Content-Type: application/json
```

```json
{
  "query": "string (required)",
  "mode": "corpus | deep | pro (default: deep)",
  "enabledAgents": ["web_search", "analysis", "fact_check", "coding", "summary"],
  "files": [
    {
      "name": "document.pdf",
      "type": "application/pdf",
      "content": "<base64-encoded file content>"
    }
  ],
  "conversationHistory": [
    { "role": "user", "content": "Previous message" },
    { "role": "assistant", "content": "Previous response" }
  ],
  "userId": "string (optional, for memory personalization)"
}
```

#### Request Fields

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `query` | `string` | ✅ | The research question or topic |
| `mode` | `enum` | ❌ | Research depth: `corpus`, `deep`, or `pro` |
| `enabledAgents` | `string[]` | ❌ | Which specialized agents to activate |
| `files` | `FileInput[]` | ❌ | Uploaded documents for context grounding |
| `conversationHistory` | `Message[]` | ❌ | Prior conversation turns for context |
| `userId` | `string` | ❌ | Used for memory retrieval (future feature) |

#### Agent IDs for `enabledAgents`

| ID | Agent |
| :--- | :--- |
| `web_search` | Web Search Agent |
| `analysis` | Strategic Analysis Agent |
| `fact_check` | Fact-Check Agent |
| `coding` | Code Generation Agent |
| `summary` | Summarization Agent |

> **Note:** `query_intelligence`, `model_selector`, and `report_synthesis` are always enabled and cannot be disabled.

#### Supported File Types

| MIME Type | Format | Parser |
| :--- | :--- | :--- |
| `application/pdf` | PDF | `pdfjs-dist` |
| `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | DOCX | `mammoth` |
| `text/csv` | CSV | `PapaParse` |
| `image/png`, `image/jpeg`, `image/webp` | Image | `Tesseract.js` (WASM OCR) |

---

## SSE Event Stream

The response is a `text/event-stream` (SSE) with the following event types:

### Response Headers

```http
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

### Event Format

Each event follows the SSE format:

```
data: {"type":"<event_type>","payload":{...}}\n\n
```

---

### Event Types

#### `plan_ready`

Fired after the Query Intelligence Agent completes.

```json
{
  "type": "plan_ready",
  "payload": {
    "researchPlan": {
      "reportTitle": "string",
      "researchType": "string",
      "estimatedPages": 8,
      "dynamicSections": [
        { "id": "string", "title": "string", "description": "string", "taskType": "string" }
      ],
      "globalSearchContext": "string"
    }
  }
}
```

---

#### `models_assigned`

Fired after the Model Selector Agent completes.

```json
{
  "type": "models_assigned",
  "payload": {
    "assignments": [
      {
        "sectionId": "string",
        "primaryModel": "string",
        "fallbackModel": "string",
        "maxTokens": 16384
      }
    ],
    "nimHealthy": true
  }
}
```

---

#### `agent_update`

Fired by each agent during execution to report progress.

```json
{
  "type": "agent_update",
  "payload": {
    "agentName": "Web Search Agent",
    "status": "running | complete | failed | timeout",
    "percent": 45,
    "message": "Fetching 4 sources from Perplexity..."
  }
}
```

---

#### `phase_complete`

Fired when a macro-phase finishes.

```json
{
  "type": "phase_complete",
  "payload": {
    "phase": 1,
    "name": "Intelligence",
    "durationMs": 3420
  }
}
```

---

#### `complete`

Fired when the full pipeline finishes. Contains the complete report.

```json
{
  "type": "complete",
  "payload": {
    "report": "# Report Title\n\n## Executive Summary\n...",
    "metadata": {
      "totalDurationMs": 42000,
      "agentsUsed": ["query_intelligence", "web_search", "analysis", "report_synthesis"],
      "sourcesCount": 4,
      "tokenCount": 14200,
      "researchMode": "deep",
      "confidenceScore": 0.87
    },
    "sources": [
      { "url": "string", "title": "string", "relevanceScore": 0.92 }
    ]
  }
}
```

---

#### `error`

Fired on recoverable or fatal errors.

```json
{
  "type": "error",
  "payload": {
    "code": "NIM_UNAVAILABLE | RATE_LIMITED | INVALID_API_KEY | TIMEOUT | UNKNOWN",
    "message": "Human-readable error description",
    "retryable": true,
    "agentName": "Web Search Agent (optional)"
  }
}
```

Error codes and their meanings are defined in `lib/engine/errors.ts`.

---

## Client-Side SSE Consumption

### JavaScript / TypeScript

```typescript
const response = await fetch('/api/research', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'Your question', mode: 'deep' }),
});

const reader = response.body!.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const lines = decoder.decode(value).split('\n\n');
  for (const line of lines) {
    if (!line.startsWith('data: ')) continue;
    const event = JSON.parse(line.slice(6));

    switch (event.type) {
      case 'plan_ready':    handlePlan(event.payload); break;
      case 'agent_update':  updateAgentUI(event.payload); break;
      case 'complete':      renderReport(event.payload.report); break;
      case 'error':         showError(event.payload); break;
    }
  }
}
```

---

## Error Handling

| HTTP Status | Meaning |
| :--- | :--- |
| `200` | Stream started successfully (errors appear as SSE events) |
| `400` | Bad request — missing `query` field |
| `401` | One or more API keys are missing or invalid |
| `429` | Rate limit hit across all providers |
| `500` | Unexpected server error |

---

*Next: [FAQ →](FAQ)*
