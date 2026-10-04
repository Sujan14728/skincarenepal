import type { Metadata } from 'next';
import ReviewsView, {
  type ProductRating
} from '@/components/storefront/reviews/ReviewsView';
import {
  getOverallRating,
  getProductRatingStats,
  getPublishedReviews,
  getStorefrontProducts
} from '@/lib/storefront';

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

  const ratings: ProductRating[] = products
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

  return <ReviewsView reviews={reviews} ratings={ratings} overall={overall} />;
}
