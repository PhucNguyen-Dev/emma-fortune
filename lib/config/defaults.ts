import type { AppState, AppConfig, Coupon, WishlistItem } from "@/types";

export const DEFAULT_RECIPIENT_NAME = "Ng Thanh Ngân";
export const DEFAULT_SENDER_NAME = "Your Love";
export const DEFAULT_CURRENCY = "VND";
export const DEFAULT_LOCALE = "vi-VN";

/** Starter target for the Future Fund; the UI marks it as an editable demo value. */
export const DEMO_FUND_TARGET = 5_000_000;
export const STARTING_LOVE_BALANCE = 1_000_000;

export const defaultConfig: AppConfig = {
  recipientName: DEFAULT_RECIPIENT_NAME,
  senderName: DEFAULT_SENDER_NAME,
  currency: DEFAULT_CURRENCY,
  locale: DEFAULT_LOCALE,
  appTitle: "Emma's Unlimited Fortune",
  tagline: "A little luxury today. A future we build together.",
  letter: {
    salutation: "My dearest Ngân,",
    body: [
      "Happy birthday, my love.",
      "I know you love money and beautiful things, and I wish I could give you everything you've been dreaming about today. I can't do that right now, so I made you this little world instead: a playful fortune, a place for your wishes, and a fund I hope to build honestly over time.",
      "I don't want to pretend that points are money or that a dream is already paid for. I just want you to know that I listen to what you love, I care about your happiness, and I want to keep building a life with more possibilities.",
      "Today is yours. Happy birthday, Ngân. I love you.",
    ].join("\n\n"),
    signOff: "Forever yours,",
    personalReasons: [],
  },
  fund: {
    name: "Emma's Birthday Dream",
    description: "A little fund for something you really want.",
    targetAmount: DEMO_FUND_TARGET,
  },
  specialCard: {
    title: "A One-in-Ten-Thousand Treasure",
    message:
      "This card has no price, because there is only one in the whole world — and it was always meant for you. Edit this message in Settings and make it yours.",
    ratePercent: 0.01,
  },
};

export const defaultCoupons: Coupon[] = [
  {
    id: "coupon-long-hug",
    title: "One long hug",
    description: "Redeemable anytime, no appointment needed. Squeeze duration negotiable.",
    category: "affection",
    icon: "heart",
    fictionalPointCost: 5_000,
    status: "available",
  },
  {
    id: "coupon-date-by-you",
    title: "A date picked by you",
    description: "You choose the place, the plan, and the dessert. I handle logistics.",
    category: "date",
    icon: "calendar-heart",
    fictionalPointCost: 50_000,
    status: "available",
  },
  {
    id: "coupon-full-evening",
    title: "A full evening of my attention",
    description: "Phone away, plans off. One entire evening that belongs to you.",
    category: "time",
    icon: "moon-star",
    fictionalPointCost: 80_000,
    status: "available",
  },
  {
    id: "coupon-favorite-snack",
    title: "Your favorite homemade snack",
    description: "Made by me, in my kitchen, with a 100% effort guarantee.",
    category: "treat",
    icon: "cookie",
    fictionalPointCost: 15_000,
    status: "available",
  },
  {
    id: "coupon-shopping-companion",
    title: "One no-complaints shopping companion",
    description: "Carries bags, offers honest opinions, complains about absolutely nothing.",
    category: "shopping",
    icon: "shopping-bag",
    fictionalPointCost: 30_000,
    status: "available",
  },
  {
    id: "coupon-birthday-wish",
    title: "One birthday wish we can realistically plan",
    description: "Tell me something within reach, and we'll make a real plan for it.",
    category: "wish",
    icon: "sparkles",
    fictionalPointCost: 100_000,
    status: "available",
  },
];

let wishlistCounter = 0;

function wish(
  partial: Omit<WishlistItem, "id" | "createdAt" | "updatedAt" | "favorite" | "status"> &
    Partial<Pick<WishlistItem, "favorite" | "status">>,
): WishlistItem {
  wishlistCounter += 1;
  const now = new Date(2026, 0, 1, 9, 0, 0).toISOString();
  return {
    id: `wishlist-default-${wishlistCounter}`,
    favorite: false,
    status: "dreaming",
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

/** Neutral sample catalog — generic names, editable estimates, no brand claims. */
export const defaultWishlist: WishlistItem[] = [
  wish({
    name: "Elegant everyday handbag",
    category: "Fashion",
    description: "A structured, go-with-everything bag that makes any outfit look intentional.",
    estimatedPrice: 2_500_000,
    priority: "dream",
    favorite: true,
  }),
  wish({
    name: "Signature perfume",
    category: "Beauty",
    description: "The scent people associate with you the moment you leave the room.",
    estimatedPrice: 1_800_000,
    priority: "high",
  }),
  wish({
    name: "Minimal gold necklace",
    category: "Fashion",
    description: "A thin, timeless piece that never takes a day off.",
    estimatedPrice: 1_200_000,
    priority: "medium",
  }),
  wish({
    name: "Premium headphones",
    category: "Tech",
    description: "Noise cancellation for focus, sound quality for joy.",
    estimatedPrice: 3_000_000,
    priority: "medium",
  }),
  wish({
    name: "A spa day",
    category: "Experiences",
    description: "Hours of massage, steam, and absolutely no notifications.",
    estimatedPrice: 900_000,
    priority: "high",
  }),
  wish({
    name: "A weekend getaway",
    category: "Experiences",
    description: "One small trip, planned together, remembered forever.",
    estimatedPrice: 4_500_000,
    priority: "dream",
    favorite: true,
  }),
  wish({
    name: "A beautiful pair of shoes",
    category: "Fashion",
    description: "The kind of shoes that make the whole street a runway.",
    estimatedPrice: 1_500_000,
    priority: "low",
  }),
  wish({
    name: "A special birthday dinner",
    category: "Experiences",
    description: "A table for two, candlelight, and no rush to leave.",
    estimatedPrice: 1_000_000,
    priority: "high",
  }),
];

export function createDefaultState(): AppState {
  return {
    schemaVersion: 1,
    config: structuredCloneSafe(defaultConfig),
    coupons: defaultCoupons.map((coupon) => ({ ...coupon })),
    contributions: [],
    wishlist: defaultWishlist.map((item) => ({ ...item })),
    transactions: [],
    specialCard: { found: false },
    preferences: {},
  };
}

function structuredCloneSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
