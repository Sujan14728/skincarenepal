import { ProductCardSkeleton } from '@/components/landing/partial/ProductCardSkeleton';

export default function ProductsLoading() {
  return (
    <div className='flex min-h-screen flex-col'>
      <main className='bg-background flex-grow py-12 md:pb-16'>
        <div className='mx-auto px-4 sm:px-6 lg:px-8'>
          <h1 className='text-foreground mb-12 text-4xl font-extrabold'>
            Our Products
          </h1>

          <div className='grid animate-pulse grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
