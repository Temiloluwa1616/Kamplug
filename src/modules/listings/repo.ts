import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";

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