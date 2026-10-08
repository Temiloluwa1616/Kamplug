import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import { config } from "@/lib/config";
import * as schema from "@/lib/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    // Keys are Better Auth's model names. Values are YOUR Drizzle tables.
    // Do NOT set `modelName` anywhere: this map is what links them.
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.account,
      verification: schema.verifications,
    },
  }),

  secret: config.BETTER_AUTH_SECRET,
  baseURL: config.BETTER_AUTH_URL,

  socialProviders: {
    google: {
      clientId: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
    },
  },

  user: {
    // Better Auth field name -> your Drizzle property name
    fields: {
      name: "displayName",
      image: "avatarUrl",
    },
    additionalFields: {
      // Not known at Google signup. Filled in during onboarding.
      universityId: { type: "string", required: false, input: false },
      username: { type: "string", required: false, input: true },
      facultyId: { type: "string", required: false, input: true },
      departmentId: { type: "string", required: false, input: true },
    },
  },

  account: {
    fields: {
      providerId: "provider",
      accountId: "providerUserId",
    },
  },

  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
});