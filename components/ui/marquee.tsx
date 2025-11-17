'use client';
import Marquee from 'react-fast-marquee';
import React, { useEffect, useState } from 'react';

type MarqueeType = {
  id: number;
  text: string;
};

export default function MarqueeFeature() {
  const [marquees, setMarquees] = useState<MarqueeType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout

    fetch('/api/marquee', { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        setMarquees(data.marquees || []);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error('Marquee fetch error:', err);
        }
      })
      .finally(() => {
        setLoading(false);
        clearTimeout(timeoutId);
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  if (loading || !marquees.length) {
    return null;
  }

  return (
    <div className='sticky top-0 z-50 bg-emerald-700 py-2 text-white shadow-sm'>
      <Marquee speed={120} gradient={false} pauseOnHover>
        {marquees.map((m, idx) => (
          <span key={m.id} className='mx-6 text-sm font-medium'>
            {m.text}
            {idx < marquees.length - 1 && ' • '}
          </span>
        ))}
      </Marquee>
    </div>
  );
}
