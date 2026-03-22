"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { formatBytes } from "@/components/tools/FormatBytes";
import { useImagePipeline } from "@/components/tools/useImagePipeline";

export function WatermarkPanel() {
  const { state, runWithWatermark, reset } = useImagePipeline();
  const [main, setMain] = useState<File | null>(null);
  const [mask, setMask] = useState<File | null>(null);
  const prevMain = useMemo(() => (main ? URL.createObjectURL(main) : null), [main]);
  const prevMask = useMemo(() => (mask ? URL.createObjectURL(mask) : null), [mask]);
  useEffect(() => {
    return () => {
      if (prevMain) URL.revokeObjectURL(prevMain);
      if (prevMask) URL.revokeObjectURL(prevMask);
    };
  }, [prevMain, prevMask]);

  const onMain = useDropzone({
    onDrop: useCallback(
      (f: File[]) => {
        if (f[0]) {
          setMain(f[0]);
          reset();
        }
      },
      [reset]
    ),
    accept: { "image/*": [] },
    multiple: false,
    disabled: state.phase === "uploading" || state.phase === "processing",
  });

  const onMask = useDropzone({
    onDrop: useCallback((f: File[]) => {
      if (f[0]) setMask(f[0]);
    }, []),
    accept: { "image/png": [".png"], "image/*": [] },
    multiple: false,
    disabled: state.phase === "uploading" || state.phase === "processing",
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
        <p className="font-medium text-zinc-900 dark:text-zinc-100">Mask format</p>
        <p className="mt-2">
          Upload a PNG mask the same size as your image: <strong>white</strong> pixels mark the watermark (or
          object) to remove; <strong>black</strong> keeps the rest. Processing uses LaMa on Replicate — set{" "}
          <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">REPLICATE_API_TOKEN</code> and{" "}
          <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">REPLICATE_LAMA_VERSION</code>.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div
          {...onMain.getRootProps()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed px-4 py-10 text-center text-sm outline-none ${
            onMain.isDragActive ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30" : "border-zinc-300 dark:border-zinc-600"
          }`}
        >
          <input {...onMain.getInputProps()} />
          Photo
          {main && <p className="mt-2 truncate text-xs text-zinc-500">{main.name}</p>}
        </div>
        <div
          {...onMask.getRootProps()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed px-4 py-10 text-center text-sm outline-none ${
            onMask.isDragActive ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30" : "border-zinc-300 dark:border-zinc-600"
          }`}
        >
          <input {...onMask.getInputProps()} />
          Mask image
          {mask && <p className="mt-2 truncate text-xs text-zinc-500">{mask.name}</p>}
        </div>
      </div>
      {(prevMain || prevMask) && (
        <div className="grid grid-cols-2 gap-2">
          {prevMain ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={prevMain} alt="" className="max-h-40 rounded-lg border object-contain" />
            </>
          ) : null}
          {prevMask ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={prevMask} alt="" className="max-h-40 rounded-lg border object-contain" />
            </>
          ) : null}
        </div>
      )}
      <button
        type="button"
        onClick={() => main && mask && void runWithWatermark(main, mask)}
        disabled={!main || !mask || state.phase === "uploading" || state.phase === "processing"}
        className="rounded-xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
      >
        {state.phase === "uploading" || state.phase === "processing" ? "Working…" : "Remove (inpaint)"}
      </button>
      {state.phase === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
      )}
      {state.phase === "done" && (
        <div className="flex flex-col gap-3 rounded-xl border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-900 dark:bg-cyan-950/40">
          {state.notice && <p className="text-sm font-medium">{state.notice}</p>}
          <p className="text-sm">
            {formatBytes(state.outputBytes)} (was {formatBytes(state.inputBytes)})
          </p>
          <a
            href={state.downloadUrl}
            download={state.suggestedFilename}
            className="inline-flex w-fit rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white"
          >
            Download PNG
          </a>
        </div>
      )}
    </div>
  );
}
