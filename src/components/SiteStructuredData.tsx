import { JsonLd } from "@/components/JsonLd";
import { getSiteUrl } from "@/lib/siteUrl";

const siteUrl = getSiteUrl();

export function SiteStructuredData() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": `${siteUrl}/#organization`,
            name: "PicVista",
            url: siteUrl,
            description:
              "Free online image compressor, format converter, resizer, background removal, and batch tools.",
          },
          {
            "@type": "WebSite",
            "@id": `${siteUrl}/#website`,
            name: "PicVista",
            url: siteUrl,
            description:
              "Compress images online, convert PNG to JPG or WebP, reduce file size, resize for social media, remove backgrounds, and process batches — fast, no login.",
            publisher: { "@id": `${siteUrl}/#organization` },
            inLanguage: "en-US",
          },
        ],
      }}
    />
  );
}
