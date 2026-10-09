import { db } from "./index";
import {
  users,
  listings,
  listingImages,
  universities,
  faculties,
  departments,
  categories,
  pickupLocations,
} from "./schema";
import { eq } from "drizzle-orm";

const picsum = (seed: string) =>
  `https://picsum.photos/seed/${seed}/800/1000`;

async function main() {
  console.log("Seeding test listings...");

  const [unilag] = await db
    .select()
    .from(universities)
    .where(eq(universities.slug, "unilag"))
    .limit(1);
  if (!unilag) throw new Error("UNILAG not seeded. Run db:seed first.");

  const allFaculties = await db
    .select()
    .from(faculties)
    .where(eq(faculties.universityId, unilag.id));
  const allDepartments = await db.select().from(departments);
  const allCategories = await db.select().from(categories);
  const allPickups = await db
    .select()
    .from(pickupLocations)
    .where(eq(pickupLocations.universityId, unilag.id));

  const catBySlug = Object.fromEntries(allCategories.map((c) => [c.slug, c]));
  const facBySlug = Object.fromEntries(allFaculties.map((f) => [f.slug, f]));
  const deptBySlug = Object.fromEntries(allDepartments.map((d) => [d.slug, d]));
  const pickupByName = Object.fromEntries(allPickups.map((p) => [p.name, p]));

  // ---------- fake users ----------
  const fakeUsers = [
    {
      username: "aisha",
      displayName: "Aisha Bello",
      email: "aisha@unilag.edu.ng",
      phone: "+2348011111111",
      avatarUrl: picsum("aisha-avatar"),
      bio: "Selling bits and pieces from my room. Fast replies on WhatsApp.",
      isVerified: true,
      facultySlug: "science",
      departmentSlug: "computer-science",
    },
    {
      username: "tunde",
      displayName: "Tunde Adeyemi",
      email: "tunde@unilag.edu.ng",
      phone: "+2348022222222",
      avatarUrl: picsum("tunde-avatar"),
      bio: "Engineering student. Selling gadgets I no longer use.",
      isVerified: true,
      facultySlug: "engineering",
      departmentSlug: "mechanical-engineering",
    },
    {
      username: "chidi",
      displayName: "Chidi Okonkwo",
      email: "chidi@unilag.edu.ng",
      phone: "+2348033333333",
      avatarUrl: picsum("chidi-avatar"),
      bio: "Room clearout happening. DM me.",
      isVerified: false,
      facultySlug: "social-sciences",
      departmentSlug: "economics",
    },
    {
      username: "zainab",
      displayName: "Zainab Ibrahim",
      email: "zainab@unilag.edu.ng",
      phone: "+2348044444444",
      avatarUrl: picsum("zainab-avatar"),
      bio: "Hairstylist on campus. Braids, twists, cornrows.",
      isVerified: true,
      facultySlug: "arts",
      departmentSlug: "english",
    },
  ];

  const insertedUsers: Record<string, { id: string }> = {};

  for (const u of fakeUsers) {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, u.username))
      .limit(1);

    if (existing) {
      insertedUsers[u.username] = existing;
      console.log(`  Skipped existing user: ${u.username}`);
      continue;
    }

    const [row] = await db
      .insert(users)
      .values({
        universityId: unilag.id,
        facultyId: facBySlug[u.facultySlug]?.id ?? null,
        departmentId: deptBySlug[u.departmentSlug]?.id ?? null,
        username: u.username,
        displayName: u.displayName,
        email: u.email,
        emailVerified: true,
        phone: u.phone,
        avatarUrl: u.avatarUrl,
        bio: u.bio,
        isVerified: u.isVerified,
        onboardingCompleted: true,
      })
      .returning({ id: users.id });

    insertedUsers[u.username] = row;
    console.log(`  Created user: ${u.username}`);
  }

  // ---------- listings ----------
  type Seed = {
    seller: string;
    categorySlug: string;
    type: "sell" | "swap" | "rent" | "free" | "service";
    title: string;
    description: string;
    priceNaira?: number;
    condition?: "new" | "like_new" | "used" | "for_parts";
    pickupName?: string;
    imageSeeds: string[];
  };

  const seeds: Seed[] = [
    {
      seller: "tunde",
      categorySlug: "phones-tablets",
      type: "sell",
      title: "iPhone 12, 128GB, clean",
      description:
        "Barely used iPhone 12. Battery health 89%. Comes with charger and case. No scratches, screen protector on since day one.",
      priceNaira: 285000,
      condition: "used",
      pickupName: "Faculty of Engineering",
      imageSeeds: ["iphone-12-a", "iphone-12-b"],
    },
    {
      seller: "aisha",
      categorySlug: "beauty-care",
      type: "sell",
      title: "Vanilla perfume, sealed",
      description:
        "Original 100ml bottle, still sealed. Bought two, giving one out. Smells amazing, lasts all day.",
      priceNaira: 12000,
      condition: "new",
      pickupName: "Moremi Hall",
      imageSeeds: ["perfume-a"],
    },
    {
      seller: "chidi",
      categorySlug: "hostel-room",
      type: "rent",
      title: "Bed space in Moremi, next session",
      description:
        "Clean bed space available from next session. Shared bathroom, constant water, close to the market.",
      priceNaira: 85000,
      pickupName: "Moremi Hall",
      imageSeeds: ["room-a", "room-b"],
    },
    {
      seller: "zainab",
      categorySlug: "services",
      type: "service",
      title: "Box braids, medium size",
      description:
        "Certified hairstylist on campus. Medium box braids from ₦8000. I come to your hostel or you come to mine. Bring your own hair or I source it.",
      priceNaira: 8000,
      pickupName: "Faculty of Arts",
      imageSeeds: ["braids-a"],
    },
    {
      seller: "aisha",
      categorySlug: "books-study",
      type: "free",
      title: "CHM 101 textbook, giving out",
      description:
        "Old but still useful. Some notes in pencil, easily erased. First person to pick up gets it.",
      pickupName: "Faculty of Science",
      imageSeeds: ["chem-book"],
    },
    {
      seller: "tunde",
      categorySlug: "laptops-computers",
      type: "swap",
      title: "JBL speaker, want earbuds",
      description:
        "JBL Flip 5, works perfectly. Want to swap for wireless earbuds of similar value. Sound quality is great, battery lasts about 8 hours.",
      condition: "used",
      pickupName: "Faculty of Engineering",
      imageSeeds: ["jbl-speaker"],
    },
    {
      seller: "chidi",
      categorySlug: "food-provisions",
      type: "sell",
      title: "Mini fridge, barely used",
      description:
        "Bought last semester, no longer needed. Works fine, no dents. Selling because I'm moving out.",
      priceNaira: 45000,
      condition: "used",
      pickupName: "New Hall",
      imageSeeds: ["fridge-a", "fridge-b"],
    },
    {
      seller: "zainab",
      categorySlug: "clothing-fashion",
      type: "sell",
      title: "Ankara two-piece, size M",
      description:
        "Custom-made Ankara two-piece. Worn twice. Fits UK 10-12. Perfect for weddings and church.",
      priceNaira: 15000,
      condition: "like_new",
      pickupName: "Faculty of Arts",
      imageSeeds: ["ankara-a", "ankara-b"],
    },
    {
      seller: "aisha",
      categorySlug: "sports-fitness",
      type: "sell",
      title: "Yoga mat + dumbbells set",
      description:
        "Selling as a set. Mat is thick, non-slip. Two 5kg dumbbells, minimal use.",
      priceNaira: 18000,
      condition: "used",
      pickupName: "Sports Centre",
      imageSeeds: ["fitness-a"],
    },
    {
      seller: "tunde",
      categorySlug: "gigs-skills",
      type: "service",
      title: "Maths tutoring, WAEC & JAMB",
      description:
        "Engineering student, 3 years tutoring experience. Home lessons at your hostel or online. ₦2500/hour.",
      priceNaira: 2500,
      imageSeeds: ["tutor-a"],
    },
  ];

  let created = 0;
  let skipped = 0;

  for (const s of seeds) {
    const seller = insertedUsers[s.seller];
    const category = catBySlug[s.categorySlug];
    if (!seller || !category) {
      console.log(`  Skipped (missing ref): ${s.title}`);
      continue;
    }

    const [existing] = await db
      .select({ id: listings.id })
      .from(listings)
      .where(eq(listings.title, s.title))
      .limit(1);

    if (existing) {
      skipped++;
      continue;
    }

    const [listing] = await db
      .insert(listings)
      .values({
        universityId: unilag.id,
        sellerId: seller.id,
        categoryId: category.id,
        pickupLocationId: s.pickupName
          ? pickupByName[s.pickupName]?.id ?? null
          : null,
        type: s.type,
        title: s.title,
        description: s.description,
        priceKobo: s.priceNaira ? s.priceNaira * 100 : null,
        condition: s.condition ?? null,
        contactPhone: fakeUsers.find((u) => u.username === s.seller)!.phone,
        status: "active",
      })
      .returning({ id: listings.id });

    await db.insert(listingImages).values(
      s.imageSeeds.map((seed, i) => ({
        listingId: listing.id,
        url: picsum(seed),
        sortOrder: i,
      }))
    );

    created++;
  }

  console.log(`\nDone.`);
  console.log(`  Users created/found: ${Object.keys(insertedUsers).length}`);
  console.log(`  Listings created: ${created}`);
  console.log(`  Listings skipped (already existed): ${skipped}`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});