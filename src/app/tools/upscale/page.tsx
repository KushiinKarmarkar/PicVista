import type { Metadata } from "next";
import { UpscalePanel } from "@/components/tools/UpscalePanel";

const title = "Upscale Images Online — 2× & 4× (Lanczos or AI)";
const description =
  "Upscale images 2× or 4×: fast Lanczos scaling in-browser processing, or configure Replicate Real-ESRGAN for AI detail recovery.";

export const metadata: Metadata = {
  title,
  description,
  keywords: ["upscale image", "enlarge image online", "2x image", "4x upscale", "real-esrgan"],
  alternates: { canonical: "/tools/upscale" },
  openGraph: { title, description },
};

export default function UpscalePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Upscale images
      </h1>
      <p className="mt-3 max-w-3xl text-zinc-600 dark:text-zinc-400">
        Choose mathematical Lanczos enlargement for speed, or connect Replicate for generative upscaling when you have
        a model version configured.
      </p>
      <div className="mt-8">
        <UpscalePanel />
      </div>
    </div>
  );
}
