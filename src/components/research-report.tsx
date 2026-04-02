"use client";

import { useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SourceBadge } from "./source-badge";
import { ExportReportButton } from "./export-report-button";
import { Source } from "@/types/research";

interface ResearchReportProps {
  report: string;
  sources: Source[];
  isStreaming: boolean;
  embedded?: boolean;
}

export function ResearchReport({
  report,
  sources,
  isStreaming,
  embedded = false,
}: ResearchReportProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLElement>(null);
  const userScrolledRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleScroll = useCallback(() => {
    if (!isStreaming) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    userScrolledRef.current = distanceFromBottom > 80;
  }, [isStreaming]);

  useEffect(() => {
    if (isStreaming) {
      userScrolledRef.current = false;
    }
  }, [isStreaming]);

  useEffect(() => {
    if (!isStreaming || userScrolledRef.current) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 50);
  }, [report, isStreaming]);

  if (!report) return null;

  const pad = embedded ? "px-6" : "px-5";

  const reportContent = (
    <>
      {/* Sticky header */}
      <div className={`report-header sticky top-0 z-10 backdrop-blur-md flex items-center justify-between border-b ${embedded ? "px-6 pt-5 pb-3" : "px-5 pt-5 pb-3"}`}>
        <h3 className="text-sm font-semibold uppercase tracking-wider">Research Report</h3>
        <div className="flex items-center gap-3">
          {isStreaming && (
            <span className="streaming-indicator inline-flex items-center gap-1.5 text-xs">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" />
              Streaming
            </span>
          )}
          {!isStreaming && report && (
            <ExportReportButton
              reportRef={articleRef}
              reportMarkdown={report}
              sources={sources}
            />
          )}
        </div>
      </div>

      {/* Article */}
      <div className={`${pad} py-6`}>
        <article ref={articleRef} className="prose prose-observatory max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{report}</ReactMarkdown>
        </article>
      </div>

      {/* Sources */}
      {sources.length > 0 && (
        <div className={`${pad} pb-6 space-y-3`}>
          <div className="flex items-center gap-3">
            <h4 className="sources-header text-sm font-semibold uppercase tracking-wider">Sources</h4>
            <span className="text-xs text-muted-foreground tabular-nums">
              {sources.length} references
            </span>
            <div className="sources-divider flex-1 h-px bg-border" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {sources.map((source, i) => (
              <SourceBadge key={i} source={source} index={i + 1} />
            ))}
          </div>
        </div>
      )}
    </>
  );

  /* Embedded mode: light panel */
  if (embedded) {
    return (
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="report-light h-full overflow-y-auto"
      >
        {reportContent}
      </div>
    );
  }

  /* Standalone mode: light card */
  return (
    <div className="space-y-6">
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="report-light rounded-2xl border border-border overflow-hidden max-h-[600px] overflow-y-auto"
      >
        {reportContent}
      </div>
    </div>
  );
}
