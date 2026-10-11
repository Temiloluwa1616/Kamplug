"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleBlock } from "./actions";

export function BlockButton({
  userId,
  username,
  initiallyBlocked = false,
}: {
  userId: string;
  username: string;
  initiallyBlocked?: boolean;
}) {
  const router = useRouter();
  const [blocked, setBlocked] = useState(initiallyBlocked);
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function run() {
    const next = !blocked;
    setBlocked(next); // optimistic
    startTransition(async () => {
      const result = await toggleBlock(userId);
      if (!result.ok) {
        setBlocked(!next); // revert
        return;
      }
      setConfirming(false);
      router.refresh();
    });
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-5 text-sm font-semibold text-ink transition hover:border-danger/40 hover:text-danger active:scale-[0.98]"
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6" />
          <path d="M5 5l10 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        {blocked ? "Unblock" : "Block"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-ink">
        {blocked ? "Unblock" : "Block"} @{username}?
      </span>
      <button
        type="button"
        onClick={run}
        disabled={isPending}
        className="inline-flex h-11 items-center rounded-full bg-danger px-5 text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-60"
      >
        {isPending ? "…" : "Confirm"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-sm font-medium text-ink-muted hover:text-ink"
      >
        Cancel
      </button>
    </div>
  );
}