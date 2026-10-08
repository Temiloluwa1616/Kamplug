import { z } from "zod";

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