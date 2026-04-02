import Exa from "exa-js";
import { Source } from "@/types/research";

let exa: Exa;
function getExa() {
  if (!exa) exa = new Exa(process.env.EXA_API_KEY!);
  return exa;
}

export async function searchWeb(
  query: string,
  numResults = 5
): Promise<Source[]> {
  const result = await getExa().searchAndContents(query, {
    type: "auto",
    numResults,
    highlights: true,
    summary: true,
  });

  return result.results.map((r) => ({
    title: r.title ?? "Untitled",
    url: r.url,
    snippet: r.summary ?? r.highlights?.join(" ") ?? "",
    publishedDate: r.publishedDate ?? undefined,
  }));
}
