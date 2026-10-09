import { asc, desc, eq, and, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  categories,
  faculties,
  listings,
  listingImages,
  pickupLocations,
  universities,
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

export type ListingDetail = {
  id: string;
  title: string;
  description: string | null;
  priceKobo: number | null;
  type: string;
  condition: string | null;
  status: string;
  contactPhone: string;
  createdAt: Date;
  categoryName: string;
  categorySlug: string;
  pickupLocationName: string | null;
  sellerId: string;
  sellerUsername: string | null;
  sellerDisplayName: string;
  sellerAvatarUrl: string | null;
  sellerIsVerified: boolean;
  sellerBio: string | null;
  images: string[];
};


export async function getListingDetail(
  listingId: string
): Promise<ListingDetail | null> {
  const [row] = await db
    .select({
      id: listings.id,
      title: listings.title,
      description: listings.description,
      priceKobo: listings.priceKobo,
      type: listings.type,
      condition: listings.condition,
      status: listings.status,
      contactPhone: listings.contactPhone,
      createdAt: listings.createdAt,
      categoryName: categories.name,
      categorySlug: categories.slug,
      pickupLocationName: pickupLocations.name,
      sellerId: users.id,
      sellerUsername: users.username,
      sellerDisplayName: users.displayName,
      sellerAvatarUrl: users.avatarUrl,
      sellerIsVerified: users.isVerified,
      sellerBio: users.bio,
    })
    .from(listings)
    .innerJoin(categories, eq(listings.categoryId, categories.id))
    .innerJoin(users, eq(listings.sellerId, users.id))
    .leftJoin(pickupLocations, eq(listings.pickupLocationId, pickupLocations.id))
    .where(eq(listings.id, listingId))
    .limit(1);

  if (!row) return null;

  const imageRows = await db
    .select({ url: listingImages.url })
    .from(listingImages)
    .where(eq(listingImages.listingId, listingId))
    .orderBy(asc(listingImages.sortOrder));

  return {
    ...row,
    images: imageRows.map((i) => i.url),
  };
}

export type StorefrontUser = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  isVerified: boolean;
  facultyName: string | null;
  universityShortName: string;
  activeListingCount: number;
};

export async function getStorefront(
  username: string
): Promise<StorefrontUser | null> {
  const [row] = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      bio: users.bio,
      isVerified: users.isVerified,
      facultyName: faculties.name,
      universityShortName: universities.shortName,
    })
    .from(users)
    .innerJoin(universities, eq(users.universityId, universities.id))
    .leftJoin(faculties, eq(users.facultyId, faculties.id))
    .where(eq(users.username, username))
    .limit(1);

  if (!row || !row.username) return null;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(listings)
    .where(and(eq(listings.sellerId, row.id), eq(listings.status, "active")));

  return {
    ...row,
    username: row.username,
    activeListingCount: count,
  };
}

export async function getSellerListings(
  sellerId: string
): Promise<FeedListing[]> {
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
    .where(and(eq(listings.sellerId, sellerId), eq(listings.status, "active")))
    .orderBy(desc(listings.createdAt));

  if (rows.length === 0) return [];

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

export type MyListing = {
  id: string;
  title: string;
  priceKobo: number | null;
  type: string;
  status: string;
  createdAt: Date;
  coverUrl: string | null;
};

export async function getMyListings(
  userId: string,
  status: "active" | "sold" | "removed"
): Promise<MyListing[]> {
  const rows = await db
    .select({
      id: listings.id,
      title: listings.title,
      priceKobo: listings.priceKobo,
      type: listings.type,
      status: listings.status,
      createdAt: listings.createdAt,
    })
    .from(listings)
    .where(and(eq(listings.sellerId, userId), eq(listings.status, status)))
    .orderBy(desc(listings.createdAt));

  if (rows.length === 0) return [];

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