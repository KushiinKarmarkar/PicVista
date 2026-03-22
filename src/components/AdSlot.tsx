"use client";

import { useEffect, useId, useRef } from "react";

type Props = {
  variant?: "inline" | "banner";
  className?: string;
  /** Overrides env; use the numeric slot id from AdSense → Ads → Ad units */
  adSlot?: string;
};

function clientId(): string {
  return (
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || "ca-pub-2297460973101114"
  );
}

function slotForVariant(variant: "inline" | "banner", propSlot?: string): string | undefined {
  if (propSlot?.trim()) return propSlot.trim();
  if (variant === "banner") {
    const b = process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER?.trim();
    if (b) return b;
  }
  return process.env.NEXT_PUBLIC_ADSENSE_SLOT?.trim();
}

/**
 * Responsive AdSense display unit. Set NEXT_PUBLIC_ADSENSE_SLOT (and optionally
 * NEXT_PUBLIC_ADSENSE_SLOT_BANNER) in production. Script loads from layout via AdSenseScript.
 */
export function AdSlot({ variant = "inline", className = "", adSlot }: Props) {
  const uid = useId().replace(/:/g, "");
  const insRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);
  const slot = slotForVariant(variant, adSlot);
  const pub = clientId();
  const minH = variant === "banner" ? "min-h-[90px]" : "min-h-[100px]";

  useEffect(() => {
    if (!slot || !insRef.current || pushedRef.current) return;
    pushedRef.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      pushedRef.current = false;
    }
  }, [slot]);

  if (!slot) {
    return (
      <aside
        className={`${minH} w-full rounded-xl border border-dashed border-zinc-300/80 bg-zinc-100/50 dark:border-zinc-700 dark:bg-zinc-900/30 ${className}`}
        data-ad-placeholder
      >
        <div className="flex h-full min-h-[inherit] flex-col items-center justify-center gap-1 px-4 py-3 text-center">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Advertisement
          </span>
          <p className="max-w-md text-xs text-zinc-600 dark:text-zinc-400">
            Set <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">NEXT_PUBLIC_ADSENSE_SLOT</code> (and
            optionally <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">NEXT_PUBLIC_ADSENSE_SLOT_BANNER</code>
            ) to show AdSense units.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={`${minH} w-full overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40 ${className}`}
      aria-label="Advertisement"
    >
      <p className="px-3 pt-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
        Advertisement
      </p>
      <div className="flex justify-center px-2 pb-2">
        <ins
          ref={insRef}
          id={`adsense-${uid}`}
          className="adsbygoogle block w-full max-w-full"
          style={{ display: "block", minHeight: variant === "banner" ? 90 : 100 }}
          data-ad-client={pub}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
}
