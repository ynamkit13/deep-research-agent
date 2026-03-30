"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SourceBadge } from "./source-badge";
import { Source } from "@/types/research";

interface ResearchReportProps {
  report: string;
  sources: Source[];
  isStreaming: boolean;
}

export function ResearchReport({ report, sources, isStreaming }: ResearchReportProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isStreaming && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [report, isStreaming]);

  if (!report) return null;

  return (
    <div className="space-y-6">
      {/* Report */}
      <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden">
        <div className="px-5 pt-5 pb-2 flex items-center justify-between">
          <h3 className="font-heading text-lg text-foreground">Research Report</h3>
          {isStreaming && (
            <span className="inline-flex items-center gap-1.5 text-xs text-amber-dim">
              <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
              Streaming
            </span>
          )}
        </div>
        <div className="px-5 pb-6">
          <article className="prose prose-sm prose-observatory max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{report}</ReactMarkdown>
            {isStreaming && <span className="streaming-cursor" />}
            <div ref={bottomRef} />
          </article>
        </div>
      </div>

      {/* Sources */}
      {sources.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 px-1">
            <h4 className="font-heading text-base text-foreground">
              Sources
            </h4>
            <span className="text-xs text-muted-foreground tabular-nums">
              {sources.length} references
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {sources.map((source, i) => (
              <SourceBadge key={i} source={source} index={i + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
