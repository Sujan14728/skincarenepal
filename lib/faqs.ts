import { DEFAULT_CONTACT, SOCIAL_LINKS } from '@/lib/storefront-utils';

export type Faq = { id: string; question: string; answer: string };

type Contact = { supportEmail: string; phone: string };

/** Brand questions shown on the home page. Product-specific ones live on each product page. */
export function getHomeFaqs(contact: Contact = DEFAULT_CONTACT): Faq[] {
  return [
    {
      id: 'brand',
      question: 'What is Care & Clean Nepal?',
      answer:
        'Care & Clean is a proudly Nepali herbal skincare brand. We make simple, effective everyday essentials — Face Wash, 2-in-1 Face Pack, Aloe Vera Gel, Moisturizer and Sunscreen — that together form one complete daily routine.'
    },
    {
      id: 'different',
      question: 'What makes Care & Clean different?',
      answer:
        'We keep skincare honest: herbal ingredients your skin recognises, no harsh chemicals, and a routine that takes minutes, not a shelf full of products. Everything is made in Nepal and priced for everyday use.'
    },
    {
      id: 'skin-types',
      question: 'Is Care & Clean suitable for my skin type?',
      answer:
        'Our formulas are gentle and made for all skin types, including sensitive skin. If your skin is very reactive, patch-test any new product on your inner arm for 24 hours first.'
    },
    {
      id: 'natural',
      question: 'Are your products chemical-free and cruelty-free?',
      answer:
        'Yes. Our products are built around herbal and natural ingredients without harsh chemicals, they are dermatologically tested, and we never test on animals.'
    },
    {
      id: 'routine',
      question: 'I’m new to skincare. Where do I start?',
      answer:
        'Start with the Combo Set — it has every step of the routine. Cleanse, soothe, hydrate and protect every morning; cleanse, soothe and hydrate at night; and use the 2-in-1 Face Pack two to three times a week.'
    },
    {
      id: 'ask',
      question: 'Can I ask Care & Clean a skincare question?',
      answer: `Of course! Send us a DM on Instagram (@${SOCIAL_LINKS.instagramHandle}) — we answer your questions in our “Ask Care & Clean” series — or call us on ${contact.phone}.`
    },
    {
      id: 'support',
      question: 'How can I contact customer support?',
      answer: `Email ${contact.supportEmail}, call ${contact.phone} or use the contact form on our website.`
    }
  ];
}

/**
 * Questions about a single product, shown on its product page.
 * Keyed by routine step (see getRoutineKey).
 */
const PRODUCT_FAQS: Record<string, Omit<Faq, 'id'>[]> = {
  COMBO: [
    {
      question: 'What’s inside the Combo Set?',
      answer:
        'One of each step of our routine: Face Wash, 2-in-1 Face Pack, Aloe Vera Gel, Moisturizer and Sunscreen — everything you need, morning and night.'
    },
    {
      question: 'How do I use the products together?',
      answer:
        'Morning: Face Wash → Aloe Vera Gel → Moisturizer → Sunscreen. Night: Face Wash → Aloe Vera Gel → Moisturizer. Use the Face Pack 2–3 times a week after cleansing.'
    },
    {
      question: 'Is the Combo Set a good gift?',
      answer:
        'Yes — it’s a complete routine in one box, suitable for all skin types, which makes it an easy and thoughtful gift.'
    }
  ],
  CLEANSE: [
    {
      question: 'How often should I use the Face Wash?',
      answer:
        'Twice a day — morning and night. Massage gently onto wet skin, then rinse with water.'
    },
    {
      question: 'Will it dry out my skin?',
      answer:
        'No. It cleanses dirt and oil without stripping your skin’s natural moisture, so it is gentle enough for daily use on all skin types.'
    }
  ],
  TREAT: [
    {
      question: 'How often should I use the 2-in-1 Face Pack?',
      answer: '2–3 times a week for best results.'
    },
    {
      question: 'What do I mix the Face Pack with?',
      answer:
        'Mix 1–2 teaspoons with curd, milk, honey or aloe vera gel. Scrub gently for 1–2 minutes, then leave it on as a mask for 10–15 minutes before rinsing.'
    }
  ],
  SOOTHE: [
    {
      question: 'How do I use the Aloe Vera Gel?',
      answer:
        'Apply a thin layer after cleansing, morning and night. It also soothes skin after sun exposure, shaving or waxing.'
    }
  ],
  HYDRATE: [
    {
      question: 'When should I apply moisturizer?',
      answer:
        'After cleansing (or the face pack), while your skin is still slightly damp, for the best absorption. Use it morning and night.'
    }
  ],
  PROTECT: [
    {
      question: 'When should I apply sunscreen?',
      answer:
        'Every morning as the last step of your routine, about 15 minutes before going outside. Reapply every 2 hours when you are outdoors.'
    },
    {
      question: 'Do I need sunscreen on cloudy days or indoors?',
      answer:
        'Yes — UV rays reach your skin through clouds and windows, so apply it every day for the best protection.'
    }
  ]
};

export function getProductFaqs(routineKey: string): Faq[] {
  return (PRODUCT_FAQS[routineKey] ?? []).map((faq, i) => ({
    id: `${routineKey.toLowerCase()}-${i}`,
    ...faq
  }));
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

/** Everything general, for the dedicated FAQ page. */
export function getAllFaqs(contact: Contact = DEFAULT_CONTACT): Faq[] {
  const home = getHomeFaqs(contact);
  return [
    ...home.filter(f => f.id !== 'support'),
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
    home.find(f => f.id === 'support')!
  ];
}
