'use client';
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  DESIGN_IMAGES,
  displayName,
  stripHtml,
  type StorefrontProduct
} from '@/lib/storefront-utils';

const AUTOPLAY_MS = 7000;

const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max).replace(/\s+\S*$/, '')}…` : text;

/** "Our Products": one product story per slide, with arrows, dots and autoplay. */
export default function ProductSlider({
  products
}: {
  products: StorefrontProduct[];
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = products.length;

  useEffect(() => {
    if (paused || count < 2) return;
    const id = window.setInterval(
      () => setIndex(i => (i + 1) % count),
      AUTOPLAY_MS
    );
    return () => window.clearInterval(id);
  }, [paused, count]);

  if (count === 0) return null;
  const go = (delta: number) => setIndex(i => (i + delta + count) % count);

  return (
    <div
      className='product-slider'
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription='carousel'
      aria-label='Our products'
    >
      <div className='product-slider-viewport'>
        <div
          className='product-slider-track'
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {products.map((product, i) => {
            const step = String(i + 1).padStart(2, '0');
            const chips = (
              product.keyIngredients.length
                ? product.keyIngredients
                : product.keyBenefits
            ).slice(0, 4);
            return (
              <article
                key={product.id}
                className='product-block product-slide'
                aria-roledescription='slide'
                aria-label={`${i + 1} of ${count}`}
                aria-hidden={i !== index}
                inert={i !== index}
              >
                <div className='product-block-art'>
                  <span className='step-number'>{step}</span>
                  <figure className='photo-frame product-block-photo'>
                    <img
                      src={product.images[0] || DESIGN_IMAGES.flatLay}
                      alt={displayName(product.name)}
                      loading={i === 0 ? 'eager' : 'lazy'}
                    />
                  </figure>
                </div>
                <div className='product-details'>
                  <p className='eyebrow'>Step {step}</p>
                  <h3>{displayName(product.name)}</h3>
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
                        {product.howToUse.slice(0, 4).map((text, n) => (
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
      </div>

      {count > 1 && (
        <div className='slider-controls'>
          <button
            type='button'
            className='slider-arrow'
            aria-label='Previous product'
            onClick={() => go(-1)}
          >
            <ArrowLeft size={18} />
          </button>
          <div className='slider-dots'>
            {products.map((product, i) => (
              <button
                key={product.id}
                type='button'
                className={i === index ? 'active' : ''}
                aria-label={`Show ${displayName(product.name)}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
          <button
            type='button'
            className='slider-arrow'
            aria-label='Next product'
            onClick={() => go(1)}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
