import fs from "node:fs";
import fsPromises from "node:fs/promises";
import { once } from "node:events";
import path from "node:path";
import archiver from "archiver";
import { TMP_OUTPUTS, TMP_UPLOADS, ensureTmpDirs } from "@/lib/config";
import { processImage } from "@/lib/image/processor";
import type { BatchZipParams } from "@/types/image-tools";

export async function runBatchZipJob(jobId: string, params: BatchZipParams): Promise<{
  zipPath: string;
  outputBytes: number;
  inputBytes: number;
}> {
  ensureTmpDirs();
  const zipPath = path.join(TMP_OUTPUTS, `${jobId}.zip`);
  const output = fs.createWriteStream(zipPath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  archive.pipe(output);

  let totalIn = 0;
  let idx = 0;
  for (const uploadId of params.uploadIds) {
    const buf = await fsPromises.readFile(path.join(TMP_UPLOADS, uploadId));
    totalIn += buf.length;
    const result = await processImage(buf, params.childParams);
    const ext = path.extname(result.outputPath) || ".bin";
    const name = `${String(idx).padStart(3, "0")}-out${ext}`;
    archive.file(result.outputPath, { name });
    idx += 1;
  }

  const closed = once(output, "close");
  archive.on("error", (err) => {
    output.destroy(err);
  });
  await archive.finalize();
  await closed;

  const st = await fsPromises.stat(zipPath);
  return { zipPath, outputBytes: st.size, inputBytes: totalIn };
}
