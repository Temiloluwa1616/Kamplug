"use client";

import { useState, useTransition, type MouseEvent } from "react";
import { toggleSave } from "./saves";

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      aria-hidden="true"
    >
      <path
        d="M12 20.5s-7.5-4.6-7.5-10.2A4.8 4.8 0 0 1 9.3 5.5c1.2 0 2.3.5 3 1.3.7-.8 1.8-1.3 3-1.3a4.8 4.8 0 0 1 4.8 4.8c0 5.6-7.5 10.2-7.5 10.2z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SaveButton({
  listingId,
  initiallySaved,
  variant = "card",
}: {
  listingId: string;
  initiallySaved: boolean;
  variant?: "card" | "detail";
}) {
  const [saved, setSaved] = useState(initiallySaved);
  const [isPending, startTransition] = useTransition();

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    const next = !saved;
    setSaved(next); // optimistic

    startTransition(async () => {
      const result = await toggleSave(listingId);
      if (!result.ok || result.saved !== next) {
        setSaved(!next); // revert on failure
      }
    });
  }

  const base =
    "flex items-center justify-center transition active:scale-90 disabled:opacity-60";

  if (variant === "detail") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-pressed={saved}
        aria-label={saved ? "Remove from saved" : "Save listing"}
        className={`${base} size-12 rounded-full border border-line bg-surface text-ink hover:border-ink-muted/50 ${
          saved ? "text-danger" : ""
        }`}
      >
        <HeartIcon filled={saved} />
      </button>
    );
  }

  // Card variant: floating overlay, top-right.
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save listing"}
      className={`${base} absolute right-2.5 top-2.5 z-10 size-9 rounded-full bg-ink/45 text-white backdrop-blur-[2px] ${
        saved ? "text-danger" : ""
      }`}
    >
      <HeartIcon filled={saved} />
    </button>
  );
}