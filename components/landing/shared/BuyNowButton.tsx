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
      className={cn(className)}
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        buyNow(product.id);
      }}
    >
      {'Buy Now'}
    </Button>
  );
};

export default BuyNowButton;
