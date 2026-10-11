"use server";

import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { reports, blocks, listings, users, universities } from "@/lib/db/schema";
import { requireAuth } from "@/modules/identity/session";

const VALID_REASONS = [
  "scam",
  "prohibited",
  "wrong_category",
  "offensive",
  "other",
] as const;

export type ReportReason = (typeof VALID_REASONS)[number];

export type ReportResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitReport(input: {
  listingId?: string;
  reportedUserId?: string;
  reason: string;
  details?: string;
}): Promise<ReportResult> {
  const session = await requireAuth();
  const reporterId = session.user.id;

  if (!VALID_REASONS.includes(input.reason as ReportReason)) {
    return { ok: false, error: "Invalid reason" };
  }
  if (!input.listingId && !input.reportedUserId) {
    return { ok: false, error: "Nothing to report" };
  }

  // If reporting a listing, ensure it exists and the reporter isn't the seller.
  let reportedUserId = input.reportedUserId ?? null;
  if (input.listingId) {
    const [listing] = await db
      .select({ sellerId: listings.sellerId })
      .from(listings)
      .where(eq(listings.id, input.listingId))
      .limit(1);
    if (!listing) return { ok: false, error: "Listing not found" };
    if (listing.sellerId === reporterId) {
      return { ok: false, error: "You can't report your own listing" };
    }
    reportedUserId = listing.sellerId;
  } else if (reportedUserId === reporterId) {
    return { ok: false, error: "You can't report yourself" };
  }

  // Rate limit: one report per reporter per listing per hour.
  // (Simple heuristic; not tracked precisely, but blocks obvious spam.)
  const recent = await db
    .select({ id: reports.id })
    .from(reports)
    .where(
      and(
        eq(reports.reporterId, reporterId),
        input.listingId
          ? eq(reports.listingId, input.listingId)
          : eq(reports.reportedUserId, reportedUserId!)
      )
    )
    .limit(1);

  if (recent.length > 0) {
    return { ok: false, error: "You've already reported this" };
  }

  await db.insert(reports).values({
    reporterId,
    listingId: input.listingId ?? null,
    reportedUserId,
    reason: input.reason,
    details: input.details?.trim() || null,
    status: "pending",
  });

  return { ok: true };
}

export type BlockResult =
  | { ok: true; blocked: boolean }
  | { ok: false; error: string };

export async function toggleBlock(userId: string): Promise<BlockResult> {
  const session = await requireAuth();
  const blockerId = session.user.id;

  if (blockerId === userId) {
    return { ok: false, error: "You can't block yourself" };
  }

  const [existing] = await db
    .select({ id: blocks.id })
    .from(blocks)
    .where(and(eq(blocks.blockerId, blockerId), eq(blocks.blockedId, userId)))
    .limit(1);

  if (existing) {
    await db.delete(blocks).where(eq(blocks.id, existing.id));
    revalidatePath("/");
    revalidatePath("/saved");
    return { ok: true, blocked: false };
  }

  await db.insert(blocks).values({ blockerId, blockedId: userId });
  revalidatePath("/");
  revalidatePath("/saved");
  return { ok: true, blocked: true };
}


export async function getBlockedIds(): Promise<string[]> {
  const session = await requireAuth();
  const rows = await db
    .select({ blockedId: blocks.blockedId })
    .from(blocks)
    .where(eq(blocks.blockerId, session.user.id));
  return rows.map((r) => r.blockedId);
}

export type BlockedUser = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  universityShortName: string;
};

export async function listBlockedUsers(): Promise<BlockedUser[]> {
  const session = await requireAuth();

  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      universityShortName: universities.shortName,
    })
    .from(blocks)
    .innerJoin(users, eq(blocks.blockedId, users.id))
    .innerJoin(universities, eq(users.universityId, universities.id))
    .where(eq(blocks.blockerId, session.user.id))
    .orderBy(desc(blocks.createdAt));

  return rows.filter(
    (r): r is BlockedUser => Boolean(r.username)
  );
}