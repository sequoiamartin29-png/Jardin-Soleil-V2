const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8" },
});

export default async function handler(request) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const endpoint = process.env.CONSERVATORY_AI_ENDPOINT;
  const apiKey = process.env.CONSERVATORY_AI_KEY;
  if (!endpoint || !apiKey) return json({ error: "External Conservatory provider is not configured" }, 503);

  let input;
  try {
    input = await request.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  const question = String(input?.question || "").trim().slice(0, 1200);
  if (!question) return json({ error: "A question is required" }, 400);

  const payload = {
    question,
    companion: String(input?.companion || "buddy").slice(0, 40),
    scopePlant: input?.scopePlant ? {
      id: String(input.scopePlant.id || "").slice(0, 120),
      name: String(input.scopePlant.name || "").slice(0, 160),
    } : null,
    relevantSources: Array.isArray(input?.relevantSources) ? input.relevantSources.slice(0, 50) : [],
    localAnswer: String(input?.localAnswer || "").slice(0, 5000),
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return json({ error: "External provider unavailable" }, 502);
    const output = await response.json();
    const answer = output?.answer || output?.choices?.[0]?.message?.content;
    if (!answer) return json({ error: "External provider returned no answer" }, 502);
    return json({ answer: String(answer).slice(0, 12000) });
  } catch {
    return json({ error: "External provider unavailable" }, 502);
  }
}
