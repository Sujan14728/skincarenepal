import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { displayName, type StorefrontProduct } from '@/lib/storefront-utils';

export default function RoutineBand({
  routine,
  ctaHref
}: {
  routine: StorefrontProduct[];
  ctaHref: string;
}) {
  if (routine.length === 0) return null;

  return (
    <section className='cc-routine' id='routine'>
      <div className='cc-routine-heading'>
        <p className='cc-eyebrow'>A LITTLE RITUAL, EVERY DAY</p>
        <h2>
          Build Your Complete
          <br />
          <em>Routine</em>
        </h2>
        <p>
          Simple, effective care in {routine.length} thoughtful steps. Your skin
          will thank you.
        </p>
      </div>
      <div className='cc-flow' aria-label='Skincare routine steps'>
        {routine.map((product, i) => (
          <div key={product.id} className='cc-flow-step'>
            <span>{String(i + 1).padStart(2, '0')}</span>
            <strong>{displayName(product.name)}</strong>
            {i < routine.length - 1 ? <i aria-hidden='true' /> : null}
          </div>
        ))}
      </div>
      <Link className='cc-button cc-button-light' href={ctaHref}>
        SHOP THE FULL ROUTINE <ArrowUpRight size={15} />
      </Link>
    </section>
  );
}
