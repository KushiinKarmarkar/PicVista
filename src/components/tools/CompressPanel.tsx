"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { formatBytes } from "@/components/tools/FormatBytes";
import { useImagePipeline } from "@/components/tools/useImagePipeline";

export function CompressPanel() {
  const { state, run, reset } = useImagePipeline();
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(75);
  const [mode, setMode] = useState<"manual" | "auto">("auto");

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const onDrop = useCallback(
    (accepted: File[]) => {
      const f = accepted[0];
      if (!f) return;
      setFile(f);
      reset();
    },
    [reset]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
    disabled: state.phase === "uploading" || state.phase === "processing",
  });

  const onCompress = () => {
    if (!file) return;
    void run(file, {
      kind: "compress",
      quality,
      mode,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed px-6 py-14 text-center transition outline-none ${
          isDragActive
            ? "border-sky-500 bg-sky-50 dark:border-sky-400 dark:bg-sky-950/30"
            : "border-zinc-300 bg-white hover:border-zinc-400 dark:border-zinc-600 dark:bg-zinc-950/40"
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
          Drop an image to compress
        </p>
        <p className="mt-2 text-xs text-zinc-500">Lossy tuning for JPG/WEBP/AVIF; PNG uses compression level</p>
      </div>

      {preview && (
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative max-h-64 flex-1 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="mx-auto max-h-64 w-auto object-contain" />
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-72">
            <label className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Mode
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode("auto")}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
                  mode === "auto"
                    ? "bg-sky-600 text-white"
                    : "border border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-950"
                }`}
              >
                Auto
              </button>
              <button
                type="button"
                onClick={() => setMode("manual")}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
                  mode === "manual"
                    ? "bg-sky-600 text-white"
                    : "border border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-950"
                }`}
              >
                Manual
              </button>
            </div>
            {mode === "manual" && (
              <>
                <label className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Quality ({quality})
                </label>
                <input
                  type="range"
                  min={10}
                  max={90}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                />
              </>
            )}
            <button
              type="button"
              onClick={onCompress}
              disabled={!file || state.phase === "uploading" || state.phase === "processing"}
              className="rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {state.phase === "uploading" || state.phase === "processing"
                ? "Working…"
                : "Compress"}
            </button>
          </div>
        </div>
      )}

      {state.phase === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
      )}
      {state.phase === "done" && (
        <div className="flex flex-col gap-4 rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-800 dark:bg-sky-950/40">
          {state.notice && (
            <p className="text-sm font-medium text-sky-950 dark:text-sky-50">{state.notice}</p>
          )}
          <p className="text-sm text-sky-900 dark:text-sky-100">
            {formatBytes(state.outputBytes)} (was {formatBytes(state.inputBytes)})
          </p>
          <a
            href={state.downloadUrl}
            className="inline-flex w-fit items-center justify-center rounded-xl bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600"
          >
            Download result
          </a>
        </div>
      )}

    </div>
  );
}
