import { JsonLd } from "@/components/JsonLd";
import { getSiteUrl } from "@/lib/siteUrl";

const siteUrl = getSiteUrl();

const tools = [
  { name: "Compress image online — reduce file size", path: "/tools/compress" },
  { name: "Convert PNG to JPG, WebP, AVIF", path: "/tools/convert" },
  { name: "Image resizer — Instagram, LinkedIn, custom", path: "/tools/resize" },
  { name: "Remove background from image", path: "/tools/remove-background" },
  { name: "Watermark removal (inpainting)", path: "/tools/watermark" },
  { name: "Upscale image 2x or 4x", path: "/tools/upscale" },
  { name: "Batch image processing (ZIP)", path: "/tools/batch" },
];

export function HomeStructuredData() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "PicVista — free online image utilities",
        description: "Core tools for compression, conversion, resizing, and AI-assisted edits.",
        numberOfItems: tools.length,
        itemListElement: tools.map((t, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: t.name,
          url: `${siteUrl}${t.path}`,
        })),
      }}
    />
  );
}
