'use client';
import Marquee from 'react-fast-marquee';
import React from 'react';

type MarqueeType = {
  id: number;
  text: string;
};

interface MarqueeFeatureProps {
  marquees: MarqueeType[];
}

export default function MarqueeFeature({ marquees }: MarqueeFeatureProps) {
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
