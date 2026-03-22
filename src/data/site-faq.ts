export type FaqItem = { question: string; answer: string };

/** Shared FAQ for visible markup + FAQPage JSON-LD (same copy = consistent signals). */
export const siteFaq: FaqItem[] = [
  {
    question: "How do I compress an image online for free?",
    answer:
      "Open Compress, drop your file, and use Auto mode for a smaller file or Manual for a specific quality. If the image is already heavily compressed, we return your original so the file size never increases.",
  },
  {
    question: "Can I convert PNG to JPG or WebP without signing up?",
    answer:
      "Yes. Use the converter on this page or the dedicated convert tool. Pick JPG, PNG, WEBP, or AVIF, adjust quality, optionally keep EXIF metadata, and download the result.",
  },
  {
    question: "How do I resize an image for Instagram or LinkedIn?",
    answer:
      "Use the resizer tool and choose a preset (e.g. 1080×1080 for Instagram posts or 1200×627 for LinkedIn). You can keep aspect ratio or crop to exact dimensions.",
  },
  {
    question: "Do you store my photos?",
    answer:
      "Files are uploaded for processing and short-term download only. In production, use cloud storage with a strict TTL and purge policy for your compliance needs.",
  },
  {
    question: "What can I do with background removal and upscaling?",
    answer:
      "Background removal gives you transparent PNGs for product photos and composites. Upscaling enlarges images 2× or 4× with high-quality results. Both tools work instantly in your browser.",
  },
];
