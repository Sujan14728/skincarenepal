'use client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCheckout } from '@/hooks/useCheckout';
import { useCustomerForm } from '@/hooks/useCustomerForm';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import CustomerDetails from './CustomerDetails';
import PaymentSection from './PaymentSection';
import SingleProductSummary from './SingleProductSummary';
import { useState } from 'react';

export interface DraftOrder {
  orderId: number;
  placementToken: string;
}

export default function CheckoutClient() {
  const search = useSearchParams();
  const buyParam = search?.get('buy');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    isPercentage: boolean;
  } | null>(null);
  const [draft, setDraft] = useState<DraftOrder | null>(null);
  const {
    settings,
    cartItems,
    setCartItems,
    singleProductMode,
    singleProduct,
    singleQty,
    setSingleQty,
    loadingProduct,
    isDeliveryFree
  } = useCheckout(buyParam);

  const customerForm = useCustomerForm(cartItems);

  const placeOrder = async () => {
    if (!customerForm.isFormValid(cartItems)) return;

    try {
      customerForm.setPlacing(true);

      // 1. Create draft if not exists
      let draftOrder = draft;
      if (!draftOrder) {
        const draftRes = await fetch('/api/orders/create-draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cartItems.map(i => ({
              productId: i.id,
              quantity: i.quantity,
              price: i.salePrice ?? i.price,
              name: i.name
            })),
            subtotal: cartItems.reduce(
              (sum, i) => sum + (i.salePrice ?? i.price) * i.quantity,
              0
            ),
            shipping: isDeliveryFree ? 0 : settings?.deliveryCost || 0
          })
        });

        if (!draftRes.ok) throw new Error('Failed to create draft order');
        draftOrder = await draftRes.json();
        setDraft(draftOrder);
      }

      // 2. Upload payment slip if ONLINE
      let paymentSlipUrl: string | undefined;
      if (
        customerForm.paymentImage &&
        customerForm.paymentMethod === 'ONLINE'
      ) {
        const form = new FormData();
        form.append('file', customerForm.paymentImage);
        const uploadRes = await fetch('/api/media/upload', {
          method: 'POST',
          body: form
        });
        if (!uploadRes.ok) throw new Error('Upload failed');
        const { url } = await uploadRes.json();
        paymentSlipUrl = url;
      }

      console.log('Placing order with draft token:', draftOrder);

      // 3. Confirm order - send draft token and coupon info (if any)
      const confirmRes = await fetch('/api/orders/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: draftOrder?.placementToken,
          userId: null,
          email: customerForm.email || null,
          name: customerForm.name || null,
          phone: customerForm.phone || null,
          shippingAddress: customerForm.shippingAddress,
          note: customerForm.note || null,
          paymentMethod: customerForm.paymentMethod || 'COD',
          paymentSlipUrl: paymentSlipUrl || null,
          coupon: appliedCoupon
            ? {
                code: appliedCoupon.code,
                discountAmount: appliedCoupon.discountAmount,
                isPercentage: appliedCoupon.isPercentage
              }
            : null
        })
      });

      if (!confirmRes.ok) throw new Error('Failed to place order');

      toast.success(
        'Order placed successfully. Please check your email for confirmation.'
      );

      // Clear cart and draft
      setCartItems([]);
      setDraft(null);

      if (singleProductMode) window.history.replaceState({}, '', '/checkout');
    } catch (err) {
      console.error(err);
      toast.error('Failed to place order');
    } finally {
      customerForm.setPlacing(false);
    }
  };

  return (
    <div className='mx-auto max-w-4xl space-y-6 p-4'>
      <h1 className='text-2xl font-semibold'>Checkout</h1>
      <div className='grid gap-6 md:grid-cols-2'>
        <div className='flex flex-col gap-4'>
          {singleProductMode && (
            <SingleProductSummary
              singleProduct={singleProduct}
              singleQty={singleQty}
              setSingleQty={setSingleQty}
              setCartItems={setCartItems}
              loadingProduct={loadingProduct}
              deliveryCost={isDeliveryFree ? 0 : settings?.deliveryCost}
              appliedCoupon={appliedCoupon}
              setAppliedCoupon={setAppliedCoupon}
              draft={draft}
              setDraft={setDraft}
            />
          )}
          {customerForm.paymentMethod === 'ONLINE' && (
            <PaymentSection settings={settings} />
          )}
        </div>

        <Card className='px-4'>
          <CustomerDetails {...customerForm} />
          <Button
            className='mt-4 w-full'
            onClick={placeOrder}
            disabled={customerForm.placing}
          >
            {customerForm.placing ? 'Placing Order...' : 'Place Order'}
          </Button>
        </Card>
      </div>
    </div>
  );
}
