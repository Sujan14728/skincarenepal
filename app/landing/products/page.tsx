import type { Metadata } from 'next';
import ProductsListView from '@/components/storefront/products/ProductsListView';
import { getStorefrontProducts } from '@/lib/storefront';
import { pickRoutine } from '@/lib/storefront-utils';

// Force dynamic rendering to avoid failing static prerender in CI when DB is unreachable
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Products',
  description:
    'Browse our collection of natural and organic skincare products in Nepal.',
  alternates: { canonical: '/products' },
  openGraph: {
    type: 'website',
    url: 'https://careandcleannp.com/products',
    title: 'Products | Care And Clean Nepal',
    description:
      'Browse our collection of natural and organic skincare products in Nepal.'
  }
};

export default async function ProductPage() {
  const products = await getStorefrontProducts();
  return (
    <ProductsListView products={products} routine={pickRoutine(products)} />
  );
}
