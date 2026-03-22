# PicVista

Next.js App Router frontend + API routes, Sharp for image work, optional BullMQ + Redis for horizontal workers, file-backed job status for multi-process safety.

## Commands

- `npm run dev` — local development
- `npm run build` / `npm start` — production
- `npm run worker` — BullMQ worker (requires `REDIS_URL` and shared `tmp/` with the API process)

## Environment

Copy `.env.example` to `.env.local`. Set `NEXT_PUBLIC_SITE_URL` for production SEO metadata and sitemap URLs.

- **Vercel / serverless**: processing runs inline in the job API route (see `src/lib/jobs/dispatch.ts`). Use a small max upload or move heavy work to Railway/Fly + Redis.
- **Long-running Node**: omit `VERCEL` and optionally set `REDIS_URL` + run `npm run worker` on a second instance with shared storage (or point uploads/outputs to S3/R2).

## SEO

Metadata, canonical URLs, and JSON-LD live on `/` and each `/tools/*` route (`layout.tsx`, `page.tsx`, `SiteStructuredData`, `HomeStructuredData`, `FaqJsonLd`). Expand keywords and copy on those pages as you measure Search Console data.

## Phase 2 (AI)

- **Background**: `REMOVE_BG_API_KEY` → remove.bg API (`/tools/remove-background`).
- **Watermark / inpaint**: mask PNG + `REPLICATE_API_TOKEN` + `REPLICATE_LAMA_VERSION` (`/tools/watermark`).
- **Upscale**: Lanczos in Sharp, or Replicate with `REPLICATE_ESRGAN_VERSION` (`/tools/upscale`).

## Phase 3

- **Batch**: `/tools/batch` → `POST /api/batch` → ZIP of outputs.
- **API**: `POST /api/v1/jobs`, `POST /api/v1/batch`, `GET /api/v1/jobs/:id` with `Authorization: Bearer` and `PICVISTA_API_KEY` (legacy: `IMGTOOLS_API_KEY` still accepted).
- **Chrome**: load `extension/` as “Unpacked” in `chrome://extensions` and set `ORIGIN` in `popup.js`.

Hydration: `<html>` / `<body>` use `suppressHydrationWarning` so privacy extensions (e.g. GA opt-out attributes) do not break React hydration.
