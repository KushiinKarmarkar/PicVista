import { redisUrl } from "@/lib/config";
import { enqueueBullJob } from "@/lib/jobs/bull";
import { runJob, scheduleJob } from "@/lib/jobs/runner";
import { setJob } from "@/lib/jobs/store";
import type { JobRecord } from "@/lib/jobs/types";

function shouldProcessInline(): boolean {
  return (
    process.env.SYNC_IMAGE_JOBS === "1" ||
    process.env.VERCEL === "1" ||
    process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined
  );
}

export async function dispatchJob(job: JobRecord): Promise<void> {
  await setJob(job);

  if (redisUrl) {
    await enqueueBullJob(job);
    return;
  }

  if (shouldProcessInline()) {
    await runJob(job);
    return;
  }

  scheduleJob(job);
}
