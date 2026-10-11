'use client';
/* eslint-disable @next/next/no-img-element */

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ArrowRight,
  Clipboard,
  Headphones,
  Leaf,
  Mail,
  Mountain,
  Phone,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import FaqAccordion from '@/components/storefront/FaqAccordion';
import RevealOnScroll from '@/components/storefront/RevealOnScroll';
import ProductSlider from './ProductSlider';
import RoutineCarousel from './RoutineCarousel';
import {
  DESIGN_IMAGES,
  displayName,
  effectivePrice,
  formatPrice,
  type ContactInfo,
  type StorefrontProduct
} from '@/lib/storefront-utils';
import type { Faq } from '@/lib/faqs';

type HomeViewProps = {
  products: StorefrontProduct[];
  combo: StorefrontProduct | null;
  routine: StorefrontProduct[];
  rating: { average: number | null; count: number };
  contact: ContactInfo;
  faqs: Faq[];
};

/** Below this, a saving is too small to headline. */
const MIN_SAVING = 100;

export default function HomeView({
  products,
  combo,
  routine,
  rating,
  contact,
  faqs
}: HomeViewProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [copied, setCopied] = useState('');

  const copyEmail = (email: string) => {
    navigator.clipboard?.writeText(email);
    setCopied(email);
    window.setTimeout(() => setCopied(''), 1600);
  };

  const sameEmail = contact.supportEmail === contact.generalEmail;
  // The combo is the hero's campaign; the sliders show the individual products.
  const singles = products.filter(p => p.routineKey !== 'COMBO');
  const featured = singles.slice(0, 4);

  const comboPrice = combo ? effectivePrice(combo) : 0;
  const separateTotal = routine.reduce((sum, p) => sum + effectivePrice(p), 0);
  const saving = separateTotal - comboPrice;

  return (
    <main className='cc-home'>
      <RevealOnScroll />

      {/* ---------- Hero: campaign billboard for the combo ---------- */}
      <section id='home' className='hero billboard section-pad'>
        <div className='hero-copy fade-up'>
          {combo ? (
            <>
              <p className='eyebrow'>
                Combo offer · Complete {routine.length || 5}-step routine
              </p>
              <h1>
                Your Complete Routine,
                <br />
                <em>One Combo.</em>
              </h1>
              <p className='hero-subline'>
                Cleanse, treat, soothe, hydrate and protect — every step your
                skin needs, morning and night, in one herbal set.
              </p>
              <div className='billboard-price'>
                <strong>{formatPrice(comboPrice)}</strong>
                {saving >= MIN_SAVING && (
                  <>
                    <s>{formatPrice(separateTotal)}</s>
                    <span>Save {formatPrice(saving)}</span>
                  </>
                )}
              </div>
              <div className='button-row'>
                <Link className='button solid' href='/routine'>
                  Shop the Combo <ArrowRight size={16} />
                </Link>
                <a className='button outline' href='#products'>
                  Explore Products
                </a>
              </div>
            </>
          ) : (
            <>
              <p className='eyebrow'>5-Step Herbal Skincare Collection</p>
              <h1>
                CARE &amp;
                <br />
                CLEAN NEPAL
              </h1>
              <p className='hero-subline'>
                Complete Care for Your Everyday Skincare Routine.
              </p>
              <div className='button-row'>
                <Link className='button solid' href='/products'>
                  Shop Now <ArrowRight size={16} />
                </Link>
                <a className='button outline' href='#products'>
                  Explore Products
                </a>
              </div>
            </>
          )}
        </div>
        <div className='hero-visual fade-up'>
          <div className='arch'>
            <figure className='photo-frame hero-photo-frame'>
              <img
                src={DESIGN_IMAGES.heroCollection}
                alt='Model beside the complete Care and Clean Nepal skincare range'
                fetchPriority='high'
              />
            </figure>
          </div>
          {combo && (
            <Link className='billboard-tag' href='/routine'>
              <small>Combo Set</small>
              <b>{formatPrice(comboPrice)}</b>
            </Link>
          )}
          {rating.average !== null && (
            <p className='proof'>
              ⭐ {rating.average}/5 from {rating.count.toLocaleString('en-IN')}{' '}
              {rating.count === 1 ? 'review' : 'reviews'}
            </p>
          )}
        </div>
      </section>

      {/* ---------- Our Products: one product per slide ---------- */}
      {singles.length > 0 && (
        <section id='products' className='products section-pad'>
          <div className='section-heading centered fade-up'>
            <p className='eyebrow'>The complete collection</p>
            <h2>Our Products</h2>
          </div>
          <ProductSlider products={singles} />
          <Link className='button solid centered-button' href='/products'>
            View All Products <ArrowRight size={16} />
          </Link>
        </section>
      )}

      {/* ---------- Everyday essentials ---------- */}
      {featured.length > 0 && (
        <section className='featured section-pad'>
          <div className='section-heading centered fade-up'>
            <p className='eyebrow'>Featured Products</p>
            <h2>For Your Everyday Essentials</h2>
          </div>
          <div className='featured-marquee'>
            <div className='featured-track'>
              {/* Rendered twice so the CSS marquee loops seamlessly. */}
              {[...featured, ...featured].map((product, i) => {
                const clone = i >= featured.length;
                return (
                  <Link
                    key={`${product.id}-${i}`}
                    href={`/products/${product.slug}`}
                    className='mini-card'
                    aria-hidden={clone || undefined}
                    tabIndex={clone ? -1 : undefined}
                  >
                    <span className='mini-card-photo'>
                      <img
                        src={product.images[0] || DESIGN_IMAGES.flatLay}
                        alt={clone ? '' : displayName(product.name)}
                        loading='lazy'
                      />
                    </span>
                    <strong>{displayName(product.name)}</strong>
                    <span className='mini-card-price'>
                      {formatPrice(effectivePrice(product))}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
          <Link className='button solid centered-button' href='/products'>
            View Complete Collection <ArrowRight size={16} />
          </Link>
        </section>
      )}

      {/* ---------- Trust strip (below the products) ---------- */}
      <div className='trust-strip'>
        <div className='trust-item fade-up' style={{ transitionDelay: '0ms' }}>
          <Leaf /> <span>Herbal Ingredients</span>
        </div>
        <div className='trust-item fade-up' style={{ transitionDelay: '90ms' }}>
          <ShieldCheck /> <span>Dermatologically Tested</span>
        </div>
        <div
          className='trust-item fade-up'
          style={{ transitionDelay: '180ms' }}
        >
          <span className='emoji'>🐰</span>
          <span>Cruelty-Free</span>
        </div>
        <div
          className='trust-item fade-up'
          style={{ transitionDelay: '270ms' }}
        >
          <Mountain /> <span>Proudly Nepali</span>
        </div>
      </div>

      {/* ---------- Routine carousel ---------- */}
      {routine.length > 0 && (
        <section id='routine' className='routine section-pad'>
          <div className='section-heading centered fade-up'>
            <p className='eyebrow'>A little ritual, every day</p>
            <h2>Your Complete {routine.length}-Step Routine</h2>
            <p>Everything your skin needs — morning and night.</p>
          </div>
          <RoutineCarousel routine={routine} />
          <Link className='button solid centered-button' href='/routine'>
            Shop the Full Routine <ArrowRight size={16} />
          </Link>
        </section>
      )}

      {/* ---------- Contact ---------- */}
      <section id='contact' className='contact section-pad'>
        <div className='section-heading centered fade-up'>
          <p className='eyebrow'>We are here for you</p>
          <h2>Get in Touch</h2>
          <p>We&apos;d love to hear from you.</p>
        </div>
        <div className='contact-cards'>
          <article>
            <Headphones />
            <h3>Customer Support</h3>
            <div className='email-row'>
              <span>{contact.supportEmail}</span>
              <button
                type='button'
                onClick={() => copyEmail(contact.supportEmail)}
                aria-label='Copy customer support email'
              >
                <Clipboard size={17} />
              </button>
            </div>
            <p>For orders, returns and product queries.</p>
            {copied === contact.supportEmail && <small>Copied!</small>}
          </article>
          {sameEmail ? (
            <article>
              <Phone />
              <h3>Call or WhatsApp</h3>
              <div className='email-row'>
                <a href={`tel:${contact.phone.replace(/\s+/g, '')}`}>
                  {contact.phone}
                </a>
              </div>
              <p>Sunday – Friday, 9:00 AM – 7:00 PM.</p>
            </article>
          ) : (
            <article>
              <Mail />
              <h3>General Enquiries</h3>
              <div className='email-row'>
                <span>{contact.generalEmail}</span>
                <button
                  type='button'
                  onClick={() => copyEmail(contact.generalEmail)}
                  aria-label='Copy general enquiries email'
                >
                  <Clipboard size={17} />
                </button>
              </div>
              <p>For partnerships, press and everything else.</p>
              {copied === contact.generalEmail && <small>Copied!</small>}
            </article>
          )}
        </div>
        <button
          type='button'
          className='button solid centered-button'
          onClick={() => setFormOpen(open => !open)}
          aria-expanded={formOpen}
        >
          {formOpen ? 'Close Form' : 'Contact Us'}
        </button>
        {formOpen && <QuickContactForm onSent={() => setFormOpen(false)} />}
      </section>

      {/* ---------- FAQ ---------- */}
      <section id='faq' className='faq section-pad'>
        <div className='section-heading centered fade-up'>
          <p className='eyebrow'>Need to know</p>
          <h2>Frequently Asked Questions</h2>
        </div>
        <FaqAccordion faqs={faqs} />
      </section>

    </main>
  );
}

const STORY_HIGHLIGHTS = [
  {
    icon: Mountain,
    title: 'Born in Nepal',
    text: 'Care & Clean began with a single product — our 2-in-1 Face Pack of papaya, orange peel and multani mitti. It has since grown into a complete everyday routine, made right here in Nepal.'
  },
  {
    icon: Leaf,
    title: 'Nature First',
    text: 'Every formula starts with botanicals your skin recognises — aloe vera, papaya, cucumber, orange peel — paired with gentle, proven skincare science. No harsh chemicals, nothing your skin doesn’t need.'
  },
  {
    icon: Sparkles,
    title: 'Simple Routine, Real Results',
    text: 'Cleanse, treat, soothe, hydrate, protect. Five steps designed to work together, so caring for your skin takes minutes — not a shelf full of products.'
  },
  {
    icon: ShieldCheck,
    title: 'Our Promise',
    text: 'Dermatologically tested, cruelty-free and honestly priced — premium herbal skincare that every Nepali household can make part of its day.'
  }
];

export function AboutGrid() {
  return (
    <div className='about-grid'>
      <figure className='brand-art photo-frame fade-up'>
        <img
          src={DESIGN_IMAGES.flatLay}
          alt='Care and Clean Nepal products arranged with dried botanicals in a studio flat-lay'
          loading='lazy'
        />
        <figcaption>
          <span>
            Care from Nature,
            <br />
            Clean by Choice.
          </span>
          <small>Proudly Nepali · made for everyday</small>
        </figcaption>
      </figure>
      <div className='about-copy'>
        <p className='about-lead'>
          We believe good skincare shouldn’t be complicated or out of reach. So
          we make honest, herbal essentials — rooted in Nepal’s nature, made for
          your everyday.
        </p>
        {STORY_HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
          <article key={title}>
            <Icon size={24} />
            <div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function QuickContactForm({ onSent }: { onSent: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, subject: 'General Enquiry' })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to send message');
      toast.success("Message sent! We'll get back to you within 24 hours.");
      onSent();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSending(false);
    }
  };

  return (
    <form className='contact-form' onSubmit={submit}>
      <label>
        Name
        <input
          required
          type='text'
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
      </label>
      <label>
        Email
        <input
          required
          type='email'
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />
      </label>
      <label>
        Message
        <textarea
          required
          rows={4}
          value={form.message}
          onChange={e => setForm({ ...form, message: e.target.value })}
        />
      </label>
      <button className='button solid' type='submit' disabled={sending}>
        {sending ? 'Sending…' : 'Submit'}
      </button>
    </form>
  );
}
