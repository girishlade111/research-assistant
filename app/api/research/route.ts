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
        // Map backend `type` literals to the small set of event names
        // the frontend readStream() switch handles. Anything unknown falls
        // through to 'status' so the UI still updates.
        const type = (data.type as string) || '';
        const event = eventName || (
          type === 'agent_update' ? 'agent_status' :
          type === 'plan_ready' ? 'status' :
          type === 'models_assigned' ? 'status' :
          type === 'phase_complete' ? 'status' :
          type === 'complete' ? 'done' :
          type === 'error' ? 'error' :
          type === 'warning' ? 'status' :
          type === 'result' ? 'result' :
          'status'
        );

        const sseString = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        writer.write(encoder.encode(sseString));
      } catch (err) {
        isClosed = true;
        console.warn('[SSE] Write failed — stream closed:', err);
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
            // sendSSE derives the event name from event.type
            sendSSE(event as Record<string, unknown>);
          }
        });
        sendSSE({ type: 'result', ...finalReport } as Record<string, unknown>, 'result');
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
