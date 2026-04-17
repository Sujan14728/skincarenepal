export default function ShippingPage() {
  return (
    <div className='mx-auto max-w-4xl px-4 py-12'>
      <h1 className='mb-4 text-4xl font-extrabold text-foreground'>
        Shipping & Delivery
      </h1>
      <hr className='border-1 mb-4 font-extrabold text-gray-800' />

      <div className='space-y-6 text-muted-foreground'>
        <section>
          <h2 className='mb-3 text-xl font-semibold text-foreground'>
            Delivery Information
          </h2>
          <p className='mb-3'>
            We deliver our natural skincare products across Nepal. All orders
            are processed within 1-2 business days.
          </p>
          <ul className='list-inside list-disc space-y-2'>
            <li>Standard Delivery: 3-5 business days</li>
            <li>Valley Delivery: 1-2 business days</li>
            <li>Remote Areas: 5-7 business days</li>
          </ul>
        </section>

        <section>
          <h2 className='mb-3 text-xl font-semibold text-foreground'>
            Delivery Charges
          </h2>
          <p className='mb-3'>
            Delivery charge: Rs. 100 (waived for orders above Rs. 3000)
          </p>
        </section>

        <section>
          <h2 className='mb-3 text-xl font-semibold text-foreground'>
            Order Tracking
          </h2>
          <p>
            Once your order is shipped, you will receive an email confirmation
            with tracking details. For any queries, contact us at{' '}
            <a
              href='tel:+9779801753033'
              className='text-primary hover:underline'
            >
              +977 9801753033
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
