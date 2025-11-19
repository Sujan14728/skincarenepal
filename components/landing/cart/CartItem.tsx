import Image from 'next/image';
import { useCallback } from 'react';
import { LuX } from 'react-icons/lu';
import QuantityControl from './QuantityControl';
import { formatCurrency } from '@/lib/utils/cart-utils';
import { ICartItem } from '@/lib/types/cart';

interface CartItemProps {
  item: ICartItem;
  onUpdateQuantity: (_id: number, _newQuantity: number) => void;
  onRemove: (_id: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove
}) => {
  const subtotal = item.salePrice
    ? item.salePrice * item.quantity
    : item.price * item.quantity;

  const handleUpdate = useCallback(
    (newQuantity: number) => {
      onUpdateQuantity(item.id, newQuantity);
    },
    [item.id, onUpdateQuantity]
  );

  return (
    <div className='border-border relative flex items-start border-b p-4 last:border-b-0'>
      <div className='bg-muted border-border/70 mr-4 h-28 w-28 flex-shrink-0 overflow-hidden rounded-lg border'>
        {/* Placeholder image from the uploaded file */}
        <Image
          height={112}
          width={112}
          src={item.image}
          alt={item.name}
          className='h-full w-full object-cover'
          onError={e => {
            e.currentTarget.src =
              'https://placehold.co/112x112/f0f0f0/6b7280?text=Product';
            e.currentTarget.onerror = null;
          }}
          unoptimized
        />
      </div>

      <div className='flex flex-grow flex-col'>
        <h3 className='text-foreground text-lg font-semibold'>{item.name}</h3>
        <div className='mb-3 flex items-center space-x-2'>
          <p className='text-primary text-lg font-bold'>
            {formatCurrency(item.salePrice || item.price)}
          </p>
          {item.price !== item.salePrice && (
            <p className='text-muted-foreground text-sm line-through'>
              {formatCurrency(item.price)}
            </p>
          )}
        </div>

        <div className='mt-auto flex items-center justify-between'>
          <div className='text-muted-foreground flex items-center space-x-2 text-sm'>
            <span>Quantity:</span>
            <QuantityControl quantity={item.quantity} onUpdate={handleUpdate} />
          </div>
          <p className='text-muted-foreground hidden text-sm sm:block'>
            Subtotal:{' '}
            <span className='text-foreground font-medium'>
              {formatCurrency(subtotal)}
            </span>
          </p>
        </div>
      </div>

      <div
        onClick={() => onRemove(item.id)}
        className='text-muted-foreground hover:text-destructive absolute top-4 right-4 rounded-full p-1 transition-colors'
        aria-label={`Remove ${item.name}`}
      >
        <LuX className='h-5 w-5' />
      </div>
    </div>
  );
};

export default CartItem;
