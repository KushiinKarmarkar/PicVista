import type { Metadata } from "next";
import { ResizePanel } from "@/components/tools/ResizePanel";

const title = "Resize Images Online — Instagram, LinkedIn & Custom Sizes";
const description =
  "Resize images online with aspect ratio control. Presets for Instagram square and story, LinkedIn link preview, and WhatsApp profile, plus custom width and height.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "resize image online",
    "resize image for instagram",
    "instagram image size",
    "linkedin image dimensions",
    "image resizer",
  ],
  alternates: { canonical: "/tools/resize" },
  openGraph: { title, description },
};

export default function ToolResizePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Image resizer
      </h1>
      <p className="mt-3 max-w-3xl text-zinc-600 dark:text-zinc-400">
        Fit your photo to common social and messaging dimensions, or set exact pixels. Toggle aspect ratio to avoid
        stretched faces or logos.
      </p>
      <div className="mt-8">
        <ResizePanel />
      </div>
    </div>
  );
}
