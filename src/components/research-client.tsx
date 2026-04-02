"use client";

import { useReducer, useCallback, useRef } from "react";
import { ResearchForm } from "./research-form";
import { ResearchProgress } from "./research-progress";
import { ResearchReport } from "./research-report";
import { SSEEvent, ResearchStep, Source } from "@/types/research";

type Status = "idle" | "researching" | "streaming" | "done" | "error";

interface State {
  status: Status;
  steps: ResearchStep[];
  sources: Source[];
  report: string;
  error?: string;
}

type Action =
  | { type: "RESET" }
  | { type: "SSE_EVENT"; event: SSEEvent };

const initialState: State = {
  status: "idle",
  steps: [],
  sources: [],
  report: "",
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "RESET":
      return { ...initialState, status: "researching", error: undefined };
    case "SSE_EVENT": {
      const event = action.event;
      switch (event.type) {
        case "step":
          return { ...state, steps: [...state.steps, event.step] };
        case "sources":
          return { ...state, sources: event.sources };
        case "report_chunk":
          return {
            ...state,
            status: "streaming",
            report: state.report + event.content,
          };
        case "done":
          return { ...state, status: "done" };
        case "error":
          return { ...state, status: "error", error: event.message };
        default:
          return state;
      }
    }
    default:
      return state;
  }
}

export function ResearchClient() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const abortRef = useRef<AbortController | null>(null);

  const cancelResearch = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    dispatch({ type: "SSE_EVENT", event: { type: "done" } });
  }, []);

  const startResearch = useCallback(async (query: string) => {
    dispatch({ type: "RESET" });

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json();
        dispatch({
          type: "SSE_EVENT",
          event: { type: "error", message: err.error || "Request failed" },
        });
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop()!;

        for (const part of parts) {
          const trimmed = part.trim();
          if (trimmed.startsWith("data: ")) {
            try {
              const event: SSEEvent = JSON.parse(trimmed.slice(6));
              dispatch({ type: "SSE_EVENT", event });
            } catch {
              // Skip malformed events
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      dispatch({
        type: "SSE_EVENT",
        event: {
          type: "error",
          message: err instanceof Error ? err.message : "Connection failed",
        },
      });
    } finally {
      abortRef.current = null;
    }
  }, []);

  const isActive = state.status === "researching" || state.status === "streaming";
  const hasReport = state.report.length > 0;

  const leftPanel = (
    <>
      <ResearchForm onSubmit={startResearch} onCancel={cancelResearch} disabled={isActive} />

      {state.error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 backdrop-blur-sm px-5 py-4 text-sm text-destructive flex items-start gap-3">
          <span className="shrink-0 mt-0.5">&#x26A0;</span>
          <span>{state.error}</span>
        </div>
      )}

      <ResearchProgress steps={state.steps} isActive={state.status === "researching"} />
    </>
  );

  /* ---- Single-column: no report yet ---- */
  if (!hasReport) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 space-y-6">
        {leftPanel}
      </div>
    );
  }

  /* ---- Split-screen: report exists ---- */
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(380px,1fr)_minmax(0,2fr)] h-[calc(100vh-200px)]">
      {/* Left panel — form + progress */}
      <div className="overflow-y-auto border-b lg:border-b-0 lg:border-r border-border/50 p-6 space-y-6">
        {leftPanel}
      </div>

      {/* Right panel — report */}
      <div className="overflow-y-auto">
        <ResearchReport
          report={state.report}
          sources={state.sources}
          isStreaming={state.status === "streaming"}
          embedded
        />
      </div>
    </div>
  );
}
