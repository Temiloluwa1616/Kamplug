import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/modules/identity/session";
import { getListingDetail } from "@/modules/listings/repo";
import { ImageCarousel } from "@/modules/listings/ImageCarousel";
import { WhatsAppButton } from "@/modules/listings/WhatsAppButton";

type Props = {
  params: Promise<{ id: string }>;
};

function formatPrice(
  priceKobo: number | null,
  type: string
): string {
  if (priceKobo === null) {
    if (type === "free") return "Free";
    if (type === "swap") return "Open to swaps";
    if (type === "service") return "Contact for price";
    return "";
  }
  return `₦${(priceKobo / 100).toLocaleString("en-NG")}`;
}

function formatDate(date: Date): string {
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return date.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
}

const CONDITION_LABEL: Record<string, string> = {
  new: "Brand new",
  like_new: "Like new",
  used: "Used",
  for_parts: "For parts",
};

function VerifiedTick() {
  return (
    <svg width="16" height="16" viewBox="0 0 14 14" role="img" aria-label="Verified" className="shrink-0">
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

function ClockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 4.7V8l2.2 1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 14.25s4.5-3.85 4.5-7.6a4.5 4.5 0 0 0-9 0c0 3.75 4.5 7.6 4.5 7.6z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="6.5" r="1.6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="mt-px shrink-0">
      <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 8.2v4.3M9 5.5v.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params;
  const user = await getCurrentUser();
  const listing = await getListingDetail(id);

  if (!listing) notFound();

  const isSeller = user?.id === listing.sellerId;
  const isUnavailable = listing.status !== "active";
  const priceLabel = formatPrice(listing.priceKobo, listing.type);
  const hasNumericPrice = listing.priceKobo !== null;
  const sellerName = listing.sellerUsername
    ? `@${listing.sellerUsername}`
    : listing.sellerDisplayName;
  const sellerSubtitle = isSeller
    ? "You"
    : listing.sellerIsVerified
      ? "Verified student"
      : "Student seller";

  return (
    <main className="mx-auto max-w-5xl px-4 pb-36 sm:px-6 sm:pt-6 lg:pt-10">
      <div className="lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12">
        {/* Photos run edge to edge on phones */}
        <div
          className={`-mx-4 sm:mx-0 lg:sticky lg:top-24 lg:self-start ${
            isUnavailable ? "opacity-70 saturate-50" : ""
          }`}
        >
          <ImageCarousel images={listing.images} title={listing.title} />
        </div>

        <div className="mt-6 lg:mt-0">
          {/* Price leads. The title is still the page's h1 for screen readers. */}
          <div className="flex flex-col">
            <p
              className={`order-1 font-extrabold leading-none tracking-tight tabular-nums text-ink ${
                hasNumericPrice ? "text-[2rem]" : "text-2xl"
              }`}
            >
              {priceLabel}
            </p>
            <h1 className="order-2 mt-2.5 text-balance text-xl font-bold leading-snug text-ink">
              {listing.title}
            </h1>
            <p className="order-3 mt-2 flex items-center gap-1.5 text-sm text-ink-muted">
              <ClockIcon />
              <span className="sr-only">Listed </span>
              {formatDate(listing.createdAt)}
            </p>
          </div>

          {isUnavailable && (
            <div
              role="status"
              className="mt-5 flex items-start gap-2.5 rounded-xl bg-sand p-3.5 text-sm font-medium text-ink"
            >
              <InfoIcon />
              <p>This listing is no longer available.</p>
            </div>
          )}

          {/* Seller */}
          <div className="mt-6 flex items-center gap-3.5 rounded-2xl border border-line bg-surface p-3.5">
            {listing.sellerAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={listing.sellerAvatarUrl}
                alt=""
                width={48}
                height={48}
                referrerPolicy="no-referrer"
                className="size-12 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand text-base font-bold text-on-brand">
                {listing.sellerDisplayName.charAt(0).toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[15px] font-bold text-ink">
                <span className="truncate">{sellerName}</span>
                {listing.sellerIsVerified && <VerifiedTick />}
              </p>
              <p className="truncate text-sm text-ink-muted">{sellerSubtitle}</p>
            </div>
            {listing.sellerUsername && !isSeller && (
              <Link
                href={`/@${listing.sellerUsername}`}
                className="inline-flex h-10 shrink-0 items-center rounded-full border border-line px-4 text-sm font-semibold text-ink transition hover:border-ink-muted/50 active:scale-[0.98]"
              >
                Visit store
              </Link>
            )}
          </div>

          {/* Details */}
          <dl className="mt-6 divide-y divide-line border-y border-line text-[15px]">
            {listing.condition && (
              <div className="flex items-center justify-between gap-4 py-3.5">
                <dt className="text-ink-muted">Condition</dt>
                <dd className="font-semibold text-ink">
                  {CONDITION_LABEL[listing.condition] ?? listing.condition}
                </dd>
              </div>
            )}
            <div className="flex items-center justify-between gap-4 py-3.5">
              <dt className="text-ink-muted">Category</dt>
              <dd className="font-semibold text-ink">{listing.categoryName}</dd>
            </div>
            {listing.pickupLocationName && (
              <div className="flex items-center justify-between gap-4 py-3.5">
                <dt className="text-ink-muted">Pickup</dt>
                <dd className="flex items-center gap-1.5 font-semibold text-ink">
                  <span className="text-brand">
                    <PinIcon />
                  </span>
                  {listing.pickupLocationName}
                </dd>
              </div>
            )}
          </dl>

          {listing.description && (
            <div className="mt-7">
              <h2 className="text-base font-bold text-ink">About this item</h2>
              <p className="mt-2 max-w-prose whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
                {listing.description}
              </p>
            </div>
          )}

                    {isSeller && (
            <div className="mt-7">
              <Link
                href="/profile/listings"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-line bg-surface text-sm font-semibold text-ink transition hover:border-ink-muted/50 active:scale-[0.99]"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M11 2.5l2.5 2.5L5 13.5l-3 .5.5-3L11 2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                </svg>
                Manage this listing
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Sticky WhatsApp CTA: hidden for the seller, hidden when unavailable.
          Solid background on purpose: blur is slow on cheaper phones. */}
      {!isSeller && !isUnavailable && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-canvas px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_28px_-18px_rgb(20_22_31/0.3)]">
          <div className="mx-auto max-w-5xl lg:flex lg:justify-end">
            <div className="lg:w-full lg:max-w-md">
              <WhatsAppButton
                phoneE164={listing.contactPhone}
                listingTitle={listing.title}
                priceLabel={priceLabel}
                listingId={listing.id}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}