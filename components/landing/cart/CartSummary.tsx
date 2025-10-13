'use client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ICartTotals } from '@/lib/types/cart';
import {
  formatCurrency,
  FREE_SHIPPING_THRESHOLD
} from '@/lib/utils/cart-utils';
import Link from 'next/link';

interface CartSummaryProps {
  totals: ICartTotals;
}

const CartSummary: React.FC<CartSummaryProps> = ({ totals }) => {
  return (
    <Card className='sticky top-4 flex flex-col space-y-0 p-4'>
      <h2 className='text-foreground border-border mb-2 border-b pb-3 text-xl font-bold'>
        Order Summary
      </h2>

      <div className='space-y-2'>
        <div className='flex justify-between text-base'>
          <span className='text-muted-foreground'>Subtotal</span>
          <span className='text-foreground font-medium'>
            {formatCurrency(totals.subtotal)}
          </span>
        </div>
        <div className='flex justify-between text-base'>
          <span className='text-muted-foreground'>Shipping</span>
          <span
            className={`font-medium ${totals.isFreeShipping ? 'text-primary' : 'text-foreground'}`}
          >
            {totals.isFreeShipping ? 'FREE' : formatCurrency(totals.shipping)}
          </span>
        </div>
        <div className='border-border flex justify-between border-t pt-4 text-xl font-bold'>
          <span>Total</span>
          <span>{formatCurrency(totals.total)}</span>
        </div>
      </div>

      {/* Free Shipping Message */}
      {totals.subtotal < FREE_SHIPPING_THRESHOLD && (
        <p className='text-primary bg-primary/10 rounded-lg p-2 text-center text-sm font-medium'>
          Add {formatCurrency(totals.remainingForFreeShipping)} more for FREE
          shipping! 📦
        </p>
      )}
      {totals.isFreeShipping && (
        <p className='rounded-lg bg-green-600/10 p-2 text-center text-sm font-medium text-green-600'>
          Hooray! Your order qualifies for FREE shipping! 🎉
        </p>
      )}

      <Button variant='default' className='h-12 w-full text-lg'>
        Proceed to Checkout
      </Button>
      <Link href={'/products'} className='w-full'>
        <Button
          variant='secondary'
          className='bg-muted/80 hover:bg-muted text-foreground h-12 w-full cursor-pointer'
        >
          Continue Shopping
        </Button>
      </Link>
    </Card>
  );
};

export default CartSummary;
