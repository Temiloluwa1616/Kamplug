import { requireOnboarded } from "@/modules/identity/session";
import { listCategories } from "@/modules/listings/repo";
import { getFeed } from "@/modules/listings/repo";
import { CategoryChips } from "@/modules/listings/CategoryChips";
import { EmptyFeed } from "@/modules/listings/EmptyFeed";
import { ListingGrid } from "@/modules/listings/ListingGrid";
import { SellFab } from "@/modules/listings/SellFab";
import { db } from "@/lib/db";
import { universities } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type Props = {
  searchParams: Promise<{ category?: string }>;
};

export default async function HomePage({ searchParams }: Props) {
  const user = await requireOnboarded();
  const params = await searchParams;
  const activeSlug = params.category;

  const [categories, feed, uni] = await Promise.all([
    listCategories(),
    getFeed(user.universityId!, activeSlug),
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

  return (
    <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6">
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">
          {universityName} marketplace
        </h1>
        <p className="mt-0.5 text-sm text-ink-muted">
          {hasListings
            ? `${feed.length} ${feed.length === 1 ? "listing" : "listings"} right now`
            : "Everything students are selling right now"}
        </p>
      </div>

      <CategoryChips categories={categories} activeSlug={activeSlug} />

      <div className="mt-6">
        {hasListings ? (
          <ListingGrid listings={feed} />
        ) : (
          <EmptyFeed
            universityName={universityName}
            categoryName={activeCategory?.name}
          />
        )}
      </div>

      <SellFab />
    </main>
  );
}