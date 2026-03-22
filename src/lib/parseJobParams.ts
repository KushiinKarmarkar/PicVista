import type {
  OutputFormat,
  ProcessParams,
  ResizePreset,
  SimpleProcessParams,
} from "@/types/image-tools";

const FORMATS: OutputFormat[] = ["jpeg", "png", "webp", "avif"];
const PRESETS: ResizePreset[] = [
  "instagram-square",
  "instagram-story",
  "linkedin",
  "whatsapp",
  "custom",
];

function parseSimple(o: Record<string, unknown>): SimpleProcessParams | null {
  const kind = o.kind;
  if (kind === "convert") {
    const targetFormat = o.targetFormat;
    const q = Number(o.quality);
    if (typeof targetFormat !== "string" || !FORMATS.includes(targetFormat as OutputFormat)) {
      return null;
    }
    if (!Number.isFinite(q)) return null;
    return {
      kind: "convert",
      targetFormat: targetFormat as OutputFormat,
      quality: q,
      preserveMetadata: Boolean(o.preserveMetadata),
    };
  }
  if (kind === "compress") {
    const q = Number(o.quality);
    const mode = o.mode === "auto" ? "auto" : "manual";
    if (!Number.isFinite(q)) return null;
    return { kind: "compress", quality: q, mode };
  }
  if (kind === "resize") {
    const preset = o.preset;
    if (typeof preset !== "string" || !PRESETS.includes(preset as ResizePreset)) {
      return null;
    }
    return {
      kind: "resize",
      width: o.width != null ? Number(o.width) : undefined,
      height: o.height != null ? Number(o.height) : undefined,
      maintainAspect: Boolean(o.maintainAspect),
      preset: preset as ResizePreset,
    };
  }
  if (kind === "removeBackground") {
    return { kind: "removeBackground" };
  }
  if (kind === "upscale") {
    const scale = Number(o.scale);
    if (scale !== 2 && scale !== 4) return null;
    const engine = o.engine === "replicate" ? "replicate" : "lanczos";
    return { kind: "upscale", scale: scale as 2 | 4, engine };
  }
  if (kind === "removeWatermark") {
    const maskUploadId = o.maskUploadId;
    if (typeof maskUploadId !== "string" || !maskUploadId) return null;
    return { kind: "removeWatermark", maskUploadId };
  }
  return null;
}

export function parseJobParams(body: unknown): ProcessParams | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  if (o.kind === "batchZip") {
    const ids = o.uploadIds;
    const child = o.childParams;
    if (!Array.isArray(ids) || ids.length < 1 || ids.length > 40) return null;
    if (!ids.every((x) => typeof x === "string" && x.length > 0)) return null;
    if (!child || typeof child !== "object") return null;
    const childParams = parseSimple(child as Record<string, unknown>);
    if (!childParams) return null;
    if (childParams.kind === "removeWatermark") return null;
    return { kind: "batchZip", uploadIds: ids as string[], childParams };
  }
  return parseSimple(o);
}
