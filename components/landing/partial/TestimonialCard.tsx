// components/TestimonialCard.tsx
import { Star } from 'lucide-react';

interface TestimonialCardProps {
  quote: string;
  customerName: string;
  location: string;
  productPurchased: string;
}

export function TestimonialCard({
  quote,
  customerName,
  location,
  productPurchased
}: TestimonialCardProps) {
  return (
    <div className='bg-accent flex h-full flex-col rounded-xl p-6 shadow-sm'>
      <div className='mb-4 flex space-x-0.5'>
        {[...Array(5)].map((_, i) => (
          <Star key={i} className='h-5 w-5 fill-yellow-400 text-yellow-400' />
        ))}
      </div>

      <p className='text-foreground mb-4 flex-grow text-base italic'>
        &quot;{quote}&quot;
      </p>

      <div className='mt-auto space-y-1 pt-2'>
        <p className='text-foreground font-semibold'>{customerName}</p>

        <p className='text-muted-foreground text-sm'>{location}</p>

        <p className='text-primary text-sm font-medium'>
          Purchased: {productPurchased}
        </p>
      </div>
    </div>
  );
}
