import type { ShopCategory, ShopItem } from "@/types";

/**
 * The Unlimited Boutique — a deterministic catalog of beauty & everyday
 * treasures. Each archetype (e.g. "Lipstick") comes in several famous-brand
 * variants with poetic names and a stable random price between 1,000 and
 * 100,000 love points. Generation is seeded, so prices and names never change
 * between visits (and nothing here is stored in localStorage).
 */

export const SHOP_CATEGORIES: ShopCategory[] = [
  "Makeup",
  "Skincare",
  "Hair",
  "Jewelry & Accessories",
  "Treats & Comfort",
];

type Archetype = {
  kind: string;
  category: ShopCategory;
  icon: string;
  brands: [string, string, string, string, string];
};

const ARCHETYPES: Archetype[] = [
  // Makeup
  { kind: "Lipstick", category: "Makeup", icon: "sparkles", brands: ["Chanel", "Dior", "YSL", "MAC", "Charlotte Tilbury"] },
  { kind: "Lip Gloss", category: "Makeup", icon: "sparkles", brands: ["Fenty Beauty", "Dior", "NYX", "Rare Beauty", "Glossier"] },
  { kind: "Lip Balm", category: "Makeup", icon: "heart", brands: ["Laneige", "Fresh", "Summer Fridays", "Rhode", "Clarins"] },
  { kind: "Mascara", category: "Makeup", icon: "eye", brands: ["Maybelline", "Lancôme", "Too Faced", "Benefit", "Charlotte Tilbury"] },
  { kind: "Eyeliner", category: "Makeup", icon: "pencil", brands: ["Stila", "KVD Beauty", "Lancôme", "Urban Decay", "Fenty Beauty"] },
  { kind: "Blush", category: "Makeup", icon: "flower", brands: ["Rare Beauty", "NARS", "Benefit", "Tarte", "Glossier"] },
  { kind: "Highlighter", category: "Makeup", icon: "sun", brands: ["Fenty Beauty", "Hourglass", "RMS Beauty", "MAC", "Charlotte Tilbury"] },
  { kind: "Foundation", category: "Makeup", icon: "droplet", brands: ["Estée Lauder", "Armani Beauty", "NARS", "MAC", "Fenty Beauty"] },
  { kind: "Cushion Foundation", category: "Makeup", icon: "droplet", brands: ["Laneige", "Sulwhasoo", "Shiseido", "YSL", "Dior"] },
  { kind: "Setting Spray", category: "Makeup", icon: "wind", brands: ["Urban Decay", "Charlotte Tilbury", "NYX", "Morphe", "MAC"] },
  { kind: "Nail Polish", category: "Makeup", icon: "gem", brands: ["OPI", "Essie", "Chanel", "Dior", "Olive & June"] },
  { kind: "Brush Set", category: "Makeup", icon: "palette", brands: ["Morphe", "Sigma Beauty", "Real Techniques", "Zoeva", "Sephora Collection"] },

  // Skincare
  { kind: "Face Serum", category: "Skincare", icon: "droplet", brands: ["The Ordinary", "Estée Lauder", "La Mer", "SkinCeuticals", "Glossier"] },
  { kind: "Face Cream", category: "Skincare", icon: "cloud", brands: ["La Mer", "Clinique", "Tatcha", "Belif", "Kiehl's"] },
  { kind: "Sheet Mask", category: "Skincare", icon: "sparkles", brands: ["SK-II", "Dr. Jart+", "Innisfree", "TONYMOLY", "Laneige"] },
  { kind: "Face Mist", category: "Skincare", icon: "wind", brands: ["Caudalie", "Tatcha", "Avène", "La Mer", "Mario Badescu"] },
  { kind: "Sunscreen", category: "Skincare", icon: "sun", brands: ["La Roche-Posay", "Supergoop!", "Beauty of Joseon", "Shiseido", "EltaMD"] },
  { kind: "Cleanser", category: "Skincare", icon: "droplet", brands: ["Fresh", "Tatcha", "Caudalie", "Glossier", "Kiehl's"] },
  { kind: "Toner", category: "Skincare", icon: "droplet", brands: ["Paula's Choice", "Klairs", "Pixi", "Innisfree", "Thayers"] },
  { kind: "Eye Cream", category: "Skincare", icon: "eye", brands: ["La Mer", "Estée Lauder", "Ole Henriksen", "Shiseido", "Kiehl's"] },
  { kind: "Lip Sleeping Mask", category: "Skincare", icon: "moon", brands: ["Laneige", "Fresh", "Tatcha", "Clarins", "Summer Fridays"] },
  { kind: "Face Oil", category: "Skincare", icon: "droplet", brands: ["The Ordinary", "Kiehl's", "Herbivore", "Sunday Riley", "Caudalie"] },
  { kind: "Hand Cream", category: "Skincare", icon: "hand", brands: ["L'Occitane", "Aesop", "Jurlique", "Byredo", "Molton Brown"] },
  { kind: "Body Lotion", category: "Skincare", icon: "sparkles", brands: ["Nuxe", "L'Occitane", "Sol de Janeiro", "Jo Malone", "Jurlique"] },
  { kind: "Perfume", category: "Skincare", icon: "flower", brands: ["Chanel", "Dior", "Jo Malone", "YSL", "Maison Margiela"] },
  { kind: "Mini Perfume Set", category: "Skincare", icon: "gift", brands: ["Dior", "Chanel", "Marc Jacobs", "Jo Malone", "Lancôme"] },

  // Hair
  { kind: "Shampoo", category: "Hair", icon: "droplet", brands: ["Olaplex", "Kérastase", "Moroccanoil", "OUAI", "Aesop"] },
  { kind: "Conditioner", category: "Hair", icon: "droplet", brands: ["Olaplex", "Kérastase", "Moroccanoil", "Davines", "Briogeo"] },
  { kind: "Hair Oil", category: "Hair", icon: "sun", brands: ["Moroccanoil", "Gisou", "Olaplex", "Kérastase", "Verb"] },
  { kind: "Hair Mask", category: "Hair", icon: "cloud", brands: ["Gisou", "Olaplex", "Briogeo", "Kérastase", "Moroccanoil"] },
  { kind: "Hair Perfume", category: "Hair", icon: "flower", brands: ["Gisou", "Sol de Janeiro", "OUAI", "Byredo", "Chanel"] },
  { kind: "Silk Scrunchie", category: "Hair", icon: "circle", brands: ["Slip", "Kitsch", "Emi Jay", "Free People", "Anthropologie"] },
  { kind: "Hair Clip", category: "Hair", icon: "star", brands: ["Emi Jay", "Kitsch", "Valet", "Anthropologie", "Zara"] },

  // Jewelry & Accessories
  { kind: "Necklace", category: "Jewelry & Accessories", icon: "gem", brands: ["Pandora", "Swarovski", "Tiffany & Co.", "Mejuri", "Cartier"] },
  { kind: "Earrings", category: "Jewelry & Accessories", icon: "gem", brands: ["Swarovski", "Pandora", "Mejuri", "Missoma", "Astrid & Miyu"] },
  { kind: "Bracelet", category: "Jewelry & Accessories", icon: "circle", brands: ["Pandora", "Cartier", "Tiffany & Co.", "Swarovski", "Links of London"] },
  { kind: "Ring", category: "Jewelry & Accessories", icon: "gem", brands: ["Pandora", "Mejuri", "Tiffany & Co.", "Swarovski", "Boucheron"] },
  { kind: "Bag Charm", category: "Jewelry & Accessories", icon: "star", brands: ["Kate Spade", "Coach", "Furla", "Longchamp", "Strathberry"] },
  { kind: "Sunglasses", category: "Jewelry & Accessories", icon: "glasses", brands: ["Ray-Ban", "Gucci", "Prada", "Saint Laurent", "Celine"] },
  { kind: "Silk Scarf", category: "Jewelry & Accessories", icon: "shirt", brands: ["Hermès", "Gucci", "Fendi", "Liberty London", "Faliero Sarti"] },
  { kind: "Tote Bag", category: "Jewelry & Accessories", icon: "shopping-bag", brands: ["Longchamp", "Kate Spade", "Coach", "Marc Jacobs", "Tory Burch"] },
  { kind: "Phone Case", category: "Jewelry & Accessories", icon: "smartphone", brands: ["CASETiFY", "Sonix", "BURGA", "Kate Spade", "Wildflower"] },
  { kind: "Keychain", category: "Jewelry & Accessories", icon: "star", brands: ["Coach", "Kate Spade", "Michael Kors", "Furla", "Longchamp"] },
  { kind: "Compact Mirror", category: "Jewelry & Accessories", icon: "circle", brands: ["Estée Lauder", "Swarovski", "Ted Baker", "Fossil", "Dior"] },

  // Treats & Comfort
  { kind: "Scented Candle", category: "Treats & Comfort", icon: "flame", brands: ["Diptyque", "Jo Malone", "Yankee Candle", "Bath & Body Works", "L'Occitane"] },
  { kind: "Chocolate Box", category: "Treats & Comfort", icon: "candy", brands: ["Lindt", "Godiva", "Patchi", "Ferrero Rocher", "Neuhaus"] },
  { kind: "Tea Set", category: "Treats & Comfort", icon: "coffee", brands: ["TWG", "Mariage Frères", "Fortnum & Mason", "Harrods", "Whittard"] },
  { kind: "Plush Bear", category: "Treats & Comfort", icon: "heart", brands: ["Jellycat", "Steiff", "Build-A-Bear", "Aurora", "Warmies"] },
  { kind: "Silk Pillowcase", category: "Treats & Comfort", icon: "moon", brands: ["Slip", "Blissy", "Kitsch", "Lilysilk", "Fishers Finery"] },
  { kind: "Cozy Slippers", category: "Treats & Comfort", icon: "footprints", brands: ["UGG", "EMU Australia", "Vionic", "Dearfoams", "Anthropologie"] },
  { kind: "Bath Bomb Set", category: "Treats & Comfort", icon: "droplet", brands: ["Lush", "Rituals", "L'Occitane", "Herbivore", "Diptyque"] },
];

const VARIANTS: Record<ShopCategory, string[]> = {
  Makeup: ["Velvet", "Rose", "Glam", "Silky", "Dewy", "Luxe", "Golden", "Pearl", "Starlit", "Chérie"],
  Skincare: ["Glow", "Hydra", "Radiance", "Petal", "Cloud", "Silk", "Dew", "Aurora", "Moon", "Velvet"],
  Hair: ["Silk", "Golden", "Moonlit", "Honey", "Cloud", "Velvet", "Pearl", "Radiance", "Dew", "Luxe"],
  "Jewelry & Accessories": ["Étoile", "Lune", "Aurore", "Duchess", "Bijou", "Céleste", "Romance", "Dawn", "Opaline", "Réverie"],
  "Treats & Comfort": ["Cozy", "Dream", "Sweet", "Cocoa", "Lullaby", "Petal", "Cloud", "Honey", "Snug", "Twilight"],
};

/** Deterministic 32-bit string hash (FNV-1a). */
function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Mulberry32 — tiny seeded PRNG, stable across sessions. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const MIN_SHOP_PRICE = 1_000;
export const MAX_SHOP_PRICE = 100_000;

function seededPrice(id: string): number {
  const rand = mulberry32(hashString(`price:${id}`));
  const raw = MIN_SHOP_PRICE + rand() * (MAX_SHOP_PRICE - MIN_SHOP_PRICE);
  // Round to the nearest 500 so prices look intentional on a shelf.
  return Math.max(MIN_SHOP_PRICE, Math.round(raw / 500) * 500);
}

function seededName(kind: string, category: ShopCategory, brandIndex: number): string {
  const variants = VARIANTS[category];
  // Rotate the variant list per archetype so each of its brands gets a
  // different, deterministic name — no collisions within one archetype.
  const offset = hashString(`variant:${kind}`) % variants.length;
  const variant = variants[(offset + brandIndex) % variants.length];
  return `${variant} ${kind}`;
}

let catalogCache: ShopItem[] | null = null;

export function generateShopCatalog(): ShopItem[] {
  if (catalogCache) return catalogCache;
  const items: ShopItem[] = [];
  for (const archetype of ARCHETYPES) {
    archetype.brands.forEach((brand, brandIndex) => {
      const id = `shop-${hashString(`${archetype.kind}:${brand}`).toString(36)}`;
      items.push({
        id,
        kind: archetype.kind,
        brand,
        name: seededName(archetype.kind, archetype.category, brandIndex),
        category: archetype.category,
        icon: archetype.icon,
        price: seededPrice(id),
      });
    });
  }
  catalogCache = items;
  return items;
}

export function getShopItem(id: string): ShopItem | undefined {
  return generateShopCatalog().find((item) => item.id === id);
}

export function shopCatalogSize(): number {
  return generateShopCatalog().length;
}

/** Map boutique categories onto the wishlist's curated categories. */
export function shopCategoryToWishlistCategory(
  category: ShopCategory | undefined,
): string {
  switch (category) {
    case "Jewelry & Accessories":
      return "Fashion";
    case "Treats & Comfort":
      return "Little luxuries";
    case "Makeup":
    case "Skincare":
    case "Hair":
      return "Beauty";
    default:
      return "Other";
  }
}
