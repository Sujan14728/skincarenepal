'use client';
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef } from 'react';
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
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Kept in a ref so a parent re-render doesn't re-run the focus effect.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const isOpen = Boolean(review?.mediaUrl);

  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onCloseRef.current();
      if (e.key !== 'Tab' || !dialogRef.current) return;
      // Keep focus inside the modal.
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, a[href], video[controls], [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      opener?.focus();
    };
  }, [isOpen]);

  if (!review?.mediaUrl) return null;

  // Portal into the storefront root so the .cc-site styles still apply.
  const root = document.querySelector('.cc-site') ?? document.body;

  return createPortal(
    <div
      ref={dialogRef}
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
          ref={closeRef}
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
