// components/ProductCard.tsx
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  id: number;
  image: string;
  title: string;
  description: string;
  salePrice: number;
  price?: number;
}

export function ProductCard({
  id,
  image,
  title,
  description,
  salePrice,
  price
}: ProductCardProps) {
  const isOnSale = price && price > salePrice;
  const priceFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  const formattedPrice = priceFormatter.format(salePrice).replace('₹', 'Rs. ');
  const formattedOriginalPrice = price
    ? priceFormatter.format(price).replace('₹', 'Rs. ')
    : '';

  return (
    <Link
      href={`/products/${id}`}
      className='bg-card group flex cursor-pointer flex-col overflow-hidden rounded-xl shadow-md transition-all duration-300 hover:shadow-lg'
    >
      <div className='relative aspect-[4/3] w-full overflow-hidden'>
        {/* Sale Tag */}
        {isOnSale && (
          <span className='bg-destructive text-destructive-foreground absolute top-2 right-2 z-10 rounded-full px-3 py-1 text-xs font-semibold uppercase'>
            Sale
          </span>
        )}
        <Image
          src={image}
          alt={title}
          width={400}
          height={300}
          className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]'
        />
      </div>

      <div className='flex flex-grow flex-col p-4'>
        {/* Category and Rating */}
        {/* <div className="flex justify-between items-center text-xs mb-2">
          <span className="text-muted-foreground">{category}</span>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-primary text-primary" />
            <span className="text-foreground font-medium">{rating.toFixed(1)}</span>
            <span className="text-muted-foreground">({reviewCount})</span>
          </div>
        </div> */}

        <h4 className='text-foreground mb-2 text-lg font-semibold'>{title}</h4>

        <p className='text-muted-foreground mb-4 line-clamp-2 flex-grow text-sm'>
          {description}
        </p>

        <div className='mt-auto flex items-center justify-between pt-2'>
          <div className='flex flex-col'>
            <span className='text-foreground text-xl font-bold'>
              {formattedPrice}
            </span>
            {isOnSale && (
              <span className='text-muted-foreground text-sm line-through'>
                {formattedOriginalPrice}
              </span>
            )}
          </div>
          <Button>Add to Cart</Button>
        </div>
      </div>
    </Link>
  );
}
