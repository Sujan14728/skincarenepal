'use client';

import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import type { Faq } from '@/lib/faqs';

/** The home design's FAQ list; one answer open at a time. */
export default function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [openId, setOpenId] = useState(faqs[0]?.id ?? '');

  return (
    <div className='faq-list'>
      {faqs.map(faq => {
        const open = openId === faq.id;
        return (
          <article key={faq.id}>
            <button
              type='button'
              onClick={() => setOpenId(open ? '' : faq.id)}
              aria-expanded={open}
            >
              <span>{faq.question}</span>
              {open ? <X size={18} /> : <ChevronDown size={18} />}
            </button>
            {open && <p>{faq.answer}</p>}
          </article>
        );
      })}
    </div>
  );
}
