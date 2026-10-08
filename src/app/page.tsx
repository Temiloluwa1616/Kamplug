import Link from "next/link";
import { requireOnboarded } from "@/modules/identity/session";
import { listCategories } from "@/modules/listings/repo";
import { CategoryChips } from "@/modules/listings/CategoryChips";
import { EmptyFeed } from "@/modules/listings/EmptyFeed";
import { SellFab } from "@/modules/listings/SellFab";
import { db } from "@/lib/db";
import { universities } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function HomePage() {
  const user = await requireOnboarded();
  const categories = await listCategories();

  const [uni] = await db
    .select({ shortName: universities.shortName })
    .from(universities)
    .where(eq(universities.id, user.universityId!))
    .limit(1);

  const universityName = uni?.shortName ?? "your campus";

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">
            {universityName} marketplace
          </h1>
          <p className="mt-0.5 text-sm text-ink-muted">
            Everything students are selling right now
          </p>
        </div>
        <Link
          href="/sell"
          className="hidden h-11 items-center rounded-full bg-accent px-5 font-bold text-on-accent shadow-card transition hover:brightness-[1.03] active:scale-[0.98] sm:inline-flex"
        >
          Sell an item
        </Link>
      </div>

      <CategoryChips categories={categories} />

      <div className="mt-6">
        <EmptyFeed universityName={universityName} />
      </div>

      <SellFab />
    </main>
  );
}