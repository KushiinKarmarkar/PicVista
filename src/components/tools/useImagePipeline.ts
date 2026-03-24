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

async function processBatchInline(
  files: File[],
  childParams: SimpleProcessParams
): Promise<{
  url: string;
  inputBytes: number;
  outputBytes: number;
  suggestedFilename?: string;
}> {
  const fd = new FormData();
  for (const file of files) fd.append("files", file);
  fd.append("childParams", JSON.stringify(childParams));

  const res = await fetch("/api/batch", { method: "POST", body: fd });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Batch failed");
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const inputBytes = parseInt(res.headers.get("X-Input-Bytes") ?? "0", 10);
  const outputBytes = parseInt(res.headers.get("X-Output-Bytes") ?? "0", 10);
  const suggestedFilename = res.headers.get("X-Suggested-Filename") ?? undefined;
  return { url, inputBytes, outputBytes, suggestedFilename };
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
      setState({ phase: "processing" });
      const { url, inputBytes, outputBytes, suggestedFilename } = await processBatchInline(
        files,
        childParams
      );
      setState({
        phase: "done",
        downloadUrl: url,
        inputBytes,
        outputBytes,
        suggestedFilename,
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
