"use client";

import { useState, useRef } from "react";

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d={direction === "left" ? "M12.5 4.5L7 10l5.5 5.5" : "M7.5 4.5L13 10l-5.5 5.5"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ARROW =
  "absolute top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface text-ink shadow-pop transition active:scale-95 pointer-fine:flex";

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
      <div className="flex aspect-[4/5] items-center justify-center bg-brand-soft sm:rounded-3xl">
        <svg width="56" height="56" viewBox="0 0 44 44" fill="none" aria-hidden="true" opacity="0.45">
          <rect x="7" y="9" width="30" height="26" rx="6" stroke="var(--color-brand)" strokeWidth="2.4" />
          <circle cx="17" cy="19" r="3" fill="var(--color-brand)" />
          <path
            d="M8 31l8-8 6 6 4-4 8 8"
            stroke="var(--color-brand)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
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

  // Only used by the desktop arrows. Touch users keep swiping.
  function goTo(index: number) {
    const el = scrollerRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: index * el.clientWidth, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        role="region"
        aria-roledescription="carousel"
        aria-label={`${title} photos`}
        tabIndex={0}
        className="flex snap-x snap-mandatory overflow-x-auto bg-sand sm:rounded-3xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((url, i) => (
          <div
            key={url}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${images.length}`}
            className="relative aspect-[4/5] w-full shrink-0 snap-center"
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
        <>
          <p className="sr-only" aria-live="polite">
            Photo {active + 1} of {images.length}
          </p>

          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
            <div className="flex items-center gap-1.5 rounded-full bg-ink/40 px-2.5 py-2">
              {images.map((_, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className={`h-1.5 rounded-full bg-white transition-all duration-200 ${
                    i === active ? "w-4" : "w-1.5 opacity-60"
                  }`}
                />
              ))}
            </div>
          </div>

          {active > 0 && (
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              aria-label="Previous photo"
              className={`${ARROW} left-3`}
            >
              <Chevron direction="left" />
            </button>
          )}
          {active < images.length - 1 && (
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              aria-label="Next photo"
              className={`${ARROW} right-3`}
            >
              <Chevron direction="right" />
            </button>
          )}
        </>
      )}
    </div>
  );
}