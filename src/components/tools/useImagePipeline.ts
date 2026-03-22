"use client";

import { useCallback, useState } from "react";
import type { ProcessParams, SimpleProcessParams } from "@/types/image-tools";

export type PipelineState =
  | { phase: "idle" }
  | { phase: "uploading" }
  | { phase: "processing" }
  | {
      phase: "done";
      downloadUrl: string;
      inputBytes: number;
      outputBytes: number;
      notice?: string;
    }
  | { phase: "error"; message: string };

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const up = await fetch("/api/upload", { method: "POST", body: fd });
  if (!up.ok) {
    const err = await up.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Upload failed");
  }
  const { uploadId } = (await up.json()) as { uploadId: string };
  return uploadId;
}

type JobPayload = {
  status: string;
  error?: string;
  result?: {
    outputFilename: string;
    outputBytes: number;
    inputBytes: number;
    message?: string;
    passthrough?: boolean;
  };
};

async function pollJob(jobId: string): Promise<JobPayload> {
  let status = "queued";
  let payload: JobPayload | null = null;
  for (let i = 0; i < 600 && status !== "completed" && status !== "failed"; i++) {
    await new Promise((r) => setTimeout(r, 250));
    const g = await fetch(`/api/jobs/${jobId}`);
    const next = (await g.json()) as JobPayload;
    payload = next;
    status = next.status;
  }
  if (status !== "completed" || !payload?.result) {
    throw new Error(payload?.error || "Processing timed out");
  }
  return payload;
}

export function useImagePipeline() {
  const [state, setState] = useState<PipelineState>({ phase: "idle" });

  const run = useCallback(async (file: File, params: Exclude<ProcessParams, { kind: "batchZip" }>) => {
    setState({ phase: "uploading" });
    try {
      const uploadId = await uploadFile(file);
      setState({ phase: "processing" });
      const jobRes = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId, params }),
      });
      if (!jobRes.ok) {
        const err = await jobRes.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || "Job failed");
      }
      const { jobId } = (await jobRes.json()) as { jobId: string };
      const payload = await pollJob(jobId);
      const url = `/api/download/${encodeURIComponent(payload.result!.outputFilename)}`;
      setState({
        phase: "done",
        downloadUrl: url,
        inputBytes: payload.result!.inputBytes,
        outputBytes: payload.result!.outputBytes,
        notice: payload.result?.message,
      });
    } catch (e) {
      setState({
        phase: "error",
        message: e instanceof Error ? e.message : "Something went wrong",
      });
    }
  }, []);

  const runWithWatermark = useCallback(async (main: File, mask: File) => {
    setState({ phase: "uploading" });
    try {
      const maskUploadId = await uploadFile(mask);
      const uploadId = await uploadFile(main);
      setState({ phase: "processing" });
      const jobRes = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploadId,
          params: { kind: "removeWatermark", maskUploadId },
        }),
      });
      if (!jobRes.ok) {
        const err = await jobRes.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || "Job failed");
      }
      const { jobId } = (await jobRes.json()) as { jobId: string };
      const payload = await pollJob(jobId);
      const url = `/api/download/${encodeURIComponent(payload.result!.outputFilename)}`;
      setState({
        phase: "done",
        downloadUrl: url,
        inputBytes: payload.result!.inputBytes,
        outputBytes: payload.result!.outputBytes,
        notice: payload.result?.message,
      });
    } catch (e) {
      setState({
        phase: "error",
        message: e instanceof Error ? e.message : "Something went wrong",
      });
    }
  }, []);

  const runBatch = useCallback(async (files: File[], childParams: SimpleProcessParams) => {
    setState({ phase: "uploading" });
    try {
      const uploadIds: string[] = [];
      for (const f of files) {
        uploadIds.push(await uploadFile(f));
      }
      setState({ phase: "processing" });
      const jobRes = await fetch("/api/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadIds, childParams }),
      });
      if (!jobRes.ok) {
        const err = await jobRes.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || "Batch failed");
      }
      const { jobId } = (await jobRes.json()) as { jobId: string };
      const payload = await pollJob(jobId);
      const url = `/api/download/${encodeURIComponent(payload.result!.outputFilename)}`;
      setState({
        phase: "done",
        downloadUrl: url,
        inputBytes: payload.result!.inputBytes,
        outputBytes: payload.result!.outputBytes,
        notice: "ZIP contains one processed file per upload (same order).",
      });
    } catch (e) {
      setState({
        phase: "error",
        message: e instanceof Error ? e.message : "Something went wrong",
      });
    }
  }, []);

  const reset = useCallback(() => setState({ phase: "idle" }), []);

  return { state, run, runBatch, runWithWatermark, reset };
}
