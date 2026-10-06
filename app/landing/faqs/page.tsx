import type { Metadata } from 'next';
import Link from 'next/link';
import FaqAccordion from '@/components/storefront/FaqAccordion';
import { getContactInfo } from '@/lib/storefront';
import { getAllFaqs } from '@/lib/faqs';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'FAQs',
  description:
    'Answers about our products, routine, delivery across Nepal, payment and returns.',
  alternates: { canonical: '/faqs' }
};

export default async function FAQsPage() {
  const contact = await getContactInfo();

  return (
    <main className='cc-home'>
      <section className='page-hero section-pad'>
        <p className='eyebrow'>Need to know</p>
        <h1>Frequently Asked Questions</h1>
        <p>Everything about our products, delivery, payment and returns.</p>
      </section>

      <section className='faq section-pad' style={{ paddingTop: 40 }}>
        <FaqAccordion faqs={getAllFaqs(contact)} />
      </section>

      <section className='contact section-pad'>
        <div className='section-heading centered'>
          <p className='eyebrow'>We are here for you</p>
          <h2>Still have questions?</h2>
          <p>We&apos;re here to help — reach out to us anytime.</p>
        </div>
        <div className='button-row' style={{ justifyContent: 'center' }}>
          <a
            className='button solid'
            href={`tel:${contact.phone.replace(/\s+/g, '')}`}
          >
            Call Us
          </a>
          <Link className='button outline' href='/contact'>
            Contact Form
          </Link>
        </div>
      </section>
    </main>
  );
}
