import type { Metadata } from 'next';
import BundleView from '@/components/storefront/bundle/BundleView';
import { getProductFaqs } from '@/lib/faqs';
import {
  getPublishedReviews,
  getStorefrontProducts,
  pickCombo,
  pickRoutine
} from '@/lib/storefront';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'The Complete Routine Combo',
  description:
    'Every step of the Care & Clean herbal skincare routine in one combo set — Face Wash, 2-in-1 Face Pack, Aloe Vera Gel, Moisturizer and Sunscreen.',
  alternates: { canonical: '/routine' },
  openGraph: {
    type: 'website',
    url: 'https://careandcleannp.com/routine',
    title: 'The Complete Routine Combo | Care And Clean Nepal',
    description:
      'Every step of the Care & Clean herbal skincare routine in one combo set.'
  }
};

/**
 * "Shop the Full Routine" lands here. The combo is the bundle product and the
 * routine steps are what it contains; a future bundle can reuse BundleView
 * with its own product and items.
 */
export default async function RoutinePage() {
  const products = await getStorefrontProducts();
  const combo = pickCombo(products);
  const reviews = combo
    ? await getPublishedReviews({ productId: combo.id, take: 3 })
    : [];

  return (
    <BundleView
      bundle={combo}
      items={pickRoutine(products)}
      reviews={reviews.filter(r => r.content)}
      faqs={getProductFaqs('COMBO')}
    />
  );
}
