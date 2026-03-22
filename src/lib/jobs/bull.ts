import { Queue, Worker } from "bullmq";
import { redisUrl } from "@/lib/config";
import { getJob } from "@/lib/jobs/store";
import { runJob } from "@/lib/jobs/runner";

const QUEUE_NAME = "picvista";

let queue: Queue | null = null;

function getQueue(): Queue | null {
  if (!redisUrl) return null;
  if (!queue) {
    queue = new Queue(QUEUE_NAME, { connection: { url: redisUrl } });
  }
  return queue;
}

export async function enqueueBullJob(job: { id: string }): Promise<void> {
  const q = getQueue();
  if (!q) return;
  await q.add("process", { jobId: job.id }, { jobId: job.id });
}

export function startBullWorker(): void {
  if (!redisUrl) {
    console.warn("startBullWorker: REDIS_URL not set");
    return;
  }
  new Worker(
    QUEUE_NAME,
    async (bullJob) => {
      const jobId = bullJob.data.jobId as string;
      const job = await getJob(jobId);
      if (!job) {
        throw new Error("Job not found");
      }
      await runJob(job);
    },
    { connection: { url: redisUrl } }
  );
}
