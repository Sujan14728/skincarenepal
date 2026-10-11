import type { Metadata } from 'next';
import ReviewsView, {
  type ProductRating,
  type ReviewGroup
} from '@/components/storefront/reviews/ReviewsView';
import {
  getOverallRating,
  getProductRatingStats,
  getPublishedReviews,
  getStorefrontProducts,
  displayName,
  getRoutineLabel,
  type RoutineKey
} from '@/lib/storefront';

/** Review sections follow the product line-up: combo first, aloe gel last. */
const REVIEW_ORDER: RoutineKey[] = [
  'COMBO',
  'TREAT',
  'CLEANSE',
  'HYDRATE',
  'PROTECT',
  'SOOTHE',
  'CARE'
];
const reviewRank = (key: RoutineKey) => REVIEW_ORDER.indexOf(key);

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Customer Reviews',
  description:
    'Real reviews, photos and videos from Care And Clean customers across Nepal.',
  alternates: { canonical: '/reviews' },
  openGraph: {
    type: 'website',
    url: 'https://careandcleannp.com/reviews',
    title: 'Customer Reviews | Care And Clean Nepal',
    description:
      'Real reviews, photos and videos from Care And Clean customers across Nepal.'
  }
};

export default async function ReviewsPage() {
  const [reviews, stats, overall, products] = await Promise.all([
    getPublishedReviews(),
    getProductRatingStats(),
    getOverallRating(),
    getStorefrontProducts()
  ]);

  const ordered = [...products].sort(
    (a, b) => reviewRank(a.routineKey) - reviewRank(b.routineKey)
  );

  const groups: ReviewGroup[] = ordered
    .map(p => {
      const stat = stats.get(p.id);
      return {
        key: p.slug,
        title: displayName(p.name),
        eyebrow:
          p.routineKey === 'COMBO'
            ? 'BESTSELLER'
            : getRoutineLabel(p.routineKey).toUpperCase(),
        slug: p.slug,
        rating: stat ? { score: stat.average, count: stat.count } : null,
        reviews: reviews.filter(r => r.product?.id === p.id)
      };
    })
    .filter(g => g.reviews.length > 0);

  // Reviews not tied to a product are social highlights ("From our DMs").
  const dms = reviews.filter(r => !r.product);

  const ratings: ProductRating[] = ordered
    .filter(p => stats.has(p.id))
    .map(p => {
      const stat = stats.get(p.id)!;
      return {
        productId: p.id,
        product: p.name,
        score: stat.average,
        count: stat.count,
        distribution: stat.distribution
      };
    });

  return (
    <ReviewsView
      reviews={reviews}
      groups={groups}
      dms={dms}
      ratings={ratings}
      overall={overall}
    />
  );
}
