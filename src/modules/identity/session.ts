import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.user) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  return user ?? null;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/auth");
  }
  return session;
}

export async function requireOnboarded() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth");
  }
  if (!user.onboardingCompleted) {
    redirect("/onboarding");
  }
  return user;
}