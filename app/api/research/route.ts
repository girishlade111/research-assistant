import { NextResponse } from "next/server";
import { runResearch } from "@/lib/engine/orchestrator";
import { classifyError, userFacingMessage } from "@/lib/engine/errors";
import type { ResearchRequest, ResearchApiResponse, ApiKeys } from "@/lib/engine/types";

// ── Resolve API Keys ───────────────────────────────────────────

function getApiKeys(): ApiKeys {
  return {
    nvidiaKey: process.env.NVIDIA_API_KEY,
    openrouterKey: process.env.OPENROUTER_API_KEY,
    perplexityKey: process.env.PERPLEXITY_API_KEY,
  };
}

function hasAnyKey(keys: ApiKeys): boolean {
  return !!(keys.nvidiaKey || keys.openrouterKey || keys.perplexityKey);
}

// ── Streaming Response (SSE) ───────────────────────────────────

function streamingResponse(
  query: string,
  body: ResearchRequest,
  apiKeys: ApiKeys
): Response {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      }

      try {
        send("status", { phase: "searching", message: "Searching sources..." });

        const result = await runResearch(
          query,
          {
            mode: body.mode ?? "pro",
            userModelId: body.model,
            maxSources: 6,
          },
          apiKeys,
          // Stream callback — forward LLM tokens to client
          (chunk, done) => {
            if (chunk) send("token", { text: chunk });
            if (done) send("status", { phase: "normalizing", message: "Processing results..." });
          }
        );

        send("result", result);
        send("done", {});
      } catch (err) {
        const classified = classifyError(err);
        send("error", { message: userFacingMessage(classified), kind: classified.kind });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

// ── POST Handler ───────────────────────────────────────────────

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as ResearchRequest;

    if (!body.query?.trim()) {
      return NextResponse.json(
        { success: false, error: "Query is required" } satisfies ResearchApiResponse,
        { status: 400 }
      );
    }

    const apiKeys = getApiKeys();

    if (!hasAnyKey(apiKeys)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No API keys configured. Set NVIDIA_API_KEY, OPENROUTER_API_KEY, or PERPLEXITY_API_KEY in your environment.",
        } satisfies ResearchApiResponse,
        { status: 503 }
      );
    }

    // Streaming mode
    if (body.stream) {
      return streamingResponse(body.query.trim(), body, apiKeys);
    }

    // Non-streaming mode
    const result = await runResearch(
      body.query.trim(),
      {
        mode: body.mode ?? "pro",
        userModelId: body.model,
        maxSources: 6,
        files: body.files,
      },
      apiKeys
    );

    return NextResponse.json({ success: true, data: result } satisfies ResearchApiResponse);
  } catch (err) {
    const classified = classifyError(err);
    console.error("[api/research]", classified.kind, classified.message);

    const status =
      classified.kind === "rate_limit"
        ? 429
        : classified.kind === "auth"
          ? 401
          : 500;

    return NextResponse.json(
      { success: false, error: userFacingMessage(classified) } satisfies ResearchApiResponse,
      { status }
    );
  }
}
