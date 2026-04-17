import CheckoutClient from '@/components/landing/checkout';
import React, { Suspense } from 'react';

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={<div className='p-6 text-center'>Loading checkout…</div>}
    >
      <CheckoutClient />
    </Suspense>
  );
}
