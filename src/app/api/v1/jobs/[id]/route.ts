import { NextResponse } from "next/server";
import { verifyPicVistaApiKey } from "@/lib/api/verifyApiKey";
import { getJob } from "@/lib/jobs/store";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: RouteContext): Promise<Response> {
  if (!verifyPicVistaApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const job = await getJob(id);
  if (!job) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    id: job.id,
    status: job.status,
    error: job.error,
    result: job.result,
  });
}
