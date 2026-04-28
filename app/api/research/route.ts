import { NextResponse } from "next/server";
import { runResearchOrchestrator } from "@/lib/engine/orchestrator";
import { runAllConnectionTests } from "@/lib/engine/debug/api-test";
import type { ApiKeys } from "@/lib/engine/types";

function getApiKeys(): ApiKeys {
  return {
    nvidiaKey: process.env.NVIDIA_API_KEY,
    openrouterKey: process.env.OPENROUTER_API_KEY,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, userId, conversationId, mode } = body;

    const apiKeys = getApiKeys();
    if (!apiKeys.nvidiaKey && !apiKeys.openrouterKey) {
      return NextResponse.json(
        { success: false, error: "No API keys configured." },
        { status: 503 }
      );
    }

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Query is required" },
        { status: 400 }
      );
    }

    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const sendSSE = (data: object) => {
      writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    };

    // Background execution
    (async () => {
      try {
        // Debug: test API connectivity before research
        if (process.env.NODE_ENV === "development") {
          const testResults = await runAllConnectionTests(apiKeys);
          sendSSE({ type: "debug", apiTests: testResults });
        }

        const finalReport = await runResearchOrchestrator({
          userQuery: query,
          userId,
          conversationId,
          researchMode: mode || 'deep',
          apiKeys,
          onProgress: sendSSE
        });
        sendSSE({ type: "result", data: finalReport });
      } catch (error: any) {
        const msg: string = error?.message ?? String(error);
        console.error('[Pipeline Error]', msg);

        const isRecoverable = /rate.?limit|429|openrouter|timeout|provider/i.test(msg);
        if (isRecoverable) {
          sendSSE({
            type: 'warning',
            message: 'Some sources were unavailable — results may be partial.',
          });
        } else {
          sendSSE({ type: 'error', message: msg });
        }
      } finally {
        writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no'  // Nginx buffering disable
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
