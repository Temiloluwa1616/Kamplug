import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, pickupLocations } from "@/lib/db/schema";


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