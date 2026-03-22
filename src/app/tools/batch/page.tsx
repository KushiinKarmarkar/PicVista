import type { Metadata } from "next";
import { BatchPanel } from "@/components/tools/BatchPanel";

const title = "Batch Image Processing — Compress or Convert Many Files (ZIP)";
const description =
  "Process up to 40 images at once: compress, convert to WebP, or resize for Instagram. Download everything in one ZIP.";

export const metadata: Metadata = {
  title,
  description,
  keywords: ["batch compress images", "bulk image converter", "resize multiple images", "zip download"],
  alternates: { canonical: "/tools/batch" },
  openGraph: { title, description },
};

export default function BatchPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Batch image processing
      </h1>
      <p className="mt-3 max-w-3xl text-zinc-600 dark:text-zinc-400">
        Same operation on every file — ideal when you need consistent compression or format for a folder of assets.
        Outputs are numbered inside the ZIP in upload order.
      </p>
      <div className="mt-8">
        <BatchPanel />
      </div>
    </div>
  );
}
