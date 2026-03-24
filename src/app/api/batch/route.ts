import { NextResponse } from "next/server";
import { once } from "node:events";
import path from "node:path";
import { PassThrough } from "node:stream";
import archiver from "archiver";
import { processImage } from "@/lib/image/processor";
import { parseJobParams } from "@/lib/parseJobParams";
import type { BatchZipParams } from "@/types/image-tools";

export const runtime = "nodejs";
export const maxDuration = 300;
const MAX_FILES = 40;
const MAX_BYTES = 25 * 1024 * 1024;

export async function POST(req: Request): Promise<Response> {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const rawFiles = form.getAll("files");
  const files = rawFiles.filter((f): f is File => f instanceof File);
  if (files.length < 1 || files.length > MAX_FILES) {
    return NextResponse.json({ error: `Send between 1 and ${MAX_FILES} files` }, { status: 400 });
  }
  if (files.some((f) => f.size > MAX_BYTES)) {
    return NextResponse.json({ error: "Each file must be <= 25MB" }, { status: 413 });
  }

  const childParamsRaw = form.get("childParams");
  if (typeof childParamsRaw !== "string") {
    return NextResponse.json({ error: "childParams required" }, { status: 400 });
  }
  let childParamsObj: unknown;
  try {
    childParamsObj = JSON.parse(childParamsRaw);
  } catch {
    return NextResponse.json({ error: "Invalid childParams JSON" }, { status: 400 });
  }

  const params = parseJobParams({
    kind: "batchZip",
    uploadIds: files.map((_, i) => `inline-${i + 1}`),
    childParams: childParamsObj,
  });
  if (!params || params.kind !== "batchZip") {
    return NextResponse.json({ error: "Invalid batch payload" }, { status: 400 });
  }
  const batch = params as BatchZipParams;

  try {
    const out = new PassThrough();
    const chunks: Buffer[] = [];
    out.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    const outDone = once(out, "end");

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.on("error", (err) => out.destroy(err));
    archive.pipe(out);

    let totalInputBytes = 0;
    let index = 0;
    for (const file of files) {
      const input = Buffer.from(await file.arrayBuffer());
      totalInputBytes += input.length;
      const result = await processImage(input, batch.childParams, { returnBuffer: true });
      if (!result.outputBuffer) throw new Error("Batch processing returned no output");
      const ext =
        result.outputPath?.split(".").pop() ||
        (result.mime === "image/png"
          ? "png"
          : result.mime === "image/jpeg"
            ? "jpg"
            : result.mime === "image/webp"
              ? "webp"
              : result.mime === "image/avif"
                ? "avif"
                : "bin");
      const base = path.parse(file.name || `file-${index + 1}`).name || `file-${index + 1}`;
      archive.append(result.outputBuffer, {
        name: `${String(index + 1).padStart(2, "0")}-${base}.${ext}`,
      });
      index += 1;
    }

    await archive.finalize();
    await outDone;
    const zipBuffer = Buffer.concat(chunks);

    return new Response(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="batch-results.zip"',
        "X-Output-Bytes": String(zipBuffer.length),
        "X-Input-Bytes": String(totalInputBytes),
        "X-Suggested-Filename": "batch-results.zip",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Batch processing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
