import { prisma } from '@/lib/prisma';
import {
  DEFAULT_CONTACT,
  getRoutineIndex,
  getRoutineKey,
  type ContactInfo,
  type PublicReview,
  type StorefrontProduct
} from '@/lib/storefront-utils';

export * from '@/lib/storefront-utils';

/* -------------------------------------------------
   Products
   ------------------------------------------------- */
const storefrontProductSelect = {
  id: true,
  slug: true,
  name: true,
  excerpt: true,
  description: true,
  price: true,
  salePrice: true,
  stock: true,
  images: true,
  status: true,
  keyBenefits: true,
  howToUse: true,
  keyIngredients: true,
  suitableFor: true
} as const;

/** Products ordered by routine step (Cleanse → Protect). */
export async function getStorefrontProducts({
  includeDiscontinued = false
}: { includeDiscontinued?: boolean } = {}): Promise<StorefrontProduct[]> {
  try {
    const [products, stats] = await Promise.all([
      prisma.product.findMany({
        where: includeDiscontinued
          ? undefined
          : { status: { not: 'DISCONTINUED' } },
        orderBy: { createdAt: 'asc' },
        select: storefrontProductSelect
      }),
      getProductRatingStats()
    ]);

    return products
      .map(p => {
        const stat = stats.get(p.id);
        return {
          ...p,
          routineKey: getRoutineKey(p.name),
          rating: stat?.average ?? null,
          reviewCount: stat?.count ?? 0
        };
      })
      .sort(
        (a, b) => getRoutineIndex(a.routineKey) - getRoutineIndex(b.routineKey)
      );
  } catch (err) {
    console.error('Failed to load storefront products:', err);
    return [];
  }
}

/* -------------------------------------------------
   Reviews
   ------------------------------------------------- */
const publicReviewSelect = {
  id: true,
  type: true,
  customerName: true,
  location: true,
  instagramUrl: true,
  rating: true,
  content: true,
  mediaUrl: true,
  thumbnailUrl: true,
  isFeatured: true,
  product: { select: { id: true, name: true, slug: true } }
} as const;

export async function getPublishedReviews(
  options: { take?: number; productId?: number } = {}
): Promise<PublicReview[]> {
  try {
    return await prisma.review.findMany({
      where: {
        isPublished: true,
        ...(options.productId ? { productId: options.productId } : {})
      },
      orderBy: [
        { isFeatured: 'desc' },
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      take: options.take,
      select: publicReviewSelect
    });
  } catch (err) {
    console.error('Failed to load reviews:', err);
    return [];
  }
}

type RatingStat = {
  average: number;
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

/** Average rating, count and star distribution per product. */
export async function getProductRatingStats(): Promise<Map<number, RatingStat>> {
  const stats = new Map<number, RatingStat>();
  try {
    const rows = await prisma.review.groupBy({
      by: ['productId', 'rating'],
      where: { isPublished: true, productId: { not: null } },
      _count: { _all: true }
    });

    for (const row of rows) {
      if (row.productId == null) continue;
      const stat = stats.get(row.productId) ?? {
        average: 0,
        count: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
      const rating = Math.min(5, Math.max(1, row.rating)) as 1 | 2 | 3 | 4 | 5;
      stat.distribution[rating] += row._count._all;
      stat.count += row._count._all;
      stats.set(row.productId, stat);
    }

    for (const stat of stats.values()) {
      const total = (Object.entries(stat.distribution) as [string, number][])
        .map(([star, n]) => Number(star) * n)
        .reduce((a, b) => a + b, 0);
      stat.average = Math.round((total / stat.count) * 10) / 10;
    }
  } catch (err) {
    console.error('Failed to load rating stats:', err);
  }
  return stats;
}

export async function getOverallRating() {
  try {
    const agg = await prisma.review.aggregate({
      where: { isPublished: true },
      _avg: { rating: true },
      _count: { _all: true }
    });
    const count = agg._count._all;
    return {
      count,
      average: count ? Math.round((agg._avg.rating ?? 0) * 10) / 10 : null
    };
  } catch (err) {
    console.error('Failed to load overall rating:', err);
    return { count: 0, average: null };
  }
}

/* -------------------------------------------------
   Company contact info
   ------------------------------------------------- */
export async function getContactInfo(): Promise<ContactInfo> {
  try {
    const info = await prisma.companyInfo.findFirst();
    const emails = info?.companyEmails?.filter(Boolean) ?? [];
    const phones = info?.companyPhones?.filter(Boolean) ?? [];
    const supportEmail =
      emails.find(e => /support|help|care@/i.test(e)) ??
      emails[0] ??
      DEFAULT_CONTACT.supportEmail;
    return {
      supportEmail,
      generalEmail: emails.find(e => e !== supportEmail) ?? supportEmail,
      phone: phones[0] ?? DEFAULT_CONTACT.phone,
      location: info?.companyLocation || DEFAULT_CONTACT.location
    };
  } catch (err) {
    console.error('Failed to load company info:', err);
    return DEFAULT_CONTACT;
  }
}

