export type CouponStatus = "available" | "redeemed";

export type WishlistPriority = "dream" | "high" | "medium" | "low";

export type WishlistStatus = "dreaming" | "planned" | "gifted";

export type PreviewMode = "owner" | "recipient";

export type TransactionKind = "redemption" | "purchase" | "transfer";

/**
 * Effect on the BANK balance: "in" means coins arrived (e.g. a gift from the
 * Future Fund), "out" means coins were spent or sent away. Redemptions and
 * purchases are always "out".
 */
export type TransactionDirection = "in" | "out";

export type ShopCategory =
  | "Makeup"
  | "Skincare"
  | "Hair"
  | "Jewelry & Accessories"
  | "Treats & Comfort";

export type AppConfig = {
  recipientName: string;
  senderName: string;
  birthdayDate?: string;
  currency: string;
  locale: string;
  appTitle: string;
  tagline: string;
  letter: {
    salutation: string;
    body: string;
    signOff: string;
    personalReasons: string[];
  };
  fund: {
    name: string;
    description: string;
    targetAmount: number;
    targetDate?: string;
  };
  specialCard: {
    title: string;
    message: string;
    /** Chance (%) that a boutique purchase awakens the rare card. */
    ratePercent: number;
  };
};

export type Coupon = {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  fictionalPointCost: number;
  status: CouponStatus;
  redeemedAt?: string;
  redemptionNote?: string;
};

export type FundContribution = {
  id: string;
  amount: number;
  /** Local calendar date in YYYY-MM-DD form. */
  date: string;
  note?: string;
  createdAt: string;
};

export type WishlistItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  estimatedPrice?: number;
  currency?: string;
  /** Famous brand, e.g. "Chanel" — set automatically for boutique purchases. */
  brand?: string;
  /** For treasures bought in the Boutique, so repeat buys don't duplicate the wish. */
  shopItemId?: string;
  priority: WishlistPriority;
  status: WishlistStatus;
  favorite: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type ShopItem = {
  id: string;
  /** What it is, e.g. "Lipstick". */
  kind: string;
  /** Famous brand shown beneath the name. */
  brand: string;
  /** Full display name, e.g. "Velvet Rose Lipstick". */
  name: string;
  category: ShopCategory;
  icon: string;
  /** Fictional love-point price, 1,000–100,000. */
  price: number;
};

export type BankTransaction = {
  id: string;
  /** Coupon id, shop item id, or transfer id depending on kind. */
  couponId: string;
  /** Display label: coupon title, "brand · item", or transfer description. */
  couponTitle: string;
  fictionalPointCost: number;
  createdAt: string;
  kind?: TransactionKind;
  direction?: TransactionDirection;
};

export type AppPreferences = {
  reducedMotion?: boolean;
  introSeen?: boolean;
  /** Celebrated state for the future fund; set only after explicit confirmation. */
  fundGoalReached?: boolean;
  previewMode?: PreviewMode;
  /** The hidden music box: undefined means "not chosen yet" (auto-plays once). */
  musicEnabled?: boolean;
  musicTrackId?: string;
};

export type AppState = {
  schemaVersion: 1;
  config: AppConfig;
  coupons: Coupon[];
  contributions: FundContribution[];
  wishlist: WishlistItem[];
  transactions: BankTransaction[];
  /** The rare, unpurchasable treasure — appears by chance and reveals on click. */
  specialCard: {
    found: boolean;
    revealedAt?: string;
  };
  preferences: AppPreferences;
};

export const WISHLIST_CATEGORIES = [
  "Fashion",
  "Beauty",
  "Tech",
  "Experiences",
  "Little luxuries",
  "Other",
] as const;

export type WishlistCategory = (typeof WISHLIST_CATEGORIES)[number];

export const COUPON_CATEGORIES = [
  "affection",
  "date",
  "time",
  "treat",
  "shopping",
  "wish",
] as const;

export const SUPPORTED_CURRENCIES = ["VND", "USD", "EUR", "GBP", "JPY", "SGD", "THB", "AUD"] as const;

export const SUPPORTED_LOCALES = ["vi-VN", "en-US", "en-GB"] as const;
