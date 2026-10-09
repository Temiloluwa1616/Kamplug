import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/identity/session";
import { getMyListings } from "@/modules/listings/repo";
import { MyListingRow } from "@/modules/listings/MyListingRow";

type Props = {
  searchParams: Promise<{ status?: string }>;
};

const TABS = [
  { key: "active", label: "Active" },
  { key: "sold", label: "Sold" },
  { key: "removed", label: "Removed" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function isTabKey(v: string | undefined): v is TabKey {
  return v === "active" || v === "sold" || v === "removed";
}

export default async function MyListingsPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");
  if (!user.onboardingCompleted) redirect("/onboarding");

  const params = await searchParams;
  const status: TabKey = isTabKey(params.status) ? params.status : "active";

  const [active, sold, removed] = await Promise.all([
    getMyListings(user.id, "active"),
    getMyListings(user.id, "sold"),
    getMyListings(user.id, "removed"),
  ]);

  const counts: Record<TabKey, number> = {
    active: active.length,
    sold: sold.length,
    removed: removed.length,
  };

  const current =
    status === "active" ? active : status === "sold" ? sold : removed;

  return (
    <main className="mx-auto max-w-3xl px-4 pb-28 pt-6 sm:px-6 sm:pt-10">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-tight text-ink sm:text-3xl">
            My listings
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Manage everything you&apos;ve posted
          </p>
        </div>
        <Link
          href="/sell"
          className="hidden h-11 shrink-0 items-center rounded-full bg-accent px-5 font-bold text-on-accent shadow-card transition hover:brightness-[1.03] active:scale-[0.98] sm:inline-flex"
        >
          Sell an item
        </Link>
      </div>

      {/* Tabs */}
      <nav aria-label="Listing status" className="flex border-b border-line">
        {TABS.map((tab) => {
          const isActive = status === tab.key;
          const count = counts[tab.key];
          return (
            <Link
              key={tab.key}
              href={`/profile/listings?status=${tab.key}`}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex h-12 flex-1 items-center justify-center gap-2 text-[15px] font-semibold transition ${
                isActive ? "text-ink" : "text-ink-muted hover:text-ink"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-[11px] font-bold tabular-nums ${
                    isActive ? "bg-ink text-canvas" : "bg-sand text-ink-muted"
                  }`}
                >
                  {count}
                </span>
              )}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-ink"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Listings */}
      {current.length > 0 ? (
        <ul className="mt-5 divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface">
          {current.map((listing) => (
            <MyListingRow key={listing.id} listing={listing} />
          ))}
        </ul>
      ) : (
        <div className="mt-5 flex flex-col items-center rounded-3xl border border-dashed border-line px-6 py-14 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-brand-soft">
            <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <path
                d="M4 14.2V6a2 2 0 0 1 2-2h8.2a2 2 0 0 1 1.4.6l8.2 8.2a2 2 0 0 1 0 2.8l-7.4 7.4a2 2 0 0 1-2.8 0L4.6 15.6A2 2 0 0 1 4 14.2z"
                stroke="var(--color-brand)"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <circle cx="10" cy="10" r="1.8" fill="var(--color-brand)" />
            </svg>
          </span>
          <p className="mt-4 text-base font-bold text-ink">
            {status === "active" && "Nothing active right now"}
            {status === "sold" && "No sold listings yet"}
            {status === "removed" && "Nothing removed"}
          </p>
          <p className="mt-1 max-w-xs text-sm leading-relaxed text-ink-muted">
            {status === "active" &&
              "When you publish something, it'll appear here."}
            {status === "sold" &&
              "Listings you mark as sold will live here."}
            {status === "removed" &&
              "Listings you delete will show here so you can restore them."}
          </p>
          {status === "active" && (
            <Link
              href="/sell"
              className="mt-6 inline-flex h-12 items-center rounded-full bg-accent px-6 font-bold text-on-accent shadow-card transition hover:brightness-[1.03] active:scale-[0.98]"
            >
              Sell your first item
            </Link>
          )}
        </div>
      )}
    </main>
  );
}