'use client';
import { Button } from '@/components/ui/button';
import React from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const BuyNowButton = ({
  product,
  className
}: {
  product: {
    id: number;
    image: string;
    name: string;
    price: number;
    salePrice: number | null;
    status?: string;
  };
  className?: string;
}) => {
  const router = useRouter();
  const buyNow = (productId: number) => {
    // redirect to checkout with a buy query parameter
    router.push(`/checkout?buy=${productId}`);
  };
  return (
    <Button
      className={cn(
        className,
        product.status === 'COMING_SOON' || product.status === 'DISCONTINUED'
          ? 'cursor-not-allowed opacity-50'
          : ''
      )}
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        if (
          product.status === 'COMING_SOON' ||
          product.status === 'DISCONTINUED'
        )
          return;
        buyNow(product.id);
      }}
    >
      {'Buy Now'}
    </Button>
  );
};

export default BuyNowButton;
