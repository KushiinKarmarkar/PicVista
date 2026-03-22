import Link from "next/link";

const link = "text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white";

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          PicVista
        </Link>
        <nav className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Primary">
          <Link href="/tools/compress" className={link}>
            Compress
          </Link>
          <Link href="/tools/convert" className={link}>
            Convert
          </Link>
          <Link href="/tools/resize" className={link}>
            Resize
          </Link>
          <Link href="/tools/remove-background" className={link}>
            Background
          </Link>
          <Link href="/tools/watermark" className={link}>
            Watermark
          </Link>
          <Link href="/tools/upscale" className={link}>
            Upscale
          </Link>
          <Link href="/tools/batch" className={link}>
            Batch
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-50 py-10 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 lg:flex-row lg:justify-between">
        <div>
          <p className="font-medium text-zinc-800 dark:text-zinc-200">PicVista</p>
          <p className="mt-2 max-w-md leading-relaxed">
            Free online image compressor, converter, and resizer. Shrink file sizes, change PNG/JPG/WebP/AVIF, resize
            for social platforms, remove backgrounds, inpaint with a mask, upscale, or batch to ZIP.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Tools</span>
            <Link href="/tools/compress" className="hover:text-zinc-900 dark:hover:text-zinc-100">
              Compress image online
            </Link>
            <Link href="/tools/convert?to=jpeg" className="hover:text-zinc-900 dark:hover:text-zinc-100">
              PNG to JPG
            </Link>
            <Link href="/tools/convert?to=png" className="hover:text-zinc-900 dark:hover:text-zinc-100">
              WebP to PNG
            </Link>
            <Link href="/tools/resize" className="hover:text-zinc-900 dark:hover:text-zinc-100">
              Image resizer
            </Link>
            <Link href="/tools/batch" className="hover:text-zinc-900 dark:hover:text-zinc-100">
              Batch ZIP
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">AI & advanced</span>
            <Link href="/tools/remove-background" className="hover:text-zinc-900 dark:hover:text-zinc-100">
              Remove background
            </Link>
            <Link href="/tools/watermark" className="hover:text-zinc-900 dark:hover:text-zinc-100">
              Watermark removal
            </Link>
            <Link href="/tools/upscale" className="hover:text-zinc-900 dark:hover:text-zinc-100">
              Upscale image
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Developers</span>
            <span className="text-zinc-500">REST API (Bearer key)</span>
            <code className="text-xs text-zinc-500">POST /api/v1/jobs</code>
          </div>
        </div>
      </div>
    </footer>
  );
}
