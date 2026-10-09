"use client";

import { useState, useRef } from "react";

export function ImageCarousel({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-sand">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="var(--color-ink-muted)" strokeWidth="1.5" />
          <circle cx="9" cy="9" r="2" stroke="var(--color-ink-muted)" strokeWidth="1.5" />
          <path d="M3 17l5-5 4 4 3-3 6 6" stroke="var(--color-ink-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  function handleScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActive(index);
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto rounded-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((url, i) => (
          <div
            key={url}
            className="relative aspect-square w-full shrink-0 snap-center bg-sand"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`${title} — photo ${i + 1}`}
              loading={i === 0 ? "eager" : "lazy"}
              className="size-full object-cover"
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((_, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={`size-1.5 rounded-full transition ${
                i === active ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}