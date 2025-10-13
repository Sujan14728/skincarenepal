'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function OrderConfirmedPage() {
  const [status, setStatus] = useState<string | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get('order');
    setStatus(s);
    if (s === 'confirmed')
      toast.success(
        'Your order is confirmed. We will verify your payment shortly.'
      );
    if (s === 'expired')
      toast.error('Confirmation link expired. Please place the order again.');
    if (s === 'invalid') toast.error('Invalid confirmation link.');
    if (s === 'error')
      toast.error('Something went wrong while confirming your order.');
  }, []);
  const title = useMemo(() => {
    if (status === 'confirmed') return 'Order Confirmed';
    if (status === 'expired') return 'Link Expired';
    if (status === 'invalid') return 'Invalid Link';
    if (status === 'error') return 'Error';
    return 'Order';
  }, [status]);
  const message = useMemo(() => {
    if (status === 'confirmed')
      return 'Thank you. We will verify your payment shortly and keep you updated by email.';
    if (status === 'expired')
      return 'The confirmation link has expired. Please place a new order.';
    if (status === 'invalid') return 'The confirmation link is not valid.';
    if (status === 'error')
      return 'Something went wrong while confirming your order.';
    return '';
  }, [status]);
  return (
    <div className='mx-auto max-w-xl p-6 text-center'>
      <h1 className='mb-2 text-2xl font-semibold'>{title}</h1>
      {message && <p className='text-muted-foreground mb-6'>{message}</p>}
      <div className='flex items-center justify-center gap-3'>
        <Link href='/products'>
          <Button>Continue Shopping</Button>
        </Link>
        <Link href='/'>
          <Button variant='secondary'>Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
