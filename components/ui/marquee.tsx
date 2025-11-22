'use client';
import Marquee from 'react-fast-marquee';
import React, { useEffect, useState } from 'react';

type MarqueeType = {
  id: number;
  text: string;
};

interface MarqueeFeatureProps {
  marquees: MarqueeType[];
}

export default function MarqueeFeature({
  marquees: initialMarquees
}: MarqueeFeatureProps) {
  const [marquees, setMarquees] = useState<MarqueeType[]>(initialMarquees);

  useEffect(() => {
    let active = true;

    const fetchLatest = async () => {
      try {
        const res = await fetch('/api/marquee', { cache: 'no-store' });
        const data = await res.json();
        if (active && data.marquees) {
          setMarquees(data.marquees);
        }
      } catch (error) {
        console.error('Failed to fetch marquees:', error);
      }
    };

    // Refresh shortly after mount to catch recent updates
    const initialTimer = setTimeout(fetchLatest, 3000);

    // Poll every 20 seconds
    const interval = setInterval(fetchLatest, 20000);

    // Refresh when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchLatest();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      active = false;
      clearTimeout(initialTimer);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (!marquees || marquees.length === 0) {
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
