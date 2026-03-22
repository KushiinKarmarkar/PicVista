"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import type { OutputFormat } from "@/types/image-tools";
import { AdSlot } from "@/components/AdSlot";
import { formatBytes } from "@/components/tools/FormatBytes";
import { useImagePipeline } from "@/components/tools/useImagePipeline";

const formats: { value: OutputFormat; label: string }[] = [
  { value: "jpeg", label: "JPG" },
  { value: "png", label: "PNG" },
  { value: "webp", label: "WEBP" },
  { value: "avif", label: "AVIF" },
];

type Props = {
  defaultTarget?: OutputFormat;
};

export function ConvertPanel({ defaultTarget = "jpeg" }: Props) {
  const { state, run, reset } = useImagePipeline();
  const [file, setFile] = useState<File | null>(null);
  const [target, setTarget] = useState<OutputFormat>(defaultTarget);
  const [quality, setQuality] = useState(85);
  const [preserveMeta, setPreserveMeta] = useState(false);

  useEffect(() => {
    setTarget(defaultTarget);
  }, [defaultTarget]);

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

  const onConvert = () => {
    if (!file) return;
    void run(file, {
      kind: "convert",
      targetFormat: target,
      quality,
      preserveMetadata: preserveMeta,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <AdSlot variant="banner" />

      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed px-6 py-14 text-center transition outline-none ${
          isDragActive
            ? "border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950/30"
            : "border-zinc-300 bg-white hover:border-zinc-400 dark:border-zinc-600 dark:bg-zinc-950/40"
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
          Drop an image here, or click to browse
        </p>
        <p className="mt-2 text-xs text-zinc-500">PNG, JPG, WEBP, AVIF — up to 25MB</p>
      </div>

      {preview && (
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative max-h-64 flex-1 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="mx-auto max-h-64 w-auto object-contain" />
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-72">
            <label className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Output format
            </label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value as OutputFormat)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            >
              {formats.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
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
            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={preserveMeta}
                onChange={(e) => setPreserveMeta(e.target.checked)}
              />
              Preserve metadata (EXIF)
            </label>
            <button
              type="button"
              onClick={onConvert}
              disabled={!file || state.phase === "uploading" || state.phase === "processing"}
              className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {state.phase === "uploading" || state.phase === "processing"
                ? "Working…"
                : "Convert"}
            </button>
          </div>
        </div>
      )}

      {state.phase === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
      )}
      {state.phase === "done" && (
        <div className="flex flex-col gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/40">
          {state.notice && (
            <p className="text-sm font-medium text-emerald-950 dark:text-emerald-50">{state.notice}</p>
          )}
          <p className="text-sm text-emerald-900 dark:text-emerald-100">
            Saved {formatBytes(state.outputBytes)} (was {formatBytes(state.inputBytes)})
          </p>
          <a
            href={state.downloadUrl}
            className="inline-flex w-fit items-center justify-center rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            Download result
          </a>
        </div>
      )}

      <AdSlot variant="inline" className="min-h-[120px]" />
    </div>
  );
}
