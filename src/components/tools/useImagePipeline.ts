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
      suggestedFilename?: string;
    }
  | { phase: "error"; message: string };

/** Single-request processing (Vercel-friendly: no cross-instance /tmp). */
async function processInline(
  file: File,
  params: Exclude<ProcessParams, { kind: "batchZip" }>,
  mask?: File
): Promise<{
  url: string;
  inputBytes: number;
  outputBytes: number;
  notice?: string;
  suggestedFilename?: string;
}> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("params", JSON.stringify(params));
  if (mask) fd.append("mask", mask);

  const res = await fetch("/api/process", { method: "POST", body: fd });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Processing failed");
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const inputBytes = parseInt(res.headers.get("X-Input-Bytes") ?? "0", 10);
  const outputBytes = parseInt(res.headers.get("X-Output-Bytes") ?? "0", 10);
  const notice = res.headers.get("X-Message") ?? undefined;
  const suggestedFilename = res.headers.get("X-Suggested-Filename") ?? undefined;
  return { url, inputBytes, outputBytes, notice, suggestedFilename };
}

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
    setState((prev) => {
      if (prev.phase === "done" && prev.downloadUrl.startsWith("blob:")) {
        URL.revokeObjectURL(prev.downloadUrl);
      }
      return { phase: "uploading" };
    });
    try {
      setState({ phase: "processing" });
      const { url, inputBytes, outputBytes, notice, suggestedFilename } =
        await processInline(file, params);
      setState({
        phase: "done",
        downloadUrl: url,
        inputBytes,
        outputBytes,
        notice,
        suggestedFilename,
      });
    } catch (e) {
      setState({
        phase: "error",
        message: e instanceof Error ? e.message : "Something went wrong",
      });
    }
  }, []);

  const runWithWatermark = useCallback(async (main: File, mask: File) => {
    setState((prev) => {
      if (prev.phase === "done" && prev.downloadUrl.startsWith("blob:")) {
        URL.revokeObjectURL(prev.downloadUrl);
      }
      return { phase: "uploading" };
    });
    try {
      setState({ phase: "processing" });
      const params = { kind: "removeWatermark", maskUploadId: "__inline__" } as const;
      const { url, inputBytes, outputBytes, notice, suggestedFilename } =
        await processInline(main, params, mask);
      setState({
        phase: "done",
        downloadUrl: url,
        inputBytes,
        outputBytes,
        notice,
        suggestedFilename,
      });
    } catch (e) {
      setState({
        phase: "error",
        message: e instanceof Error ? e.message : "Something went wrong",
      });
    }
  }, []);

  const runBatch = useCallback(async (files: File[], childParams: SimpleProcessParams) => {
    setState((prev) => {
      if (prev.phase === "done" && prev.downloadUrl.startsWith("blob:")) {
        URL.revokeObjectURL(prev.downloadUrl);
      }
      return { phase: "uploading" };
    });
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

  const reset = useCallback(() => {
    setState((prev) => {
      if (prev.phase === "done" && prev.downloadUrl.startsWith("blob:")) {
        URL.revokeObjectURL(prev.downloadUrl);
      }
      return { phase: "idle" };
    });
  }, []);

  return { state, run, runBatch, runWithWatermark, reset };
}
