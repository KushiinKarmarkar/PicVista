import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/siteUrl";

const base = getSiteUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "Mediapartners-Google", allow: "/" },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
