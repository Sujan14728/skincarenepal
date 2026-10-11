// Pure storefront helpers — safe to import from client components.

/** Brand photography from the MagicPath designs (public/images/design). */
export const DESIGN_IMAGES = {
  heroCollection: '/images/design/hero-collection.jpg',
  flatLay: '/images/design/flat-lay.jpg',
  aloeModel: '/images/design/aloe-model.jpg',
  moisturizerModel: '/images/design/moisturizer-model.jpg',
  sunscreenModel: '/images/design/sunscreen-model.jpg'
};

/* -------------------------------------------------
   Routine steps
   Products have no category column, so the routine step
   is derived from the product name.
   ------------------------------------------------- */
export const ROUTINE_STEPS = [
  { key: 'CLEANSE', label: 'Cleanse' },
  { key: 'TREAT', label: 'Treat' },
  { key: 'SOOTHE', label: 'Soothe' },
  { key: 'HYDRATE', label: 'Hydrate' },
  { key: 'PROTECT', label: 'Protect' }
] as const;

/** Bundles (e.g. the Combo Set) sit outside the routine steps. */
export type RoutineKey =
  | (typeof ROUTINE_STEPS)[number]['key']
  | 'COMBO'
  | 'CARE';

/** One photoshoot image per routine step, for routine sliders. */
export const STEP_PHOTOS: Record<string, string> = {
  CLEANSE: DESIGN_IMAGES.heroCollection,
  TREAT: DESIGN_IMAGES.flatLay,
  SOOTHE: DESIGN_IMAGES.aloeModel,
  HYDRATE: DESIGN_IMAGES.moisturizerModel,
  PROTECT: DESIGN_IMAGES.sunscreenModel
};

/** What each routine step does, in a line. */
export const STEP_TAGLINES: Record<string, string> = {
  CLEANSE: 'Start fresh — lift away dirt, oil and the day.',
  TREAT: 'A weekly ritual that scrubs, brightens and refines.',
  SOOTHE: 'Calm and cool your skin with pure aloe.',
  HYDRATE: 'Lock in lightweight, all-day moisture.',
  PROTECT: 'Shield your skin from the sun, every single morning.'
};

// Checked in this order, so "Sunscreen Gel" resolves to PROTECT, not SOOTHE.
const STEP_MATCHERS: { key: RoutineKey; pattern: RegExp }[] = [
  { key: 'COMBO', pattern: /combo|bundle|\bkit\b|\bset\b/i },
  { key: 'PROTECT', pattern: /sun\s*screen|sunblock|spf/i },
  { key: 'CLEANSE', pattern: /face\s*wash|facewash|cleans|wash/i },
  { key: 'TREAT', pattern: /pack|mask|scrub|serum|treat/i },
  { key: 'SOOTHE', pattern: /aloe|sooth|gel/i },
  { key: 'HYDRATE', pattern: /moistur|cream|lotion|hydrat/i }
];

export function getRoutineKey(name: string): RoutineKey {
  return STEP_MATCHERS.find(m => m.pattern.test(name))?.key ?? 'CARE';
}

export function getRoutineIndex(key: RoutineKey) {
  // Bundles lead every listing: they are the best value.
  if (key === 'COMBO') return -1;
  const index = ROUTINE_STEPS.findIndex(s => s.key === key);
  return index === -1 ? ROUTINE_STEPS.length : index;
}

export function getRoutineLabel(key: RoutineKey) {
  if (key === 'COMBO') return 'Combo';
  return ROUTINE_STEPS.find(s => s.key === key)?.label ?? 'Care';
}

/**
 * Product name for promotional copy (routine, reviews, home): we never
 * highlight pack sizes there, so "Aloe-Vera Gel 200Gram" → "Aloe-Vera Gel".
 */
export function displayName(name: string) {
  return name
    .replace(
      /\s*\(?\d+(\.\d+)?\s*(g|gm|gms|gram|grams|ml|mls|kg|l)\b\.?\)?/gi,
      ''
    )
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/* -------------------------------------------------
   Formatting helpers
   ------------------------------------------------- */
export function formatPrice(value: number) {
  return `Rs. ${value.toLocaleString('en-IN')}`;
}

export function stripHtml(html?: string | null) {
  if (!html) return '';
  return html
    .replace(/<(br|\/p|\/li|\/h\d)\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export function initials(name: string) {
  return name
    .replace(/[^\p{L}\s]/gu, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]!.toUpperCase())
    .join('');
}

export type StorefrontProduct = {
  id: number;
  slug: string;
  name: string;
  excerpt: string;
  description: string | null;
  price: number;
  salePrice: number | null;
  stock: number;
  images: string[];
  status: string;
  keyBenefits: string[];
  howToUse: string[];
  keyIngredients: string[];
  suitableFor: string[];
  routineKey: RoutineKey;
  rating: number | null;
  reviewCount: number;
};

/** The first bundle product (the Combo Set), if any. */
export function pickCombo(products: StorefrontProduct[]) {
  return products.find(p => p.routineKey === 'COMBO') ?? null;
}

/** One product per routine step, in step order. */
export function pickRoutine(products: StorefrontProduct[]) {
  const seen = new Set<RoutineKey>();
  return products.filter(p => {
    if (p.routineKey === 'CARE' || p.routineKey === 'COMBO') return false;
    if (seen.has(p.routineKey)) return false;
    seen.add(p.routineKey);
    return true;
  });
}

export function effectivePrice(p: {
  price: number;
  salePrice?: number | null;
}) {
  return p.salePrice && p.salePrice < p.price ? p.salePrice : p.price;
}

export function isPurchasable(p: { status: string }) {
  return p.status === 'IN_STOCK';
}

export type PublicReview = {
  id: number;
  type: 'TEXT' | 'IMAGE' | 'VIDEO';
  customerName: string;
  location: string | null;
  instagramUrl: string | null;
  rating: number;
  content: string | null;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  isFeatured: boolean;
  product: { id: number; name: string; slug: string } | null;
};

export const DEFAULT_CONTACT = {
  supportEmail: 'info@careandcleannp.com',
  generalEmail: 'info@careandcleannp.com',
  phone: '+977 9801753033',
  location: 'Dhangadhi-3, Kailali, Nepal'
};

export type ContactInfo = {
  supportEmail: string;
  generalEmail: string;
  phone: string;
  location: string;
};

export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/careandclean_nepal/',
  instagramHandle: 'careandclean_nepal',
  facebook: 'https://www.facebook.com/careandcleannepal',
  tiktok: 'https://www.tiktok.com/@careandcleannepal',
  whatsapp: 'https://wa.me/9779801753033'
};
