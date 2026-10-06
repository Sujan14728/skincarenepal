export default function TermsPage() {
  return (
    <div className='mx-auto max-w-4xl px-4 py-12'>
      <h1 className='mb-8 text-4xl font-extrabold text-foreground'>
        Terms & Conditions
      </h1>
      <p className='mb-2 text-sm'>
        <strong>Last Updated:</strong> November 16, 2025
      </p>
      <hr className='border-1 mb-4 font-extrabold text-gray-800' />

      <div className='space-y-6 text-muted-foreground'>
        <section>
          <h2 className='mb-3 text-2xl font-semibold text-foreground'>
            1. Agreement to Terms
          </h2>
          <p>
            By accessing and using careandcleannp.com, you accept and agree to
            be bound by these Terms and Conditions. If you do not agree, please
            do not use our website or purchase our products.
          </p>
        </section>

        <section>
          <h2 className='mb-3 text-2xl font-semibold text-foreground'>
            2. Products and Services
          </h2>
          <p className='mb-3'>
            Care And Clean Nepal offers natural and organic skincare products.
            We strive to provide accurate product descriptions, but we do not
            guarantee that:
          </p>
          <ul className='list-inside list-disc space-y-2'>
            <li>Product descriptions are error-free</li>
            <li>Products will meet your specific requirements</li>
            <li>Results will be the same for all users</li>
          </ul>
        </section>

        <section>
          <h2 className='mb-3 text-2xl font-semibold text-foreground'>
            3. Orders and Payments
          </h2>
          <ul className='list-inside list-disc space-y-2'>
            <li>
              All orders are subject to product availability and acceptance
            </li>
            <li>
              Prices are in Nepali Rupees (NPR) and may change without notice
            </li>
            <li>Payment must be completed before order processing</li>
            <li>We reserve the right to cancel orders for any reason</li>
          </ul>
        </section>

        <section>
          <h2 className='mb-3 text-2xl font-semibold text-foreground'>
            4. Shipping and Delivery
          </h2>
          <p>
            We deliver across Nepal. Delivery times are estimates and not
            guaranteed. Risk of loss transfers to you upon delivery to the
            carrier.
          </p>
        </section>

        <section>
          <h2 className='mb-3 text-2xl font-semibold text-foreground'>
            5. Returns and Refunds
          </h2>
          <p>
            Please refer to our Returns & Exchanges page for detailed
            information. Returns must comply with our policy and be initiated
            within 7 days of delivery.
          </p>
        </section>

        <section>
          <h2 className='mb-3 text-2xl font-semibold text-foreground'>
            6. Product Usage
          </h2>
          <ul className='list-inside list-disc space-y-2'>
            <li>Perform a patch test before first use</li>
            <li>Follow usage instructions on product packaging</li>
            <li>Discontinue use if irritation occurs</li>
            <li>Store products in cool, dry places</li>
          </ul>
        </section>

        <section>
          <h2 className='mb-3 text-2xl font-semibold text-foreground'>
            7. Limitation of Liability
          </h2>
          <p>
            Care And Clean Nepal is not liable for any indirect, incidental, or
            consequential damages arising from product use. Our liability is
            limited to the purchase price of the product.
          </p>
        </section>

        <section>
          <h2 className='mb-3 text-2xl font-semibold text-foreground'>
            8. Intellectual Property
          </h2>
          <p>
            All content on this website (text, images, logos, graphics) is the
            property of Care And Clean Nepal and protected by copyright laws.
            Unauthorized use is prohibited.
          </p>
        </section>

        <section>
          <h2 className='mb-3 text-2xl font-semibold text-foreground'>
            9. User Conduct
          </h2>
          <p className='mb-3'>You agree not to:</p>
          <ul className='list-inside list-disc space-y-2'>
            <li>Use the website for illegal purposes</li>
            <li>Attempt to hack or disrupt the website</li>
            <li>Post false or misleading information</li>
            <li>Violate any applicable laws or regulations</li>
          </ul>
        </section>

        <section>
          <h2 className='mb-3 text-2xl font-semibold text-foreground'>
            10. Modifications
          </h2>
          <p>
            We reserve the right to modify these Terms & Conditions at any time.
            Changes will be effective immediately upon posting. Continued use
            constitutes acceptance of modified terms.
          </p>
        </section>

        <section>
          <h2 className='mb-3 text-2xl font-semibold text-foreground'>
            11. Governing Law
          </h2>
          <p>
            These Terms are governed by the laws of Nepal. Any disputes shall be
            resolved in the courts of Kailali, Nepal.
          </p>
        </section>

        <section>
          <h2 className='mb-3 text-2xl font-semibold text-foreground'>
            12. Contact Information
          </h2>
          <p>For questions about these Terms & Conditions, contact us at:</p>
          <div className='mt-3 space-y-1'>
            <p>Email: info@careandcleannp.com</p>
            <p>Phone: +977 9801753033</p>
            <p>Address: Dhangadhi-3, Kailali, Nepal</p>
          </div>
        </section>

        <section className='bg-primary/10 rounded-lg p-4'>
          <p className='font-semibold text-foreground'>
            By using our website and purchasing our products, you acknowledge
            that you have read, understood, and agree to these Terms &
            Conditions.
          </p>
        </section>
      </div>
    </div>
  );
}
