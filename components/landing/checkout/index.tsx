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
import EmptyCartMessage from '../partial/EmptyCart';

export default function CheckoutClient() {
  const search = useSearchParams();
  const buyParam = search?.get('buy');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    isPercentage: boolean;
  } | null>(null);
  const {
    settings,
    cartItems,
    setCartItems,
    singleProductMode,
    singleProduct,
    singleQty,
    setSingleQty,
    setSingleProductMode,
    setSingleProduct,
    loadingProduct,
    isDeliveryFree
  } = useCheckout(buyParam);

  const customerForm = useCustomerForm(cartItems);

  const placeOrder = async () => {
    if (!cartItems || cartItems.length === 0) {
      toast.error('Your cart is empty. Please add items to place an order.');
      customerForm.setPlacing(false);
      return;
    }
    if (!(await customerForm.isFormValid())) return;

    try {
      customerForm.setPlacing(true);

      // 1. Upload payment slip if ONLINE
      let paymentSlipUrl: string | undefined;
      const paymentMethod = customerForm.form.getValues('paymentMethod');
      if (customerForm.paymentImage && paymentMethod === 'ONLINE') {
        toast.loading('Uploading payment slip...', { id: 'order-progress' });
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

      toast.loading('Placing order...', { id: 'order-progress' });
      const values = customerForm.form.getValues();
      const payload = {
        items: cartItems.map(i => ({ productId: i.id, quantity: i.quantity })),
        shipping: isDeliveryFree ? 0 : settings?.deliveryCost || 0,
        coupon: appliedCoupon ? { code: appliedCoupon.code } : null,
        shippingAddress: values.shippingAddress,
        note: values.note || null,
        paymentMethod: values.paymentMethod || 'COD',
        paymentSlipUrl: paymentSlipUrl || null,
        email: values.email || null,
        name: values.name || null,
        phone: values.phone || null
      };

      const confirmRes = await fetch('/api/orders/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await confirmRes.json();
      if (!confirmRes.ok)
        throw new Error(data?.error || 'Failed to place order');

      toast.success(
        'Order placed successfully. Please check your email for confirmation.',
        { id: 'order-progress' }
      );

      // Clear cart and local coupon
      setCartItems([]);
      setAppliedCoupon(null);

      // Reset form fields
      customerForm.resetForm();

      // If we were in single-product mode, clear it so UI shows empty cart
      try {
        setSingleProductMode(false);
        setSingleProduct(null);
        setSingleQty(1);
      } catch {
        // ignore if setters are not present for some reason
      }

      if (singleProductMode) window.history.replaceState({}, '', '/checkout');
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || 'Failed to place order', {
        id: 'order-progress'
      });
    } finally {
      customerForm.setPlacing(false);
    }
  };

  return (
    <div className='mx-auto max-w-4xl space-y-6 p-4'>
      <h1 className='text-2xl font-semibold'>Checkout</h1>
      <div className='grid gap-6 md:grid-cols-2'>
        <div className='flex flex-col gap-4'>
          {singleProductMode ? (
            <SingleProductSummary
              singleProduct={singleProduct}
              singleQty={singleQty}
              setSingleQty={setSingleQty}
              setCartItems={setCartItems}
              loadingProduct={loadingProduct}
              deliveryCost={isDeliveryFree ? 0 : settings?.deliveryCost}
              appliedCoupon={appliedCoupon}
              setAppliedCoupon={setAppliedCoupon}
            />
          ) : (
            <EmptyCartMessage />
          )}
          {customerForm.form.watch('paymentMethod') === 'ONLINE' && (
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
