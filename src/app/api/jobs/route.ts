import { NextResponse } from "next/server";
import { dispatchJob } from "@/lib/jobs/dispatch";
import { newJobId } from "@/lib/jobs/runner";
import { parseJobParams } from "@/lib/parseJobParams";
import type { JobRecord } from "@/lib/jobs/types";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const uploadId = typeof b.uploadId === "string" ? b.uploadId : "";
  if (!uploadId) {
    return NextResponse.json({ error: "uploadId required" }, { status: 400 });
  }
  const params = parseJobParams(b.params);
  if (!params || params.kind === "batchZip") {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }

  const id = newJobId();
  const job: JobRecord = {
    id,
    status: "queued",
    uploadId,
    params,
    createdAt: Date.now(),
  };

  await dispatchJob(job);

  return NextResponse.json({ jobId: id });
}
