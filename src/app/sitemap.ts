import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/siteUrl";

const base = getSiteUrl();

const paths = [
  "",
  "/tools/convert",
  "/tools/compress",
  "/tools/resize",
  "/tools/remove-background",
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
