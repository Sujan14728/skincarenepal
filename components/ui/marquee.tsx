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
    // Poll for updates every 30 seconds
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/marquee', { cache: 'no-store' });
        const data = await res.json();
        if (data.marquees) {
          setMarquees(data.marquees);
        }
      } catch (error) {
        console.error('Failed to fetch marquees:', error);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
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
