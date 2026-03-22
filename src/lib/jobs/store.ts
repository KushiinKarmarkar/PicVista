import fs from "node:fs/promises";
import path from "node:path";
import { TMP_JOBS, ensureTmpDirs } from "@/lib/config";
import type { JobRecord } from "./types";

const JOB_DIR = TMP_JOBS;

const cache = new Map<string, JobRecord>();

async function jobPath(id: string): Promise<string> {
  ensureTmpDirs();
  await fs.mkdir(JOB_DIR, { recursive: true });
  return path.join(JOB_DIR, `${id}.json`);
}

export async function getJob(id: string): Promise<JobRecord | undefined> {
  const hit = cache.get(id);
  if (hit) return hit;
  try {
    const raw = await fs.readFile(await jobPath(id), "utf8");
    const j = JSON.parse(raw) as JobRecord;
    cache.set(id, j);
    return j;
  } catch {
    return undefined;
  }
}

export async function setJob(record: JobRecord): Promise<void> {
  cache.set(record.id, record);
  const p = await jobPath(record.id);
  await fs.writeFile(p, JSON.stringify(record), "utf8");
}

export async function updateJob(
  id: string,
  patch: Partial<JobRecord>
): Promise<JobRecord | undefined> {
  const cur = await getJob(id);
  if (!cur) return undefined;
  const next = { ...cur, ...patch };
  await setJob(next);
  return next;
}
