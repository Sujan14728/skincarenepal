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
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/marquee')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch marquees');
        return res.json();
      })
      .then(data => {
        setMarquees(data.marquees || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Marquee fetch error:', err);
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className='bg-emerald-700 py-2'>
        <div className='mx-auto h-5 w-full animate-pulse rounded bg-emerald-600/60' />
      </div>
    );
  }

  if (error || !marquees.length) {
    // Return nothing or a minimal bar when no marquees exist
    return null;
  }

  return (
    <div className='bg-emerald-700 py-2 text-white'>
      <Marquee speed={90} gradient={false} pauseOnHover>
        {marquees.map((m, idx) => (
          <span key={m.id}>
            {m.text} {idx < marquees.length - 1 && ' | '}
          </span>
        ))}
      </Marquee>
    </div>
  );
}
