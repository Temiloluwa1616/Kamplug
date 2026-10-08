import Link from "next/link";

export function EmptyFeed({ universityName }: { universityName: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-brand-soft">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M3 9l9-6 9 6v10a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2V9z"
            stroke="var(--color-brand)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h2 className="text-xl font-bold text-ink">
        Nothing listed yet at {universityName}
      </h2>
      <p className="mt-2 max-w-sm text-base leading-relaxed text-ink-muted">
        Be the first. Sell something you don&apos;t need, or list a service you offer.
        Listings go live in under 60 seconds.
      </p>

      <Link
        href="/sell"
        className="mt-8 inline-flex h-12 items-center rounded-full bg-accent px-6 text-base font-bold text-on-accent shadow-card transition hover:brightness-[1.03] active:scale-[0.98]"
      >
        Sell your first item
      </Link>
    </div>
  );
}