'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/types/product';
import { ICartItem } from '@/lib/types/cart';
import { Loader2, Plus, Minus } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { DraftOrder } from '@/components/landing/checkout';
interface SingleProductSummaryProps {
  singleProduct: Product | null;
  singleQty: number;
  setSingleQty: Dispatch<SetStateAction<number>>;
  setCartItems: Dispatch<SetStateAction<ICartItem[]>>;
  loadingProduct: boolean;
  deliveryCost?: number;
  appliedCoupon: {
    code: string;
    discountAmount: number;
    isPercentage: boolean;
  } | null;
  setAppliedCoupon: Dispatch<
    SetStateAction<{
      code: string;
      discountAmount: number;
      isPercentage: boolean;
    } | null>
  >;
  draft: DraftOrder | null;
  setDraft: Dispatch<SetStateAction<DraftOrder | null>>;
}

export default function SingleProductSummary({
  singleProduct,
  singleQty,
  setSingleQty,
  setCartItems,
  loadingProduct,
  deliveryCost = 100,
  appliedCoupon,
  setAppliedCoupon,
  draft,
  setDraft
}: SingleProductSummaryProps) {
  const [couponCode, setCouponCode] = useState('');

  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Compute subtotal and delivery
  const subtotal = useMemo(() => {
    if (!singleProduct) return 0;
    return (singleProduct.salePrice ?? singleProduct.price) * singleQty;
  }, [singleProduct, singleQty]);

  const total = useMemo(() => {
    if (!appliedCoupon) return subtotal + deliveryCost;
    // discountAmount is already calculated by the API
    const discount = appliedCoupon.discountAmount || 0;
    return subtotal + deliveryCost - discount;
  }, [subtotal, deliveryCost, appliedCoupon]);

  useEffect(() => {
    if (!singleProduct) return;
    let aborted = false;
    const controller = new AbortController();
    const createOrUpdateDraft = async () => {
      try {
        const res = await fetch('/api/orders/create-draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            items: [
              {
                productId: singleProduct.id,
                quantity: singleQty,
                price: singleProduct.salePrice ?? singleProduct.price,
                name: singleProduct.name
              }
            ],
            subtotal,
            shipping: deliveryCost || 0
          })
        });
        if (!res.ok) throw new Error('Failed to create draft');
        const data = await res.json();
        if (!aborted) setDraft(data); // data contains orderId + placementToken + totals
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('Draft creation error:', err);
      }
    };

    // Debounce to avoid creating drafts on rapid qty changes
    const t = setTimeout(createOrUpdateDraft, 250);
    return () => {
      aborted = true;
      controller.abort();
      clearTimeout(t);
    };
  }, [singleProduct, singleQty, subtotal, deliveryCost, setDraft]);

  const handleQtyChange = (delta: number) => {
    const newQty = Math.max(1, singleQty + delta);
    setSingleQty(newQty);

    // reset coupon because subtotal changed
    if (appliedCoupon) setAppliedCoupon(null);

    if (singleProduct) {
      setCartItems([
        {
          id: singleProduct.id,
          name: singleProduct.name,
          image: singleProduct.images?.[0] || '',
          price: singleProduct.price,
          salePrice: singleProduct.salePrice ?? null,
          quantity: newQty
        }
      ]);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode || !draft) {
      toast.error('Please add product before applying coupon');
      return;
    }
    setApplyingCoupon(true);
    try {
      // send draft token so server can validate and attach coupon to draft
      const res = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          couponCode,
          draftToken: draft.placementToken
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to apply coupon');

      setAppliedCoupon({
        code: data.code,
        discountAmount: data.discountAmount,
        isPercentage: data.isPercentage
      });
      // server should return updated totals - you can update draft if returned
      if (data.draft) setDraft(data.draft);
      toast.success(`Coupon "${couponCode}" applied!`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || 'Invalid coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  if (loadingProduct)
    return (
      <Card className='flex items-center justify-center p-6'>
        <Loader2 className='animate-spin text-muted-foreground' size={28} />
      </Card>
    );

  if (!singleProduct)
    return (
      <Card className='p-6 text-center text-muted-foreground'>
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
              <div className='flex h-full items-center justify-center text-sm text-muted-foreground'>
                No Image
              </div>
            )}
          </div>

          <div className='flex flex-col justify-between'>
            <div>
              <p className='text-base font-medium'>{singleProduct.name}</p>
              <p className='text-sm text-muted-foreground'>{'Product'}</p>
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
          {appliedCoupon && (
            <div className='flex justify-between text-sm text-green-600'>
              <span>Discount ({appliedCoupon.code})</span>
              <span>Rs. {appliedCoupon.discountAmount.toLocaleString()}</span>
            </div>
          )}
          <div className='flex justify-between border-t pt-2 text-base font-semibold'>
            <span>Total</span>
            <span>Rs. {total.toLocaleString()}</span>
          </div>
        </div>

        <div className='mt-2 flex gap-2'>
          <Input
            placeholder='Enter coupon code'
            value={couponCode}
            onChange={e => setCouponCode(e.target.value)}
            disabled={applyingCoupon || !!appliedCoupon}
          />
          <Button
            onClick={handleApplyCoupon}
            disabled={applyingCoupon || !!appliedCoupon}
          >
            {applyingCoupon ? (
              <Loader2 className='animate-spin' size={16} />
            ) : (
              'Apply'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
