'use client';
import { Button } from '@/components/ui/button';
import { addItemToCart } from '@/lib/utils/local-storage';
import React from 'react';

const AddToCartButton = ({
  product
}: {
  product: {
    id: number;
    image: string;
    name: string;
    price: number;
    salePrice: number | null;
  };
}) => {
  const addToCart = (productId: number) => {
    addItemToCart({
      id: productId,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice ?? null,
      quantity: 1,
      image: product.image
    });
  };
  return (
    <Button
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product.id);
      }}
    >
      {'Add to Cart'}
    </Button>
  );
};

export default AddToCartButton;
