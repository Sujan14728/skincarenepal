import { DEFAULT_CONTACT } from '@/lib/storefront-utils';

export type Faq = { id: string; question: string; answer: string };

type Contact = { supportEmail: string; phone: string };

/** Routine-focused questions shown on the home page. */
export function getHomeFaqs(contact: Contact = DEFAULT_CONTACT): Faq[] {
  return [
    {
      id: 'included',
      question: 'What products are included in the Care & Clean range?',
      answer:
        'Our range includes everyday essentials: Gentle Face Wash, 2-in-1 Face Pack, Aloe Vera Gel, Hydrating Moisturizer and SPF 50+ Sunscreen.'
    },
    {
      id: 'routine',
      question: 'How should I use the 5-step routine?',
      answer:
        'Cleanse with Face Wash, treat with Face Pack (2–3×/week), soothe with Aloe Gel, hydrate with Moisturizer, protect with Sunscreen. Morning and/or evening.'
    },
    {
      id: 'face-pack',
      question: 'How often should I use the 2-in-1 Face Pack?',
      answer: '2–3 times per week for best results.'
    },
    {
      id: 'moisturizer',
      question: 'When should I apply moisturizer?',
      answer:
        'After cleansing or the face pack, while your skin is slightly damp, for best absorption.'
    },
    {
      id: 'sunscreen',
      question: 'When should I apply sunscreen?',
      answer:
        'Every morning, 15 minutes before sun exposure. Reapply every 2 hours if outdoors.'
    },
    {
      id: 'support',
      question: 'How can I contact customer support?',
      answer: `Email ${contact.supportEmail}, call ${contact.phone} or use the contact form on our website.`
    }
  ];
}

/** Order and delivery questions shown on the contact page. */
export function getOrderFaqs(contact: Contact = DEFAULT_CONTACT): Faq[] {
  return [
    {
      id: 'delivery',
      question: 'How long does delivery take?',
      answer:
        'We typically dispatch within 1–2 business days. Delivery takes 3–7 business days depending on your location across Nepal.'
    },
    {
      id: 'returns',
      question: 'What is your return policy?',
      answer:
        'If you receive a damaged or incorrect product, contact us within 48 hours and we will arrange a replacement or refund.'
    },
    {
      id: 'tracking',
      question: 'How can I track my order?',
      answer: `Once your order is shipped, you will receive an email with tracking details. You can also call us on ${contact.phone} for an update.`
    },
    {
      id: 'shipping',
      question: 'Do you deliver across Nepal?',
      answer:
        'Yes! We deliver to all major cities and most districts across Nepal through our trusted delivery partners. We do not ship outside Nepal yet.'
    }
  ];
}

/** Everything, for the dedicated FAQ page. */
export function getAllFaqs(contact: Contact = DEFAULT_CONTACT): Faq[] {
  return [
    ...getHomeFaqs(contact).filter(f => f.id !== 'support'),
    {
      id: 'natural',
      question: 'Are your products natural?',
      answer:
        'Yes. Our formulas are built around herbal and natural ingredients, and we never use harsh chemicals or artificial additives.'
    },
    {
      id: 'skin-type',
      question: 'How do I choose the right product for my skin?',
      answer: `Each product page lists who it is suitable for. For personalised advice, contact us at ${contact.phone} or ${contact.supportEmail}.`
    },
    {
      id: 'payment',
      question: 'What payment methods do you accept?',
      answer:
        'We accept Cash on Delivery (COD) and online payment via QR code (eSewa, Khalti or bank transfer). You can upload your payment slip during checkout.'
    },
    ...getOrderFaqs(contact),
    {
      id: 'cancel',
      question: 'Can I cancel my order?',
      answer: `Yes, you can cancel within 24 hours of placing your order. Contact us on ${contact.phone} with your order number.`
    },
    {
      id: 'shelf-life',
      question: 'How long do the products last?',
      answer:
        'Our products have a shelf life of 12–18 months when stored properly. Always check the expiry date on the packaging and store in a cool, dry place.'
    },
    {
      id: 'cruelty-free',
      question: 'Are your products cruelty-free?',
      answer:
        'Absolutely. We never test our products on animals, and all our formulas are ethically developed.'
    },
    getHomeFaqs(contact).find(f => f.id === 'support')!
  ];
}
