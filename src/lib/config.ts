import path from "node:path";
import fs from "node:fs";

const root = process.cwd();

export const TMP_UPLOADS = path.join(root, "tmp", "uploads");
export const TMP_OUTPUTS = path.join(root, "tmp", "outputs");
export const TMP_JOBS = path.join(root, "tmp", "jobs");

export function ensureTmpDirs(): void {
  for (const dir of [TMP_UPLOADS, TMP_OUTPUTS, TMP_JOBS]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

export const redisUrl = process.env.REDIS_URL ?? "";
export const useBullMq = Boolean(redisUrl);
