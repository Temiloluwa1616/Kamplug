"use server";

import { eq, and, desc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { saves, listings, listingImages, users } from "@/lib/db/schema";
import { requireAuth } from "@/modules/identity/session";
import type { FeedListing } from "./repo";

export type SaveResult =
  | { ok: true; saved: boolean }
  | { ok: false; error: string };

export async function toggleSave(listingId: string): Promise<SaveResult> {
  const session = await requireAuth();
  const userId = session.user.id;

  const [existing] = await db
    .select({ id: saves.id })
    .from(saves)
    .where(and(eq(saves.userId, userId), eq(saves.listingId, listingId)))
    .limit(1);

  if (existing) {
    await db.delete(saves).where(eq(saves.id, existing.id));
    revalidatePath("/saved");
    return { ok: true, saved: false };
  }

  await db.insert(saves).values({ userId, listingId });
  revalidatePath("/saved");
  return { ok: true, saved: true };
}

export async function getSavedIds(): Promise<string[]> {
  const session = await requireAuth();
  const rows = await db
    .select({ listingId: saves.listingId })
    .from(saves)
    .where(eq(saves.userId, session.user.id));
  return rows.map((r) => r.listingId);
}

export async function getSavedListings(): Promise<FeedListing[]> {
  const session = await requireAuth();
  const userId = session.user.id;

  const savedRows = await db
    .select({ listingId: saves.listingId })
    .from(saves)
    .where(eq(saves.userId, userId))
    .orderBy(desc(saves.createdAt));

  if (savedRows.length === 0) return [];

  const ids = savedRows.map((s) => s.listingId);

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
    .where(and(inArray(listings.id, ids), eq(listings.status, "active")));

  if (rows.length === 0) return [];

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

  // Preserve saved order (most recently saved first).
  const byId = new Map(rows.map((r) => [r.id, r]));
  return savedRows
    .map((s) => byId.get(s.listingId))
    .filter((r): r is NonNullable<typeof r> => Boolean(r))
    .map((r) => ({
      ...r,
      coverUrl: coverByListing.get(r.id) ?? null,
    }));
}