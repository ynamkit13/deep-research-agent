import { NextRequest } from "next/server";
import { runResearchLoop } from "@/lib/research-agent";
import { SSEEvent } from "@/types/research";

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return new Response(JSON.stringify({ error: "Query is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!process.env.OPENROUTER_API_KEY || !process.env.EXA_API_KEY) {
    return new Response(
      JSON.stringify({ error: "API keys not configured. Check .env.local" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function sendEvent(event: SSEEvent) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
        );
      }

      try {
        await runResearchLoop(query.trim(), sendEvent);
      } catch (err) {
        sendEvent({
          type: "error",
          message: err instanceof Error ? err.message : String(err),
        });
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
