export default function FAQsPage() {
  return (
    <div className='mx-auto max-w-4xl px-4 py-12'>
      <h1 className='mb-4 text-4xl font-extrabold text-foreground'>
        Frequently Asked Questions
      </h1>
      <hr className='border-1 mb-8 font-extrabold text-gray-800' />

      <div className='space-y-6'>
        <div className='rounded-lg border border-border bg-card p-6'>
          <h2 className='mb-2 text-xl font-semibold text-foreground'>
            Are your products natural?
          </h2>
          <p className='text-muted-foreground'>
            Yes! All our skincare products are made with 100% natural and
            organic ingredients sourced from Nepal. We never use harmful
            chemicals or artificial additives.
          </p>
        </div>

        <div className='rounded-lg border border-border bg-card p-6'>
          <h2 className='mb-2 text-xl font-semibold text-foreground'>
            How do I choose the right product for my skin?
          </h2>
          <p className='text-muted-foreground'>
            Each product page includes detailed information about suitable skin
            types. If you need personalized recommendations, contact us at +977
            9801753033 or info@careandcleannp.com.
          </p>
        </div>

        <div className='rounded-lg border border-border bg-card p-6'>
          <h2 className='mb-2 text-xl font-semibold text-foreground'>
            What payment methods do you accept?
          </h2>
          <p className='text-muted-foreground'>
            We accept Cash on Delivery (COD) and online payments via QR code
            (eSewa, Khalti, bank transfer). You can upload your payment slip
            during checkout.
          </p>
        </div>

        <div className='rounded-lg border border-border bg-card p-6'>
          <h2 className='mb-2 text-xl font-semibold text-foreground'>
            How long do products last?
          </h2>
          <p className='text-muted-foreground'>
            Our natural products have a shelf life of 12-18 months when stored
            properly. Always check the expiry date on the packaging and store in
            a cool, dry place.
          </p>
        </div>

        <div className='rounded-lg border border-border bg-card p-6'>
          <h2 className='mb-2 text-xl font-semibold text-foreground'>
            Do you ship outside Nepal?
          </h2>
          <p className='text-muted-foreground'>
            Currently, we only deliver within Nepal. We are working on expanding
            our shipping to international locations soon.
          </p>
        </div>

        <div className='rounded-lg border border-border bg-card p-6'>
          <h2 className='mb-2 text-xl font-semibold text-foreground'>
            Can I cancel my order?
          </h2>
          <p className='text-muted-foreground'>
            Yes, you can cancel your order within 24 hours of placement. Contact
            us immediately at +977 9801753033 with your order number.
          </p>
        </div>

        <div className='rounded-lg border border-border bg-card p-6'>
          <h2 className='mb-2 text-xl font-semibold text-foreground'>
            Are your products cruelty-free?
          </h2>
          <p className='text-muted-foreground'>
            Absolutely! We never test our products on animals. All our formulas
            are ethically developed and cruelty-free.
          </p>
        </div>

        <div className='rounded-lg border border-border bg-card p-6'>
          <h2 className='mb-2 text-xl font-semibold text-foreground'>
            How can I track my order?
          </h2>
          <p className='text-muted-foreground'>
            After your order is shipped, you will receive an email with tracking
            details. You can also contact us for updates on your order status.
          </p>
        </div>
      </div>

      <div className='bg-primary/10 mt-10 rounded-lg p-6 text-center'>
        <h3 className='mb-2 text-xl font-semibold text-foreground'>
          Still have questions?
        </h3>
        <p className='mb-4 text-muted-foreground'>
          We're here to help! Reach out to us anytime.
        </p>
        <div className='flex flex-wrap justify-center gap-4'>
          <a
            href='tel:+9779801753033'
            className='hover:bg-primary/90 rounded-lg bg-primary px-6 py-2 text-white'
          >
            Call Us
          </a>
          <a
            href='/contact'
            className='hover:bg-primary/10 rounded-lg border border-primary px-6 py-2 text-primary'
          >
            Contact Form
          </a>
        </div>
      </div>
    </div>
  );
}
