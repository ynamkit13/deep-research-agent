const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

function headers() {
  return {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
    "HTTP-Referer": "http://localhost:3001",
  };
}

export async function chatCompletionJSON<T>(
  systemPrompt: string,
  userPrompt: string
): Promise<T> {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL ?? "anthropic/claude-sonnet-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const raw = data.choices[0].message.content
    .replace(/^```(?:json)?\s*|\s*```$/g, "")
    .trim();
  return JSON.parse(raw) as T;
}

export async function chatCompletionStream(
  systemPrompt: string,
  userPrompt: string
): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL ?? "anthropic/claude-sonnet-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      stream: true,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${text}`);
  }

  return res.body!;
}
