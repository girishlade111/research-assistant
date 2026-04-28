import type { ApiKeys } from "../types";

const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

export interface DebugTestResult {
  provider: string;
  success: boolean;
  model: string;
  responsePreview?: string;
  tokensUsed?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  latencyMs: number;
  error?: string;
}

export async function testNvidiaConnection(apiKeys: ApiKeys): Promise<DebugTestResult> {
  const apiKey = apiKeys.nvidiaKey;
  const model = "mistralai/mistral-large-3-675b-instruct-2512";
  const start = Date.now();

  console.log("[DEBUG] NVIDIA API Key present:", !!apiKey);
  console.log("[DEBUG] NVIDIA API Key prefix:", apiKey?.slice(0, 10) + "...");

  if (!apiKey) {
    return { provider: "nvidia", success: false, model, latencyMs: 0, error: "NVIDIA_API_KEY is missing" };
  }

  try {
    const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "Reply with exactly: WORKING" }],
        max_tokens: 10,
        temperature: 0,
      }),
    });

    const latencyMs = Date.now() - start;

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[DEBUG] NVIDIA HTTP Error:", response.status, errorBody.slice(0, 300));
      return { provider: "nvidia", success: false, model, latencyMs, error: `HTTP ${response.status}: ${errorBody.slice(0, 200)}` };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";
    const usage = data.usage ?? { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

    console.log("[DEBUG] NVIDIA Response:", { content, usage, latencyMs });

    return {
      provider: "nvidia",
      success: true,
      model: data.model ?? model,
      responsePreview: content.slice(0, 100),
      tokensUsed: usage,
      latencyMs,
    };
  } catch (error) {
    const latencyMs = Date.now() - start;
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[DEBUG] NVIDIA Connection FAILED:", msg);
    return { provider: "nvidia", success: false, model, latencyMs, error: msg };
  }
}

export async function testOpenRouterConnection(apiKeys: ApiKeys): Promise<DebugTestResult> {
  const apiKey = apiKeys.openrouterKey;
  const model = "meta-llama/llama-3.3-70b-instruct:free";
  const start = Date.now();

  console.log("[DEBUG] OpenRouter API Key present:", !!apiKey);
  console.log("[DEBUG] OpenRouter API Key prefix:", apiKey?.slice(0, 12) + "...");

  if (!apiKey) {
    return { provider: "openrouter", success: false, model, latencyMs: 0, error: "OPENROUTER_API_KEY is missing" };
  }

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://research-agent.app",
        "X-Title": "ResAgent",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "Reply with exactly: WORKING" }],
        max_tokens: 10,
        temperature: 0,
      }),
    });

    const latencyMs = Date.now() - start;

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[DEBUG] OpenRouter HTTP Error:", response.status, errorBody.slice(0, 300));
      return { provider: "openrouter", success: false, model, latencyMs, error: `HTTP ${response.status}: ${errorBody.slice(0, 200)}` };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";
    const usage = data.usage ?? { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

    console.log("[DEBUG] OpenRouter Response:", { content, usage, latencyMs });

    return {
      provider: "openrouter",
      success: true,
      model: data.model ?? model,
      responsePreview: content.slice(0, 100),
      tokensUsed: usage,
      latencyMs,
    };
  } catch (error) {
    const latencyMs = Date.now() - start;
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[DEBUG] OpenRouter Connection FAILED:", msg);
    return { provider: "openrouter", success: false, model, latencyMs, error: msg };
  }
}

export async function runAllConnectionTests(apiKeys: ApiKeys): Promise<DebugTestResult[]> {
  console.log("═══════════════════════════════════════════");
  console.log("[DEBUG] Running API Connection Tests...");
  console.log("═══════════════════════════════════════════");

  const results = await Promise.allSettled([
    testNvidiaConnection(apiKeys),
    testOpenRouterConnection(apiKeys),
  ]);

  const testResults = results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : { provider: i === 0 ? "nvidia" : "openrouter", success: false, model: "unknown", latencyMs: 0, error: String(r.reason) }
  );

  console.log("═══════════════════════════════════════════");
  console.log("[DEBUG] Test Summary:");
  for (const r of testResults) {
    console.log(`  ${r.provider}: ${r.success ? "✓ PASS" : "✗ FAIL"} (${r.latencyMs}ms) ${r.error ?? ""}`);
    if (r.tokensUsed) console.log(`    tokens: ${JSON.stringify(r.tokensUsed)}`);
  }
  console.log("═══════════════════════════════════════════");

  return testResults;
}
