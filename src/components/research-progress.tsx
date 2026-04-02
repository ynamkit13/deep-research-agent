"use client";

import { Progress } from "@/components/ui/progress";
import { ResearchStep } from "@/types/research";

const MAX_ITERATIONS = 5;

const STEP_ICONS: Record<ResearchStep["type"], { icon: string; color: string }> = {
  planning: { icon: "\u2726", color: "text-amber" },
  searching: { icon: "\u2315", color: "text-blue-400" },
  analyzing: { icon: "\u25C8", color: "text-emerald-400" },
  finalizing: { icon: "\u2713", color: "text-amber" },
};

const STEP_LABELS: Record<ResearchStep["type"], string> = {
  planning: "Planning",
  searching: "Searching",
  analyzing: "Analyzing",
  finalizing: "Finalizing",
};

interface ResearchProgressProps {
  steps: ResearchStep[];
  isActive: boolean;
}

export function ResearchProgress({ steps, isActive }: ResearchProgressProps) {
  if (steps.length === 0) return null;

  const iteration = steps.filter((s) => s.type === "analyzing").length;
  const isFinalizing = steps.some((s) => s.type === "finalizing");
  const progressPercent = isFinalizing
    ? 100
    : Math.round((iteration / MAX_ITERATIONS) * 80);

  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Research Progress</h3>
          {isActive && (
            <span className="text-xs font-medium text-amber-dim tabular-nums">
              {isFinalizing ? "Writing report\u2026" : `Iteration ${iteration} / ${MAX_ITERATIONS}`}
            </span>
          )}
        </div>
        {isActive && (
          <div className="progress-glow">
            <Progress value={progressPercent} className="h-1.5 bg-muted" />
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="px-5 pb-5">
        <div className="relative">
          {/* Vertical line */}
          {steps.length > 1 && (
            <div
              className="absolute left-[15px] top-[8px] w-px bg-gradient-to-b from-amber/40 via-border to-transparent"
              style={{ height: `calc(100% - 16px)` }}
            />
          )}

          <div className="space-y-0.5">
            {steps.map((step, i) => {
              const { icon, color } = STEP_ICONS[step.type];
              const isLast = i === steps.length - 1;

              return (
                <div
                  key={i}
                  className="animate-fade-in relative flex items-start gap-3 py-2"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {/* Dot */}
                  <div className="relative z-10 flex items-center justify-center w-[30px] h-[30px] shrink-0">
                    <div
                      className={`flex items-center justify-center w-[30px] h-[30px] rounded-full border text-sm ${
                        isLast && isActive
                          ? "border-amber/50 bg-amber-glow pulse-dot"
                          : "border-border bg-muted/50"
                      }`}
                    >
                      <span className={color}>{icon}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {STEP_LABELS[step.type]}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/70 mt-0.5 leading-relaxed">
                      {step.message}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Loading placeholder */}
            {isActive && (
              <div className="animate-fade-in relative flex items-start gap-3 py-2">
                <div className="relative z-10 flex items-center justify-center w-[30px] h-[30px] shrink-0">
                  <div className="w-[30px] h-[30px] rounded-full border border-border bg-muted/30 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-amber/50 animate-pulse" />
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <div className="h-3 w-48 rounded-full bg-muted/50 animate-pulse" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
