import path from "node:path";
import fs from "node:fs";

/** On Vercel, process.cwd() is read-only; only /tmp is writable. */
const tmpRoot = process.env.VERCEL
  ? path.join("/tmp", "picvista")
  : path.join(process.cwd(), "tmp");

export const TMP_UPLOADS = path.join(tmpRoot, "uploads");
export const TMP_OUTPUTS = path.join(tmpRoot, "outputs");
export const TMP_JOBS = path.join(tmpRoot, "jobs");

export function ensureTmpDirs(): void {
  for (const dir of [TMP_UPLOADS, TMP_OUTPUTS, TMP_JOBS]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

export const redisUrl = process.env.REDIS_URL ?? "";
export const useBullMq = Boolean(redisUrl);
