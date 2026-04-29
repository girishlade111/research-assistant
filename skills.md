# Skills

This document outlines the specialized skills and agent capabilities of the ResAgent multi-agent research system.

---

## Agent Fleet

ResAgent uses a fleet of specialized AI agents, each optimized for specific tasks.

| Skill | Purpose | Model |
|-------|---------|-------|
| Query Intelligence | Refines prompts & builds research plans | `kimi-k2-thinking` |
| Web Search | Real-time data retrieval | `dracarys-70b` |
| Strategic Analysis | Pattern recognition & correlation | `nemotron-3-super` |
| Fact-Check | Verify claims against sources | `mistral-large-3` |
| Coding | Technical snippet generation | `qwen3-coder-480b` |
| Summary | Overview generation | `minimax-m2.7` |
| Report | Final synthesis & QC | `kimi-k2-thinking` |

---

## How It Works

1. **Intent Analysis** - Query is refined and classified
2. **Retrieval** - Web search + file parsing runs concurrently
3. **Synthesis** - Agents work in parallel, then results are merged

---

## Reliability

- **Auto-Fallback**: If NVIDIA NIM fails, switches to OpenRouter
- **Concurrency**: Agents run in parallel via `Promise.all`
- **Grounding**: All agents receive search results + uploaded files

---

## Token Limits

- **System Context**: 32,768 tokens
- **Max Report**: 16,384 tokens
- **Per Agent**: 8,192 tokens