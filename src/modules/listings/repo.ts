import { asc, desc, eq, and, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  categories,
  listings,
  listingImages,
  pickupLocations,
  users,
} from "@/lib/db/schema";

export async function listCategories() {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      icon: categories.icon,
    })
    .from(categories)
    .orderBy(asc(categories.sortOrder));
}

export async function listPickupLocations(universityId: string) {
  return db
    .select({
      id: pickupLocations.id,
      name: pickupLocations.name,
    })
    .from(pickupLocations)
    .where(eq(pickupLocations.universityId, universityId))
    .orderBy(asc(pickupLocations.name));
}

export type FeedListing = {
  id: string;
  title: string;
  priceKobo: number | null;
  type: string;
  condition: string | null;
  coverUrl: string | null;
  sellerUsername: string | null;
  sellerDisplayName: string;
  sellerAvatarUrl: string | null;
  sellerIsVerified: boolean;
};

export async function getFeed(
  universityId: string,
  categorySlug?: string
): Promise<FeedListing[]> {
  // If a category filter is set, resolve the slug to an id first.
  let categoryId: string | undefined;
  if (categorySlug) {
    const [cat] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, categorySlug))
      .limit(1);
    if (!cat) return []; // unknown slug: no results
    categoryId = cat.id;
  }

  const where = categoryId
    ? and(
        eq(listings.universityId, universityId),
        eq(listings.status, "active"),
        eq(listings.categoryId, categoryId)
      )
    : and(
        eq(listings.universityId, universityId),
        eq(listings.status, "active")
      );

  const rows = await db
    .select({
      id: listings.id,
      title: listings.title,
      priceKobo: listings.priceKobo,
      type: listings.type,
      condition: listings.condition,
      sellerUsername: users.username,
      sellerDisplayName: users.displayName,
      sellerAvatarUrl: users.avatarUrl,
      sellerIsVerified: users.isVerified,
    })
    .from(listings)
    .innerJoin(users, eq(listings.sellerId, users.id))
    .where(where)
    .orderBy(desc(listings.createdAt))
    .limit(60);

  if (rows.length === 0) return [];

  // Fetch the cover image (sortOrder 0) for each listing in one query.
  const ids = rows.map((r) => r.id);
  const covers = await db
    .select({
      listingId: listingImages.listingId,
      url: listingImages.url,
    })
    .from(listingImages)
    .where(
      and(
        inArray(listingImages.listingId, ids),
        eq(listingImages.sortOrder, 0)
      )
    );

  const coverByListing = new Map(covers.map((c) => [c.listingId, c.url]));

  return rows.map((r) => ({
    ...r,
    coverUrl: coverByListing.get(r.id) ?? null,
  }));
}