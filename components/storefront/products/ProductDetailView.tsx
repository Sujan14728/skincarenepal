'use client';
/* eslint-disable @next/next/no-img-element */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Droplets, Leaf, Play, Sparkles } from 'lucide-react';
import FaqAccordion from '@/components/storefront/FaqAccordion';
import MediaLightbox from '@/components/storefront/MediaLightbox';
import { getProductFaqs } from '@/lib/faqs';
import {
  DESIGN_IMAGES,
  displayName,
  getRoutineIndex,
  getRoutineLabel,
  isPurchasable,
  type PublicReview,
  type StorefrontProduct
} from '@/lib/storefront-utils';
import { CardBody, Price, Stars, buyLabel } from './ProductCard';
import RoutineBand from './RoutineBand';

const TABS = ['HOW TO USE', 'INGREDIENTS', 'BENEFITS', 'REVIEWS'] as const;
type Tab = (typeof TABS)[number];

const TRUST_MARKERS = [
  'Dermatologically Tested',
  'Cruelty-Free',
  'Herbal',
  'No Harsh Chemicals'
];

const BENEFIT_ICONS = [Sparkles, Droplets, Leaf];

/** "Visible Glow: Helps revive dull skin" → title + description. */
function splitBenefit(benefit: string) {
  const match = benefit.match(/^(.{2,40}?)\s*[:–—-]\s+(.+)$/);
  return match
    ? { title: match[1], description: match[2] }
    : { title: benefit, description: '' };
}

export default function ProductDetailView({
  product,
  related,
  routine,
  reviews
}: {
  product: StorefrontProduct;
  related: StorefrontProduct[];
  routine: StorefrontProduct[];
  reviews: PublicReview[];
}) {
  const router = useRouter();
  const [imageIndex, setImageIndex] = useState(0);
  const [tab, setTab] = useState<Tab>('HOW TO USE');
  const [activeReview, setActiveReview] = useState<PublicReview | null>(null);

  const images = product.images.length
    ? product.images
    : [DESIGN_IMAGES.flatLay];
  const purchasable = isPurchasable(product);
  const faqs = getProductFaqs(product.routineKey);
  const eyebrow =
    product.routineKey === 'CARE'
      ? 'CARE & CLEAN NEPAL'
      : `STEP ${String(getRoutineIndex(product.routineKey) + 1).padStart(2, '0')} · ${getRoutineLabel(product.routineKey).toUpperCase()}`;

  return (
    <main className='cc-page'>
      <div className='cc-view cc-view-detail'>
        <section
          className='cc-detail-breadcrumb'
          aria-label='Product breadcrumb'
        >
          <div className='cc-detail-shell cc-breadcrumb-inner'>
            <Link className='cc-back-link' href='/products'>
              ← Back to Products
            </Link>
            <p>Products / {product.name}</p>
          </div>
        </section>

        <section
          className='cc-detail-hero'
          aria-labelledby='detail-product-title'
        >
          <div className='cc-detail-shell cc-detail-hero-grid'>
            <div className='cc-detail-media-column'>
              <figure className='cc-detail-main-image'>
                <img
                  key={imageIndex}
                  src={images[imageIndex]}
                  alt={`${product.name} product view`}
                  fetchPriority='high'
                />
              </figure>
              {images.length > 1 && (
                <div
                  className='cc-detail-thumbs'
                  aria-label={`${product.name} image options`}
                >
                  {images.map((src, i) => (
                    <button
                      key={`${src}-${i}`}
                      className={`cc-detail-thumb ${imageIndex === i ? 'cc-detail-thumb-active' : ''}`}
                      type='button'
                      aria-label={`Show ${product.name} image ${i + 1}`}
                      onClick={() => setImageIndex(i)}
                    >
                      <img src={src} alt='' aria-hidden='true' />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className='cc-detail-copy-column'>
              <p className='cc-detail-eyebrow'>{eyebrow}</p>
              <h1 id='detail-product-title'>{product.name}</h1>
              {product.reviewCount > 0 && (
                <div
                  className='cc-detail-rating'
                  aria-label={`${product.rating} out of 5 stars from ${product.reviewCount} reviews`}
                >
                  <Stars rating={product.rating} />
                  <strong>{product.rating}</strong>
                  <span>
                    ({product.reviewCount}{' '}
                    {product.reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}
              <Price product={product} className='cc-detail-price' />
              {product.excerpt && (
                <p className='cc-detail-tagline'>
                  <em>{product.excerpt}</em>
                </p>
              )}
              <hr className='cc-detail-divider' />
              {product.description && (
                <div
                  className='cc-detail-description'
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              )}
              {product.keyIngredients.length > 0 && (
                <ul
                  className='cc-detail-chips'
                  aria-label={`${product.name} key ingredients`}
                >
                  {product.keyIngredients.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
              <hr className='cc-detail-divider' />
              <button
                className='cc-detail-buy'
                type='button'
                disabled={!purchasable}
                onClick={() => router.push(`/checkout?buy=${product.id}`)}
              >
                {buyLabel(product)}
              </button>
              <ul
                className='cc-detail-trust'
                aria-label='Product trust markers'
              >
                {TRUST_MARKERS.map(marker => (
                  <li key={marker}>
                    <Check size={16} aria-hidden='true' />
                    <span>{marker}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section
          className='cc-detail-tabs-section'
          id='reviews'
          aria-labelledby='detail-tabs-title'
        >
          <div className='cc-detail-shell'>
            <h2 className='cc-visually-hidden' id='detail-tabs-title'>
              Product details
            </h2>
            <div
              className='cc-detail-tabbar'
              role='tablist'
              aria-label={`${product.name} details`}
            >
              {TABS.map(item => (
                <button
                  key={item}
                  className={`cc-detail-tab ${tab === item ? 'cc-detail-tab-active' : ''}`}
                  type='button'
                  role='tab'
                  aria-selected={tab === item}
                  onClick={() => setTab(item)}
                >
                  {item}
                  {item === 'REVIEWS' && reviews.length > 0
                    ? ` (${reviews.length})`
                    : ''}
                </button>
              ))}
            </div>

            <div className='cc-detail-tab-panel' role='tabpanel'>
              {tab === 'HOW TO USE' &&
                (product.howToUse.length ? (
                  <ol className='cc-detail-steps'>
                    {product.howToUse.map((step, i) => (
                      <li key={i}>
                        <span>{i + 1}</span>
                        <p>{step}</p>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className='cc-tab-empty'>
                    Usage directions are printed on the pack.
                  </p>
                ))}

              {tab === 'INGREDIENTS' &&
                (product.keyIngredients.length || product.suitableFor.length ? (
                  <div className='cc-ingredients-grid'>
                    <ul
                      className='cc-detail-chips cc-ingredient-chip-grid'
                      aria-label={`${product.name} complete ingredients`}
                    >
                      {product.keyIngredients.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                    {product.suitableFor.length > 0 && (
                      <aside className='cc-ingredient-callout'>
                        <h3>Suitable for</h3>
                        <p>{product.suitableFor.join(', ')}.</p>
                      </aside>
                    )}
                  </div>
                ) : (
                  <p className='cc-tab-empty'>
                    The full ingredient list is printed on the pack.
                  </p>
                ))}

              {tab === 'BENEFITS' &&
                (product.keyBenefits.length ? (
                  <div className='cc-benefit-grid'>
                    {product.keyBenefits.map((benefit, i) => {
                      const { title, description } = splitBenefit(benefit);
                      const Icon = BENEFIT_ICONS[i % BENEFIT_ICONS.length];
                      return (
                        <article key={i} className='cc-benefit-card'>
                          <Icon size={24} aria-hidden='true' />
                          <h3>{title}</h3>
                          {description && <p>{description}</p>}
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <p className='cc-tab-empty'>Benefits coming soon.</p>
                ))}

              {tab === 'REVIEWS' &&
                (reviews.length ? (
                  <div className='cc-review-grid'>
                    {reviews.map(review => (
                      <ProductReviewCard
                        key={review.id}
                        review={review}
                        productName={product.name}
                        onOpen={() => setActiveReview(review)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className='cc-tab-empty'>
                    No reviews yet.{' '}
                    <Link href='/reviews' style={{ color: 'var(--cc-green)' }}>
                      See what customers say about our range →
                    </Link>
                  </p>
                ))}
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className='cc-related' aria-labelledby='related-title'>
            <div className='cc-detail-shell'>
              <h3 id='related-title'>Complete Your Routine</h3>
              <div className='cc-related-row'>
                {related.map(item => (
                  <article key={item.id} className='cc-related-card'>
                    <Link
                      className='cc-card-hit'
                      href={`/products/${item.slug}`}
                      aria-label={`View ${item.name} details`}
                    >
                      <CardBody product={item} />
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {faqs.length > 0 && (
          <section className='cc-product-faq' aria-labelledby='faq-title'>
            <div className='cc-detail-shell'>
              <h3 id='faq-title'>
                Questions about {displayName(product.name)}
              </h3>
              <FaqAccordion faqs={faqs} />
            </div>
          </section>
        )}

        <RoutineBand routine={routine} ctaHref='/routine' />
      </div>

      <MediaLightbox
        review={activeReview}
        onClose={() => setActiveReview(null)}
      />
    </main>
  );
}

function ProductReviewCard({
  review,
  productName,
  onOpen
}: {
  review: PublicReview;
  productName: string;
  onOpen: () => void;
}) {
  const hasMedia =
    (review.type === 'IMAGE' || review.type === 'VIDEO') && review.mediaUrl;
  const preview =
    review.type === 'VIDEO' ? review.thumbnailUrl : review.mediaUrl;

  return (
    <article className='cc-review-card'>
      {hasMedia && (
        <button
          type='button'
          onClick={onOpen}
          aria-label={`Open ${review.type === 'VIDEO' ? 'video' : 'photo'} review by ${review.customerName}`}
          style={{
            position: 'relative',
            display: 'block',
            width: '100%',
            padding: 0,
            border: 0,
            background: 'none'
          }}
        >
          {preview ? (
            <img className='cc-review-media' src={preview} alt='' />
          ) : (
            <span
              className='cc-review-media'
              style={{ background: 'var(--cc-forest)' }}
            />
          )}
          {review.type === 'VIDEO' && (
            <span
              style={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                marginBottom: 16
              }}
            >
              <span
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'var(--cc-sun)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#fff'
                }}
              >
                <Play size={22} fill='currentColor' />
              </span>
            </span>
          )}
        </button>
      )}
      <div
        className='cc-review-stars'
        aria-label={`${review.rating} out of 5 stars`}
      >
        {'★'.repeat(review.rating)}
      </div>
      <p className='cc-reviewer'>
        <strong>{review.customerName}</strong>
        {review.location && <span>{review.location}</span>}
      </p>
      {review.content && <blockquote>{review.content}</blockquote>}
      <span className='cc-review-chip'>{productName}</span>
    </article>
  );
}
