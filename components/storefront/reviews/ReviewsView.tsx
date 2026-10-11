'use client';
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Play } from 'lucide-react';
import MediaLightbox from '@/components/storefront/MediaLightbox';
import { starString } from '@/components/storefront/products/ProductCard';
import {
  DESIGN_IMAGES,
  SOCIAL_LINKS,
  displayName,
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
  return length < 60
    ? 'wall-short'
    : length < 110
      ? 'wall-medium'
      : 'wall-tall';
}

/** Reviews of one product, shown as its own section. */
export type ReviewGroup = {
  key: string;
  title: string;
  eyebrow: string;
  slug: string | null;
  rating: { score: number; count: number } | null;
  reviews: PublicReview[];
};

export default function ReviewsView({
  reviews,
  groups,
  dms,
  ratings,
  overall
}: {
  reviews: PublicReview[];
  groups: ReviewGroup[];
  dms: PublicReview[];
  ratings: ProductRating[];
  overall: { average: number | null; count: number };
}) {
  const [barsVisible, setBarsVisible] = useState(false);
  const [activeReview, setActiveReview] = useState<PublicReview | null>(null);
  const ratingsRef = useRef<HTMLElement>(null);

  const dmTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ratingsRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setBarsVisible(true),
      { threshold: 0.25 }
    );
    observer.observe(ratingsRef.current);
    return () => observer.disconnect();
  }, []);

  // Scroll the DM slider by roughly one card.
  const scrollDms = (direction: number) => {
    const track = dmTrackRef.current;
    if (!track) return;
    track.scrollBy({
      left: direction * Math.min(track.clientWidth, 340),
      behavior: 'smooth'
    });
  };

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
          {groups.map(group => (
            <section
              key={group.key}
              className='section product-reviews'
              id={`reviews-${group.key.toLowerCase()}`}
            >
              <div className='section-heading'>
                <div>
                  <p className='eyebrow'>{group.eyebrow}</p>
                  <h2>{group.title}</h2>
                  {group.rating && (
                    <p>
                      <span className='group-stars'>
                        {starString(group.rating.score)}
                      </span>{' '}
                      {group.rating.score} · {group.rating.count}{' '}
                      {group.rating.count === 1 ? 'review' : 'reviews'}
                    </p>
                  )}
                </div>
                {group.slug && (
                  <Link
                    className='outline-button'
                    href={`/products/${group.slug}`}
                  >
                    <span>SHOP {group.title.toUpperCase()}</span>
                  </Link>
                )}
              </div>
              <div className='wall'>
                {group.reviews.map(review => (
                  <WallTile
                    key={review.id}
                    review={review}
                    onOpen={() => setActiveReview(review)}
                  />
                ))}
              </div>
            </section>
          ))}

          <section className='section dm-section' id='from-our-dms'>
            <div className='section-heading'>
              <div>
                <p className='eyebrow'>SOCIAL LOVE</p>
                <h2>From Our DMs</h2>
                <p>
                  The best messages from our Instagram, Facebook and TikTok —
                  straight from our inbox.
                </p>
              </div>
              {dms.length > 1 && (
                <div className='carousel-actions'>
                  <button
                    className='arrow-button'
                    aria-label='Previous messages'
                    type='button'
                    onClick={() => scrollDms(-1)}
                  >
                    <ArrowLeft size={17} />
                  </button>
                  <button
                    className='arrow-button'
                    aria-label='Next messages'
                    type='button'
                    onClick={() => scrollDms(1)}
                  >
                    <ArrowRight size={17} />
                  </button>
                </div>
              )}
            </div>
            {dms.length > 0 ? (
              <div className='dm-track' ref={dmTrackRef}>
                {dms.map(review => (
                  <WallTile
                    key={review.id}
                    review={review}
                    onOpen={() => setActiveReview(review)}
                  />
                ))}
              </div>
            ) : (
              <p className='empty-state'>
                Our favourite DMs are coming soon. Send us yours on{' '}
                <a
                  href={SOCIAL_LINKS.instagram}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Instagram
                </a>
                !
              </p>
            )}
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
                    <h3>{displayName(rating.product)}</h3>
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
            A considered routine, made with ingredients your skin can understand
            and results you can feel.
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
            {stars(review.rating)}{' '}
            {review.product
              ? displayName(review.product.name)
              : review.customerName}
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
          <span className='product-chip'>
            {displayName(review.product.name)}
          </span>
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
        <div className='chat-name'>
          {review.customerName}
          {review.location && (
            <span className='chat-location'> · {review.location}</span>
          )}
        </div>
        <div className='bubble'>{review.content}</div>
      </div>
      <div className='tile-footer'>
        <span className='tile-stars'>{stars(review.rating)}</span>
        {review.product && (
          <span className='product-chip'>
            {displayName(review.product.name)}
          </span>
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
