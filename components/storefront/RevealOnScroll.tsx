'use client';

import { useEffect } from 'react';

/** Adds `.visible` to every `.fade-up` element as it scrolls into view. */
export default function RevealOnScroll({ deps = [] }: { deps?: unknown[] }) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries =>
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 }
    );
    document
      .querySelectorAll('.fade-up:not(.visible)')
      .forEach(el => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return null;
}
