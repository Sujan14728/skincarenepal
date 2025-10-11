'use client';
import CartList from '@/components/landing/cart/CartList';
import CartSummary from '@/components/landing/cart/CartSummary';
import { ICartItem } from '@/lib/types/cart';
import { calculateCartTotals } from '@/lib/utils/cart-utils';
import { getCartFromLocal, saveCartToLocal } from '@/lib/utils/local-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<ICartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedCart = getCartFromLocal();
    if (storedCart.length > 0) {
      setCartItems(storedCart);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      saveCartToLocal(cartItems);
    }
  }, [cartItems, isHydrated]);

  const handleUpdateQuantity = useCallback(
    (id: number, newQuantity: number) => {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    },
    []
  );

  const handleRemoveItem = useCallback((id: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  }, []);

  // --- Cart Totals Calculation ---

  const totals = useMemo(() => calculateCartTotals(cartItems), [cartItems]);

  if (!isHydrated) {
    return (
      <div className='bg-background flex min-h-screen items-center justify-center p-4 font-sans md:p-8'>
        <p className='text-muted-foreground text-xl'>Loading cart...</p>
      </div>
    );
  }

  return (
    <div className='bg-background min-h-screen p-4 font-sans md:p-8'>
      <div className='mx-auto max-w-7xl'>
        <h1 className='text-foreground mb-8 text-3xl font-extrabold md:text-4xl'>
          Shopping Cart
        </h1>

        <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
          {/* Cart List Column */}
          <div className='lg:col-span-2'>
            <CartList
              items={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemoveItem}
            />
          </div>

          {/* Order Summary Column */}
          <div className='lg:col-span-1'>
            <CartSummary totals={totals} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
