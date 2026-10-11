'use client';
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  DESIGN_IMAGES,
  STEP_PHOTOS,
  STEP_TAGLINES,
  displayName,
  getRoutineLabel,
  stripHtml,
  type StorefrontProduct
} from '@/lib/storefront-utils';

const AUTOPLAY_MS = 4500;

/** Cards visible at once: 3 on desktop, 1 on phones. */
function usePerView() {
  const [perView, setPerView] = useState(3);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 760px)');
    const update = () => setPerView(mq.matches ? 1 : 3);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return perView;
}

/** The routine as an auto-playing carousel of photoshoot cards. */
export default function RoutineCarousel({
  routine
}: {
  routine: StorefrontProduct[];
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const perView = usePerView();
  const count = routine.length;

  useEffect(() => {
    if (paused || count < 2) return;
    const id = window.setInterval(
      () => setActive(i => (i + 1) % count),
      AUTOPLAY_MS
    );
    return () => window.clearInterval(id);
  }, [paused, count]);

  if (count === 0) return null;

  // Keep the active card in view, centred where possible.
  const maxOffset = Math.max(0, count - perView);
  const offset = Math.min(
    maxOffset,
    Math.max(0, active - (perView === 3 ? 1 : 0))
  );
  const go = (delta: number) => setActive(i => (i + delta + count) % count);

  return (
    <div
      className='routine-carousel'
      style={{ '--per-view': perView } as React.CSSProperties}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription='carousel'
      aria-label='Your skincare routine'
    >
      <div className='routine-tabs' role='tablist'>
        {routine.map((product, i) => (
          <button
            key={product.id}
            type='button'
            role='tab'
            aria-selected={i === active}
            className={i === active ? 'active' : ''}
            onClick={() => setActive(i)}
          >
            <b>{String(i + 1).padStart(2, '0')}</b>
            <span>{getRoutineLabel(product.routineKey)}</span>
          </button>
        ))}
      </div>

      <div className='routine-viewport'>
        <div
          className='routine-track'
          style={{ '--offset': offset } as React.CSSProperties}
        >
          {routine.map((product, i) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className={`routine-card ${i === active ? 'active' : ''}`}
            >
              <figure>
                <img
                  src={
                    STEP_PHOTOS[product.routineKey] ||
                    product.images[0] ||
                    DESIGN_IMAGES.flatLay
                  }
                  alt={`${displayName(product.name)} in our routine photoshoot`}
                />
                <span className='routine-card-step'>
                  {String(i + 1).padStart(2, '0')}
                </span>
              </figure>
              <div className='routine-card-copy'>
                <p className='eyebrow'>{getRoutineLabel(product.routineKey)}</p>
                <h3>{displayName(product.name)}</h3>
                <p>
                  {STEP_TAGLINES[product.routineKey] ||
                    product.excerpt ||
                    stripHtml(product.description)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {count > 1 && (
        <div className='slider-controls'>
          <button
            type='button'
            className='slider-arrow'
            aria-label='Previous step'
            onClick={() => go(-1)}
          >
            <ArrowLeft size={18} />
          </button>
          <div className='slider-dots'>
            {routine.map((product, i) => (
              <button
                key={product.id}
                type='button'
                className={i === active ? 'active' : ''}
                aria-label={`Show step ${i + 1}`}
                onClick={() => setActive(i)}
              />
            ))}
          </div>
          <button
            type='button'
            className='slider-arrow'
            aria-label='Next step'
            onClick={() => go(1)}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
