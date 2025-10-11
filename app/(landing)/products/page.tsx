// app/products/page.tsx
import Footer from '@/components/landing/Footer';
import { ProductCard } from '@/components/landing/partial/ProductCard';

// NOTE: CategoryFilter and Search are removed as requested.

// Mock Data (Enhanced to include Key Benefits)
const mockProducts = [
  {
    id: 1,
    image: '/images/products/facepack.jpg',
    title: 'Himalayan Rose Face Cream',
    description:
      'Luxurious face cream enriched with Himalayan rose extracts and natural botanicals for deep hydration and...',
    salePrice: 1250,
    price: 1650,
    keyBenefits: ['Deep hydration', 'Anti-aging properties']
  },
  {
    id: 2,
    image: '/images/products/facepack.jpg',
    title: 'Turmeric Glow Serum',
    description:
      'Powerful brightening serum with turmeric and saffron for even skin tone and luminous complexion.',
    salePrice: 1850,
    price: 2300,
    keyBenefits: ['Brightens skin', 'Reduces dark spots']
  }
];

export default function ProductPage() {
  return (
    <div className='flex min-h-screen flex-col'>
      <main className='bg-background flex-grow py-12 md:pb-16'>
        <div className='mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Header */}
          <h1 className='text-foreground mb-12 text-4xl font-extrabold'>
            Our Products
          </h1>

          {/* Product Grid */}
          <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
            {mockProducts.map((product, index) => (
              <ProductCard key={index} {...product} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
