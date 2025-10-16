'use client';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getCartFromLocal } from '@/lib/utils/local-storage';
import { ICartItem } from '@/lib/types/cart';
import { toast } from 'sonner';

type SiteSetting = {
  id: number;
  globalDiscountPercent: number;
  freeShippingThreshold: number;
  qrImageUrl: string | null;
  updatedAt: string;
};

export default function CheckoutPage() {
  const [settings, setSettings] = useState<SiteSetting | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [note, setNote] = useState('');
  const [paymentImage, setPaymentImage] = useState<File | null>(null);
  const [placing, setPlacing] = useState(false);
  const cartItems = useMemo<ICartItem[]>(() => getCartFromLocal() || [], []);

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

  const placeOrder = async () => {
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
    } catch {
      toast.error('Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className='mx-auto max-w-4xl space-y-6 p-4'>
      <h1 className='text-2xl font-semibold'>Checkout</h1>
      <div className='grid gap-6 md:grid-cols-2'>
        <Card className='space-y-3 p-4'>
          <h2 className='text-lg font-semibold'>Payment</h2>
          {settings?.qrImageUrl && (
            <div className='relative h-64 w-full overflow-hidden rounded-md border'>
              <Image
                src={settings.qrImageUrl}
                alt='QR'
                fill
                className='object-contain'
              />
            </div>
          )}
          <Input
            type='file'
            accept='image/*'
            onChange={e => setPaymentImage(e.target.files?.[0] || null)}
          />
        </Card>
        <Card className='space-y-3 p-4'>
          <h2 className='text-lg font-semibold'>Customer Details</h2>
          <Input
            placeholder='Name'
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <Input
            placeholder='Email'
            type='email'
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <Input
            placeholder='Phone'
            type='tel'
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
          <Textarea
            placeholder='Shipping Address'
            value={shippingAddress}
            onChange={e => setShippingAddress(e.target.value)}
          />
          <Textarea
            placeholder='Note'
            value={note}
            onChange={e => setNote(e.target.value)}
          />
          <Button className='w-full' onClick={placeOrder} disabled={placing}>
            {placing ? 'Placing Order...' : 'Place Order'}
          </Button>
        </Card>
      </div>
    </div>
  );
}
