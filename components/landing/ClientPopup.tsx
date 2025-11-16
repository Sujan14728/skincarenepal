'use client';
import dynamic from 'next/dynamic';

const DynamicPopup = dynamic(() => import('./Popup'), {
  ssr: false,
  loading: () => null
});

export default function ClientPopup() {
  return <DynamicPopup />;
}
