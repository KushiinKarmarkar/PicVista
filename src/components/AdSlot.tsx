"use client";

type Props = {
  /** IAB display label */
  variant?: "inline" | "banner";
  className?: string;
};

/**
 * Drop your ad network snippet inside this container in production, or replace the inner content.
 * Outer box reserves layout space to reduce CLS when ads load.
 */
export function AdSlot({ variant = "inline", className = "" }: Props) {
  const minH = variant === "banner" ? "min-h-[90px]" : "min-h-[100px]";
  return (
    <aside
      className={`${minH} w-full rounded-xl border border-zinc-200/80 bg-zinc-100/50 dark:border-zinc-800 dark:bg-zinc-900/30 ${className}`}
      data-ad-slot
    >
      <div className="flex h-full min-h-[inherit] flex-col items-center justify-center gap-1 px-4 py-3 text-center">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
          Advertisement
        </span>
        <p className="max-w-md text-xs text-zinc-600 dark:text-zinc-400">
          Reserve space for AdSense, Ezoic, or Mediavine. Paste your unit where this text lives.
        </p>
      </div>
    </aside>
  );
}
