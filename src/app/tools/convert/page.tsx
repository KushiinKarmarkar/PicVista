import type { Metadata } from "next";
import { ConvertPanel } from "@/components/tools/ConvertPanel";
import type { OutputFormat } from "@/types/image-tools";

type Props = {
  searchParams: Promise<{ to?: string }>;
};

function parseToParam(to: string | undefined): OutputFormat {
  if (!to) return "jpeg";
  const n = to.toLowerCase();
  if (n === "jpg" || n === "jpeg") return "jpeg";
  if (n === "png") return "png";
  if (n === "webp") return "webp";
  if (n === "avif") return "avif";
  return "jpeg";
}

const title = "Free Image Converter Online — PNG, JPG, WebP, AVIF";
const description =
  "Convert images online for free: PNG to JPG, JPG to PNG, WebP to PNG or JPG, and AVIF export. Adjust quality, optional EXIF. No account required.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "png to jpg",
    "jpg to png",
    "webp to png",
    "convert webp to jpg",
    "image converter online",
    "avif converter",
  ],
  alternates: { canonical: "/tools/convert" },
  openGraph: { title, description },
};

export default async function ToolConvertPage({ searchParams }: Props) {
  const { to } = await searchParams;
  const defaultTarget = parseToParam(to);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Free online image converter
      </h1>
      <p className="mt-3 max-w-3xl text-zinc-600 dark:text-zinc-400">
        Change format in one step — common flows include PNG to JPG for smaller photos, WebP to PNG for design tools,
        and exporting modern WebP or AVIF for the web. Use the quality slider and optional metadata preservation.
      </p>
      <div className="mt-8">
        <ConvertPanel defaultTarget={defaultTarget} />
      </div>
    </div>
  );
}
