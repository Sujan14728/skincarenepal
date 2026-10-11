'use client';
/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Gift, MapPin, Moon, Sparkles, Sun } from 'lucide-react';
import FaqAccordion from '@/components/storefront/FaqAccordion';
import { Stars, buyLabel } from '@/components/storefront/products/ProductCard';
import type { Faq } from '@/lib/faqs';
import {
  DESIGN_IMAGES,
  STEP_TAGLINES,
  displayName,
  effectivePrice,
  formatPrice,
  getRoutineLabel,
  isPurchasable,
  type PublicReview,
  type StorefrontProduct
} from '@/lib/storefront-utils';

/** Which routine steps belong in the morning, at night and weekly. */
const RITUAL = [
  {
    title: 'Morning',
    icon: Sun,
    keys: ['CLEANSE', 'SOOTHE', 'HYDRATE', 'PROTECT']
  },
  { title: 'Night', icon: Moon, keys: ['CLEANSE', 'SOOTHE', 'HYDRATE'] },
  { title: '2–3× a week', icon: Sparkles, keys: ['CLEANSE', 'TREAT'] }
];

const WHY = [
  {
    title: 'Made to work together',
    text: 'Each step prepares your skin for the next, so every product does more than it would on its own.'
  },
  {
    title: 'Simple, not complicated',
    text: 'Five products, a few minutes a day. No guesswork about what to buy or what to use when.'
  },
  {
    title: 'The best value',
    text: 'One set covers your whole routine — and costs less than buying each product separately.'
  }
];

/**
 * A bundle landing page: what's inside, why it works, how to use it, the
 * value and its reviews. It is driven entirely by data, so a future combo
 * only needs a bundle product and its items to get the same page.
 */
export default function BundleView({
  bundle,
  items,
  reviews,
  faqs
}: {
  bundle: StorefrontProduct | null;
  items: StorefrontProduct[];
  reviews: PublicReview[];
  faqs: Faq[];
}) {
  const router = useRouter();
  const bundlePrice = bundle ? effectivePrice(bundle) : 0;
  const separateTotal = items.reduce((sum, p) => sum + effectivePrice(p), 0);
  const saving = bundle ? separateTotal - bundlePrice : 0;
  const purchasable = bundle ? isPurchasable(bundle) : false;
  const steps = items.length;
  // Only claim value when the set really costs less.
  const why = saving > 0 ? WHY : WHY.slice(0, 2);

  const buy = () => bundle && router.push(`/checkout?buy=${bundle.id}`);

  return (
    <main className='cc-page cc-bundle'>
      {/* ---------- Hero ---------- */}
      <section className='cc-bundle-hero'>
        <div className='cc-bundle-hero-copy'>
          <p className='cc-eyebrow'>THE COMPLETE {steps}-STEP ROUTINE</p>
          <h1>
            Everything your skin needs,
            <br />
            <em>in one set.</em>
          </h1>
          <p className='cc-bundle-lead'>
            Great skin isn&apos;t about more products — it&apos;s about the
            right ones, used every day. Our combo brings together every step of
            the Care &amp; Clean routine, so you can cleanse, treat, soothe,
            hydrate and protect without a second thought.
          </p>
          {bundle ? (
            <>
              <div className='cc-bundle-price'>
                <strong>{formatPrice(bundlePrice)}</strong>
                {saving > 0 && (
                  <>
                    <s>{formatPrice(separateTotal)}</s>
                    <span>You save {formatPrice(saving)}</span>
                  </>
                )}
              </div>
              {bundle.reviewCount > 0 && (
                <p className='cc-bundle-rating'>
                  <Stars rating={bundle.rating} /> {bundle.rating} ·{' '}
                  {bundle.reviewCount}{' '}
                  {bundle.reviewCount === 1 ? 'review' : 'reviews'}
                </p>
              )}
              <div className='cc-hero-actions'>
                <button
                  className='cc-button'
                  type='button'
                  disabled={!purchasable}
                  onClick={buy}
                >
                  {purchasable ? 'BUY THE COMBO' : buyLabel(bundle)}
                </button>
                <Link
                  className='cc-button cc-button-outline'
                  href={`/products/${bundle.slug}`}
                >
                  VIEW DETAILS
                </Link>
              </div>
            </>
          ) : (
            <div className='cc-hero-actions'>
              <Link className='cc-button' href='/products'>
                SHOP THE PRODUCTS <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
        <figure className='cc-bundle-hero-photo'>
          <img
            src={bundle?.images[0] || DESIGN_IMAGES.flatLay}
            alt='Every Care and Clean routine product together in one set'
            fetchPriority='high'
          />
          <figcaption>
            <Gift size={14} /> {steps} essentials · 1 set
          </figcaption>
        </figure>
      </section>

      {/* ---------- What's inside ---------- */}
      {items.length > 0 && (
        <section className='cc-bundle-section'>
          <div className='cc-bundle-heading'>
            <p className='cc-eyebrow'>WHAT&apos;S INSIDE</p>
            <h2>One set, {steps} steps</h2>
          </div>
          <ol className='cc-bundle-items'>
            {items.map((item, i) => (
              <li key={item.id}>
                <Link href={`/products/${item.slug}`}>
                  <figure>
                    <img
                      src={item.images[0] || DESIGN_IMAGES.flatLay}
                      alt={displayName(item.name)}
                      loading='lazy'
                    />
                  </figure>
                  <span className='cc-bundle-step'>
                    {String(i + 1).padStart(2, '0')} ·{' '}
                    {getRoutineLabel(item.routineKey)}
                  </span>
                  <h3>{displayName(item.name)}</h3>
                  <p>{STEP_TAGLINES[item.routineKey] || item.excerpt}</p>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* ---------- Why a routine ---------- */}
      <section className='cc-bundle-section cc-bundle-why'>
        <div className='cc-bundle-heading'>
          <p className='cc-eyebrow'>WHY A ROUTINE</p>
          <h2>Small steps, every day</h2>
        </div>
        <div className='cc-bundle-why-grid'>
          {why.map((point, i) => (
            <article key={point.title}>
              <b>{String(i + 1).padStart(2, '0')}</b>
              <h3>{point.title}</h3>
              <p>{point.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- How to use ---------- */}
      {items.length > 0 && (
        <section className='cc-bundle-section'>
          <div className='cc-bundle-heading'>
            <p className='cc-eyebrow'>YOUR DAILY RITUAL</p>
            <h2>How to use your set</h2>
          </div>
          <div className='cc-bundle-ritual'>
            {RITUAL.map(({ title, icon: Icon, keys }) => {
              const ritualSteps = keys
                .map(key => items.find(p => p.routineKey === key))
                .filter((p): p is StorefrontProduct => Boolean(p));
              if (ritualSteps.length === 0) return null;
              return (
                <article key={title}>
                  <h3>
                    <Icon size={18} /> {title}
                  </h3>
                  <ol>
                    {ritualSteps.map(p => (
                      <li key={p.id}>
                        <span>{getRoutineLabel(p.routineKey)}</span>
                        {displayName(p.name)}
                      </li>
                    ))}
                  </ol>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* ---------- Value ---------- */}
      {bundle && items.length > 0 && (
        <section className='cc-bundle-section'>
          <div className='cc-bundle-value'>
            <div>
              <p className='cc-eyebrow'>THE VALUE</p>
              <h2>Your routine, for less</h2>
              <p>
                Bought one by one, the full routine costs{' '}
                {formatPrice(separateTotal)}. The combo brings every step
                together for {formatPrice(bundlePrice)}.
              </p>
            </div>
            <table>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td>{displayName(item.name)}</td>
                    <td>{formatPrice(effectivePrice(item))}</td>
                  </tr>
                ))}
                <tr className='cc-bundle-total'>
                  <td>Bought separately</td>
                  <td>{formatPrice(separateTotal)}</td>
                </tr>
                <tr className='cc-bundle-combo'>
                  <td>Combo Set</td>
                  <td>{formatPrice(bundlePrice)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ---------- Reviews ---------- */}
      {reviews.length > 0 && (
        <section className='cc-bundle-section'>
          <div className='cc-bundle-heading'>
            <p className='cc-eyebrow'>LOVED BY OUR CUSTOMERS</p>
            <h2>What combo customers say</h2>
          </div>
          <div className='cc-bundle-reviews'>
            {reviews.slice(0, 3).map(review => (
              <article key={review.id}>
                <span className='cc-stars'>{'★'.repeat(review.rating)}</span>
                <p>“{review.content}”</p>
                <strong>{review.customerName}</strong>
                {review.location && (
                  <small>
                    <MapPin size={12} /> {review.location}
                  </small>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ---------- FAQ ---------- */}
      {faqs.length > 0 && (
        <section className='cc-bundle-section'>
          <div className='cc-bundle-heading'>
            <p className='cc-eyebrow'>GOOD TO KNOW</p>
            <h2>Combo questions</h2>
          </div>
          <FaqAccordion faqs={faqs} />
        </section>
      )}

      {/* ---------- Closing CTA ---------- */}
      {bundle && (
        <section className='cc-bundle-cta'>
          <h2>Start your routine today.</h2>
          <p>Every step your skin needs, in one set.</p>
          <button
            className='cc-button'
            type='button'
            disabled={!purchasable}
            onClick={buy}
          >
            {purchasable
              ? `BUY THE COMBO · ${formatPrice(bundlePrice)}`
              : buyLabel(bundle)}
          </button>
        </section>
      )}
    </main>
  );
}
