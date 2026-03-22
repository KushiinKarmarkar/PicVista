import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { FaqJsonLd } from "@/components/FaqJsonLd";
import { HomeStructuredData } from "@/components/HomeStructuredData";
import { ConvertPanel } from "@/components/tools/ConvertPanel";
import { siteFaq } from "@/data/site-faq";

const desc =
  "Free image compressor and converter: shrink JPEG and PNG, turn PNG to JPG or WebP to PNG, resize for social posts, remove backgrounds, and export batches as ZIP. Works in your browser — upload, process, download.";

export const metadata: Metadata = {
  title: "Free Online Image Compressor, Converter & Resizer",
  description: desc,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Free Online Image Compressor, Converter & Resizer | PicVista",
    description: desc,
  },
};

export default function Home() {
  return (
    <>
      <HomeStructuredData />
      <FaqJsonLd />
      <div className="mx-auto flex max-w-5xl flex-col gap-14 px-4 py-12">
        <section className="flex flex-col gap-6" aria-labelledby="hero-heading">
          <h1
            id="hero-heading"
            className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl"
          >
            Compress, convert & resize images online — free
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            Reduce image file size without upsizing outputs, switch between PNG, JPG, WEBP, and AVIF, resize for
            Instagram or LinkedIn, cut out backgrounds, inpaint watermarks with a mask, upscale, or run the same
            job on many files and grab one ZIP.
          </p>
          <nav aria-label="Popular tools" className="flex flex-wrap gap-2 text-sm">
            <Link
              href="/tools/compress"
              className="rounded-full bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              Compress image
            </Link>
            <Link
              href="/tools/convert?to=jpeg"
              className="rounded-full border border-zinc-300 px-4 py-2 font-medium hover:bg-white dark:border-zinc-600 dark:hover:bg-zinc-900"
            >
              PNG to JPG
            </Link>
            <Link
              href="/tools/convert?to=png"
              className="rounded-full border border-zinc-300 px-4 py-2 font-medium hover:bg-white dark:border-zinc-600 dark:hover:bg-zinc-900"
            >
              WebP to PNG
            </Link>
            <Link
              href="/tools/resize"
              className="rounded-full border border-zinc-300 px-4 py-2 font-medium hover:bg-white dark:border-zinc-600 dark:hover:bg-zinc-900"
            >
              Image resizer
            </Link>
            <Link
              href="/tools/remove-background"
              className="rounded-full border border-zinc-300 px-4 py-2 font-medium hover:bg-white dark:border-zinc-600 dark:hover:bg-zinc-900"
            >
              Remove background
            </Link>
            <Link
              href="/tools/batch"
              className="rounded-full border border-zinc-300 px-4 py-2 font-medium hover:bg-white dark:border-zinc-600 dark:hover:bg-zinc-900"
            >
              Batch ZIP
            </Link>
          </nav>
        </section>

        <AdSlot variant="banner" />

        <section className="flex flex-col gap-4" aria-labelledby="converter-heading">
          <h2 id="converter-heading" className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Image format converter (PNG, JPG, WEBP, AVIF)
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Pick an output format and quality. Optional EXIF preservation. For JPG exports from PNG, use the quality
            slider to balance size and clarity.
          </p>
          <ConvertPanel />
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950/50">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">All tools</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            <li>
              <Link href="/tools/compress" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
                Compress images online
              </Link>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Auto or manual quality; never returns a larger file.</p>
            </li>
            <li>
              <Link href="/tools/convert" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
                Convert image format
              </Link>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">PNG ↔ JPG ↔ WEBP ↔ AVIF.</p>
            </li>
            <li>
              <Link href="/tools/resize" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
                Resize images
              </Link>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Presets for Instagram, LinkedIn, WhatsApp.</p>
            </li>
            <li>
              <Link href="/tools/remove-background" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
                Background remover
              </Link>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Transparent PNG via remove.bg.</p>
            </li>
            <li>
              <Link href="/tools/watermark" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
                Watermark removal
              </Link>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Mask-based inpainting (Replicate).</p>
            </li>
            <li>
              <Link href="/tools/upscale" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
                Upscale images
              </Link>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">2× / 4× — Lanczos or Real-ESRGAN.</p>
            </li>
            <li>
              <Link href="/tools/batch" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
                Batch processing
              </Link>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Up to 40 files, one ZIP.</p>
            </li>
          </ul>
        </section>

        <section className="border-t border-zinc-200 pt-10 dark:border-zinc-800" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Frequently asked questions
          </h2>
          <dl className="mt-6 space-y-6">
            {siteFaq.map((item) => (
              <div key={item.question}>
                <dt className="font-medium text-zinc-900 dark:text-zinc-100">{item.question}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </>
  );
}
