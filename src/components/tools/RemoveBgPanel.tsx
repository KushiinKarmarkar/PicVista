"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { formatBytes } from "@/components/tools/FormatBytes";
import { useImagePipeline } from "@/components/tools/useImagePipeline";

export function RemoveBgPanel() {
  const { state, run, reset } = useImagePipeline();
  const [file, setFile] = useState<File | null>(null);
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
        Remove backgrounds and get transparent PNGs for product shots, headshots, and composites.
      </p>
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed px-6 py-14 text-center outline-none ${
          isDragActive
            ? "border-rose-500 bg-rose-50 dark:border-rose-400 dark:bg-rose-950/30"
            : "border-zinc-300 bg-white hover:border-zinc-400 dark:border-zinc-600 dark:bg-zinc-950/40"
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">Drop a photo to remove its background</p>
        <p className="mt-2 text-xs text-zinc-500">You get a PNG with transparency.</p>
      </div>
      {preview && (
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative max-h-64 flex-1 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element -- object URL preview */}
            <img src={preview} alt="Preview" className="mx-auto max-h-64 w-auto object-contain" />
          </div>
          <div className="flex flex-col gap-3 sm:w-56">
            <button
              type="button"
              onClick={() => file && void run(file, { kind: "removeBackground" })}
              disabled={!file || state.phase === "uploading" || state.phase === "processing"}
              className="rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
            >
              {state.phase === "uploading" || state.phase === "processing" ? "Working…" : "Remove background"}
            </button>
          </div>
        </div>
      )}
      {state.phase === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
      )}
      {state.phase === "done" && (
        <div className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/40">
          {state.notice && <p className="text-sm font-medium">{state.notice}</p>}
          <p className="text-sm text-rose-900 dark:text-rose-100">
            {formatBytes(state.outputBytes)} (was {formatBytes(state.inputBytes)})
          </p>
          <a
            href={state.downloadUrl}
            download={state.suggestedFilename}
            className="inline-flex w-fit rounded-xl bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
          >
            Download PNG
          </a>
        </div>
      )}
    </div>
  );
}
