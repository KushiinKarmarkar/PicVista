import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const paths = [
  "",
  "/tools/convert",
  "/tools/compress",
  "/tools/resize",
  "/tools/remove-background",
  "/tools/watermark",
  "/tools/upscale",
  "/tools/batch",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? ("daily" as const) : ("weekly" as const),
    priority: path === "" ? 1 : 0.9,
  }));
}
