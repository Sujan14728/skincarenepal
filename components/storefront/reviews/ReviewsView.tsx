'use client';
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Play } from 'lucide-react';
import MediaLightbox from '@/components/storefront/MediaLightbox';
import { starString } from '@/components/storefront/products/ProductCard';
import {
  DESIGN_IMAGES,
  initials,
  type PublicReview
} from '@/lib/storefront-utils';

export type ProductRating = {
  productId: number;
  product: string;
  score: number;
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

const stars = (n: number) => '★'.repeat(Math.max(1, Math.min(5, n)));

function wallHeight(review: PublicReview) {
  if (review.type === 'VIDEO') return 'wall-video';
  if (review.type === 'IMAGE') return 'wall-tall';
  const length = review.content?.length ?? 0;
  return length < 60 ? 'wall-short' : length < 110 ? 'wall-medium' : 'wall-tall';
}

export default function ReviewsView({
  reviews,
  ratings,
  overall
}: {
  reviews: PublicReview[];
  ratings: ProductRating[];
  overall: { average: number | null; count: number };
}) {
  const [index, setIndex] = useState(0);
  const [barsVisible, setBarsVisible] = useState(false);
  const [activeReview, setActiveReview] = useState<PublicReview | null>(null);
  const ratingsRef = useRef<HTMLElement>(null);

  // Written testimonials power the carousel.
  const quotes = useMemo(() => reviews.filter(r => r.content), [reviews]);
  const visibleQuotes = useMemo(
    () =>
      Array.from(
        { length: Math.min(3, quotes.length) },
        (_, i) => quotes[(index + i) % quotes.length]
      ),
    [quotes, index]
  );

  useEffect(() => {
    if (!ratingsRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setBarsVisible(true),
      { threshold: 0.25 }
    );
    observer.observe(ratingsRef.current);
    return () => observer.disconnect();
  }, []);

  const step = (delta: number) =>
    setIndex(i => (i + delta + quotes.length) % quotes.length);

  return (
    <main className='cc-reviews'>
      <section className='hero-band' id='top'>
        <div>
          <p className='eyebrow'>CUSTOMER REVIEWS</p>
          <h1>
            Real People.
            <br />
            Real Results.
          </h1>
          <p className='hero-subline'>
            Customers across Nepal have made Care &amp; Clean part of their
            daily routine.
          </p>
          {overall.average !== null && (
            <div className='stats'>
              <span className='stat-chip'>
                ⭐ {overall.average}/5 Average Rating
              </span>
              <span className='stat-chip'>
                {overall.count.toLocaleString('en-IN')} Customer{' '}
                {overall.count === 1 ? 'Review' : 'Reviews'}
              </span>
              <span className='stat-chip'>Shared on Instagram</span>
            </div>
          )}
        </div>
        <div className='portrait-wrap'>
          <img
            src={DESIGN_IMAGES.heroCollection}
            alt='Care and Clean customer with the complete skincare collection'
            fetchPriority='high'
          />
        </div>
      </section>

      {reviews.length === 0 ? (
        <section className='section'>
          <p className='empty-state'>
            Our community reviews are on their way. Follow us on Instagram to
            see the latest stories from our customers.
          </p>
        </section>
      ) : (
        <>
          {quotes.length > 0 && (
            <section className='section' id='testimonials'>
              <div className='section-heading'>
                <div>
                  <h2>What Our Customers Say</h2>
                  <p>Small rituals. Noticeable changes. Shared with love.</p>
                </div>
                {quotes.length > 3 && (
                  <div className='carousel-actions'>
                    <button
                      className='arrow-button'
                      aria-label='Previous reviews'
                      type='button'
                      onClick={() => step(-1)}
                    >
                      <ArrowLeft size={17} />
                    </button>
                    <button
                      className='arrow-button'
                      aria-label='Next reviews'
                      type='button'
                      onClick={() => step(1)}
                    >
                      <ArrowRight size={17} />
                    </button>
                  </div>
                )}
              </div>
              <div className='review-grid'>
                {visibleQuotes.map(review => (
                  <article key={review.id} className='review-card'>
                    <div
                      className='stars'
                      aria-label={`${review.rating} out of 5 stars`}
                    >
                      {stars(review.rating)}
                    </div>
                    <p className='quote'>“{review.content}”</p>
                    <div className='reviewer'>
                      <span className='avatar'>
                        {initials(review.customerName)}
                      </span>
                      <div>
                        <strong>{review.customerName}</strong>
                        {review.location && <span>{review.location}</span>}
                      </div>
                    </div>
                    {review.product && (
                      <span className='product-chip'>
                        {review.product.name}
                      </span>
                    )}
                  </article>
                ))}
              </div>
              {quotes.length > 3 && (
                <div className='dots' aria-label='Review carousel pages'>
                  {quotes.map((review, i) => (
                    <button
                      key={review.id}
                      className={`dot ${i === index ? 'active' : ''}`}
                      type='button'
                      aria-label={`Show review ${i + 1}`}
                      onClick={() => setIndex(i)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          <section className='section community' id='community'>
            <div className='section-heading'>
              <div>
                <h2>From Our Community</h2>
                <p>Real customers, real skin, real results.</p>
              </div>
            </div>
            <div className='wall'>
              {reviews.map(review => (
                <WallTile
                  key={review.id}
                  review={review}
                  onOpen={() => setActiveReview(review)}
                />
              ))}
            </div>
          </section>

          {ratings.length > 0 && (
            <section
              className='section rating-section'
              id='ratings'
              ref={ratingsRef}
            >
              <div className='section-heading'>
                <div>
                  <h2>Product Ratings</h2>
                  <p>The everyday essentials our community comes back to.</p>
                </div>
              </div>
              <div className='rating-grid'>
                {ratings.map(rating => (
                  <article key={rating.productId} className='rating-card'>
                    <h3>{rating.product}</h3>
                    <div className='score'>{rating.score}</div>
                    <div className='rating-stars' aria-hidden='true'>
                      {starString(rating.score)}
                    </div>
                    <p className='rating-count'>
                      {rating.count} {rating.count === 1 ? 'Review' : 'Reviews'}
                    </p>
                    {([5, 4, 3, 2, 1] as const).map(star => {
                      const pct = Math.round(
                        (rating.distribution[star] / rating.count) * 100
                      );
                      return (
                        <div key={star} className='bar-line'>
                          <span>{star}★</span>
                          <span className='bar'>
                            <i
                              style={{
                                transform: `scaleX(${barsVisible ? pct / 100 : 0})`
                              }}
                            />
                          </span>
                          <span className='bar-value'>
                            {barsVisible ? `${pct}%` : '0%'}
                          </span>
                        </div>
                      );
                    })}
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <section className='cta-band' id='shop'>
        <img
          className='cta-image'
          src={DESIGN_IMAGES.sunscreenModel}
          alt='Customer applying Care and Clean sunscreen to her cheek'
          loading='lazy'
        />
        <div className='cta-copy'>
          <h2>See the difference for yourself.</h2>
          <p>
            A considered routine, made with ingredients your skin can
            understand and results you can feel.
          </p>
          <Link className='outline-button' href='/products'>
            <Check size={15} /> <span>SHOP THE ROUTINE</span>
          </Link>
        </div>
      </section>

      <MediaLightbox
        review={activeReview}
        onClose={() => setActiveReview(null)}
      />
    </main>
  );
}

function WallTile({
  review,
  onOpen
}: {
  review: PublicReview;
  onOpen: () => void;
}) {
  const height = wallHeight(review);

  if (review.type === 'VIDEO' && review.mediaUrl) {
    return (
      <article
        className={`wall-tile video-tile ${height}`}
        onClick={onOpen}
        role='button'
        tabIndex={0}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onOpen()}
        aria-label={`Play video review by ${review.customerName}`}
      >
        {review.thumbnailUrl && (
          <img className='video-poster' src={review.thumbnailUrl} alt='' />
        )}
        <span className='video-label'>VIDEO REVIEW</span>
        <span className='play-button' aria-hidden='true'>
          <Play size={25} />
        </span>
        <div>
          <h3>{review.content || `${review.customerName}'s review`}</h3>
          <p className='video-product'>
            {stars(review.rating)} {review.product?.name ?? review.customerName}
          </p>
          <p className='watch'>WATCH NOW →</p>
        </div>
      </article>
    );
  }

  if (review.type === 'IMAGE' && review.mediaUrl) {
    return (
      <article
        className={`wall-tile photo-tile ${height}`}
        onClick={onOpen}
        role='button'
        tabIndex={0}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onOpen()}
        aria-label={`View photo review by ${review.customerName}`}
      >
        <img
          className='photo-media'
          src={review.mediaUrl}
          alt={`Photo shared by ${review.customerName}`}
          loading='lazy'
        />
        <h3>{review.customerName}</h3>
        <div className='tile-stars'>{stars(review.rating)}</div>
        {review.content && <p className='quote'>“{review.content}”</p>}
        {review.product && (
          <span className='product-chip'>{review.product.name}</span>
        )}
      </article>
    );
  }

  const tile = (
    <>
      <div className='phone-chrome'>
        <span className='phone-dots'>
          <i />
          <i />
          <i />
        </span>
        <span className='status-bar' />
      </div>
      <div className='chat-content'>
        <div className='chat-name'>{review.customerName}</div>
        <div className='bubble'>{review.content}</div>
      </div>
      <div className='tile-footer'>
        <span className='tile-stars'>{stars(review.rating)}</span>
        {review.product && (
          <span className='product-chip'>{review.product.name}</span>
        )}
      </div>
    </>
  );

  return review.instagramUrl ? (
    <a
      className={`wall-tile chat-tile ${height}`}
      href={review.instagramUrl}
      target='_blank'
      rel='noopener noreferrer'
      style={{ display: 'block' }}
    >
      {tile}
    </a>
  ) : (
    <article className={`wall-tile chat-tile ${height}`}>{tile}</article>
  );
}
