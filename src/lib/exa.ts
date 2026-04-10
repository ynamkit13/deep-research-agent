import Exa from "exa-js";
import { Source } from "@/types/research";

let exa: Exa;
function getExa() {
  if (!exa) exa = new Exa(process.env.EXA_API_KEY!);
  return exa;
}

// Official / high-authority domains get boosted when ranking sources
const PRIMARY_DOMAINS = [
  "anthropic.com",
  "openai.com",
  "google.com",
  "deepmind.google",
  "ai.meta.com",
  "microsoft.com",
  "arxiv.org",
  "github.com",
  "reuters.com",
  "apnews.com",
  "nytimes.com",
  "washingtonpost.com",
  "bbc.com",
  "techcrunch.com",
  "theverge.com",
  "wired.com",
  "arstechnica.com",
  "nature.com",
  "science.org",
];

const SPECULATIVE_DOMAINS = [
  "medium.com",
  "substack.com",
  "reddit.com",
  "quora.com",
  "dev.to",
  "hackernoon.com",
  "wordpress.com",
  "blogspot.com",
];

export function scoreSourceDomain(url: string): number {
  const hostname = new URL(url).hostname.replace(/^www\./, "");
  if (PRIMARY_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`)))
    return 2;
  if (SPECULATIVE_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`)))
    return 0;
  return 1;
}

export async function searchWeb(
  query: string,
  numResults = 5
): Promise<Source[]> {
  // Bias toward recent content (last 30 days) so reports reflect the latest info
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const result = await getExa().searchAndContents(query, {
    type: "auto",
    numResults,
    highlights: true,
    summary: true,
    startPublishedDate: thirtyDaysAgo.toISOString().split("T")[0],
  });

  return result.results.map((r) => ({
    title: r.title ?? "Untitled",
    url: r.url,
    snippet: r.summary ?? r.highlights?.join(" ") ?? "",
    publishedDate: r.publishedDate ?? undefined,
  }));
}
