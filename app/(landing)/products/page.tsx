// app/products/page.tsx
// import Footer from '@/components/landing/Footer';

import { ProductCard } from '@/components/landing/partial/ProductCard';
import { prisma } from '@/lib/prisma';
import { ProductStatus } from '@/lib/enum/product';
import type { Metadata } from 'next';

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

const ProductPage = async () => {
  let products: Array<{
    id: number;
    slug: string;
    name: string;
    excerpt: string;
    description: string | null;
    keyBenefits: string[];
    price: number;
    salePrice: number | null;
    stock: number;
    images: string[];
    status: ProductStatus;
  }> = [];
  try {
    products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        slug: true,
        name: true,
        excerpt: true,
        description: true,
        keyBenefits: true,
        price: true,
        salePrice: true,
        stock: true,
        images: true,
        status: true
      }
    });
  } catch (err) {
    console.error('Failed to load products (dynamic fallback):', err);
  }

  return (
    <div className='flex min-h-screen flex-col'>
      <main className='flex-grow bg-background py-12 md:pb-16'>
        <div className='mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Header */}
          <h1 className='mb-12 text-4xl font-extrabold text-foreground'>
            Our Products
          </h1>

          {/* Product Grid */}
          <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
            {products
              ?.filter(
                product =>
                  product.status !== 'COMING_SOON' &&
                  product.status !== 'DISCONTINUED'
              )
              ?.map((product, index) => (
                <ProductCard
                  key={index}
                  {...product}
                  image={product.images[0]}
                />
              ))}
          </div>

          <div className='mt-10 flex flex-col gap-5'>
            <h1 className='text-2xl font-semibold'>Coming Soon:</h1>
            <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
              {products
                ?.filter(product => product.status === 'COMING_SOON')
                ?.map((product, index) => (
                  <ProductCard
                    key={index}
                    {...product}
                    image={product.images[0]}
                  />
                ))}
            </div>
          </div>
        </div>
      </main>

      {/* <Footer /> */}
    </div>
  );
};
export default ProductPage;
