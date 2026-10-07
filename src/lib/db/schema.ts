import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ============================================
// TENANTS: universities, faculties, departments
// ============================================

export const universities = pgTable("universities", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  shortName: text("short_name").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  domain: text("domain").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const faculties = pgTable(
  "faculties",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    universityId: uuid("university_id")
      .notNull()
      .references(() => universities.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("faculties_university_slug_idx").on(t.universityId, t.slug),
  ]
);

export const departments = pgTable(
  "departments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    facultyId: uuid("faculty_id")
      .notNull()
      .references(() => faculties.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("departments_faculty_slug_idx").on(t.facultyId, t.slug)]
);

// ============================================
// CATEGORIES + PICKUP LOCATIONS
// ============================================

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pickupLocations = pgTable(
  "pickup_locations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    universityId: uuid("university_id")
      .notNull()
      .references(() => universities.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("pickup_locations_university_idx").on(t.universityId)]
);

// ============================================
// USERS + AUTH
// ============================================

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    universityId: uuid("university_id")
      .notNull()
      .references(() => universities.id),
    facultyId: uuid("faculty_id").references(() => faculties.id),
    departmentId: uuid("department_id").references(() => departments.id),
    username: text("username").notNull().unique(),
    displayName: text("display_name").notNull(),
    email: text("email"),
    phone: text("phone"),
    avatarUrl: text("avatar_url"),
    bio: text("bio"),
    isVerified: boolean("is_verified").notNull().default(false),
    isAdmin: boolean("is_admin").notNull().default(false),
    isBanned: boolean("is_banned").notNull().default(false),
    onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("users_university_idx").on(t.universityId),
    index("users_username_idx").on(t.username),
  ]
);

export const authIdentities = pgTable(
  "auth_identities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerUserId: text("provider_user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("auth_identities_provider_idx").on(t.provider, t.providerUserId),
    index("auth_identities_user_idx").on(t.userId),
  ]
);

export const reservedUsernames = pgTable("reserved_usernames", {
  username: text("username").primaryKey(),
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});