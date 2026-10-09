import { z } from "zod";
import { normalizeNigerianPhone } from "@/lib/phone";

export const LISTING_TYPES = ["sell", "swap", "rent", "free", "service"] as const;
export const CONDITIONS = ["new", "like_new", "used", "for_parts"] as const;

export type ListingType = (typeof LISTING_TYPES)[number];
export type Condition = (typeof CONDITIONS)[number];

export const listingSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(80, "Title is too long"),
    description: z
      .string()
      .trim()
      .max(1000, "Description is too long")
      .optional()
      .or(z.literal("")),
    categoryId: z.string().uuid("Pick a category"),
    type: z.enum(LISTING_TYPES).default("sell"),
    condition: z.enum(CONDITIONS).optional(),

    // Price in naira, as a string from the form. We convert to kobo server-side.
    price: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine(
        (v) => !v || /^\d+(\.\d{1,2})?$/.test(v),
        "Enter a valid price like 12000 or 12000.50"
      ),

    pickupLocationId: z.string().uuid().optional().or(z.literal("")),

    // Phone as the user typed it. Normalized server-side.
    phone: z
      .string()
      .trim()
      .min(1, "Phone number is required to publish")
      .refine((v) => normalizeNigerianPhone(v) !== null, {
        message: "Enter a valid Nigerian phone number",
      }),

    images: z
      .array(z.string().url())
      .min(1, "Add at least one photo")
      .max(3, "Up to 3 photos"),
  })
  .refine(
    (data) => data.type !== "sell" || (data.price && data.price.length > 0),
    {
      message: "Price is required for items you're selling",
      path: ["price"],
    }
  );

export type ListingInput = z.infer<typeof listingSchema>;

/**
 * Convert the form's naira string to kobo (integer). Returns null if empty.
 * Naira has 100 kobo.
 */
export function nairaToKobo(naira: string | undefined): number | null {
  if (!naira || naira.length === 0) return null;
  const value = Number(naira);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
}

export function koboToNaira(kobo: number | null): string {
  if (kobo === null) return "";
  return (kobo / 100).toFixed(2).replace(/\.00$/, "");
}