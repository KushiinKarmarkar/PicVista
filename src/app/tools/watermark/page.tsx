import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Watermark Removal — Temporarily Unavailable",
  description: "Watermark removal is temporarily unavailable. Try our other image tools: compress, convert, resize, remove background, or upscale.",
  alternates: { canonical: "/tools/watermark" },
  robots: { index: false, follow: true },
};

export default function WatermarkPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Watermark removal
      </h1>
      <p className="mt-3 max-w-xl text-zinc-600 dark:text-zinc-400">
        This tool is temporarily unavailable. Please try our other image tools:
      </p>
      <nav className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/tools/compress"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-900"
        >
          Compress
        </Link>
        <Link
          href="/tools/convert"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-900"
        >
          Convert format
        </Link>
        <Link
          href="/tools/resize"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-900"
        >
          Resize
        </Link>
        <Link
          href="/tools/remove-background"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-900"
        >
          Remove background
        </Link>
        <Link
          href="/tools/upscale"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-900"
        >
          Upscale
        </Link>
        <Link
          href="/"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          All tools
        </Link>
      </nav>
    </div>
  );
}
