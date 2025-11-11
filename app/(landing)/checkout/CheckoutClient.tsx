'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getCartFromLocal } from '@/lib/utils/local-storage';
import { ICartItem } from '@/lib/types/cart';
import { toast } from 'sonner';
import { Product } from '@/lib/types/product';

type SiteSetting = {
  id: number;
  globalDiscountPercent: number;
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
  const [paymentImage, setPaymentImage] = useState<File | null>(null);
  const [placing, setPlacing] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const search = useSearchParams();
  const buyParam = search?.get('buy');

  // cartItems may come from localStorage or from a single-product 'buy now' flow
  const [cartItems, setCartItems] = useState<ICartItem[]>(
    () => getCartFromLocal() || []
  );

  const [singleProductMode, setSingleProductMode] = useState(false);
  const [singleQty, setSingleQty] = useState<number>(1);
  const [singleProduct, setSingleProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data: SiteSetting = await res.json();
        setSettings(data);
      }
    };
    load();
  }, []);

  // If we have a buy param, fetch the product and use it instead of local cart
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
        setSingleProductMode(true);
        // override cart items with single product
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

  const isPhoneValid = (phone: string) => /^(?:\+977)?9\d{9}$/.test(phone); // Example: Nepal phone

  const isFormValid = () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return false;
    }
    if (!phone.trim()) {
      toast.error('Phone is required');
      return false;
    }
    if (!isPhoneValid(phone.trim())) {
      toast.error('Invalid phone number');
      return false;
    }
    if (email && !isEmailValid(email.trim())) {
      toast.error('Invalid email');
      return false;
    }
    if (!shippingAddress.trim()) {
      toast.error('Shipping address is required');
      return false;
    }
    if (cartItems.length === 0) {
      toast.error('Cart is empty');
      return false;
    }
    return true;
  };

  const placeOrder = async () => {
    if (!isFormValid()) return;
    try {
      setPlacing(true);
      if (!phone.trim() || !shippingAddress || cartItems.length === 0) {
        toast.error('Phone and address are required');
        return;
      }
      let paymentSlipUrl: string | undefined;
      if (paymentImage) {
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
          : 100;
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
          paymentSlipUrl: paymentSlipUrl || null
        })
      });
      if (!res.ok) throw new Error('Order failed');
      toast.success('Order placed. Check your email to confirm.');

      // if we used buy-now flow, clear query and reset
      if (singleProductMode) {
        // small UX: remove buy param by navigating to /checkout without params
        try {
          // can't call hook here; use location fallback
          window.history.replaceState({}, '', '/checkout');
        } catch {
          window.history.replaceState({}, '', '/checkout');
        }
      }
    } catch {
      toast.error('Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const ProductSkeleton = () => (
    <div className='flex animate-pulse items-center gap-3'>
      <div className='h-16 w-16 rounded bg-gray-200' />
      <div className='flex-1 space-y-2'>
        <div className='h-5 w-32 rounded bg-gray-200' />
        <div className='h-4 w-24 rounded bg-gray-200' />
      </div>
      <div className='h-9 w-20 rounded-lg bg-gray-200' />
    </div>
  );

  return (
    <div className='mx-auto max-w-4xl space-y-6 p-4'>
      <h1 className='text-2xl font-semibold'>Checkout</h1>
      <div className='grid gap-6 md:grid-cols-2'>
        <Card className='space-y-3 p-4'>
          <h2 className='text-lg font-semibold'>Payment</h2>
          {settings?.qrImageUrl && (
            <>
              <div
                className='relative h-64 w-full cursor-pointer overflow-hidden rounded-md border'
                onClick={() => setIsQrOpen(true)}
              >
                <Image
                  src={settings.qrImageUrl}
                  alt='QR'
                  fill
                  className='object-contain'
                />
              </div>

              {isQrOpen && (
                <div
                  className='fixed inset-0 z-50 flex items-center justify-center bg-black/70'
                  onClick={() => setIsQrOpen(false)}
                >
                  <div className='relative max-h-[90vh] max-w-[90vw] p-4'>
                    <Image
                      src={settings.qrImageUrl}
                      alt='QR Enlarged'
                      width={600}
                      height={600}
                      className='rounded shadow-lg'
                    />
                  </div>
                </div>
              )}
            </>
          )}
          <Input
            type='file'
            accept='image/*'
            onChange={e => setPaymentImage(e.target.files?.[0] || null)}
          />
        </Card>
        <Card className='px-4'>
          <h2 className='text-lg font-semibold'>Customer Details</h2>
          <div className='mb-1 flex flex-col text-gray-700'>
            <label htmlFor='name'>Name</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              className='text-xs'
            />
          </div>
          <div className='mb-2 flex flex-col text-gray-700'>
            <label htmlFor='email'>Email</label>
            <Input
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              className='text-xs'
            />
          </div>

          <div className='mb-2 flex flex-col text-gray-700'>
            <label htmlFor='phone'>Phone</label>
            <Input
              type='tel'
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className='text-xs'
            />
          </div>

          <div className='mb-1 flex flex-col text-gray-700'>
            <label className='pb-1' htmlFor='shippingaddress'>
              Shipping Address
            </label>
            <Textarea
              value={shippingAddress}
              onChange={e => setShippingAddress(e.target.value)}
              className='pt-4'
            />
          </div>

          <div className='mb-2 flex flex-col space-y-1 text-gray-700'>
            <label htmlFor='note'>Note</label>
            <Textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              className='text-x pt-5'
            />
          </div>

          {singleProductMode && (
            <div className='space-y-2'>
              <h3 className='text-sm font-semibold'>Buying</h3>
              {loadingProduct ? (
                <ProductSkeleton />
              ) : singleProduct ? (
                <div className='flex items-center gap-3'>
                  {singleProduct.images && singleProduct.images[0] && (
                    <Image
                      src={singleProduct.images[0]}
                      alt={singleProduct.name}
                      width={64}
                      height={64}
                      className='h-16 w-16 rounded object-cover'
                    />
                  )}
                  <div className='flex-1'>
                    <div className='font-medium'>{singleProduct.name}</div>
                    <div className='text-sm text-muted-foreground'>
                      {singleProduct.salePrice ? (
                        <div>
                          <span className='font-semibold'>
                            Rs. {singleProduct.salePrice}
                          </span>{' '}
                          <span className='text-sm text-muted-foreground line-through'>
                            Rs. {singleProduct.price}
                          </span>
                        </div>
                      ) : (
                        <div className='font-semibold'>
                          Rs. {singleProduct.price}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className='flex items-center gap-2'>
                      <button
                        className='rounded border px-2'
                        onClick={() => {
                          if (singleQty <= 1) return;
                          setSingleQty(q => {
                            const next = q - 1;
                            setCartItems(items =>
                              items.map(it =>
                                it.id === singleProduct.id
                                  ? { ...it, quantity: next }
                                  : it
                              )
                            );
                            return next;
                          });
                        }}
                      >
                        -
                      </button>
                      <div className='w-8 text-center'>{singleQty}</div>
                      <button
                        className='rounded border px-2'
                        onClick={() => {
                          setSingleQty(q => {
                            const next = q + 1;
                            setCartItems(items =>
                              items.map(it =>
                                it.id === singleProduct.id
                                  ? { ...it, quantity: next }
                                  : it
                              )
                            );
                            return next;
                          });
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
          <Button className='w-full' onClick={placeOrder} disabled={placing}>
            {placing ? 'Placing Order...' : 'Place Order'}
          </Button>
        </Card>
      </div>
    </div>
  );
}
