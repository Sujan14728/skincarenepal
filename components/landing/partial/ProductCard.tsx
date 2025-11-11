// components/ProductCard.tsx
import Image from 'next/image';
import Link from 'next/link';
// import AddToCartButton from '../shared/AddToCartButton';
import BuyNowButton from '../shared/BuyNowButton';
import { ProductStatus } from '@/lib/enum/product';

interface ProductCardProps {
  id: number;
  slug: string;
  image: string;
  name: string;
  excerpt: string;
  salePrice: number | null | undefined;
  price: number;
  keyBenefits?: string[];
  status?: ProductStatus;
}

export function ProductCard({
  id,
  slug,
  image,
  name,
  excerpt,
  salePrice,
  price,
  status
}: ProductCardProps) {
  const isOnSale = salePrice && price > salePrice;
  const priceFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  const formattedPrice = priceFormatter
    .format(salePrice || price)
    .replace('₹', 'Rs. ');
  const formattedOriginalPrice = price
    ? priceFormatter.format(price).replace('₹', 'Rs. ')
    : '';

  return (
    <Link
      href={`/products/${slug}`}
      className='group flex cursor-pointer flex-col overflow-hidden rounded-xl bg-card shadow-md transition-all duration-300 hover:shadow-lg'
    >
      <div className='relative aspect-[4/3] w-full overflow-hidden'>
        {/* Sale Tag */}
        {isOnSale && (
          <span className='absolute right-2 top-2 z-10 rounded-full bg-destructive px-3 py-1 text-xs font-semibold uppercase text-destructive-foreground'>
            Sale
          </span>
        )}
        {status === 'COMING_SOON' && (
          <span className='absolute bottom-2 left-2 z-10 rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase text-muted-foreground'>
            Coming Soon
          </span>
        )}
        <Image
          src={image}
          alt={name ?? 'Product Image'}
          width={400}
          height={300}
          className='h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.1]'
        />
      </div>

      <div className='flex flex-grow flex-col p-4'>
        <h4 className='mb-2 text-lg font-semibold text-foreground'>{name}</h4>

        <p className='mb-4 line-clamp-2 flex-grow text-sm text-muted-foreground'>
          {excerpt}
        </p>

        <div className='mt-auto flex items-center justify-between pt-2'>
          <div className='flex flex-col'>
            <span className='text-xl font-bold text-foreground'>
              {formattedPrice}
            </span>
            {isOnSale && (
              <span className='text-sm text-muted-foreground line-through'>
                {formattedOriginalPrice}
              </span>
            )}
          </div>
          {/* <AddToCartButton product={{ id, image, name, price, salePrice }} /> */}
          <BuyNowButton
            product={{ id, image, name, price, salePrice, status }}
          />
        </div>
      </div>
    </Link>
  );
}
