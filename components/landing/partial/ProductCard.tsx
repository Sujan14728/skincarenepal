// components/ProductCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import AddToCartButton from '../shared/AddToCartButton';

interface ProductCardProps {
  id: number;
  slug: string;
  image: string;
  name: string;
  excerpt: string;
  salePrice: number | null;
  price: number;
  keyBenefits?: string[];
}

export function ProductCard({
  id,
  slug,
  image,
  name,
  excerpt,
  salePrice,
  price,
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
          alt={name ?? 'Product Image'}
          width={400}
          height={300}
          className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.1]'
        />
      </div>

      <div className='flex flex-grow flex-col p-4'>
        <h4 className='text-foreground mb-2 text-lg font-semibold'>{name}</h4>

        <p className='text-muted-foreground mb-4 line-clamp-2 flex-grow text-sm'>
          {excerpt}
        </p>

        {/* {keyBenefits && keyBenefits.length > 0 && (
          <div className='mb-4 flex flex-col gap-2'>
            <div className='text-muted-foreground text-sm'>Key Benefits:</div>
            <div className='flex gap-2 flex-wrap'>
              {keyBenefits.map(benefit => {
                if (!benefit || benefit.trim() === '') return null;
                return (
                  <Badge
                    key={benefit}
                    variant='default'
                    className='px-2 py-1 text-xs'
                  >
                    {benefit}
                  </Badge>
                );
              })}
            </div>
          </div>
        )} */}

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
          <AddToCartButton product={{ id, image, name, price, salePrice }} />
        </div>
      </div>
    </Link>
  );
}
