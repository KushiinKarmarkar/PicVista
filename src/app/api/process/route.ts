import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { processImage } from "@/lib/image/processor";
import { parseJobParams } from "@/lib/parseJobParams";
import type { ProcessParams, RemoveWatermarkParams } from "@/types/image-tools";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_BYTES = 25 * 1024 * 1024;

/** Single-request processing: file + params in one call. Avoids Vercel's per-instance /tmp. */
export async function POST(req: Request): Promise<Response> {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form" }, { status: 400 });
  }

  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 25MB)" }, { status: 413 });
  }

  const paramsStr = form.get("params");
  if (typeof paramsStr !== "string") {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  let paramsObj: unknown;
  try {
    paramsObj = JSON.parse(paramsStr);
  } catch {
    return NextResponse.json({ error: "Invalid params JSON" }, { status: 400 });
  }

  const maskFile = form.get("mask");
  const hasMask = maskFile instanceof File && maskFile.size > 0;

  let params: ProcessParams | null = parseJobParams(paramsObj);
  if (!params) {
    const o = paramsObj as Record<string, unknown>;
    if (o?.kind === "removeWatermark" && hasMask) {
      params = { kind: "removeWatermark", maskUploadId: "__inline__" } as RemoveWatermarkParams;
    }
  }
  if (params?.kind === "removeWatermark" && !hasMask) {
    return NextResponse.json({ error: "Watermark removal requires mask image" }, { status: 400 });
  }
  if (params?.kind === "batchZip") {
    return NextResponse.json({ error: "Use /api/batch for batch processing" }, { status: 400 });
  }
  if (!params) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }

  try {
    const buf = Buffer.from(await file.arrayBuffer());
    let maskBuf: Buffer | undefined;
    if (hasMask && maskFile instanceof File) {
      maskBuf = Buffer.from(await maskFile.arrayBuffer());
    }

    const result = await processImage(buf, params, { maskBuffer: maskBuf });
    const outBuf = await fs.readFile(result.outputPath);
    const ext = path.extname(result.outputPath) || ".bin";
    const suggestedName = `output${ext}`;

    return new Response(outBuf, {
      status: 200,
      headers: {
        "Content-Type": result.mime ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename="${suggestedName}"`,
        "X-Output-Bytes": String(result.outputBytes),
        "X-Input-Bytes": String(result.inputBytes),
        "X-Suggested-Filename": suggestedName,
        ...(result.message && { "X-Message": result.message }),
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Processing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
