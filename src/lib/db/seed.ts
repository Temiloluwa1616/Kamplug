import { db } from "./index";
import {
  universities,
  faculties,
  departments,
  categories,
  pickupLocations,
  reservedUsernames,
} from "./schema";

async function seed() {
  console.log("Seeding UNILAG...");

  // University
  const [unilag] = await db
    .insert(universities)
    .values({
      name: "University of Lagos",
      slug: "unilag",
      shortName: "UNILAG",
      city: "Akoka",
      state: "Lagos",
      domain: "unilag.edu.ng",
    })
    .onConflictDoNothing({ target: universities.slug })
    .returning();

  const uni =
  unilag ??
  (
    await db
      .select()
      .from(universities)
      .limit(1)
  )[0];

  if (!uni) throw new Error("Failed to seed university");

  // Faculties (real UNILAG faculties)
  const facultyData = [
    { name: "Faculty of Arts", slug: "arts" },
    { name: "Faculty of Basic Medical Sciences", slug: "basic-medical-sciences" },
    { name: "Faculty of Clinical Sciences", slug: "clinical-sciences" },
    { name: "Faculty of Dental Sciences", slug: "dental-sciences" },
    { name: "Faculty of Education", slug: "education" },
    { name: "Faculty of Engineering", slug: "engineering" },
    { name: "Faculty of Environmental Sciences", slug: "environmental-sciences" },
    { name: "Faculty of Law", slug: "law" },
    { name: "Faculty of Management Sciences", slug: "management-sciences" },
    { name: "Faculty of Pharmacy", slug: "pharmacy" },
    { name: "Faculty of Science", slug: "science" },
    { name: "Faculty of Social Sciences", slug: "social-sciences" },
  ];

  const insertedFaculties = await db
    .insert(faculties)
    .values(
      facultyData.map((f) => ({
        universityId: uni.id,
        name: f.name,
        slug: f.slug,
      }))
    )
    .onConflictDoNothing()
    .returning();

  const facultyBySlug = Object.fromEntries(
    insertedFaculties.map((f) => [f.slug, f])
  );

  // Departments (common ones per faculty)
  const departmentData: Record<string, { name: string; slug: string }[]> = {
    arts: [
      { name: "Creative Arts", slug: "creative-arts" },
      { name: "English", slug: "english" },
      { name: "European Languages", slug: "european-languages" },
      { name: "History and Strategic Studies", slug: "history" },
      { name: "Linguistics, African and Asian Studies", slug: "linguistics" },
      { name: "Philosophy", slug: "philosophy" },
    ],
    engineering: [
      { name: "Chemical Engineering", slug: "chemical-engineering" },
      { name: "Civil Engineering", slug: "civil-engineering" },
      { name: "Computer Engineering", slug: "computer-engineering" },
      { name: "Electrical and Electronics Engineering", slug: "eee" },
      { name: "Mechanical Engineering", slug: "mechanical-engineering" },
      { name: "Petroleum and Gas Engineering", slug: "petroleum-engineering" },
      { name: "Surveying and Geoinformatics", slug: "surveying" },
      { name: "Systems Engineering", slug: "systems-engineering" },
    ],
    science: [
      { name: "Biochemistry", slug: "biochemistry" },
      { name: "Botany", slug: "botany" },
      { name: "Chemistry", slug: "chemistry" },
      { name: "Computer Science", slug: "computer-science" },
      { name: "Geology", slug: "geology" },
      { name: "Mathematics", slug: "mathematics" },
      { name: "Microbiology", slug: "microbiology" },
      { name: "Physics", slug: "physics" },
      { name: "Statistics", slug: "statistics" },
      { name: "Zoology", slug: "zoology" },
    ],
    "social-sciences": [
      { name: "Economics", slug: "economics" },
      { name: "Geography", slug: "geography" },
      { name: "Mass Communication", slug: "mass-communication" },
      { name: "Political Science", slug: "political-science" },
      { name: "Psychology", slug: "psychology" },
      { name: "Sociology", slug: "sociology" },
    ],
    "management-sciences": [
      { name: "Accounting", slug: "accounting" },
      { name: "Actuarial Science and Insurance", slug: "actuarial-science" },
      { name: "Business Administration", slug: "business-administration" },
      { name: "Finance", slug: "finance" },
      { name: "Industrial Relations and Personnel Management", slug: "irpm" },
      { name: "Public Administration", slug: "public-administration" },
    ],
    law: [{ name: "Law", slug: "law" }],
    education: [
      { name: "Educational Foundations", slug: "educational-foundations" },
      { name: "Human Kinetics and Health Education", slug: "human-kinetics" },
      { name: "Science and Technology Education", slug: "science-education" },
      { name: "Arts and Social Sciences Education", slug: "arts-education" },
    ],
    pharmacy: [{ name: "Pharmacy", slug: "pharmacy" }],
    "environmental-sciences": [
      { name: "Architecture", slug: "architecture" },
      { name: "Building", slug: "building" },
      { name: "Estate Management", slug: "estate-management" },
      { name: "Quantity Surveying", slug: "quantity-surveying" },
      { name: "Urban and Regional Planning", slug: "urban-planning" },
    ],
  };

  const deptValues = Object.entries(departmentData).flatMap(
    ([facultySlug, depts]) => {
      const faculty = facultyBySlug[facultySlug];
      if (!faculty) return [];
      return depts.map((d) => ({
        facultyId: faculty.id,
        name: d.name,
        slug: d.slug,
      }));
    }
  );

  if (deptValues.length > 0) {
    await db.insert(departments).values(deptValues).onConflictDoNothing();
  }

  // Categories
  const categoryData = [
    { name: "Phones & Tablets", slug: "phones-tablets", icon: "smartphone", sortOrder: 1 },
    { name: "Laptops & Computers", slug: "laptops-computers", icon: "laptop", sortOrder: 2 },
    { name: "Books & Study", slug: "books-study", icon: "book", sortOrder: 3 },
    { name: "Clothing & Fashion", slug: "clothing-fashion", icon: "shirt", sortOrder: 4 },
    { name: "Hostel & Room", slug: "hostel-room", icon: "home", sortOrder: 5 },
    { name: "Food & Provisions", slug: "food-provisions", icon: "utensils", sortOrder: 6 },
    { name: "Beauty & Personal Care", slug: "beauty-care", icon: "sparkles", sortOrder: 7 },
    { name: "Services", slug: "services", icon: "wrench", sortOrder: 8 },
    { name: "Gigs & Skills", slug: "gigs-skills", icon: "briefcase", sortOrder: 9 },
    { name: "Sports & Fitness", slug: "sports-fitness", icon: "dumbbell", sortOrder: 10 },
    { name: "Other", slug: "other", icon: "package", sortOrder: 99 },
  ];

  await db.insert(categories).values(categoryData).onConflictDoNothing();

  // Pickup locations
  const pickupData = [
    { name: "Main Gate", description: "University of Lagos main entrance" },
    { name: "Second Gate", description: "Alternate entrance near Akoka" },
    { name: "Akoka Park", description: "Open park area near campus" },
    { name: "Faculty of Science", description: "In front of Science faculty building" },
    { name: "Faculty of Engineering", description: "Engineering complex entrance" },
    { name: "Faculty of Arts", description: "Arts faculty courtyard" },
    { name: "Faculty of Social Sciences", description: "Social Sciences main entrance" },
    { name: "Faculty of Law", description: "Law faculty building" },
    { name: "Moremi Hall", description: "Female hostel area" },
    { name: "Fagunwa Hall", description: "Male hostel area" },
    { name: "New Hall", description: "New Hall hostel area" },
    { name: "Senate Building", description: "Administrative block" },
    { name: "Library", description: "Main university library" },
    { name: "Sports Centre", description: "University sports complex" },
  ];

  await db
    .insert(pickupLocations)
    .values(
      pickupData.map((p) => ({
        universityId: uni.id,
        name: p.name,
        description: p.description,
      }))
    )
    .onConflictDoNothing();

  // Reserved usernames
  const reserved = [
    { username: "admin", reason: "System reserved" },
    { username: "support", reason: "System reserved" },
    { username: "help", reason: "System reserved" },
    { username: "kamplug", reason: "Brand name" },
    { username: "unilag", reason: "University name" },
    { username: "official", reason: "System reserved" },
    { username: "root", reason: "System reserved" },
    { username: "system", reason: "System reserved" },
    { username: "api", reason: "System reserved" },
    { username: "about", reason: "System reserved" },
    { username: "login", reason: "System reserved" },
    { username: "signup", reason: "System reserved" },
    { username: "settings", reason: "System reserved" },
    { username: "profile", reason: "System reserved" },
    { username: "explore", reason: "System reserved" },
    { username: "sell", reason: "System reserved" },
    { username: "search", reason: "System reserved" },
    { username: "me", reason: "System reserved" },
    { username: "you", reason: "System reserved" },
    { username: "null", reason: "System reserved" },
    { username: "undefined", reason: "System reserved" },
  ];

  await db.insert(reservedUsernames).values(reserved).onConflictDoNothing();

  console.log("Seed complete.");
  console.log(`  University: ${uni.name}`);
  console.log(`  Faculties: ${insertedFaculties.length}`);
  console.log(`  Departments: ${deptValues.length}`);
  console.log(`  Categories: ${categoryData.length}`);
  console.log(`  Pickup locations: ${pickupData.length}`);
  console.log(`  Reserved usernames: ${reserved.length}`);

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});