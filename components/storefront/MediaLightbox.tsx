'use client';
/* eslint-disable @next/next/no-img-element */

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { PublicReview } from '@/lib/storefront-utils';

/** Full-screen player for a video (or image) review. */
export default function MediaLightbox({
  review,
  onClose
}: {
  review: PublicReview | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!review) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [review, onClose]);

  if (!review?.mediaUrl) return null;

  // Portal into the storefront root so the .cc-site styles still apply.
  const root = document.querySelector('.cc-site') ?? document.body;

  return createPortal(
    <div
      className='cc-lightbox'
      role='dialog'
      aria-modal='true'
      aria-label={`Review by ${review.customerName}`}
      onClick={onClose}
    >
      <div className='cc-lightbox-inner' onClick={e => e.stopPropagation()}>
        {review.type === 'VIDEO' ? (
          <video
            src={review.mediaUrl}
            poster={review.thumbnailUrl ?? undefined}
            controls
            autoPlay
            playsInline
          />
        ) : (
          <img src={review.mediaUrl} alt={`Review by ${review.customerName}`} />
        )}
        <button
          type='button'
          className='cc-lightbox-close'
          onClick={onClose}
          aria-label='Close'
        >
          <X size={20} />
        </button>
        <p className='cc-lightbox-meta'>
          {review.customerName}
          {review.product ? ` · ${review.product.name}` : ''}
          {review.instagramUrl && (
            <>
              {' · '}
              <a
                href={review.instagramUrl}
                target='_blank'
                rel='noopener noreferrer'
              >
                View on Instagram ↗
              </a>
            </>
          )}
        </p>
      </div>
    </div>,
    root
  );
}
