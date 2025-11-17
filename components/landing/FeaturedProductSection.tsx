// components/FeaturedProductsSection.tsx
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductCard } from './partial/ProductCard';
import { useEffect, useState } from 'react';
import { ProductCardSkeleton } from './partial/ProductCardSkeleton';
import { Product } from '@prisma/client';

export function FeaturedProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    // Fetch featured/top products; API already includes IN_STOCK and COMING_SOON
    fetch('/api/products/top?limit=3')
      .then(res => res.json())
      .then(topData => {
        if (!mounted) return;
        if (topData && Array.isArray(topData.data)) {
          const productsWithOrders: {
            product: Product | null;
            totalOrdered: number;
          }[] = topData.data;
          const items = productsWithOrders
            .map(d => d.product)
            .filter((p): p is Product => !!p);
          setProducts(items);
        } else {
          setProducts([]);
        }
      })
      .catch(() => setProducts([]))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);
  return (
    <section className='bg-secondary/10 py-16 md:py-24'>
      <div className='mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8'>
        <div className='mb-12'>
          <h2 className='mb-2 text-4xl font-bold text-foreground'>
            Featured Products
          </h2>
          <p className='text-lg text-muted-foreground'>
            Discover our bestselling natural skincare collection
          </p>
        </div>

        <div className='mb-12 grid grid-cols-1 gap-8 md:grid-cols-3'>
          {loading
            ? [...Array(3)].map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((product, index) => (
                <ProductCard
                  key={index}
                  {...product}
                  slug={product.slug}
                  image={
                    product.images[0] || '/images/products/placeholder.jpg'
                  }
                />
              ))}
        </div>

        {/* Coming Soon products are included within the top list; no separate section */}

        <Button size='lg' asChild className='shadow-lg hover:shadow-xl'>
          <Link href='/products'>View All Products</Link>
        </Button>
      </div>
    </section>
  );
}
