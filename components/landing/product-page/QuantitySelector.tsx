'use client';

import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuantitySelectorProps {
  quantity: number;
  setQuantity: (_quantity: number) => void;
}

export const QuantitySelector = ({
  quantity,
  setQuantity
}: QuantitySelectorProps) => {
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  return (
    <div className='flex w-fit items-center space-x-0.5 rounded-md border border-gray-300'>
      <Button
        variant='ghost'
        size='icon'
        onClick={decreaseQuantity}
        disabled={quantity <= 1}
        className='h-8 w-8 text-gray-700 hover:bg-gray-100'
        aria-label='Decrease quantity'
      >
        <Minus className='h-4 w-4' />
      </Button>
      <div className='w-8 border-x border-gray-300 py-1 text-center font-medium text-gray-900'>
        {quantity}
      </div>
      <Button
        variant='ghost'
        size='icon'
        onClick={increaseQuantity}
        className='h-8 w-8 text-gray-700 hover:bg-gray-100'
        aria-label='Increase quantity'
      >
        <Plus className='h-4 w-4' />
      </Button>
    </div>
  );
};
