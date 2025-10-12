'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { totalItemsInCart } from '@/lib/utils/local-storage';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { LuShoppingCart } from 'react-icons/lu';

const CartBadge = () => {
  const [totalItem, setTotalItem] = useState<number>(0);

  useEffect(() => {
    // Set the actual cart count after mount
    setTotalItem(totalItemsInCart());

    const updateCartCount = () => setTotalItem(totalItemsInCart());

    window.addEventListener('cartUpdated', updateCartCount);
    window.addEventListener('storage', updateCartCount);

    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  return (
    <Button variant='ghost' size='icon' asChild>
      <Link href='/cart' className='relative'>
        <LuShoppingCart className='h-5 w-5' />
        <Badge className='absolute top-0 right-0 h-4 w-4 rounded-full'>
          {totalItem}
        </Badge>
      </Link>
    </Button>
  );
};

export default CartBadge;
