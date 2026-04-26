import { NextResponse } from "next/server";
import { runResearch, runSimpleChat } from "@/lib/engine/orchestrator";
import { classifyQuery } from "@/lib/engine/query-router";
import { classifyError, userFacingMessage } from "@/lib/engine/errors";
import { detectPlanningTransition, runPlanningChat } from "@/lib/engine/planning-workflow";
import type {
  ResearchRequest,
  ResearchApiResponse,
  ApiKeys,
  AgentStatusEvent,
  ThinkingStep,
} from "@/lib/engine/types";

// ── Resolve API Keys ───────────────────────────────────────────

function getApiKeys(): ApiKeys {
  return {
    nvidiaKey: process.env.NVIDIA_API_KEY,
    openrouterKey: process.env.OPENROUTER_API_KEY,
  };
}

function hasAnyKey(keys: ApiKeys): boolean {
  return !!(keys.nvidiaKey || keys.openrouterKey);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── Streaming Response (SSE) — Smart Routing ───────────────────

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
        const workflowMode = body.workflowMode ?? "research";
        let forceResearch = workflowMode === "research";

        // ── Step 1: Fast classification + early start ────────────
        send("status", { phase: "routing", message: "Analyzing your query..." });
        send("workflow_mode", { mode: workflowMode, autoSwitched: false });

        if (workflowMode === "planning") {
          const transition = await detectPlanningTransition(
            query,
            apiKeys,
            body.conversationHistory
          );

          if (!transition.shouldBeginResearch) {
            send("route_decision", { complexity: "simple", reason: `Planning mode: ${transition.reason}` });
            send("status", { phase: "planning", message: "Building a research plan..." });

            const result = await runPlanningChat(
              query,
              apiKeys,
              body.conversationHistory,
              (chunk, done) => {
                if (chunk) send("token", { text: chunk });
                if (done) send("status", { phase: "done", message: "" });
              }
            );

            send("result", result);
            send("done", {});
            return;
          }

          send("workflow_mode", {
            mode: "research",
            autoSwitched: true,
            reason: transition.reason,
            confidence: transition.confidence,
          });
          send("status", { phase: "transition", message: "Planning complete. Starting research..." });
          forceResearch = true;
        }

        // Force-simple if all agents disabled
        if (body.disabledAgents?.length === 6) {
          send("route_decision", { complexity: "simple", reason: "All agents disabled" });
          send("status", { phase: "chat", message: "Generating response..." });

          const result = await runSimpleChat(
            query,
            apiKeys,
            (chunk, done) => {
              if (chunk) send("token", { text: chunk });
              if (done) send("status", { phase: "done", message: "" });
            },
            body.conversationHistory
          );

          send("result", result);
          send("done", {});
          return;
        }

        // Chat mode: check if user wants research, otherwise direct chat
        if (workflowMode === "chat") {
          const researchIntent = /\b(research|analyze|investigate|deep dive|detailed analysis|comprehensive report|multi-agent)\b/i.test(query);

          if (researchIntent) {
            send("workflow_mode", { mode: "research", autoSwitched: true, reason: "Research intent detected in chat" });
            send("status", { phase: "transition", message: "Research intent detected. Switching to Research Mode..." });
            forceResearch = true;
          } else {
            send("route_decision", { complexity: "simple", reason: "Chat mode active" });
            send("status", { phase: "chat", message: "Generating response..." });

            const result = await runSimpleChat(
              query,
              apiKeys,
              (chunk, done) => {
                if (chunk) send("token", { text: chunk });
                if (done) send("status", { phase: "done", message: "" });
              },
              body.conversationHistory
            );

            send("result", result);
            send("done", {});
            return;
          }
        }

        const { complexity, reason } = forceResearch
          ? { complexity: "research" as const, reason: "Research workflow active" }
          : await classifyQuery(query, apiKeys);
        send("route_decision", { complexity, reason });

        // ── Step 2a: SIMPLE → direct chat response ─────────────
        if (complexity === "simple") {
          send("status", { phase: "chat", message: "Generating response..." });

          const result = await runSimpleChat(
            query,
            apiKeys,
            (chunk, done) => {
              if (chunk) send("token", { text: chunk });
              if (done) send("status", { phase: "done", message: "" });
            }
          );

          send("result", result);
          send("done", {});
          return;
        }

        // ── Step 2b: RESEARCH → full multi-agent pipeline ──────
        send("status", { phase: "starting", message: "Initializing multi-agent research pipeline..." });

        let _routeThinkingId = 0;
        const emitThinking = (phase: string, text: string) => {
          send("thinking", {
            id: `t-${Date.now()}-route-${++_routeThinkingId}`,
            phase,
            text,
            timestamp: Date.now(),
          });
        };

        emitThinking("routing", "Analyzing query complexity and determining research strategy...");
        emitThinking("routing", `Query classified as research-grade. Launching multi-agent pipeline.`);

        const result = await runResearch(
          query,
          {
            mode: body.mode ?? "pro",
            workflowMode,
            userModelId: body.model,
            maxSources: 8,
            files: body.files,
            conversationHistory: body.conversationHistory,
            disabledAgents: body.disabledAgents,
          },
          apiKeys,
          (chunk, done) => {
            if (chunk) send("token", { text: chunk });
            if (done) send("status", { phase: "finalizing", message: "Synthesizing final report..." });
          },
          (event: AgentStatusEvent) => {
            send("agent_status", event);

            const label = event.agent.replace("-agent", "").replace(/-/g, " ");
            if (event.status === "running") {
              send("status", {
                phase: event.agent,
                message: `${capitalize(label)} Agent → ${event.model?.split("/").pop() ?? ""}`,
              });
            } else if (event.status === "done") {
              send("status", {
                phase: event.agent,
                message: `✓ ${capitalize(label)} complete${event.isFallback ? " (fallback)" : ""}`,
              });
            } else if (event.status === "failed") {
              send("status", {
                phase: event.agent,
                message: `⚠ ${capitalize(label)} failed, continuing...`,
              });
            }
          },
          (step: ThinkingStep) => {
            send("thinking", step);
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
          error: "No API keys configured. Set NVIDIA_API_KEY or OPENROUTER_API_KEY in your environment.",
        } satisfies ResearchApiResponse,
        { status: 503 }
      );
    }

    // Streaming mode (default)
    if (body.stream !== false) {
      return streamingResponse(body.query.trim(), body, apiKeys);
    }

    const workflowMode = body.workflowMode ?? "research";

    if (body.disabledAgents?.length === 6 || workflowMode === "chat") {
      const result = await runSimpleChat(body.query.trim(), apiKeys, undefined, body.conversationHistory);
      return NextResponse.json({ success: true, data: result } satisfies ResearchApiResponse);
    }

    if (workflowMode === "planning") {
      const transition = await detectPlanningTransition(
        body.query.trim(),
        apiKeys,
        body.conversationHistory
      );

      if (!transition.shouldBeginResearch) {
        const result = await runPlanningChat(
          body.query.trim(),
          apiKeys,
          body.conversationHistory
        );
        return NextResponse.json({ success: true, data: result } satisfies ResearchApiResponse);
      }
    }

    // Non-streaming mode — always use research for simplicity
    const result = await runResearch(
      body.query.trim(),
      {
        workflowMode,
        mode: body.mode ?? "pro",
        userModelId: body.model,
        maxSources: 8,
        files: body.files,
        conversationHistory: body.conversationHistory,
        disabledAgents: body.disabledAgents,
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
