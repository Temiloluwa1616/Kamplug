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
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-6 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">
            My listings
          </h1>
          <p className="mt-0.5 text-sm text-ink-muted">
            Manage everything you&apos;ve posted
          </p>
        </div>
        <Link
          href="/sell"
          className="inline-flex h-11 shrink-0 items-center rounded-full bg-accent px-5 font-bold text-on-accent shadow-card transition hover:brightness-[1.03] active:scale-[0.98]"
        >
          Sell an item
        </Link>
      </div>

      {/* Tabs */}
      <nav
        aria-label="Listing status"
        className="mb-5 flex gap-1 rounded-full border border-line bg-surface p-1"
      >
        {TABS.map((tab) => {
          const active = status === tab.key;
          const count = counts[tab.key];
          return (
            <Link
              key={tab.key}
              href={`/profile/listings?status=${tab.key}`}
              aria-current={active ? "page" : undefined}
              className={`flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full text-sm font-semibold transition ${
                active
                  ? "bg-ink text-canvas"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                    active ? "bg-white/20" : "bg-sand text-ink-muted"
                  }`}
                >
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Listings */}
      {current.length > 0 ? (
        <ul className="space-y-3">
          {current.map((listing) => (
            <MyListingRow key={listing.id} listing={listing} />
          ))}
        </ul>
      ) : (
        <div className="rounded-3xl border border-line bg-surface px-6 py-14 text-center">
          <p className="text-base font-semibold text-ink">
            {status === "active" && "Nothing active right now"}
            {status === "sold" && "No sold listings yet"}
            {status === "removed" && "Nothing removed"}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
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