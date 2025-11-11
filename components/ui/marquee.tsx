'use client';
import Marquee from 'react-fast-marquee';
import React, { useEffect, useState } from 'react';

type MarqueeType = {
  id: number;
  text: string;
};

export default function MarqueeFeature() {
  const [marquees, setMarquees] = useState<MarqueeType[]>([]);

  useEffect(() => {
    fetch('/api/marquee')
      .then(res => res.json())
      .then(data => setMarquees(data.marquees || []));
  }, []);

  if (!marquees.length) {
    return (
      <div className='bg-emerald-700 py-2'>
        <div className='max-w-screen mx-auto h-5 flex-1 animate-pulse rounded bg-emerald-600/60' />
      </div>
    );
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
