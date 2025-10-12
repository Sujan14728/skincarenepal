// components/FeaturedProductsSection.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductCard } from './partial/ProductCard';

const mockProducts = [
  {
    id: 1,
    slug: 'himalayan-rose-face-cream',
    excerpt:" Luxurious face cream enriched with Himalayan rose extracts and natural botanicals for deep hydration and a glowing complexion.",
    image: '/images/products/facepack.jpg',
    name: 'Himalayan Rose Face Cream',
    description:
      'Luxurious face cream enriched with Himalayan rose extracts and natural botanicals for deep hydration and a glowing complexion.',
    salePrice: 1250,
    price: 1650
  },
  {
    id: 2,
    slug: 'himalayan-rose-face-cream',
    excerpt:" Luxurious face cream enriched with Himalayan rose extracts and natural botanicals for deep hydration and a glowing complexion.",
    image: '/images/products/facepack.jpg',
    name: 'Himalayan Rose Face Cream',
    description:
      'Luxurious face cream enriched with Himalayan rose extracts and natural botanicals for deep hydration and a glowing complexion.',
    salePrice: 1250,
    price: 1650
  },
  {
    id: 3,
    slug: 'himalayan-rose-face-cream',
    excerpt:" Luxurious face cream enriched with Himalayan rose extracts and natural botanicals for deep hydration and a glowing complexion.",
    image: '/images/products/facepack.jpg',
    name: 'Himalayan Rose Face Cream',
    description:
      'Luxurious face cream enriched with Himalayan rose extracts and natural botanicals for deep hydration and a glowing complexion.',
    salePrice: 1250,
    price: 1650
  }
];

export function FeaturedProductsSection() {
  return (
    <section className='bg-secondary/10 py-16 md:py-24'>
      <div className='mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8'>
        <div className='mb-12'>
          <h2 className='text-foreground mb-2 text-4xl font-bold'>
            Featured Products
          </h2>
          <p className='text-muted-foreground text-lg'>
            Discover our bestselling natural skincare collection
          </p>
        </div>

        <div className='mb-12 grid grid-cols-1 gap-8 md:grid-cols-3'>
          {mockProducts.map((product, index) => (
            <ProductCard key={index} {...product} slug={product.slug} />
          ))}
        </div>

        <Button size='lg' asChild className='shadow-lg hover:shadow-xl'>
          <Link href='/products'>View All Products</Link>
        </Button>
      </div>
    </section>
  );
}
