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

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params;
  const user = await getCurrentUser();
  const listing = await getListingDetail(id);

  if (!listing) notFound();

  const isSeller = user?.id === listing.sellerId;
  const isUnavailable = listing.status !== "active";
  const priceLabel = formatPrice(listing.priceKobo, listing.type);

  return (
    <main className="mx-auto max-w-3xl px-4 pb-32 pt-6 sm:px-6">
      <div className="lg:grid lg:grid-cols-2 lg:gap-8">
        <ImageCarousel images={listing.images} title={listing.title} />

        <div className="mt-6 lg:mt-0">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">
              {listing.title}
            </h1>
          </div>

          <p className="mt-2 text-3xl font-extrabold tabular-nums text-ink">
            {priceLabel}
          </p>

          <p className="mt-2 text-sm text-ink-muted">
            Listed {formatDate(listing.createdAt)} · {listing.categoryName}
          </p>

          {isUnavailable && (
            <div className="mt-4 rounded-xl bg-sand p-3.5 text-sm font-medium text-ink-muted">
              This listing is no longer available.
            </div>
          )}

          {/* Seller */}
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-line bg-surface p-4">
            {listing.sellerAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={listing.sellerAvatarUrl}
                alt=""
                width={48}
                height={48}
                referrerPolicy="no-referrer"
                className="size-12 rounded-full object-cover"
              />
            ) : (
              <span className="flex size-12 items-center justify-center rounded-full bg-brand text-base font-bold text-on-brand">
                {listing.sellerDisplayName.charAt(0).toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-ink">
                {listing.sellerUsername
                  ? `@${listing.sellerUsername}`
                  : listing.sellerDisplayName}
                {listing.sellerIsVerified && (
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
                )}
              </p>
              <p className="truncate text-xs text-ink-muted">
                {isSeller ? "You" : "Student seller"}
              </p>
            </div>
            {listing.sellerUsername && !isSeller && (
              <Link
                href={`/@${listing.sellerUsername}`}
                className="text-sm font-semibold text-brand hover:underline"
              >
                Visit store
              </Link>
            )}
          </div>

          {/* Details */}
          <dl className="mt-6 space-y-3 rounded-2xl border border-line bg-surface p-4 text-sm">
            {listing.condition && (
              <div className="flex justify-between">
                <dt className="text-ink-muted">Condition</dt>
                <dd className="font-medium text-ink">
                  {CONDITION_LABEL[listing.condition] ?? listing.condition}
                </dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-ink-muted">Category</dt>
              <dd className="font-medium text-ink">{listing.categoryName}</dd>
            </div>
            {listing.pickupLocationName && (
              <div className="flex justify-between">
                <dt className="text-ink-muted">Pickup</dt>
                <dd className="font-medium text-ink">{listing.pickupLocationName}</dd>
              </div>
            )}
          </dl>

          {listing.description && (
            <div className="mt-6">
              <h2 className="mb-2 text-sm font-bold text-ink">Description</h2>
              <p className="whitespace-pre-wrap text-base leading-relaxed text-ink-muted">
                {listing.description}
              </p>
            </div>
          )}

          {isSeller && (
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled
                className="flex-1 rounded-xl border border-line bg-surface py-3 text-sm font-semibold text-ink-muted"
              >
                Edit (coming soon)
              </button>
              <button
                type="button"
                disabled
                className="flex-1 rounded-xl border border-line bg-surface py-3 text-sm font-semibold text-ink-muted"
              >
                Mark as sold (coming soon)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sticky WhatsApp CTA — hidden for the seller, hidden when unavailable */}
      {!isSeller && !isUnavailable && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-canvas/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md">
          <div className="mx-auto max-w-3xl">
            <WhatsAppButton
              phoneE164={listing.contactPhone}
              listingTitle={listing.title}
              priceLabel={priceLabel}
              listingId={listing.id}
            />
          </div>
        </div>
      )}
    </main>
  );
}