"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { formatBytes } from "@/components/tools/FormatBytes";
import { useImagePipeline } from "@/components/tools/useImagePipeline";

export function UpscalePanel() {
  const { state, run, reset } = useImagePipeline();
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState<2 | 4>(2);
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

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Enlarge your images 2× or 4× with high-quality scaling. Results are sharp and ready for print or social.
      </p>
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed px-6 py-14 text-center outline-none ${
          isDragActive
            ? "border-amber-500 bg-amber-50 dark:border-amber-400 dark:bg-amber-950/30"
            : "border-zinc-300 bg-white hover:border-zinc-400 dark:border-zinc-600 dark:bg-zinc-950/40"
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">Drop an image to upscale</p>
      </div>
      {preview && (
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative max-h-64 flex-1 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="mx-auto max-h-64 w-auto object-contain" />
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-64">
            <label className="text-xs font-medium uppercase text-zinc-500">Scale</label>
            <div className="flex gap-2">
              {([2, 4] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScale(s)}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium ${
                    scale === s
                      ? "bg-amber-600 text-white"
                      : "border border-zinc-300 dark:border-zinc-600"
                  }`}
                >
                  {s}×
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => file && void run(file, { kind: "upscale", scale, engine: "lanczos" })}
              disabled={!file || state.phase === "uploading" || state.phase === "processing"}
              className="rounded-xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-500 disabled:opacity-50"
            >
              {state.phase === "uploading" || state.phase === "processing" ? "Working…" : "Upscale"}
            </button>
          </div>
        </div>
      )}
      {state.phase === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
      )}
      {state.phase === "done" && (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40">
          {state.notice && <p className="text-sm font-medium text-amber-950 dark:text-amber-100">{state.notice}</p>}
          <p className="text-sm text-amber-900 dark:text-amber-100">
            {formatBytes(state.outputBytes)} (was {formatBytes(state.inputBytes)})
          </p>
          <a
            href={state.downloadUrl}
            download={state.suggestedFilename}
            className="inline-flex w-fit rounded-xl bg-amber-800 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
          >
            Download PNG
          </a>
        </div>
      )}
    </div>
  );
}
