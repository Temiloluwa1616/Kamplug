import Link from "next/link";

type Props = {
  universityName: string;
  /** Name of the active category filter, if any. */
  categoryName?: string;
  /** Search query, if the user is searching. */
  searchQuery?: string;
};

function BagIllustration() {
  return (
    <div className="relative mx-auto size-28" aria-hidden="true">
      <span className="absolute inset-0 rounded-full bg-brand-soft" />
      <span className="absolute -right-1 top-3 size-6 rounded-full bg-accent" />
      <svg viewBox="0 0 112 112" fill="none" className="relative size-full">
        <rect x="30" y="42" width="52" height="44" rx="12" fill="var(--color-brand)" />
        <path
          d="M43 50v-6a13 13 0 0 1 26 0v6"
          stroke="var(--color-brand)"
          strokeWidth="5"
          strokeLinecap="round"
          transform="translate(0 -4)"
        />
        <circle cx="44" cy="58" r="3.5" fill="#fff" />
        <circle cx="68" cy="58" r="3.5" fill="#fff" />
      </svg>
    </div>
  );
}

export function EmptyFeed({ universityName, categoryName, searchQuery }: Props) {
  const isSearching = Boolean(searchQuery);
  const isFiltered = Boolean(categoryName);

  let heading: string;
  let body: string;
  if (isSearching) {
    heading = `No results for "${searchQuery}"`;
    body = "Try a different word, or browse everything students are selling.";
  } else if (isFiltered) {
    heading = `No ${categoryName} listed yet`;
    body = "Be the first to list one, or look at everything students are selling.";
  } else {
    heading = `Nothing listed at ${universityName} yet`;
    body = "Sell something you no longer need, or list a service you offer. Posting takes under a minute.";
  }

  return (
    <section className="flex flex-col items-center px-6 py-14 text-center sm:py-20">
      <BagIllustration />

      <h2 className="mt-8 text-xl font-extrabold tracking-tight text-ink">
        {heading}
      </h2>
      <p className="mt-2 max-w-sm text-base leading-relaxed text-ink-muted">
        {body}
      </p>

      <div className="mt-8 flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
        {isSearching ? (
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-full border border-line bg-surface px-7 text-base font-semibold text-ink transition hover:border-ink-muted/50 active:scale-[0.98]"
          >
            Clear search
          </Link>
        ) : (
          <>
            <Link
              href="/sell"
              className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-7 text-base font-bold text-on-accent shadow-card transition hover:brightness-[1.03] active:scale-[0.98]"
            >
              {isFiltered ? "List an item" : "Sell your first item"}
            </Link>
            {isFiltered && (
              <Link
                href="/"
                className="inline-flex h-12 items-center justify-center rounded-full border border-line bg-surface px-7 text-base font-semibold text-ink transition hover:border-ink-muted/50 active:scale-[0.98]"
              >
                Clear filter
              </Link>
            )}
          </>
        )}
      </div>
    </section>
  );
}