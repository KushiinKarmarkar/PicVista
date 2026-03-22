import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { TMP_OUTPUTS } from "@/lib/config";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ filename: string }> };

export async function GET(_req: Request, ctx: RouteContext): Promise<Response> {
  const { filename } = await ctx.params;
  if (!filename || filename.includes("..") || path.basename(filename) !== filename) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }
  const filePath = path.join(TMP_OUTPUTS, filename);
  try {
    const buf = await fs.readFile(filePath);
    const ext = path.extname(filename).toLowerCase();
    const mime =
      ext === ".zip"
        ? "application/zip"
        : ext === ".jpg" || ext === ".jpeg"
          ? "image/jpeg"
          : ext === ".png"
            ? "image/png"
            : ext === ".webp"
              ? "image/webp"
              : ext === ".avif"
                ? "image/avif"
                : "application/octet-stream";
    return new NextResponse(buf, {
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
