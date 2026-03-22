import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";
import { TMP_UPLOADS, ensureTmpDirs } from "@/lib/config";

export const runtime = "nodejs";

const MAX_BYTES = 25 * 1024 * 1024;

export async function POST(req: Request): Promise<Response> {
  ensureTmpDirs();
  const form = await req.formData();
  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 25MB)" }, { status: 413 });
  }

  const uploadId = uuidv4();
  const buf = Buffer.from(await file.arrayBuffer());
  const dest = path.join(TMP_UPLOADS, uploadId);
  await fs.writeFile(dest, buf);

  return NextResponse.json({
    uploadId,
    originalName: file.name,
    size: file.size,
    mime: file.type || "application/octet-stream",
  });
}
