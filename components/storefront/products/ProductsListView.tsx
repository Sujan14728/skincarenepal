'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ROUTINE_STEPS,
  isPurchasable,
  type StorefrontProduct
} from '@/lib/storefront-utils';
import { CardBody, buyLabel } from './ProductCard';
import RoutineBand from './RoutineBand';

export default function ProductsListView({
  products,
  routine
}: {
  products: StorefrontProduct[];
  routine: StorefrontProduct[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState('ALL');
  const cardRefs = useRef<Record<number, HTMLElement | null>>({});

  // Only offer filters for routine steps that actually have products.
  const filters = useMemo(
    () => [
      'ALL',
      ...(['COMBO', ...ROUTINE_STEPS.map(s => s.key)] as const).filter(key =>
        products.some(p => p.routineKey === key)
      )
    ],
    [products]
  );

  const visible = products.filter(
    p => filter === 'ALL' || p.routineKey === filter
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries =>
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('cc-visible');
        }),
      { threshold: 0.12 }
    );
    Object.values(cardRefs.current)
      .filter(Boolean)
      .forEach(el => observer.observe(el!));
    return () => observer.disconnect();
  }, [filter, products]);

  const openProduct = (product: StorefrontProduct) =>
    router.push(`/products/${product.slug}`);

  return (
    <main className='cc-page'>
      <div className='cc-view cc-view-listing'>
        <section
          className='cc-products cc-products-top'
          id='products'
          aria-labelledby='products-title'
        >
          <div className='cc-product-shell'>
            <div className='cc-products-heading'>
              <p className='cc-eyebrow'>COMPLETE SKINCARE RANGE</p>
              <h2 id='products-title'>Our Products</h2>
            </div>
            <div
              className='cc-filter-bar'
              aria-label='Product catalogue filters'
            >
              <p>
                Showing {visible.length}{' '}
                {visible.length === 1 ? 'product' : 'products'}
              </p>
              <div
                className='cc-filter-pills'
                role='group'
                aria-label='Filter products by routine step'
              >
                {filters.map(key => (
                  <button
                    key={key}
                    className={`cc-filter-pill ${filter === key ? 'cc-filter-pill-active' : ''}`}
                    type='button'
                    aria-pressed={filter === key}
                    onClick={() => setFilter(key)}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
            <div className='cc-catalogue-grid'>
              {visible.length === 0 && (
                <p className='cc-empty'>
                  New products are on their way. Check back soon!
                </p>
              )}
              {visible.map((product, i) => {
                const purchasable = isPurchasable(product);
                return (
                  <article
                    key={product.id}
                    ref={el => {
                      cardRefs.current[product.id] = el;
                    }}
                    className='cc-catalogue-card'
                    style={{ transitionDelay: `${(i % 6) * 80}ms` }}
                  >
                    <Link
                      className='cc-card-hit'
                      href={`/products/${product.slug}`}
                      aria-label={`View ${product.name} details`}
                    >
                      <CardBody product={product} />
                    </Link>
                    <div className='cc-card-buttons'>
                      <button
                        className='cc-buy-button'
                        type='button'
                        disabled={!purchasable}
                        onClick={() =>
                          router.push(`/checkout?buy=${product.id}`)
                        }
                      >
                        {buyLabel(product)}
                      </button>
                      <button
                        className='cc-detail-button'
                        type='button'
                        onClick={() => openProduct(product)}
                      >
                        VIEW DETAILS
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <RoutineBand routine={routine} ctaHref='/routine' />
      </div>
    </main>
  );
}
