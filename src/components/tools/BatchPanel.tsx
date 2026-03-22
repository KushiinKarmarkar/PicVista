"use client";

import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import type { SimpleProcessParams } from "@/types/image-tools";
import { AdSlot } from "@/components/AdSlot";
import { formatBytes } from "@/components/tools/FormatBytes";
import { useImagePipeline } from "@/components/tools/useImagePipeline";

type Op = "compress-auto" | "compress-manual" | "webp-80" | "resize-ig";

function opToParams(op: Op, manualQ: number): SimpleProcessParams {
  switch (op) {
    case "compress-auto":
      return { kind: "compress", quality: 75, mode: "auto" };
    case "compress-manual":
      return { kind: "compress", quality: manualQ, mode: "manual" };
    case "webp-80":
      return { kind: "convert", targetFormat: "webp", quality: 80 };
    case "resize-ig":
      return {
        kind: "resize",
        preset: "instagram-square",
        maintainAspect: true,
      };
  }
}

export function BatchPanel() {
  const { state, runBatch, reset } = useImagePipeline();
  const [files, setFiles] = useState<File[]>([]);
  const [op, setOp] = useState<Op>("compress-auto");
  const [manualQ, setManualQ] = useState(70);

  const onDrop = useCallback(
    (accepted: File[]) => {
      setFiles(accepted.slice(0, 40));
      reset();
    },
    [reset]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
    disabled: state.phase === "uploading" || state.phase === "processing",
  });

  const list = useMemo(
    () =>
      files.map((f, i) => (
        <li key={`${f.name}-${i}`} className="truncate text-xs text-zinc-600 dark:text-zinc-400">
          {f.name}
        </li>
      )),
    [files]
  );

  return (
    <div className="flex flex-col gap-6">
      <AdSlot variant="banner" />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Up to 40 images per batch. You receive one ZIP with outputs in upload order. Watermark removal and
        background removal are not available in batch (per-image masks / API cost).
      </p>
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed px-6 py-12 text-center outline-none ${
          isDragActive
            ? "border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950/30"
            : "border-zinc-300 dark:border-zinc-600"
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-sm font-medium">Drop multiple images or click to select</p>
        <p className="mt-1 text-xs text-zinc-500">Max 40 files · same operation on each</p>
      </div>
      {files.length > 0 && <ul className="max-h-32 overflow-y-auto rounded-lg border border-zinc-200 p-2 dark:border-zinc-700">{list}</ul>}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          <span className="text-xs font-semibold uppercase text-zinc-500">Operation</span>
          <select
            value={op}
            onChange={(e) => setOp(e.target.value as Op)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-950"
          >
            <option value="compress-auto">Compress (auto)</option>
            <option value="compress-manual">Compress (manual quality)</option>
            <option value="webp-80">Convert to WEBP (Q80)</option>
            <option value="resize-ig">Resize — Instagram square</option>
          </select>
        </label>
        {op === "compress-manual" && (
          <label className="flex flex-col gap-1 text-sm sm:w-48">
            <span className="text-xs font-semibold uppercase text-zinc-500">Quality</span>
            <input
              type="range"
              min={10}
              max={90}
              value={manualQ}
              onChange={(e) => setManualQ(Number(e.target.value))}
            />
          </label>
        )}
        <button
          type="button"
          onClick={() => files.length && void runBatch(files, opToParams(op, manualQ))}
          disabled={files.length === 0 || state.phase === "uploading" || state.phase === "processing"}
          className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {state.phase === "uploading" || state.phase === "processing" ? "Working…" : "Run batch"}
        </button>
      </div>
      {state.phase === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
      )}
      {state.phase === "done" && (
        <div className="flex flex-col gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-950/40">
          {state.notice && <p className="text-sm font-medium">{state.notice}</p>}
          <p className="text-sm">
            ZIP {formatBytes(state.outputBytes)} · source total {formatBytes(state.inputBytes)}
          </p>
          <a
            href={state.downloadUrl}
            className="inline-flex w-fit rounded-xl bg-indigo-700 px-4 py-2 text-sm font-semibold text-white"
          >
            Download ZIP
          </a>
        </div>
      )}
      <AdSlot variant="inline" className="min-h-[120px]" />
    </div>
  );
}
