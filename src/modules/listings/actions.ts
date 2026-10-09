"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { listings, listingImages, listingDrafts } from "@/lib/db/schema";
import { requireOnboarded } from "@/modules/identity/session";
import { normalizeNigerianPhone } from "@/lib/phone";
import { listingSchema, nairaToKobo } from "./validation";

export type PublishResult =
  | { ok: true; listingId: string }
  | { ok: false; error: string; field?: string };

export async function publishListing(
  input: unknown
): Promise<PublishResult> {
  const user = await requireOnboarded();

  const parsed = listingSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      error: first.message,
      field: first.path[0]?.toString(),
    };
  }

  const data = parsed.data;

  const phoneE164 = normalizeNigerianPhone(data.phone);
  if (!phoneE164) {
    return { ok: false, error: "Enter a valid Nigerian phone number", field: "phone" };
  }

  const priceKobo = data.type === "sell" ? nairaToKobo(data.price) : null;

  const listingId = await db.transaction(async (tx) => {
    const [listing] = await tx
      .insert(listings)
      .values({
        universityId: user.universityId!,
        sellerId: user.id,
        categoryId: data.categoryId,
        pickupLocationId:
          data.pickupLocationId && data.pickupLocationId !== ""
            ? data.pickupLocationId
            : null,
        type: data.type,
        title: data.title,
        description: data.description && data.description.length > 0 ? data.description : null,
        priceKobo,
        condition: data.condition ?? null,
        contactPhone: phoneE164,
        status: "active",
      })
      .returning({ id: listings.id });

    await tx.insert(listingImages).values(
      data.images.map((url, i) => ({
        listingId: listing.id,
        url,
        sortOrder: i,
      }))
    );

    await tx
      .delete(listingDrafts)
      .where(eq(listingDrafts.userId, user.id));

    return listing.id;
  });

  revalidatePath("/");
  revalidatePath("/profile/listings");

  return { ok: true, listingId };
}

/**
 * Fetch the current user's draft, if any. Used to restore form state.
 */
export async function getMyDraft(): Promise<unknown | null> {
  const user = await requireOnboarded();
  const [row] = await db
    .select({ payload: listingDrafts.payload })
    .from(listingDrafts)
    .where(eq(listingDrafts.userId, user.id))
    .limit(1);

  if (!row) return null;
  try {
    return JSON.parse(row.payload);
  } catch {
    return null;
  }
}

/**
 * Save the current form state as a draft. Called on blur / stage change.
 * Silently fails if validation fails — drafts are best-effort.
 */
export async function saveDraft(payload: unknown): Promise<void> {
  const user = await requireOnboarded();
  const json = JSON.stringify(payload);

  const [existing] = await db
    .select({ id: listingDrafts.id })
    .from(listingDrafts)
    .where(eq(listingDrafts.userId, user.id))
    .limit(1);

  if (existing) {
    await db
      .update(listingDrafts)
      .set({ payload: json, updatedAt: new Date() })
      .where(eq(listingDrafts.userId, user.id));
  } else {
    await db.insert(listingDrafts).values({
      userId: user.id,
      payload: json,
    });
  }
}

/**
 * Clear the draft. Called after successful publish or if the user cancels.
 */
export async function clearDraft(): Promise<void> {
  const user = await requireOnboarded();
  await db.delete(listingDrafts).where(eq(listingDrafts.userId, user.id));
}