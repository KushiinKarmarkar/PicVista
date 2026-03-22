import type { Metadata } from "next";
import { WatermarkPanel } from "@/components/tools/WatermarkPanel";

const title = "Remove Watermark from Image — Mask-Based Inpainting";
const description =
  "Remove watermarks or objects using a white-on-black mask and LaMa inpainting via Replicate. Upload photo + mask PNG (same dimensions).";

export const metadata: Metadata = {
  title,
  description,
  keywords: ["remove watermark", "inpainting", "erase object from photo", "lama inpainting"],
  alternates: { canonical: "/tools/watermark" },
  openGraph: { title, description },
};

export default function WatermarkPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Watermark removal (inpainting)
      </h1>
      <p className="mt-3 max-w-3xl text-zinc-600 dark:text-zinc-400">
        Paint or generate a mask where white marks what to rebuild and black stays untouched. Uses Replicate LaMa —
        set your API token and model version on the server.
      </p>
      <div className="mt-8">
        <WatermarkPanel />
      </div>
    </div>
  );
}
