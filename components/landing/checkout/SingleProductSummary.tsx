'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/types/product';
import { ICartItem } from '@/lib/types/cart';
import { Loader2, Plus, Minus } from 'lucide-react';
import { Dispatch, SetStateAction, useMemo } from 'react';

interface SingleProductSummaryProps {
  singleProduct: Product | null;
  singleQty: number;
  setSingleQty: Dispatch<SetStateAction<number>>;
  setCartItems: Dispatch<SetStateAction<ICartItem[]>>;
  loadingProduct: boolean;
}

export default function SingleProductSummary({
  singleProduct,
  singleQty,
  setSingleQty,
  setCartItems,
  loadingProduct
}: SingleProductSummaryProps) {
  // Compute subtotal and delivery
  const deliveryCost = useMemo(() => 100, []); // You can make this dynamic via props later
  const subtotal = useMemo(() => {
    if (!singleProduct) return 0;
    const price = singleProduct.salePrice ?? singleProduct.price;
    return price * singleQty;
  }, [singleProduct, singleQty]);

  const total = subtotal + deliveryCost;

  const handleQtyChange = (delta: number) => {
    const newQty = Math.max(1, singleQty + delta);
    setSingleQty(newQty);
    if (singleProduct) {
      setCartItems([
        {
          id: singleProduct.id,
          name: singleProduct.name,
          image:
            Array.isArray(singleProduct.images) && singleProduct.images[0]
              ? singleProduct.images[0]
              : '',
          price: singleProduct.price,
          salePrice: singleProduct.salePrice ?? null,
          quantity: newQty
        }
      ]);
    }
  };

  if (loadingProduct)
    return (
      <Card className='flex items-center justify-center p-6'>
        <Loader2 className='text-muted-foreground animate-spin' size={28} />
      </Card>
    );

  if (!singleProduct)
    return (
      <Card className='text-muted-foreground p-6 text-center'>
        Product not found.
      </Card>
    );

  return (
    <Card className='overflow-hidden py-2 shadow-sm'>
      <CardHeader className='border-b !py-0'>
        <CardTitle className='text-lg font-semibold'>Order Summary</CardTitle>
      </CardHeader>

      <CardContent className='space-y-2 px-4'>
        <div className='flex gap-4'>
          <div className='relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border'>
            {singleProduct.images?.[0] ? (
              <Image
                src={singleProduct.images[0]}
                alt={singleProduct.name}
                fill
                className='object-cover'
              />
            ) : (
              <div className='text-muted-foreground flex h-full items-center justify-center text-sm'>
                No Image
              </div>
            )}
          </div>

          <div className='flex flex-col justify-between'>
            <div>
              <p className='text-base font-medium'>{singleProduct.name}</p>
              <p className='text-muted-foreground text-sm'>{'Product'}</p>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                size='icon'
                variant='outline'
                onClick={() => handleQtyChange(-1)}
              >
                <Minus size={14} />
              </Button>
              <span className='min-w-[32px] text-center text-sm font-medium'>
                {singleQty}
              </span>
              <Button
                size='icon'
                variant='outline'
                onClick={() => handleQtyChange(1)}
              >
                <Plus size={14} />
              </Button>
            </div>
          </div>
        </div>

        <div className='space-y-2 border-t pt-3 text-sm'>
          <div className='flex justify-between'>
            <span>Subtotal</span>
            <span className='font-medium'>
              Rs. {(subtotal || 0).toLocaleString()}
            </span>
          </div>
          <div className='flex justify-between'>
            <span>Delivery</span>
            <span className='font-medium'>
              {deliveryCost === 0 ? 'Free' : `Rs. ${deliveryCost}`}
            </span>
          </div>
          <div className='flex justify-between border-t pt-2 text-base font-semibold'>
            <span>Total</span>
            <span>Rs. {total.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
