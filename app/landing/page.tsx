import HomeView from '@/components/storefront/home/HomeView';
import ClientPopup from '@/components/landing/ClientPopup';
import {
  getContactInfo,
  getOverallRating,
  getStorefrontProducts,
  pickCombo,
  pickRoutine
} from '@/lib/storefront';
import { getHomeFaqs } from '@/lib/faqs';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [products, rating, contact] = await Promise.all([
    getStorefrontProducts(),
    getOverallRating(),
    getContactInfo()
  ]);

  return (
    <>
      <HomeView
        products={products}
        combo={pickCombo(products)}
        routine={pickRoutine(products)}
        rating={rating}
        contact={contact}
        faqs={getHomeFaqs(contact)}
      />
      <ClientPopup />
    </>
  );
}
