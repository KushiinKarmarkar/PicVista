import type { Metadata } from "next";
import { UpscalePanel } from "@/components/tools/UpscalePanel";

const title = "Upscale Images Online — 2× & 4× Free";
const description =
  "Upscale images 2× or 4× for free. High-quality enlargement for print, social media, or thumbnails. Works in your browser.";

export const metadata: Metadata = {
  title,
  description,
  keywords: ["upscale image", "enlarge image online", "2x image", "4x upscale", "image upscaler free"],
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
        Enlarge photos and graphics 2× or 4× with sharp results. Perfect for print, social posts, or thumbnails.
      </p>
      <div className="mt-8">
        <UpscalePanel />
      </div>
    </div>
  );
}
