import { fetchUrlToBuffer, runReplicatePrediction } from "@/lib/ai/replicate";

/**
 * LaMa-style inpainting via Replicate. Configure REPLICATE_LAMA_VERSION with a full model version id.
 * Mask: PNG where white (255) = region to inpaint, black = preserve.
 */
export async function inpaintWithReplicate(image: Buffer, mask: Buffer): Promise<Buffer> {
  const version = process.env.REPLICATE_LAMA_VERSION;
  if (!version) {
    throw new Error(
      "Set REPLICATE_LAMA_VERSION to a Replicate LaMa (or compatible) model version. See https://replicate.com"
    );
  }

  const imageData = `data:image/png;base64,${image.toString("base64")}`;
  const maskData = `data:image/png;base64,${mask.toString("base64")}`;

  const output = await runReplicatePrediction(version, {
    image: imageData,
    mask: maskData,
  });

  if (typeof output === "string") {
    return fetchUrlToBuffer(output);
  }
  if (Array.isArray(output) && typeof output[0] === "string") {
    return fetchUrlToBuffer(output[0]);
  }

  throw new Error("Unexpected Replicate inpaint output shape");
}
