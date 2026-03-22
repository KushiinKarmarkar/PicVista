"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import type { ResizePreset } from "@/types/image-tools";
import { AdSlot } from "@/components/AdSlot";
import { formatBytes } from "@/components/tools/FormatBytes";
import { useImagePipeline } from "@/components/tools/useImagePipeline";

const presets: { value: ResizePreset; label: string }[] = [
  { value: "instagram-square", label: "Instagram post (1080×1080)" },
  { value: "instagram-story", label: "Instagram story (1080×1920)" },
  { value: "linkedin", label: "LinkedIn banner (1200×627)" },
  { value: "whatsapp", label: "WhatsApp profile (500×500)" },
  { value: "custom", label: "Custom size" },
];

type Props = {
  defaultPreset?: ResizePreset;
};

export function ResizePanel({ defaultPreset = "custom" }: Props) {
  const { state, run, reset } = useImagePipeline();
  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<ResizePreset>(defaultPreset);
  const [width, setWidth] = useState<number | "">(1200);
  const [height, setHeight] = useState<number | "">(800);
  const [maintainAspect, setMaintainAspect] = useState(true);

  useEffect(() => {
    setPreset(defaultPreset);
  }, [defaultPreset]);

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

  const onResize = () => {
    if (!file) return;
    void run(file, {
      kind: "resize",
      preset,
      width: preset === "custom" && width !== "" ? Number(width) : undefined,
      height: preset === "custom" && height !== "" ? Number(height) : undefined,
      maintainAspect,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <AdSlot variant="banner" />

      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed px-6 py-14 text-center transition outline-none ${
          isDragActive
            ? "border-violet-500 bg-violet-50 dark:border-violet-400 dark:bg-violet-950/30"
            : "border-zinc-300 bg-white hover:border-zinc-400 dark:border-zinc-600 dark:bg-zinc-950/40"
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
          Drop an image to resize
        </p>
        <p className="mt-2 text-xs text-zinc-500">Fast presets or custom dimensions</p>
      </div>

      {preview && (
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative max-h-64 flex-1 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="mx-auto max-h-64 w-auto object-contain" />
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-80">
            <label className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Preset
            </label>
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value as ResizePreset)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            >
              {presets.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            {preset === "custom" && (
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-zinc-500">
                  Width
                  <input
                    type="number"
                    min={1}
                    value={width}
                    onChange={(e) =>
                      setWidth(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-950"
                  />
                </label>
                <label className="text-xs text-zinc-500">
                  Height
                  <input
                    type="number"
                    min={1}
                    value={height}
                    onChange={(e) =>
                      setHeight(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-950"
                  />
                </label>
              </div>
            )}
            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={maintainAspect}
                onChange={(e) => setMaintainAspect(e.target.checked)}
              />
              Maintain aspect ratio
            </label>
            <button
              type="button"
              onClick={onResize}
              disabled={!file || state.phase === "uploading" || state.phase === "processing"}
              className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {state.phase === "uploading" || state.phase === "processing"
                ? "Working…"
                : "Resize"}
            </button>
          </div>
        </div>
      )}

      {state.phase === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
      )}
      {state.phase === "done" && (
        <div className="flex flex-col gap-4 rounded-xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-800 dark:bg-violet-950/40">
          {state.notice && (
            <p className="text-sm font-medium text-violet-950 dark:text-violet-50">{state.notice}</p>
          )}
          <p className="text-sm text-violet-900 dark:text-violet-100">
            Output {formatBytes(state.outputBytes)} (was {formatBytes(state.inputBytes)})
          </p>
          <a
            href={state.downloadUrl}
            className="inline-flex w-fit items-center justify-center rounded-xl bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-600"
          >
            Download result
          </a>
        </div>
      )}

      <AdSlot variant="inline" className="min-h-[120px]" />
    </div>
  );
}
