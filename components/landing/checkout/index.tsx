'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  getCartFromLocal,
  clearCart,
  saveCartToLocal
} from '@/lib/utils/local-storage';
import { ICartItem } from '@/lib/types/cart';
import { toast } from 'sonner';
import { Product } from '@/lib/types/product';
import PaymentSection from './PaymentSection';
import CustomerDetails from './CustomerDetails';
import SingleProductSummary from './SingleProductSummary';
import { PaymentMethod } from '@/lib/enum/product';

type SiteSetting = {
  id: number;
  deliveryCost: number;
  freeShippingThreshold: number;
  qrImageUrl: string | null;
  updatedAt: string;
};

export default function CheckoutClient() {
  const [settings, setSettings] = useState<SiteSetting | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [paymentImage, setPaymentImage] = useState<File | null>(null);
  const [placing, setPlacing] = useState(false);
  const search = useSearchParams();
  const buyParam = search?.get('buy');

  const [cartItems, setCartItems] = useState<ICartItem[]>(
    () => getCartFromLocal() || []
  );
  const [singleProductMode, setSingleProductMode] = useState(false);
  const [singleQty, setSingleQty] = useState<number>(1);
  const [singleProduct, setSingleProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [isDeliveryFree, setIsDeliveryFree] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/settings');
      if (res.ok) setSettings(await res.json());
    })();
  }, []);

  // Fetch product for single product mode
  useEffect(() => {
    if (!buyParam) return;
    const id = Number(buyParam);
    if (Number.isNaN(id)) return;
    setSingleProductMode(true);
    setLoadingProduct(true);
    let mounted = true;

    (async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error('Product fetch failed');
        const p = await res.json();
        if (!mounted) return;
        setSingleProduct(p);
        setSingleQty(1);
        setCartItems([
          {
            id: p.id,
            name: p.name,
            image: Array.isArray(p.images) && p.images[0] ? p.images[0] : '',
            price: p.price,
            salePrice: p.salePrice ?? null,
            quantity: 1
          }
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingProduct(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [buyParam]);

  const isEmailValid = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPhoneValid = (phone: string) => /^(?:\+977)?9\d{9}$/.test(phone);

  const isFormValid = () => {
    if (!name.trim()) return (toast.error('Name is required'), false);
    if (!phone.trim()) return (toast.error('Phone is required'), false);
    if (!isPhoneValid(phone.trim()))
      return (toast.error('Invalid phone number'), false);
    if (email && !isEmailValid(email.trim()))
      return (toast.error('Invalid email'), false);
    if (!shippingAddress.trim())
      return (toast.error('Shipping address is required'), false);
    if (paymentMethod === 'ONLINE' && !paymentImage)
      return (toast.error('Payment slip is required'), false);
    if (cartItems.length === 0) return (toast.error('Cart is empty'), false);
    return true;
  };

  const placeOrder = async () => {
    if (!isFormValid()) return;
    try {
      setPlacing(true);

      let paymentSlipUrl: string | undefined;
      if (paymentImage && paymentMethod === 'ONLINE') {
        const form = new FormData();
        form.append('file', paymentImage);
        const uploadRes = await fetch('/api/media/upload', {
          method: 'POST',
          body: form
        });
        if (!uploadRes.ok) throw new Error('Upload failed');
        const { url } = await uploadRes.json();
        paymentSlipUrl = url as string;
      }

      const subtotal = cartItems.reduce(
        (sum, i) => sum + (i.salePrice ?? i.price) * i.quantity,
        0
      );

      const shipping =
        settings?.freeShippingThreshold &&
        subtotal >= settings.freeShippingThreshold
          ? 0
          : settings?.deliveryCost || 0;

      const total = subtotal + shipping;

      const items = cartItems.map(i => ({
        productId: i.id,
        quantity: i.quantity,
        price: i.salePrice ?? i.price,
        name: i.name
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: null,
          email: email || null,
          name: name || null,
          phone: phone || null,
          shippingAddress,
          note: note || null,
          items,
          subtotal,
          discount: 0,
          shipping,
          total,
          paymentSlipUrl: paymentSlipUrl || null,
          paymentMethod: paymentMethod || 'COD'
        })
      });

      if (!res.ok) throw new Error('Order failed');
      toast.success(
        'Order placed successfully. Please confirm order details sent to your email.'
      );

      // Reset form and cart after successful order placement
      try {
        setName('');
        setEmail('');
        setPhone('');
        setShippingAddress('');
        setNote('');
        setPaymentMethod('COD');
        setPaymentImage(null);
        setCartItems([]);
        saveCartToLocal([]);
        clearCart();
      } catch (e) {
        console.warn('Failed to fully reset checkout form/cart:', e);
      }

      if (singleProductMode) window.history.replaceState({}, '', '/checkout');
    } catch {
      toast.error('Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  // Apply free shipping logic for both cart and single-product (buy-now) flows
  useEffect(() => {
    if (!settings) return;

    // compute subtotal from either single-product mode or cart
    let subtotal = 0;
    if (singleProductMode && singleProduct) {
      subtotal = (singleProduct.salePrice ?? singleProduct.price) * singleQty;
    } else if (cartItems.length > 0) {
      subtotal = cartItems.reduce(
        (sum, i) => sum + (i.salePrice ?? i.price) * i.quantity,
        0
      );
    }

    if (!settings.freeShippingThreshold) {
      setIsDeliveryFree(false);
      return;
    }

    if (subtotal >= settings.freeShippingThreshold) {
      setIsDeliveryFree(true);
    } else {
      setIsDeliveryFree(false);
    }
  }, [cartItems, settings, singleProductMode, singleProduct, singleQty]);

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
            />
          )}
          {paymentMethod === 'ONLINE' && <PaymentSection settings={settings} />}
        </div>

        <Card className='px-4'>
          <CustomerDetails
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            phone={phone}
            setPhone={setPhone}
            shippingAddress={shippingAddress}
            setShippingAddress={setShippingAddress}
            note={note}
            setNote={setNote}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            setPaymentImage={setPaymentImage}
          />

          <Button
            className='mt-4 w-full'
            onClick={placeOrder}
            disabled={placing}
          >
            {placing ? 'Placing Order...' : 'Place Order'}
          </Button>
        </Card>
      </div>
    </div>
  );
}
