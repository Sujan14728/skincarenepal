import React from 'react';
import { Feature } from '../FeaturesSection';

const FeatureCard = ({ feature }: { feature: Feature }) => {
  return (
    <div
      key={feature.title}
      className='bg-accent flex flex-col items-center rounded-2xl p-8 text-center'
    >
      <div className='mb-4'>
        <feature.icon className='text-primary h-12 w-12' />
      </div>
      <h3 className='text-foreground mb-2 text-xl font-bold'>
        {feature.title}
      </h3>
      <p className='text-muted-foreground text-base text-balance'>
        {feature.description}
      </p>
    </div>
  );
};

export default FeatureCard;
