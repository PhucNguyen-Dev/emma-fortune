import { z } from "zod";
import { WISHLIST_CATEGORIES } from "@/types";

/** Largest amount the app treats as meaningful; keeps typos from wrecking the UI. */
export const MAX_AMOUNT = 1_000_000_000_000;

const isoDateTime = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Not a valid date");

const isoDay = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

const shortText = z.string().trim().min(1).max(80);
const bodyText = z.string().max(8000);

const positiveAmount = z
  .number()
  .finite()
  .positive("Amount must be greater than zero")
  .max(MAX_AMOUNT, "Amount is unrealistically large");

export const appConfigSchema = z.object({
  recipientName: shortText.max(60),
  senderName: shortText.max(60),
  birthdayDate: isoDay.optional(),
  currency: z.string().min(1).max(8),
  locale: z.string().min(1).max(24),
  appTitle: z.string().trim().min(1).max(80),
  tagline: z.string().trim().max(200),
  letter: z.object({
    salutation: z.string().trim().max(120),
    body: bodyText,
    signOff: z.string().trim().max(120),
    personalReasons: z.array(z.string().trim().min(1).max(240)).max(10),
  }),
  fund: z.object({
    name: z.string().trim().min(1).max(80),
    description: z.string().trim().max(300),
    targetAmount: positiveAmount,
    targetDate: isoDay.optional(),
  }),
  specialCard: z
    .object({
      title: z.string().trim().min(1).max(120),
      message: z.string().max(2000),
      ratePercent: z.number().finite().min(0.0001).max(100),
    })
    .default({
      title: "A One-in-Ten-Thousand Treasure",
      message:
        "This card has no price. There is only one in the whole world — and it was always meant for you.",
      ratePercent: 0.01,
    }),
});

export const couponSchema = z.object({
  id: z.string().min(1).max(80),
  title: z.string().trim().min(1).max(80),
  description: z.string().trim().max(300),
  category: z.string().trim().min(1).max(40),
  icon: z.string().trim().min(1).max(40),
  fictionalPointCost: z.number().finite().min(0).max(MAX_AMOUNT),
  status: z.enum(["available", "redeemed"]),
  redeemedAt: isoDateTime.optional(),
  redemptionNote: z.string().trim().max(300).optional(),
});

export const fundContributionSchema = z.object({
  id: z.string().min(1).max(80),
  amount: positiveAmount,
  date: isoDay,
  note: z.string().trim().max(200).optional(),
  createdAt: isoDateTime,
});

export const wishlistItemSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().trim().min(1).max(120),
  category: z.string().trim().min(1).max(40),
  description: z.string().trim().max(600),
  estimatedPrice: z.number().finite().min(0).max(MAX_AMOUNT).optional(),
  currency: z.string().trim().min(1).max(8).optional(),
  brand: z.string().trim().min(1).max(80).optional(),
  shopItemId: z.string().trim().min(1).max(80).optional(),
  priority: z.enum(["dream", "high", "medium", "low"]),
  status: z.enum(["dreaming", "planned", "gifted"]),
  favorite: z.boolean(),
  imageUrl: z
    .string()
    .trim()
    .max(2000)
    .refine(
      (value) => value === "" || /^https?:\/\//i.test(value),
      "Image URL must start with http:// or https://",
    )
    .optional(),
  createdAt: isoDateTime,
  updatedAt: isoDateTime,
});

export const bankTransactionSchema = z.object({
  id: z.string().min(1).max(80),
  couponId: z.string().min(1).max(80),
  couponTitle: z.string().trim().min(1).max(120),
  fictionalPointCost: z.number().finite().min(0).max(MAX_AMOUNT),
  createdAt: isoDateTime,
  kind: z.enum(["redemption", "purchase", "transfer"]).optional(),
  direction: z.enum(["in", "out"]).optional(),
});

export const specialCardStateSchema = z
  .object({
    found: z.boolean(),
    revealedAt: isoDateTime.optional(),
  })
  .default({ found: false });

export const appPreferencesSchema = z.object({
  reducedMotion: z.boolean().optional(),
  introSeen: z.boolean().optional(),
  fundGoalReached: z.boolean().optional(),
  previewMode: z.enum(["owner", "recipient"]).optional(),
  musicEnabled: z.boolean().optional(),
  musicTrackId: z.string().trim().min(1).max(80).optional(),
});

export const appStateSchema = z.object({
  schemaVersion: z.literal(1),
  config: appConfigSchema,
  coupons: z.array(couponSchema),
  contributions: z.array(fundContributionSchema),
  wishlist: z.array(wishlistItemSchema),
  transactions: z.array(bankTransactionSchema),
  specialCard: specialCardStateSchema,
  preferences: appPreferencesSchema,
});

export type AppConfigInput = z.input<typeof appConfigSchema>;
export type AppStateInput = z.input<typeof appStateSchema>;

/** True when the category is one of the known wishlist categories. */
export function isKnownWishlistCategory(category: string): boolean {
  return (WISHLIST_CATEGORIES as readonly string[]).includes(category);
}
