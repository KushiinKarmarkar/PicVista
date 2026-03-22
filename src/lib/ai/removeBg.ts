/**
 * remove.bg API — set REMOVE_BG_API_KEY in production.
 * @see https://www.remove.bg/api
 */
export async function removeBackgroundWithRemoveBg(image: Buffer): Promise<Buffer> {
  const key = process.env.REMOVE_BG_API_KEY;
  if (!key) {
    throw new Error(
      "Background removal requires REMOVE_BG_API_KEY. Get a key at https://www.remove.bg/api"
    );
  }

  const form = new FormData();
  form.append("size", "auto");
  const blob = new Blob([new Uint8Array(image)], { type: "application/octet-stream" });
  form.append("image_file", blob, "upload.png");

  const res = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: { "X-Api-Key": key },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`remove.bg error ${res.status}: ${text}`);
  }

  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}
