import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';

export default function EmptyCartMessage() {
  return (
    <Card className='flex flex-col items-center justify-center space-y-4 p-8 text-center text-muted-foreground'>
      <ShoppingCart className='h-12 w-12 text-gray-400' />
      <h2 className='text-lg font-semibold text-gray-700'>
        No product selected for purchase
      </h2>
      <p className='text-sm text-gray-500'>
        Browse our collection and add items to your cart.
      </p>
      <Link
        href='/products'
        className='hover:bg-primary/90 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition'
      >
        Browse Products
      </Link>
    </Card>
  );
}
