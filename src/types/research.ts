export interface Source {
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string;
}

export interface ResearchStep {
  type: "planning" | "searching" | "analyzing" | "finalizing";
  message: string;
  queries?: string[];
  sourcesFound?: number;
}

export type SSEEvent =
  | { type: "step"; step: ResearchStep }
  | { type: "sources"; sources: Source[] }
  | { type: "report_chunk"; content: string }
  | { type: "done" }
  | { type: "error"; message: string };
