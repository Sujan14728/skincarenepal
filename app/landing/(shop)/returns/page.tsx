export default function ReturnsPage() {
  return (
    <div className='mx-auto max-w-4xl px-4 py-12'>
      <h1 className='mb-4 text-4xl font-extrabold text-foreground'>
        Returns & Exchanges
      </h1>
      <hr className='border-1 mb-4 font-extrabold text-gray-800' />

      <div className='space-y-6 text-muted-foreground'>
        <section>
          <h2 className='mb-3 text-xl font-semibold text-foreground'>
            Return Policy
          </h2>
          <p className='mb-3'>
            We want you to be completely satisfied with your purchase. If you
            are not happy with your order, you may return it within 7 days of
            delivery.
          </p>
          <ul className='list-inside list-disc space-y-2'>
            <li>Products must be unused and in original packaging</li>
            <li>Return shipping costs are borne by the customer</li>
            <li>Refunds will be processed within 5-7 business days</li>
          </ul>
        </section>

        <section>
          <h2 className='mb-3 text-xl font-semibold text-foreground'>
            Exchange Policy
          </h2>
          <p>
            If you received a damaged or defective product, we will replace it
            free of charge. Please contact us within 48 hours of delivery with
            photos of the damaged item.
          </p>
        </section>

        <section>
          <h2 className='mb-3 text-xl font-semibold text-foreground'>
            How to Return
          </h2>
          <ol className='list-inside list-decimal space-y-2'>
            <li>Contact us at info@careandcleannp.com or +977 9801753033</li>
            <li>Provide your order number and reason for return</li>
            <li>Pack the item securely in original packaging</li>
            <li>Ship to: Dhangadhi-3, Kailali, Nepal</li>
          </ol>
        </section>

        <section className='bg-primary/10 rounded-lg p-4'>
          <p className='font-semibold text-foreground'>
            Note: Sale items and promotional products are non-refundable.
          </p>
        </section>
      </div>
    </div>
  );
}
