export async function requestReview(payload: {
  language: string; code: string; rubric?: string;
}) {
  const res = await fetch("/api/ai/review", {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // {summary, score, issues, suggestions}
}
