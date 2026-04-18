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
    <div className='flex h-full flex-col rounded-xl bg-accent p-6 shadow-sm'>
      <div className='mb-4 flex justify-center space-x-0.5'>
        {[...Array(5)].map((_, i) => (
          <Star key={i} className='h-5 w-5 fill-yellow-400 text-yellow-400' />
        ))}
      </div>

      <p className='mb-4 flex-grow text-base italic text-foreground'>
        &quot;{quote}&quot;
      </p>

      <div className='mt-auto space-y-1 pt-2'>
        <p className='font-semibold text-foreground'>{customerName}</p>

        <p className='text-sm text-muted-foreground'>{location}</p>

        <p className='text-sm font-medium text-primary'>
          Purchased: {productPurchased}
        </p>
      </div>
    </div>
  );
}
