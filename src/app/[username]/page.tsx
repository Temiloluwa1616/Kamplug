import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/modules/identity/session";
import { getStorefront, getSellerListings } from "@/modules/listings/repo";
import { ListingGrid } from "@/modules/listings/ListingGrid";
import { ShareButton } from "@/modules/listings/ShareButton";

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { username } = await params;
  const clean = decodeURIComponent(username).replace(/^@/, "");
  const store = await getStorefront(clean);
  if (!store) return { title: "Not found — KamPlug" };
  return {
    title: `@${store.username} — KamPlug`,
    description: store.bio ?? `${store.displayName} on KamPlug`,
  };
}

function VerifiedTick() {
  return (
    <svg width="18" height="18" viewBox="0 0 14 14" aria-hidden="true" className="shrink-0">
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

export default async function StorefrontPage({ params }: Props) {
  const { username } = await params;
  const decoded = decodeURIComponent(username);

  // Require the @ prefix. Bare /tunde 404s so top-level routes stay safe.
  if (!decoded.startsWith("@")) notFound();
  const clean = decoded.slice(1).toLowerCase();
  if (!clean) notFound();

  const [store, viewer] = await Promise.all([
    getStorefront(clean),
    getCurrentUser(),
  ]);

  if (!store) notFound();

  const listings = await getSellerListings(store.id);
  const isSelf = viewer?.id === store.id;

  const shareUrl = `https://kamplug.vercel.app/@${store.username}`;

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6">
      <section className="rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-7">
        <div className="flex items-start gap-4 sm:gap-5">
          {store.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={store.avatarUrl}
              alt=""
              width={72}
              height={72}
              referrerPolicy="no-referrer"
              className="size-16 shrink-0 rounded-full object-cover sm:size-20"
            />
          ) : (
            <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-brand text-xl font-bold text-on-brand sm:size-20 sm:text-2xl">
              {store.displayName.charAt(0).toUpperCase()}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-1.5 text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
              <span className="truncate">{store.displayName}</span>
              {store.isVerified && <VerifiedTick />}
            </h1>
            <p className="mt-0.5 truncate text-sm font-medium text-ink-muted">
              @{store.username}
            </p>
            <p className="mt-1 truncate text-sm text-ink-muted">
              {store.universityShortName}
              {store.facultyName ? ` · ${store.facultyName}` : ""}
            </p>
          </div>
        </div>

        {store.bio && (
          <p className="mt-5 whitespace-pre-wrap text-base leading-relaxed text-ink-muted">
            {store.bio}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <ShareButton url={shareUrl} title={`@${store.username} on KamPlug`} />
          {isSelf && (
            <Link
              href="/profile"
              className="inline-flex h-11 items-center rounded-full bg-brand px-5 text-sm font-semibold text-on-brand transition active:scale-[0.98]"
            >
              Edit profile
            </Link>
          )}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-bold tracking-tight text-ink">
            {isSelf ? "Your listings" : "Listings"}
          </h2>
          <span className="text-sm text-ink-muted">
            {store.activeListingCount} active
          </span>
        </div>

        {listings.length > 0 ? (
          <ListingGrid listings={listings} />
        ) : (
          <div className="rounded-3xl border border-line bg-surface px-6 py-14 text-center">
            <p className="text-base font-semibold text-ink">
              {isSelf ? "You haven't listed anything yet" : "No listings right now"}
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              {isSelf
                ? "Your active listings will show up here."
                : `Check back later — @${store.username} might post something soon.`}
            </p>
            {isSelf && (
              <Link
                href="/sell"
                className="mt-6 inline-flex h-12 items-center rounded-full bg-accent px-6 font-bold text-on-accent shadow-card transition hover:brightness-[1.03] active:scale-[0.98]"
              >
                Sell your first item
              </Link>
            )}
          </div>
        )}
      </section>
    </main>
  );
}