type PredictionResponse = {
  id: string;
  status: string;
  error?: string;
  output?: unknown;
  urls?: { get?: string };
};

const API = "https://api.replicate.com/v1/predictions";

export async function runReplicatePrediction(
  version: string,
  input: Record<string, unknown>
): Promise<unknown> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new Error("REPLICATE_API_TOKEN is not configured");
  }

  const create = await fetch(API, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ version, input }),
  });

  if (!create.ok) {
    const errText = await create.text();
    throw new Error(`Replicate create failed: ${create.status} ${errText}`);
  }

  let pred = (await create.json()) as PredictionResponse;
  const pollUrl = pred.urls?.get ?? `${API}/${pred.id}`;

  for (let i = 0; i < 180; i++) {
    if (pred.status === "succeeded") {
      return pred.output;
    }
    if (pred.status === "failed" || pred.status === "canceled") {
      throw new Error(pred.error || `Replicate job ${pred.status}`);
    }
    await new Promise((r) => setTimeout(r, 1500));
    const poll = await fetch(pollUrl, {
      headers: { Authorization: `Token ${token}` },
    });
    if (!poll.ok) {
      throw new Error(`Replicate poll failed: ${poll.status}`);
    }
    pred = (await poll.json()) as PredictionResponse;
  }

  throw new Error("Replicate prediction timed out");
}

export async function fetchUrlToBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch result image: ${res.status}`);
  }
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}
