import type {
  LLMResponse,
  LLMStreamChunk,
  LLMRequestOptions,
  StreamCallback,
} from "../types";
import { NVIDIA_BASE_URL, RETRY_CONFIG } from "../config";
import { ResearchError } from "../errors";

// ── Request Helper ─────────────────────────────────────────────

function buildHeaders(apiKey: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
}

function buildBody(options: LLMRequestOptions) {
  return {
    model: options.model,
    messages: options.messages,
    max_tokens: options.maxTokens,
    temperature: options.temperature,
    stream: options.stream ?? false,
    top_p: 0.7,
    frequency_penalty: 0,
    presence_penalty: 0,
  };
}

function handleErrorStatus(status: number): ResearchError {
  if (status === 429)
    return new ResearchError("NVIDIA rate limit exceeded", "rate_limit", {
      provider: "nvidia",
      statusCode: 429,
    });
  if (status === 401 || status === 403)
    return new ResearchError("NVIDIA API key invalid", "auth", {
      provider: "nvidia",
      statusCode: status,
    });
  return new ResearchError(`NVIDIA API error: ${status}`, "provider_down", {
    provider: "nvidia",
    statusCode: status,
  });
}

// ── Timeout Helper ────────────────────────────────────────────

const DEFAULT_TIMEOUT_MS = 90_000; // 90 seconds — agents generate large JSON outputs

function makeSignal(timeoutMs?: number): AbortSignal {
  return AbortSignal.timeout(timeoutMs ?? DEFAULT_TIMEOUT_MS);
}

// ── Non-Streaming Completion ───────────────────────────────────

export async function nvidiaComplete(
  apiKey: string,
  options: LLMRequestOptions
): Promise<LLMResponse> {
  const res = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: buildHeaders(apiKey),
    body: JSON.stringify(buildBody({ ...options, stream: false })),
    signal: makeSignal(options.timeoutMs),
  });

  if (!res.ok) throw handleErrorStatus(res.status);

  const data = await res.json();
  const choice = data.choices?.[0];

  return {
    content: choice?.message?.content ?? "",
    model_used: data.model ?? options.model,
    provider: "nvidia",
    usage: {
      prompt_tokens: data.usage?.prompt_tokens ?? 0,
      completion_tokens: data.usage?.completion_tokens ?? 0,
      total_tokens: data.usage?.total_tokens ?? 0,
    }
  };
}

// ── Streaming Completion ───────────────────────────────────────

export async function nvidiaStream(
  apiKey: string,
  options: LLMRequestOptions,
  onChunk: StreamCallback
): Promise<LLMResponse> {
  const res = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: buildHeaders(apiKey),
    body: JSON.stringify(buildBody({ ...options, stream: true })),
    signal: makeSignal(options.timeoutMs ?? 60_000),
  });

  if (!res.ok) throw handleErrorStatus(res.status);
  if (!res.body) throw new ResearchError("No response body for stream", "network", { provider: "nvidia" });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullContent = "";
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data:")) continue;

        const payload = trimmed.slice(5).trim();
        if (payload === "[DONE]") {
          onChunk("", true);
          break;
        }

        try {
          const parsed = JSON.parse(payload);
          const delta = parsed.choices?.[0]?.delta?.content ?? "";
          if (delta) {
            fullContent += delta;
            onChunk(delta, false);
          }
        } catch {
          // skip malformed JSON chunks
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return {
    content: fullContent,
    model_used: options.model,
    provider: "nvidia",
    usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
  };
}

// ── Retry Wrapper ──────────────────────────────────────────────

export async function nvidiaWithRetry(
  apiKey: string,
  options: LLMRequestOptions,
  onChunk?: StreamCallback
): Promise<LLMResponse> {
  let lastError: ResearchError | null = null;

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      if (options.stream && onChunk) {
        return await nvidiaStream(apiKey, options, onChunk);
      }
      return await nvidiaComplete(apiKey, options);
    } catch (err) {
      lastError =
        err instanceof ResearchError
          ? err
          : new ResearchError(String(err), "unknown", { provider: "nvidia" });

      if (!lastError.retryable || attempt === RETRY_CONFIG.maxRetries) break;

      const delay = Math.min(
        RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt),
        RETRY_CONFIG.maxDelayMs
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError ?? new ResearchError("NVIDIA: all retries exhausted", "unknown", { provider: "nvidia" });
}

export async function callNvidiaModel(params: {
  modelId: string;
  systemPrompt: string;
  userMessage: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<{ content: string; tokensUsed: number }> {

  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) throw Object.assign(new Error('NVIDIA API key missing'), { status: 401 });

  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: params.modelId,
      messages: [
        { role: 'system', content: params.systemPrompt },
        { role: 'user', content: params.userMessage }
      ],
      temperature: params.temperature ?? 0.3,
      max_tokens: params.maxTokens ?? 8192
    })
  });

  // HTTP error असेल तर status code सहित throw करा
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const err = new Error(`NVIDIA API error: ${response.status}`) as any;
    err.status = response.status;
    err.body = errorBody;
    throw err;
  }

  const data = await response.json();
  return {
    content: data.choices?.[0]?.message?.content || '',
    tokensUsed: data.usage?.total_tokens || 0
  };
}
