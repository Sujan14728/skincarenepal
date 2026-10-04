import type { Metadata } from 'next';
import ContactView from '@/components/storefront/contact/ContactView';
import { getContactInfo } from '@/lib/storefront';
import { getOrderFaqs } from '@/lib/faqs';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Questions about an order or a product? Get in touch with Care And Clean Nepal.',
  alternates: { canonical: '/contact' }
};

export default async function ContactPage() {
  const contact = await getContactInfo();
  return <ContactView contact={contact} faqs={getOrderFaqs(contact)} />;
}
