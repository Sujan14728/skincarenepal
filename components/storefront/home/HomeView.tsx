'use client';
/* eslint-disable @next/next/no-img-element */

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ArrowRight,
  Check,
  Clipboard,
  Headphones,
  Leaf,
  Mail,
  Phone,
  Play,
  ShieldCheck,
  Sparkles,
  Sun
} from 'lucide-react';
import FaqAccordion from '@/components/storefront/FaqAccordion';
import RevealOnScroll from '@/components/storefront/RevealOnScroll';
import MediaLightbox from '@/components/storefront/MediaLightbox';
import {
  DESIGN_IMAGES,
  getRoutineLabel,
  stripHtml,
  type ContactInfo,
  type PublicReview,
  type StorefrontProduct
} from '@/lib/storefront-utils';
import type { Faq } from '@/lib/faqs';

const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max).replace(/\s+\S*$/, '')}…` : text;

type HomeViewProps = {
  products: StorefrontProduct[];
  routine: StorefrontProduct[];
  reviews: PublicReview[];
  rating: { average: number | null; count: number };
  contact: ContactInfo;
  faqs: Faq[];
};

export default function HomeView({
  products,
  routine,
  reviews,
  rating,
  contact,
  faqs
}: HomeViewProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [copied, setCopied] = useState('');
  const [activeReview, setActiveReview] = useState<PublicReview | null>(null);

  const copyEmail = (email: string) => {
    navigator.clipboard?.writeText(email);
    setCopied(email);
    window.setTimeout(() => setCopied(''), 1600);
  };

  const sameEmail = contact.supportEmail === contact.generalEmail;

  return (
    <main className='cc-home'>
      <RevealOnScroll />

      {/* ---------- Hero ---------- */}
      <section id='home' className='hero section-pad'>
        <div className='hero-copy fade-up'>
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
        </div>
        <div className='hero-visual fade-up'>
          <div className='arch'>
            <figure className='photo-frame hero-photo-frame'>
              <img
                src={DESIGN_IMAGES.heroCollection}
                alt='Model beside the complete Care and Clean Nepal skincare range on a white pedestal'
                fetchPriority='high'
              />
            </figure>
            <span className='botanical-dots' aria-hidden='true'>
              • •<br />•
            </span>
          </div>
          {rating.average !== null && (
            <p className='proof'>
              ⭐ {rating.average}/5 from {rating.count.toLocaleString()}{' '}
              {rating.count === 1 ? 'review' : 'reviews'}
            </p>
          )}
        </div>
      </section>

      {/* ---------- Trust strip ---------- */}
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
          <Sun /> <span>SPF 50+ Protection</span>
        </div>
      </div>

      {/* ---------- Featured products ---------- */}
      {products.length > 0 && (
        <section className='featured section-pad'>
          <div className='featured-head'>
            <div className='section-heading fade-up'>
              <p className='eyebrow'>Featured Products</p>
              <h2>Our Everyday Essentials</h2>
            </div>
            <figure className='photo-frame featured-support fade-up'>
              <img
                src={DESIGN_IMAGES.flatLay}
                alt='Care and Clean Nepal product range styled with dried botanicals'
                loading='lazy'
              />
            </figure>
          </div>
          <div className='featured-row'>
            {products.map((product, i) => (
              <article
                key={product.id}
                className='product-card fade-up'
                style={{ transitionDelay: `${(i % 5) * 90}ms` }}
              >
                <Link
                  href={`/products/${product.slug}`}
                  className='photo-frame product-card-photo'
                  style={{ display: 'block' }}
                  tabIndex={-1}
                  aria-hidden='true'
                >
                  <img
                    src={product.images[0] || DESIGN_IMAGES.flatLay}
                    alt=''
                    loading='lazy'
                  />
                </Link>
                <div className='product-card-copy'>
                  <h3>{product.name}</h3>
                  <p>
                    {product.excerpt ||
                      truncate(stripHtml(product.description), 60)}
                  </p>
                  <Link
                    className='button outline small'
                    href={`/products/${product.slug}`}
                  >
                    Shop Now
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Product blocks ---------- */}
      {products.length > 0 && (
        <section id='products' className='products section-pad'>
          <div className='section-heading centered fade-up'>
            <p className='eyebrow'>The complete collection</p>
            <h2>Our Products</h2>
          </div>
          <div className='product-list'>
            {products.map((product, i) => {
              const step = String(i + 1).padStart(2, '0');
              const reverse = i % 2 === 1;
              const chips = (
                product.keyIngredients.length
                  ? product.keyIngredients
                  : product.keyBenefits
              ).slice(0, 4);
              return (
                <article
                  key={product.id}
                  className={`product-block ${reverse ? 'reverse' : ''}`}
                >
                  <div
                    className={`product-block-art fade-up ${reverse ? 'slide-in-right' : 'slide-in-left'}`}
                  >
                    <span className='step-number'>{step}</span>
                    <figure className='photo-frame product-block-photo'>
                      <img
                        src={product.images[0] || DESIGN_IMAGES.flatLay}
                        alt={product.name}
                        loading='lazy'
                      />
                    </figure>
                  </div>
                  <div className='product-details fade-up'>
                    <p className='eyebrow'>Step {step}</p>
                    <h3>{product.name}</h3>
                    <p>
                      {truncate(
                        stripHtml(product.description) || product.excerpt,
                        260
                      )}
                    </p>
                    {chips.length > 0 && (
                      <div className='chips'>
                        {chips.map((chip, n) => (
                          <span key={n}>{chip}</span>
                        ))}
                      </div>
                    )}
                    {product.howToUse.length > 0 && (
                      <>
                        <h4>How to use</h4>
                        <ol>
                          {product.howToUse.map((text, n) => (
                            <li key={n}>
                              <b>{n + 1}</b>
                              <span>{text}</span>
                            </li>
                          ))}
                        </ol>
                      </>
                    )}
                    <Link
                      className='button solid'
                      href={`/products/${product.slug}`}
                    >
                      Shop Now <ArrowRight size={16} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* ---------- Routine ---------- */}
      {routine.length > 0 && (
        <section id='routine' className='routine section-pad'>
          <div className='section-heading centered fade-up'>
            <h2>Your Complete {routine.length}-Step Routine</h2>
            <p>Everything your skin needs — morning and night.</p>
          </div>
          <div className='routine-steps'>
            {routine.map((product, i) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className='routine-step fade-up'
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <div className='routine-number'>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <strong>{getRoutineLabel(product.routineKey)}</strong>
                <figure className='photo-frame routine-photo'>
                  <img
                    src={product.images[0] || DESIGN_IMAGES.flatLay}
                    alt={product.name}
                    loading='lazy'
                  />
                </figure>
                <span>{product.name.replace('2-in-1 ', '')}</span>
              </Link>
            ))}
          </div>
          <figure className='photo-frame routine-flatlay fade-up'>
            <img
              src={DESIGN_IMAGES.flatLay}
              alt='The full Care and Clean Nepal daily skincare routine styled together'
              loading='lazy'
            />
          </figure>
          <Link className='button light-outline' href='/products#routine'>
            Explore the Routine
          </Link>
        </section>
      )}

      {/* ---------- Reviews ---------- */}
      {reviews.length > 0 && (
        <section id='reviews' className='reviews section-pad'>
          <div className='section-heading fade-up'>
            <p className='eyebrow'>Customer Reviews</p>
            <h2>Real Customer Experiences</h2>
          </div>
          <div className='review-grid'>
            {reviews.map(review => (
              <ReviewTile
                key={review.id}
                review={review}
                onOpen={() => setActiveReview(review)}
              />
            ))}
          </div>
          <Link className='button solid centered-button' href='/reviews'>
            Watch Customer Reviews
          </Link>
        </section>
      )}

      {/* ---------- About ---------- */}
      <section id='about' className='about section-pad'>
        <div className='section-heading centered fade-up'>
          <p className='eyebrow'>Our story</p>
          <h2>About Care &amp; Clean</h2>
        </div>
        <AboutGrid />
      </section>

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

      <MediaLightbox
        review={activeReview}
        onClose={() => setActiveReview(null)}
      />
    </main>
  );
}

function ReviewTile({
  review,
  onOpen
}: {
  review: PublicReview;
  onOpen: () => void;
}) {
  const kind =
    review.type === 'VIDEO' && review.mediaUrl
      ? 'video'
      : review.type === 'IMAGE' && review.mediaUrl
        ? 'photo'
        : 'chat';

  return (
    <article className={`review-tile ${kind}`}>
      {kind === 'chat' && (
        <div className='review-chat-content'>
          <div className='phone-top'>
            9:41 <span>•••</span>
          </div>
          <div className='chat-bubble'>
            {'★'.repeat(review.rating)}
            <br />
            <span>{review.content}</span>
          </div>
          <strong>{review.product?.name ?? 'Care & Clean Nepal'}</strong>
          <small>{review.customerName}</small>
        </div>
      )}
      {kind === 'photo' && (
        <figure
          className='photo-frame review-photo-frame'
          onClick={onOpen}
          style={{ cursor: 'zoom-in' }}
        >
          <img
            src={review.mediaUrl!}
            alt={`Photo review by ${review.customerName}`}
            loading='lazy'
          />
          <figcaption>
            <strong>Customer Photo</strong>
          </figcaption>
        </figure>
      )}
      {kind === 'video' && (
        <>
          {review.thumbnailUrl && (
            <img
              className='video-poster'
              src={review.thumbnailUrl}
              alt=''
              loading='lazy'
            />
          )}
          <div className='review-video-content'>
            <button
              type='button'
              className='play'
              aria-label={`Play video review by ${review.customerName}`}
              onClick={onOpen}
            >
              <Play fill='currentColor' />
            </button>
            <strong>{review.content || 'Video Review'}</strong>
            <span>{'★'.repeat(review.rating)}</span>
          </div>
        </>
      )}
    </article>
  );
}

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
            CARE &amp;
            <br />
            CLEAN NEPAL
          </span>
          <small>Rooted in nature · made for everyday</small>
        </figcaption>
      </figure>
      <div className='about-copy'>
        <article>
          <Leaf size={24} />
          <div>
            <h3>Brand Introduction</h3>
            <p>
              Care &amp; Clean Nepal is a homegrown herbal skincare brand built
              on the belief that everyday skincare should be simple, effective
              and rooted in nature.
            </p>
          </div>
        </article>
        <article>
          <Sparkles size={24} />
          <div>
            <h3>Our Approach</h3>
            <p>
              We combine time-tested botanical ingredients with modern skincare
              science to create gentle, result-driven formulas that work for
              all skin types.
            </p>
          </div>
        </article>
        <article>
          <Check size={24} />
          <div>
            <h3>Our Products</h3>
            <p>
              Every product in our range is carefully formulated — free from
              harsh chemicals, dermatologically tested and designed to form a
              complete daily routine.
            </p>
          </div>
        </article>
        <article>
          <ShieldCheck size={24} />
          <div>
            <h3>Our Commitment</h3>
            <p>
              We are committed to cruelty-free, sustainable practices and to
              making premium herbal skincare accessible to every Nepali
              household.
            </p>
          </div>
        </article>
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
