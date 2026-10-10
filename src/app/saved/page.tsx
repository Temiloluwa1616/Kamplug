import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/identity/session";
import { getSavedListings } from "@/modules/listings/saves";
import { ListingGrid } from "@/modules/listings/ListingGrid";

export const metadata = {
  title: "Saved — KamPlug",
};

function BookmarkIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V20l-6-4-6 4V4.5z"
        stroke="var(--color-brand)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function SavedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");
  if (!user.onboardingCompleted) redirect("/onboarding");

  const listings = await getSavedListings();
  const count = listings.length;

  return (
    <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 sm:pt-10">
      <div className="mb-6">
        <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-tight text-ink sm:text-3xl">
          Saved
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {count === 0
            ? "Listings you save will appear here"
            : `${count} ${count === 1 ? "listing" : "listings"} saved`}
        </p>
      </div>

      {count > 0 ? (
        <ListingGrid
          listings={listings}
          savedIds={new Set(listings.map((l) => l.id))}
        />
      ) : (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-line px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-brand-soft">
            <BookmarkIcon />
          </span>
          <p className="mt-4 text-base font-bold text-ink">Nothing saved yet</p>
          <p className="mt-1 max-w-xs text-sm leading-relaxed text-ink-muted">
            Tap the heart on any listing to save it. Come back here when you&apos;re
            ready to reach the seller.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex h-12 items-center rounded-full bg-accent px-6 font-bold text-on-accent shadow-card transition hover:brightness-[1.03] active:scale-[0.98]"
          >
            Browse listings
          </Link>
        </div>
      )}
    </main>
  );
}