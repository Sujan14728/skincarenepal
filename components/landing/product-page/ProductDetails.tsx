// components/product/ProductDetails.tsx
'use client';

import { useState } from 'react';
import { Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { QuantitySelector } from './QuantitySelector';
import { Product } from '@/lib/types/product';
// import { addItemToCart } from '@/lib/utils/local-storage';
import BuyNowButton from '../shared/BuyNowButton';

// Note: Replace 'any' with your actual Product type from Prisma
interface ProductDetailsProps {
  product: Product;
}

export const ProductDetails = ({ product }: ProductDetailsProps) => {
  const [quantity, setQuantity] = useState(1);
  const discountedPrice = product.salePrice?.toLocaleString();
  const originalPrice = product.price.toLocaleString();
  const suitabilityTags = product.suitableFor;

  // const addToCart = (productId: number) => {
  //   addItemToCart({
  //     id: productId,
  //     name: product.name,
  //     price: product.price,
  //     salePrice: product.salePrice ?? null,
  //     quantity: quantity,
  //     image: product.images[0] || ''
  //   });
  // };

  return (
    <div className='flex flex-col space-y-6'>
      {/* Title and Rating */}
      <h1 className='text-3xl font-bold text-gray-900'>{product.name}</h1>

      {/* Description Excerpt */}
      <p className='font-medium text-gray-600'>{product.excerpt}</p>

      {/* Pricing */}
      <div className='space-y-2'>
        <div className='flex items-baseline space-x-3'>
          <span className='text-4xl font-semibold text-gray-900'>
            Rs.{' '}
            {product.salePrice && product.salePrice < product.price
              ? discountedPrice
              : originalPrice}
          </span>
          {product.salePrice && product.salePrice < product.price && (
            <span className='text-xl text-gray-400 line-through'>
              Rs. {originalPrice}
            </span>
          )}
        </div>
      </div>

      {suitabilityTags && suitabilityTags.length > 0 && (
        <div>
          <h3 className='mb-2 text-sm font-medium text-gray-700'>
            Suitable for:
          </h3>
          <div className='flex flex-wrap gap-2'>
            {suitabilityTags.map(tag => (
              <Badge
                key={tag}
                variant='default'
                className='text-sm font-normal'
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Quantity Selector */}
      <div className='flex flex-col space-y-2'>
        <h3 className='text-sm font-medium text-gray-700'>Quantity:</h3>
        <QuantitySelector quantity={quantity} setQuantity={setQuantity} />
      </div>

      {/* Action Buttons */}
      <div className='flex space-x-4 pt-4'>
        {/* <Button className='flex-1 rounded-lg bg-green-600 py-6 text-lg font-semibold hover:bg-green-700'>
          Buy Now
        </Button> */}
        <BuyNowButton
          product={{
            id: product.id,
            image: product.images[0] || '',
            name: product.name,
            price: product.price,
            salePrice: product.salePrice ?? null
          }}
          className='flex-1 rounded-lg bg-green-600 py-6 text-lg font-semibold hover:bg-green-700'
        />
        {/* <Button
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            addToCart(product.id);
          }}
          variant='outline'
          className='flex-1 rounded-lg border-2 border-green-600 py-6 text-lg font-semibold text-green-600 hover:bg-green-50'
        >
          Add to Cart
        </Button> */}
      </div>

      {/* Shipping/Payment Icons */}
      <div className='flex justify-between pt-6 text-center text-sm text-gray-600'>
        <div className='flex flex-col items-center space-y-1'>
          <Truck className='h-6 w-6 text-green-500' />
          <span>Free Shipping</span>
        </div>
        <div className='flex flex-col items-center space-y-1'>
          <ShieldCheck className='h-6 w-6 text-green-500' />
          <span>Secure Payment</span>
        </div>
        <div className='flex flex-col items-center space-y-1'>
          <RefreshCw className='h-6 w-6 text-green-500' />
          <span>Easy Returns</span>
        </div>
      </div>
    </div>
  );
};
