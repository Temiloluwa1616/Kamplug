import { requireOnboarded } from "@/modules/identity/session";
import { listCategories, getFeed } from "@/modules/listings/repo";
import { CategoryChips } from "@/modules/listings/CategoryChips";
import { EmptyFeed } from "@/modules/listings/EmptyFeed";
import { ListingGrid } from "@/modules/listings/ListingGrid";
import { SearchBar } from "@/modules/listings/SearchBar";
import { SellFab } from "@/modules/listings/SellFab";
import { db } from "@/lib/db";
import { universities } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type Props = {
  searchParams: Promise<{ category?: string; q?: string }>;
};

export default async function HomePage({ searchParams }: Props) {
  const user = await requireOnboarded();
  const params = await searchParams;
  const activeSlug = params.category;
  const query = params.q?.trim() || undefined;

  const [categories, feed, uni] = await Promise.all([
    listCategories(),
    getFeed(user.universityId!, activeSlug, query),
    db
      .select({ shortName: universities.shortName })
      .from(universities)
      .where(eq(universities.id, user.universityId!))
      .limit(1)
      .then((rows) => rows[0]),
  ]);

  const universityName = uni?.shortName ?? "your campus";
  const activeCategory = categories.find((c) => c.slug === activeSlug);
  const hasListings = feed.length > 0;
  const isSearching = Boolean(query);

  let subtitle: string;
  if (isSearching) {
    subtitle = hasListings
      ? `${feed.length} ${feed.length === 1 ? "result" : "results"} for "${query}"`
      : `No results for "${query}"`;
  } else if (hasListings) {
    subtitle = `${feed.length} ${feed.length === 1 ? "listing" : "listings"} right now`;
  } else {
    subtitle = "Everything students are selling right now";
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6">
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">
          {universityName} marketplace
        </h1>
        <p className="mt-0.5 text-sm text-ink-muted">{subtitle}</p>
      </div>

      <div className="mb-5">
        <SearchBar />
      </div>

      <CategoryChips categories={categories} activeSlug={activeSlug} />

      <div className="mt-6">
        {hasListings ? (
          <ListingGrid listings={feed} />
        ) : (
          <EmptyFeed
            universityName={universityName}
            categoryName={activeCategory?.name}
            searchQuery={query}
          />
        )}
      </div>

      <SellFab />
    </main>
  );
}