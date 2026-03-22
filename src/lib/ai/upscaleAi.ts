import { fetchUrlToBuffer, runReplicatePrediction } from "@/lib/ai/replicate";

export async function upscaleWithReplicate(image: Buffer, scale: 2 | 4): Promise<Buffer> {
  const version = process.env.REPLICATE_ESRGAN_VERSION;
  if (!version) {
    throw new Error(
      "Set REPLICATE_ESRGAN_VERSION to a Real-ESRGAN (or similar) Replicate model version id."
    );
  }

  const imageData = `data:image/png;base64,${image.toString("base64")}`;
  const output = await runReplicatePrediction(version, {
    image: imageData,
    scale,
  });

  if (typeof output === "string") {
    return fetchUrlToBuffer(output);
  }
  if (Array.isArray(output) && typeof output[0] === "string") {
    return fetchUrlToBuffer(output[0]);
  }

  throw new Error("Unexpected Replicate upscale output shape");
}
