import { z } from "zod";
import { normalizeNigerianPhone } from "@/lib/phone";

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be at most 20 characters")
  .regex(
    /^[a-z0-9_]+$/,
    "Only lowercase letters, numbers, and underscores"
  )
  .refine((v) => !v.startsWith("_") && !v.endsWith("_"), {
    message: "Cannot start or end with underscore",
  });

export const onboardingSchema = z.object({
  username: usernameSchema,
  universityId: z.string().uuid("Pick a university"),
  facultyId: z.string().uuid("Pick a faculty"),
  departmentId: z.string().uuid().optional().or(z.literal("")),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;


export const profileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name is too long"),
  bio: z
    .string()
    .trim()
    .max(300, "Bio is too long")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || normalizeNigerianPhone(v) !== null,
      "Enter a valid Nigerian phone number"
    )
    .optional()
    .or(z.literal("")),
});

export type ProfileInput = z.infer<typeof profileSchema>;