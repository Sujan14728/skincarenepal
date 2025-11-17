export default function PrivacyPage() {
  return (
    <div className='mx-auto max-w-4xl px-4 py-12'>
      <h1 className='mb-8 text-4xl font-extrabold text-foreground'>
        Privacy Policy
      </h1>
      <p className='mb-2 text-sm'>
        <strong>Last Updated:</strong> November 16, 2025
      </p>
      <hr className='border-1 mb-4 font-extrabold text-gray-800' />

      <div className='space-y-6 text-muted-foreground'>
        <section>
          <h2 className='mb-3 text-xl font-semibold text-foreground'>
            Information We Collect
          </h2>
          <p className='mb-3'>
            When you place an order or contact us, we collect:
          </p>
          <ul className='list-inside list-disc space-y-2'>
            <li>Name and contact information (email, phone number)</li>
            <li>Shipping address</li>
            <li>Payment information (processed securely)</li>
            <li>Order history and preferences</li>
          </ul>
        </section>

        <section>
          <h2 className='mb-3 text-xl font-semibold text-foreground'>
            How We Use Your Information
          </h2>
          <p className='mb-3'>We use your information to:</p>
          <ul className='list-inside list-disc space-y-2'>
            <li>Process and fulfill your orders</li>
            <li>Send order confirmations and updates</li>
            <li>Respond to customer service requests</li>
            <li>Improve our products and services</li>
            <li>Send promotional offers (with your consent)</li>
          </ul>
        </section>

        <section>
          <h2 className='mb-3 text-xl font-semibold text-foreground'>
            Data Security
          </h2>
          <p>
            We implement industry-standard security measures to protect your
            personal information. Your payment details are encrypted and
            processed securely through trusted payment gateways.
          </p>
        </section>

        <section>
          <h2 className='mb-3 text-xl font-semibold text-foreground'>
            Information Sharing
          </h2>
          <p className='mb-3'>
            We do not sell, trade, or rent your personal information to third
            parties. We may share information with:
          </p>
          <ul className='list-inside list-disc space-y-2'>
            <li>Delivery partners (for order fulfillment)</li>
            <li>Payment processors (for secure transactions)</li>
            <li>Legal authorities (when required by law)</li>
          </ul>
        </section>

        <section>
          <h2 className='mb-3 text-xl font-semibold text-foreground'>
            Cookies
          </h2>
          <p>
            We use cookies to enhance your browsing experience and remember your
            preferences. You can disable cookies in your browser settings, but
            some features may not function properly.
          </p>
        </section>

        <section>
          <h2 className='mb-3 text-xl font-semibold text-foreground'>
            Your Rights
          </h2>
          <p className='mb-3'>You have the right to:</p>
          <ul className='list-inside list-disc space-y-2'>
            <li>Access your personal information</li>
            <li>Request corrections or deletions</li>
            <li>Opt-out of marketing communications</li>
            <li>Withdraw consent at any time</li>
          </ul>
        </section>

        <section>
          <h2 className='mb-3 text-xl font-semibold text-foreground'>
            Contact Us
          </h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at:
          </p>
          <div className='mt-3 space-y-1'>
            <p>Email: info@careandcleannp.com</p>
            <p>Phone: +977 9801753033</p>
            <p>Address: Dhangadhi-3, Kailali, Nepal</p>
          </div>
        </section>

        <section className='bg-primary/10 rounded-lg p-4'>
          <p className='font-semibold text-foreground'>
            We may update this Privacy Policy from time to time. Changes will be
            posted on this page with an updated date.
          </p>
        </section>
      </div>
    </div>
  );
}
