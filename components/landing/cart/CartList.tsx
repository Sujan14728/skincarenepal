import { Card } from '@/components/ui/card';
import CartItem from './CartItem';
import { ICartItem } from '@/lib/types/cart';

interface CartListProps {
  items: ICartItem[];
  onUpdateQuantity: (id: number, newQuantity: number) => void;
  onRemove: (id: number) => void;
}

const CartList: React.FC<CartListProps> = ({
  items,
  onUpdateQuantity,
  onRemove
}) => {
  if (items.length === 0) {
    return (
      <Card className='flex min-h-[200px] items-center justify-center'>
        <p className='text-muted-foreground text-center'>
          Your cart is currently empty.
        </p>
      </Card>
    );
  }

  return (
    <Card className='flex flex-col p-0'>
      {items.map(item => (
        <CartItem
          key={item.id}
          item={item}
          onUpdateQuantity={onUpdateQuantity}
          onRemove={onRemove}
        />
      ))}
    </Card>
  );
};

export default CartList;
