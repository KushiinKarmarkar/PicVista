import type { Metadata } from "next";
import { RemoveBgPanel } from "@/components/tools/RemoveBgPanel";

const title = "Remove Background from Image Online — Transparent PNG";
const description =
  "Remove image backgrounds and download a transparent PNG. Powered by remove.bg; add your API key on the server for production.";

export const metadata: Metadata = {
  title,
  description,
  keywords: ["remove background from image", "transparent background", "png cutout", "remove bg online"],
  alternates: { canonical: "/tools/remove-background" },
  openGraph: { title, description },
};

export default function RemoveBackgroundPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Remove background from image
      </h1>
      <p className="mt-3 max-w-3xl text-zinc-600 dark:text-zinc-400">
        Get a clean cutout for product shots, headshots, and composites. Output is PNG with alpha. Requires a
        remove.bg API key in your environment.
      </p>
      <div className="mt-8">
        <RemoveBgPanel />
      </div>
    </div>
  );
}
