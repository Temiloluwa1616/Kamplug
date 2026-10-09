"use client";

import { useState } from "react";

export function ShareButton({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    // Native share on mobile — opens WhatsApp, IG, X, etc.
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User cancelled or share not available. Fall through to copy.
      }
    }

    // Fallback: copy to clipboard.
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (unlikely, but possible in some browsers).
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-5 text-sm font-semibold text-ink transition hover:border-ink-muted/50 active:scale-[0.98]"
    >
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M14 3a3 3 0 100 6 3 3 0 000-6zM6 7a3 3 0 100 6 3 3 0 000-6zM14 11a3 3 0 100 6 3 3 0 000-6zM8.6 9l2.8-1.5M8.6 11l2.8 1.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {copied ? "Link copied" : "Share"}
    </button>
  );
}