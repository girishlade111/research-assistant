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
    const { query, userId, conversationId, mode, workflowMode, files, conversationHistory, disabledAgents } = body;

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
    let isClosed = false;

    const sendSSE = (data: Record<string, unknown>, eventName?: string) => {
      if (isClosed) return;
      try {
        const event = eventName || (data.type as string) || 'message';
        writer.write(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      } catch (err) {
        isClosed = true;
        console.warn('[SSE] Write failed:', err);
      }
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
          mode: workflowMode || mode || 'pro',
          files: files || [],
          conversationHistory: conversationHistory || [],
          disabledAgents: disabledAgents || [],
          apiKeys,
          onProgress: (event) => {
            const eventName = event.type === 'agent_update' ? 'agent_status'
              : event.type === 'complete' ? 'done'
              : event.type === 'error' ? 'error'
              : 'status';
            sendSSE(event as Record<string, unknown>, eventName);
          }
        });
        sendSSE({ ...finalReport } as Record<string, unknown>, 'result');
      } catch (error: unknown) {
        const msg: string = error instanceof Error ? error.message : String(error);
        console.error('[Pipeline Error]', msg);

        const isRecoverable = /rate.?limit|429|openrouter|timeout|provider/i.test(msg);
        if (isRecoverable) {
          sendSSE({ message: 'Some sources were unavailable - results may be partial.' }, 'status');
        } else {
          sendSSE({ message: msg }, 'error');
        }
      } finally {
        isClosed = true; writer.close();
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
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
