import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { Analytics } from "@/components/Analytics";
import { AdSenseScript } from "@/components/AdSenseScript";
import { SiteStructuredData } from "@/components/SiteStructuredData";
import { getSiteUrl } from "@/lib/siteUrl";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();

/** Paste the content value from AdSense / Search Console “HTML tag” verification (not the whole tag). */
const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

const primaryDescription =
  "Compress images online, convert PNG to JPG or WebP to PNG, reduce image file size, resize for Instagram and LinkedIn, remove backgrounds, and batch-download results — free tools, no sign-up.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Free Image Compressor & Converter Online | PicVista",
    template: "%s | PicVista",
  },
  description: primaryDescription,
  keywords: [
    "compress image online",
    "reduce image size",
    "png to jpg",
    "webp to png",
    "image converter",
    "image resizer",
    "resize image for instagram",
    "remove background from image",
    "free image compressor",
    "compress jpeg",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "PicVista",
    title: "Free Image Compressor, Converter & Resizer Online",
    description: primaryDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "PicVista — Compress & convert images online",
    description: primaryDescription,
  },
  other: {
    "google-adsense-account": "ca-pub-2297460973101114",
  },
  ...(googleSiteVerification
    ? {
        verification: {
          google: googleSiteVerification,
        },
      }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="flex min-h-full flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50"
      >
        <SiteStructuredData />
        <AdSenseScript />
        <Analytics />
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
