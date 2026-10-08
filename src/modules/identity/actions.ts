"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { users, reservedUsernames } from "@/lib/db/schema";
import { onboardingSchema } from "./validation";
import { requireAuth } from "./session";

export type OnboardingResult =
  | { ok: true }
  | { ok: false; error: string; field?: string };

export async function completeOnboarding(
  input: unknown
): Promise<OnboardingResult> {
  const session = await requireAuth();

  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      error: first.message,
      field: first.path[0]?.toString(),
    };
  }

  const { username, universityId, facultyId, departmentId } = parsed.data;

  const reserved = await db
    .select()
    .from(reservedUsernames)
    .where(eq(reservedUsernames.username, username))
    .limit(1);

  if (reserved.length > 0) {
    return {
      ok: false,
      error: "That username is reserved",
      field: "username",
    };
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (existing.length > 0 && existing[0].id !== session.user.id) {
    return {
      ok: false,
      error: "That username is taken",
      field: "username",
    };
  }

  await db
    .update(users)
    .set({
      username,
      universityId,
      facultyId,
      departmentId: departmentId && departmentId !== "" ? departmentId : null,
      onboardingCompleted: true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, session.user.id));

  revalidatePath("/", "layout");

  return { ok: true };
}

export async function checkUsernameAvailable(
  username: string
): Promise<{ available: boolean; reason?: string }> {
  const parsed = onboardingSchema.shape.username.safeParse(username);
  if (!parsed.success) {
    return { available: false, reason: parsed.error.issues[0].message };
  }

  const reserved = await db
    .select({ username: reservedUsernames.username })
    .from(reservedUsernames)
    .where(eq(reservedUsernames.username, username))
    .limit(1);

  if (reserved.length > 0) {
    return { available: false, reason: "Reserved" };
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (existing.length > 0) {
    return { available: false, reason: "Taken" };
  }

  return { available: true };
}

export async function fetchFaculties(universityId: string) {
  const { listFaculties } = await import("./repo");
  return listFaculties(universityId);
}

export async function fetchDepartments(facultyId: string) {
  const { listDepartments } = await import("./repo");
  return listDepartments(facultyId);
}