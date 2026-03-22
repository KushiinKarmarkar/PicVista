import fs from "node:fs/promises";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";
import { TMP_OUTPUTS, TMP_UPLOADS, ensureTmpDirs } from "@/lib/config";
import { processImage } from "@/lib/image/processor";
import { runBatchZipJob } from "@/lib/jobs/batchRunner";
import { getJob, updateJob } from "@/lib/jobs/store";
import type { JobRecord } from "@/lib/jobs/types";
import type { BatchZipParams, RemoveWatermarkParams } from "@/types/image-tools";

export async function runJob(job: JobRecord): Promise<void> {
  ensureTmpDirs();
  const current = await getJob(job.id);
  if (!current || current.status !== "queued") return;

  await updateJob(job.id, { status: "processing" });

  try {
    if (job.params.kind === "batchZip") {
      const batch = job.params as BatchZipParams;
      const { outputBytes, inputBytes } = await runBatchZipJob(job.id, batch);
      const outputFilename = `${job.id}.zip`;
      await updateJob(job.id, {
        status: "completed",
        result: {
          outputFilename,
          outputBytes,
          inputBytes,
          mime: "application/zip",
        },
      });
      return;
    }

    const uploadPath = path.join(TMP_UPLOADS, job.uploadId);
    const buf = await fs.readFile(uploadPath);

    let maskBuf: Buffer | undefined;
    if (job.params.kind === "removeWatermark") {
      const p = job.params as RemoveWatermarkParams;
      maskBuf = await fs.readFile(path.join(TMP_UPLOADS, p.maskUploadId));
    }

    const result = await processImage(buf, job.params, { maskBuffer: maskBuf });
    if (!result.outputPath) throw new Error("Job requires outputPath");
    const ext = path.extname(result.outputPath) || ".bin";
    const outputFilename = `${job.id}${ext}`;
    const dest = path.join(TMP_OUTPUTS, outputFilename);
    await fs.copyFile(result.outputPath, dest);

    await updateJob(job.id, {
      status: "completed",
      result: {
        outputFilename,
        outputBytes: result.outputBytes,
        inputBytes: result.inputBytes,
        mime: result.mime,
        passthrough: result.passthrough,
        message: result.message,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Processing failed";
    await updateJob(job.id, { status: "failed", error: message });
  }
}

export function scheduleJob(job: JobRecord): void {
  setImmediate(() => {
    void runJob(job);
  });
}

export function newJobId(): string {
  return uuidv4();
}
