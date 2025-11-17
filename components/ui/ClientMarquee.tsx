'use client';
import dynamic from 'next/dynamic';

const DynamicMarquee = dynamic(() => import('./marquee'), {
  ssr: false,
  loading: () => null
});

export default function ClientMarquee() {
  return <DynamicMarquee />;
}
