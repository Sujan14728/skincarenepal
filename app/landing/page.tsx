import HomeView from '@/components/storefront/home/HomeView';
import ClientPopup from '@/components/landing/ClientPopup';
import {
  getContactInfo,
  getOverallRating,
  getPublishedReviews,
  getStorefrontProducts,
  pickRoutine
} from '@/lib/storefront';
import { getHomeFaqs } from '@/lib/faqs';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [products, reviews, rating, contact] = await Promise.all([
    getStorefrontProducts(),
    getPublishedReviews({ take: 6 }),
    getOverallRating(),
    getContactInfo()
  ]);

  return (
    <>
      <HomeView
        products={products}
        routine={pickRoutine(products)}
        reviews={reviews}
        rating={rating}
        contact={contact}
        faqs={getHomeFaqs(contact)}
      />
      <ClientPopup />
    </>
  );
}
