import type { Metadata } from "next";
import { CompressPanel } from "@/components/tools/CompressPanel";

const title = "Compress Images Online — Reduce JPG & PNG File Size";
const description =
  "Compress images online for free. Auto mode finds a smaller file; manual mode sets quality 10–90. We never return a larger file than you uploaded.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "compress image online",
    "compress jpeg",
    "reduce image size",
    "shrink png",
    "smaller image file",
  ],
  alternates: { canonical: "/tools/compress" },
  openGraph: { title, description },
};

export default function ToolCompressPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Compress images online
      </h1>
      <p className="mt-3 max-w-3xl text-zinc-600 dark:text-zinc-400">
        Shrink JPEG, PNG, WebP, and AVIF for faster sites, email attachments, and upload limits. Compare before and
        after file size on every run.
      </p>
      <div className="mt-8">
        <CompressPanel />
      </div>
    </div>
  );
}
