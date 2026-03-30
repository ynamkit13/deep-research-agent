import { SSEEvent, Source } from "@/types/research";
import { searchWeb } from "./exa";
import { chatCompletionJSON, chatCompletionStream } from "./openrouter";
import {
  PLAN_PROMPT,
  ANALYZE_PROMPT,
  REPORT_PROMPT,
  buildPlanUserPrompt,
  buildAnalyzeUserPrompt,
  buildReportUserPrompt,
} from "./prompts";

const MAX_ITERATIONS = 5;

interface PlanResponse {
  reasoning: string;
  action: "search" | "finalize";
  queries: string[];
}

interface AnalyzeResponse {
  reasoning: string;
  action: "search" | "finalize";
  queries: string[];
  key_findings_so_far: string[];
}

function deduplicateSources(sources: Source[]): Source[] {
  const seen = new Set<string>();
  return sources.filter((s) => {
    if (seen.has(s.url)) return false;
    seen.add(s.url);
    return true;
  });
}

function buildSourceSummaries(sources: Source[]): string {
  return sources
    .map(
      (s, i) =>
        `[${i + 1}] "${s.title}" (${s.url})\n${s.snippet.slice(0, 500)}`
    )
    .join("\n\n");
}

export async function runResearchLoop(
  query: string,
  sendEvent: (event: SSEEvent) => void
): Promise<void> {
  let accumulatedSources: Source[] = [];
  let keyFindings: string[] = [];
  let iteration = 0;

  // Step 1: Plan initial searches
  sendEvent({
    type: "step",
    step: { type: "planning", message: "Analyzing your query and planning research strategy..." },
  });

  let plan: PlanResponse;
  try {
    plan = await chatCompletionJSON<PlanResponse>(
      PLAN_PROMPT,
      buildPlanUserPrompt(query)
    );
  } catch (err) {
    throw new Error(`Failed to plan research: ${err}`);
  }

  let action = plan.action;
  let queries = plan.queries;

  // Step 2: Iterative search loop
  while (action === "search" && iteration < MAX_ITERATIONS) {
    iteration++;

    // Search
    for (const q of queries) {
      sendEvent({
        type: "step",
        step: {
          type: "searching",
          message: `Searching: "${q}"`,
          queries: [q],
        },
      });
    }

    const searchResults = await Promise.all(
      queries.map(async (q) => {
        try {
          return await searchWeb(q);
        } catch (err) {
          sendEvent({
            type: "step",
            step: {
              type: "searching",
              message: `Search failed for "${q}": ${err}`,
            },
          });
          return [];
        }
      })
    );

    accumulatedSources.push(...searchResults.flat());
    accumulatedSources = deduplicateSources(accumulatedSources);

    // Cap sources at 20 to manage context
    if (accumulatedSources.length > 20) {
      accumulatedSources = accumulatedSources.slice(0, 20);
    }

    sendEvent({ type: "sources", sources: accumulatedSources });

    sendEvent({
      type: "step",
      step: {
        type: "analyzing",
        message: `Analyzing ${accumulatedSources.length} sources (iteration ${iteration}/${MAX_ITERATIONS})...`,
        sourcesFound: accumulatedSources.length,
      },
    });

    // Analyze
    const sourceSummaries = buildSourceSummaries(accumulatedSources);
    let analysis: AnalyzeResponse;
    try {
      analysis = await chatCompletionJSON<AnalyzeResponse>(
        ANALYZE_PROMPT,
        buildAnalyzeUserPrompt(query, sourceSummaries, iteration, MAX_ITERATIONS)
      );
    } catch (err) {
      throw new Error(`Failed to analyze results: ${err}`);
    }

    action = analysis.action;
    queries = analysis.queries ?? [];
    keyFindings = analysis.key_findings_so_far ?? keyFindings;
  }

  // Step 3: Generate final report (streamed)
  sendEvent({
    type: "step",
    step: { type: "finalizing", message: "Writing comprehensive research report..." },
  });

  const sourceSummaries = buildSourceSummaries(accumulatedSources);
  const reportStream = await chatCompletionStream(
    REPORT_PROMPT,
    buildReportUserPrompt(query, sourceSummaries, keyFindings)
  );

  // Parse OpenRouter SSE stream and forward report chunks
  const reader = reportStream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop()!;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;
      const data = trimmed.slice(6);
      if (data === "[DONE]") continue;

      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          sendEvent({ type: "report_chunk", content });
        }
      } catch {
        // Skip malformed chunks
      }
    }
  }

  sendEvent({ type: "done" });
}
