import { NextResponse } from "next/server";
import { dispatchJob } from "@/lib/jobs/dispatch";
import { newJobId } from "@/lib/jobs/runner";
import { parseJobParams } from "@/lib/parseJobParams";
import type { JobRecord } from "@/lib/jobs/types";
import type { BatchZipParams } from "@/types/image-tools";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const params = parseJobParams({
    kind: "batchZip",
    uploadIds: b.uploadIds,
    childParams: b.childParams,
  });
  if (!params || params.kind !== "batchZip") {
    return NextResponse.json({ error: "Invalid batch payload" }, { status: 400 });
  }
  const batch = params as BatchZipParams;

  const id = newJobId();
  const job: JobRecord = {
    id,
    status: "queued",
    uploadId: batch.uploadIds[0] ?? "",
    params: batch,
    createdAt: Date.now(),
  };

  await dispatchJob(job);

  return NextResponse.json({ jobId: id });
}
