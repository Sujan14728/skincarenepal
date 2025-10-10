// components/FeaturesSection.tsx

import { IconType } from 'react-icons/lib';
import { LuLeaf, LuRabbit } from 'react-icons/lu';
import FeatureCard from './partial/FeatureCard';

export interface Feature {
  icon: IconType;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: LuLeaf,
    title: '100% Natural',
    description: 'Made from pure organic ingredients sourced from the Himalayas'
  },
  {
    icon: LuRabbit,
    title: 'Cruelty Free',
    description: 'Never tested on animals. Ethical and sustainable practices'
  },
  {
    icon: () => <h1 className='text-primary text-5xl font-bold'>NP</h1>,
    title: 'Made in Nepal',
    description: 'Proudly crafted in Nepal with traditional wisdom'
  }
];

export function FeaturesSection() {
  return (
    <section className='bg-background py-16 md:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
          {features.map(feature => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
