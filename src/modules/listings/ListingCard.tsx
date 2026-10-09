import Link from "next/link";
import type { FeedListing } from "./repo";

function formatPrice(listing: FeedListing): string {
  if (listing.priceKobo === null) {
    if (listing.type === "free") return "Free";
    if (listing.type === "swap") return "Swap";
    if (listing.type === "service") return "Ask";
    return "";
  }
  const naira = listing.priceKobo / 100;
  return `₦${naira.toLocaleString("en-NG")}`;
}

function VerifiedTick() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      role="img"
      aria-label="Verified"
      className="shrink-0"
    >
      <circle cx="7" cy="7" r="7" fill="var(--color-verified)" />
      <path
        d="M4 7.2l2 2L10 5"
        fill="none"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlaceholderImage() {
  return (
    <div className="flex size-full items-center justify-center bg-brand-soft">
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true" opacity="0.45">
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

/**
 * Borderless, image-first card. The photo is the hero, the price is the
 * strongest thing under it, and nothing else competes.
 */
export function ListingCard({ listing }: { listing: FeedListing }) {
  const price = formatPrice(listing);
  const hasNumericPrice = listing.priceKobo !== null;
  const sellerName = listing.sellerUsername
    ? `@${listing.sellerUsername}`
    : listing.sellerDisplayName;
  const sellerInitial = listing.sellerDisplayName.charAt(0).toUpperCase();

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group flex flex-col rounded-2xl transition-transform duration-150 active:scale-[0.98]"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-sand">
        {listing.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.coverUrl}
            alt={listing.title}
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <PlaceholderImage />
        )}
        {/* Hairline so pale product photos don't dissolve into the page */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-ink/10"
        />
      </div>

      <div className="flex flex-1 flex-col px-0.5 pt-3">
        {/* Same fixed height for both price styles so titles line up across a row */}
        {price &&
          (hasNumericPrice ? (
            <p className="flex h-6 items-center text-[1.0625rem] font-extrabold tabular-nums text-ink">
              {price}
            </p>
          ) : (
            <p className="flex h-6 items-center">
              <span className="inline-flex h-6 items-center rounded-full bg-brand-soft px-2.5 text-[13px] font-bold text-brand">
                {price}
              </span>
            </p>
          ))}

        <p className="mt-1.5 line-clamp-2 text-sm leading-snug text-ink">{listing.title}</p>

        <div className="mt-2 flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="flex size-5 shrink-0 items-center justify-center rounded-full bg-sand text-[10px] font-bold text-ink-muted"
          >
            {sellerInitial}
          </span>
          <span className="truncate text-xs text-ink-muted">{sellerName}</span>
          {listing.sellerIsVerified && <VerifiedTick />}
        </div>
      </div>
    </Link>
  );
}