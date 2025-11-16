'use client';
import { useSearchParams } from 'next/navigation';

export default function OrderConfirmation() {
  const search = useSearchParams();
  const status = search?.get('status');
  const orderNumber = search?.get('orderNumber');
  const message = search?.get('message');

  return (
    <div className='min-h-screen bg-gray-100 p-4'>
      <div className='mx-auto mt-20 max-w-xl rounded-md border p-6 text-center shadow'>
        {status === 'success' ? (
          <>
            <h1 className='mb-2 text-2xl font-bold'>Order Confirmed!</h1>
            <p className='mb-4'>
              Your order {orderNumber} has been successfully confirmed.
            </p>
            <p>Thank you for shopping with us!</p>
          </>
        ) : (
          <>
            <h1 className='mb-2 text-2xl font-bold text-red-600'>Oops!</h1>
            <p className='mb-4'>
              {message || 'Something went wrong while confirming your order.'}
            </p>
            <a href='/checkout' className='text-blue-600 underline'>
              Go back to checkout
            </a>
          </>
        )}
      </div>
    </div>
  );
}
