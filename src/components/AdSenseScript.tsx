import Script from "next/script";

/** Public AdSense publisher ID (safe in client bundle). */
const DEFAULT_CLIENT = "ca-pub-2297460973101114";

export function AdSenseScript() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || DEFAULT_CLIENT;
  if (!client) return null;

  return (
    <Script
      id="adsbygoogle-init"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`}
      strategy="afterInteractive"
      crossOrigin="anonymous"
    />
  );
}
