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
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="shrink-0">
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
    <div className="flex size-full items-center justify-center bg-sand">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="var(--color-ink-muted)" strokeWidth="1.5" />
        <circle cx="9" cy="9" r="2" stroke="var(--color-ink-muted)" strokeWidth="1.5" />
        <path d="M3 17l5-5 4 4 3-3 6 6" stroke="var(--color-ink-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function ListingCard({ listing }: { listing: FeedListing }) {
  const price = formatPrice(listing);

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition hover:shadow-pop active:scale-[0.98]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-sand">
        {listing.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.coverUrl}
            alt={listing.title}
            loading="lazy"
            className="size-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <PlaceholderImage />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-2 text-sm font-medium leading-snug text-ink">
          {listing.title}
        </p>
        <p className="text-base font-bold tabular-nums text-ink">
          {price}
        </p>
        <div className="mt-auto flex items-center gap-1.5 pt-1.5">
          <span className="truncate text-xs text-ink-muted">
            {listing.sellerUsername ? `@${listing.sellerUsername}` : listing.sellerDisplayName}
          </span>
          {listing.sellerIsVerified && <VerifiedTick />}
        </div>
      </div>
    </Link>
  );
}