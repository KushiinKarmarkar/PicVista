import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { inpaintWithReplicate } from "@/lib/ai/inpaint";
import { removeBackgroundWithRemoveBg } from "@/lib/ai/removeBg";
import { upscaleWithReplicate } from "@/lib/ai/upscaleAi";
import { TMP_OUTPUTS } from "@/lib/config";
import type {
  CompressParams,
  OutputFormat,
  ProcessParams,
  ResizeParams,
  ResizePreset,
} from "@/types/image-tools";

export type {
  CompressParams,
  OutputFormat,
  ProcessParams,
  ResizeParams,
  ConvertParams,
  ResizePreset,
} from "@/types/image-tools";

const PRESETS: Record<Exclude<ResizePreset, "custom">, { width: number; height: number }> = {
  "instagram-square": { width: 1080, height: 1080 },
  "instagram-story": { width: 1080, height: 1920 },
  linkedin: { width: 1200, height: 627 },
  whatsapp: { width: 500, height: 500 },
};

export type ProcessContext = {
  maskBuffer?: Buffer;
  /** When true, skip disk writes and return outputBuffer instead. Use for serverless. */
  returnBuffer?: boolean;
};

function cacheKey(buffer: Buffer, params: ProcessParams): string {
  const h = crypto.createHash("sha256");
  h.update(buffer);
  h.update(JSON.stringify(params));
  return h.digest("hex");
}

export async function findCachedOutput(
  buffer: Buffer,
  params: ProcessParams,
  ext: string
): Promise<string | null> {
  const key = cacheKey(buffer, params);
  const outPath = path.join(TMP_OUTPUTS, `${key}.${ext}`);
  try {
    await fs.access(outPath);
    return outPath;
  } catch {
    return null;
  }
}

function clampQuality(q: number): number {
  return Math.min(100, Math.max(1, Math.round(q)));
}

async function autoQuality(buffer: Buffer, targetFormat: OutputFormat): Promise<number> {
  let low = 10;
  let high = 90;
  let best = 82;
  const targetRatio = Math.min(0.9, Math.max(0.12, 48_000 / Math.max(buffer.length, 1)));

  for (let i = 0; i < 10; i++) {
    const mid = Math.floor((low + high) / 2);
    const out = await encode(buffer, targetFormat, mid, false);
    const ratio = out.length / buffer.length;
    if (ratio > targetRatio) {
      low = mid + 1;
    } else {
      best = mid;
      high = mid - 1;
    }
  }
  return clampQuality(best);
}

async function encode(
  buffer: Buffer,
  format: OutputFormat,
  quality: number,
  preserveMetadata: boolean
): Promise<Buffer> {
  let pipeline = sharp(buffer).rotate();
  if (preserveMetadata) {
    pipeline = pipeline.withMetadata();
  }

  const q = clampQuality(quality);
  switch (format) {
    case "jpeg":
      return pipeline.jpeg({ quality: q, mozjpeg: true }).toBuffer();
    case "png":
      return pipeline
        .png({
          compressionLevel: Math.min(9, Math.round((100 - q) / 11)),
          effort: 10,
        })
        .toBuffer();
    case "webp":
      return pipeline.webp({ quality: q }).toBuffer();
    case "avif":
      return pipeline.avif({ quality: q }).toBuffer();
    default:
      return pipeline.jpeg({ quality: q }).toBuffer();
  }
}

function extForFormat(f: OutputFormat): string {
  switch (f) {
    case "jpeg":
      return "jpg";
    case "png":
      return "png";
    case "webp":
      return "webp";
    case "avif":
      return "avif";
  }
}

async function compressBuffer(
  buffer: Buffer,
  targetFormat: OutputFormat,
  mode: "manual" | "auto",
  manualQuality: number
): Promise<{ out: Buffer; passthrough: boolean; message?: string; qualityUsed: number }> {
  let quality =
    mode === "auto" ? await autoQuality(buffer, targetFormat) : clampQuality(manualQuality);

  let out = await encode(buffer, targetFormat, quality, false);
  let guard = 0;
  while (out.length >= buffer.length && quality > 10 && guard < 24) {
    quality = Math.max(10, quality - 4);
    out = await encode(buffer, targetFormat, quality, false);
    guard += 1;
  }

  if (targetFormat === "png" && out.length >= buffer.length) {
    try {
      const paletteTry = await sharp(buffer)
        .rotate()
        .png({ compressionLevel: 9, effort: 10, palette: true })
        .toBuffer();
      if (paletteTry.length < out.length) {
        out = paletteTry;
      }
    } catch {
      /* ignore palette failure */
    }
  }

  if (out.length >= buffer.length) {
    return {
      out: buffer,
      passthrough: true,
      message: "Already optimized — original file returned.",
      qualityUsed: quality,
    };
  }

  return { out, passthrough: false, qualityUsed: quality };
}

export type ProcessResult = {
  outputPath?: string;
  outputBuffer?: Buffer;
  outputBytes: number;
  inputBytes: number;
  mime: string;
  passthrough?: boolean;
  message?: string;
};

export async function processImage(
  inputBuffer: Buffer,
  params: ProcessParams,
  ctx: ProcessContext = {}
): Promise<ProcessResult> {
  const inputBytes = inputBuffer.length;
  const skipDisk = Boolean(ctx.returnBuffer);

  if (params.kind === "convert") {
    const ext = extForFormat(params.targetFormat);
    if (!skipDisk) {
      const cached = await findCachedOutput(inputBuffer, params, ext);
      if (cached) {
        const st = await fs.stat(cached);
        return {
          outputPath: cached,
          outputBytes: st.size,
          inputBytes,
          mime: mimeForFormat(params.targetFormat),
        };
      }
    }
    const out = await encode(
      inputBuffer,
      params.targetFormat,
      params.quality,
      params.preserveMetadata ?? false
    );
    if (skipDisk) {
      return {
        outputBuffer: out,
        outputBytes: out.length,
        inputBytes,
        mime: mimeForFormat(params.targetFormat),
      };
    }
    const key = cacheKey(inputBuffer, params);
    const outputPath = path.join(TMP_OUTPUTS, `${key}.${ext}`);
    await fs.writeFile(outputPath, out);
    return {
      outputPath,
      outputBytes: out.length,
      inputBytes,
      mime: mimeForFormat(params.targetFormat),
    };
  }

  if (params.kind === "compress") {
    const meta = await sharp(inputBuffer).metadata();
    const raw = meta.format;
    const targetFormat: OutputFormat =
      raw === "png" || raw === "gif"
        ? "png"
        : raw === "webp"
          ? "webp"
          : raw === "avif"
            ? "avif"
            : "jpeg";

    const { out, passthrough, message, qualityUsed } = await compressBuffer(
      inputBuffer,
      targetFormat,
      params.mode,
      params.quality
    );

    if (skipDisk) {
      return {
        outputBuffer: out,
        outputBytes: out.length,
        inputBytes,
        mime: mimeForFormat(targetFormat),
        passthrough,
        message,
      };
    }
    const compressParams: CompressParams = {
      kind: "compress",
      quality: qualityUsed,
      mode: params.mode,
    };
    const ext = extForFormat(targetFormat);
    const key = cacheKey(inputBuffer, compressParams);
    const outputPath = path.join(TMP_OUTPUTS, `${key}.${ext}`);
    await fs.writeFile(outputPath, out);
    return {
      outputPath,
      outputBytes: out.length,
      inputBytes,
      mime: mimeForFormat(targetFormat),
      passthrough,
      message,
    };
  }

  if (params.kind === "resize") {
    let width = params.width;
    let height = params.height;
    if (params.preset !== "custom") {
      const p = PRESETS[params.preset];
      width = p.width;
      height = p.height;
    }
    if (!width && !height) {
      width = 800;
      height = 600;
    }

    const resizePart: ResizeParams = {
      kind: "resize",
      width,
      height,
      maintainAspect: params.maintainAspect,
      preset: params.preset,
    };

    const meta = await sharp(inputBuffer).metadata();
    const rawFmt = meta.format;
    const outFormat: OutputFormat =
      rawFmt === "png" || rawFmt === "gif"
        ? "png"
        : rawFmt === "webp"
          ? "webp"
          : rawFmt === "avif"
            ? "avif"
            : "jpeg";
    const ext = extForFormat(outFormat);

    if (!skipDisk) {
      const cached = await findCachedOutput(inputBuffer, resizePart, ext);
      if (cached) {
        const st = await fs.stat(cached);
        return {
          outputPath: cached,
          outputBytes: st.size,
          inputBytes,
          mime: mimeForFormat(outFormat),
        };
      }
    }

    let pipeline = sharp(inputBuffer).rotate();

    if (params.maintainAspect) {
      if (width && height) {
        pipeline = pipeline.resize(width, height, { fit: "inside", withoutEnlargement: true });
      } else if (width) {
        pipeline = pipeline.resize({ width, withoutEnlargement: true });
      } else if (height) {
        pipeline = pipeline.resize({ height, withoutEnlargement: true });
      }
    } else if (width && height) {
      pipeline = pipeline.resize(width, height, { fit: "cover", position: "centre" });
    }

    let out: Buffer;
    if (outFormat === "png") {
      out = await pipeline.png({ compressionLevel: 9 }).toBuffer();
    } else if (outFormat === "webp") {
      out = await pipeline.webp({ quality: 85 }).toBuffer();
    } else if (outFormat === "avif") {
      out = await pipeline.avif({ quality: 70 }).toBuffer();
    } else {
      out = await pipeline.jpeg({ quality: 88, mozjpeg: true }).toBuffer();
    }

    if (skipDisk) {
      return {
        outputBuffer: out,
        outputBytes: out.length,
        inputBytes,
        mime: mimeForFormat(outFormat),
      };
    }
    const key = cacheKey(inputBuffer, resizePart);
    const outputPath = path.join(TMP_OUTPUTS, `${key}.${ext}`);
    await fs.writeFile(outputPath, out);
    return {
      outputPath,
      outputBytes: out.length,
      inputBytes,
      mime: mimeForFormat(outFormat),
    };
  }

  if (params.kind === "removeBackground") {
    if (!skipDisk) {
      const cached = await findCachedOutput(inputBuffer, params, "png");
      if (cached) {
        const st = await fs.stat(cached);
        return {
          outputPath: cached,
          outputBytes: st.size,
          inputBytes,
          mime: "image/png",
        };
      }
    }
    const png = await removeBackgroundWithRemoveBg(inputBuffer);
    if (skipDisk) {
      return {
        outputBuffer: png,
        outputBytes: png.length,
        inputBytes,
        mime: "image/png",
      };
    }
    const key = cacheKey(inputBuffer, params);
    const outputPath = path.join(TMP_OUTPUTS, `${key}.png`);
    await fs.writeFile(outputPath, png);
    return {
      outputPath,
      outputBytes: png.length,
      inputBytes,
      mime: "image/png",
    };
  }

  if (params.kind === "upscale") {
    if (!skipDisk) {
      const cached = await findCachedOutput(inputBuffer, params, "png");
      if (cached) {
        const st = await fs.stat(cached);
        return {
          outputPath: cached,
          outputBytes: st.size,
          inputBytes,
          mime: "image/png",
        };
      }
    }

    let out: Buffer;
    if (params.engine === "replicate") {
      out = await upscaleWithReplicate(inputBuffer, params.scale);
    } else {
      const meta = await sharp(inputBuffer).metadata();
      const w = meta.width ?? 1;
      const h = meta.height ?? 1;
      const tw = Math.round(w * params.scale);
      const th = Math.round(h * params.scale);
      out = await sharp(inputBuffer)
        .rotate()
        .resize(tw, th, { kernel: sharp.kernel.lanczos3, fit: "fill" })
        .png({ compressionLevel: 6 })
        .toBuffer();
    }

    if (skipDisk) {
      return {
        outputBuffer: out,
        outputBytes: out.length,
        inputBytes,
        mime: "image/png",
        message:
          params.engine === "lanczos"
            ? "Classic Lanczos upscale (not a generative model). For AI detail, pick Replicate + Real-ESRGAN."
            : undefined,
      };
    }
    const key = cacheKey(inputBuffer, params);
    const outputPath = path.join(TMP_OUTPUTS, `${key}.png`);
    await fs.writeFile(outputPath, out);
    return {
      outputPath,
      outputBytes: out.length,
      inputBytes,
      mime: "image/png",
      message:
        params.engine === "lanczos"
          ? "Classic Lanczos upscale (not a generative model). For AI detail, pick Replicate + Real-ESRGAN."
          : undefined,
    };
  }

  if (params.kind === "removeWatermark") {
    if (!ctx.maskBuffer?.length) {
      throw new Error("Watermark removal requires a mask image (white = area to restore).");
    }
    if (!skipDisk) {
      const h = crypto.createHash("sha256");
      h.update(inputBuffer);
      h.update(JSON.stringify(params));
      h.update(ctx.maskBuffer);
      const wmKey = h.digest("hex");
      const cachedPath = path.join(TMP_OUTPUTS, `${wmKey}.png`);
      try {
        await fs.access(cachedPath);
        const st = await fs.stat(cachedPath);
        return {
          outputPath: cachedPath,
          outputBytes: st.size,
          inputBytes,
          mime: "image/png",
        };
      } catch {
        /* compute */
      }
    }

    const png = await inpaintWithReplicate(inputBuffer, ctx.maskBuffer);
    if (skipDisk) {
      return {
        outputBuffer: png,
        outputBytes: png.length,
        inputBytes,
        mime: "image/png",
      };
    }
    const h = crypto.createHash("sha256");
    h.update(inputBuffer);
    h.update(JSON.stringify(params));
    h.update(ctx.maskBuffer);
    const wmKey = h.digest("hex");
    const outputPath = path.join(TMP_OUTPUTS, `${wmKey}.png`);
    await fs.writeFile(outputPath, png);
    return {
      outputPath,
      outputBytes: png.length,
      inputBytes,
      mime: "image/png",
    };
  }

  throw new Error("Unsupported job type");
}

function mimeForFormat(f: OutputFormat): string {
  switch (f) {
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "avif":
      return "image/avif";
  }
}
