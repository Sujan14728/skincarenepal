import { useCallback } from 'react';
import { LuMinus, LuPlus } from 'react-icons/lu';

interface QuantityControlProps {
  quantity: number;
  onUpdate: (newQuantity: number) => void;
}

const QuantityControl: React.FC<QuantityControlProps> = ({
  quantity,
  onUpdate
}) => {
  const decrement = useCallback(() => {
    if (quantity > 1) {
      onUpdate(quantity - 1);
    }
  }, [quantity, onUpdate]);

  const increment = useCallback(() => {
    onUpdate(quantity + 1);
  }, [quantity, onUpdate]);

  return (
    <div className='border-input flex items-center space-x-2 overflow-hidden rounded-lg border'>
      <button
        onClick={decrement}
        disabled={quantity <= 1}
        className='text-muted-foreground hover:bg-muted flex h-8 w-8 items-center justify-center p-1 transition-colors disabled:opacity-50'
        aria-label='Decrease quantity'
      >
        <LuMinus className='h-4 w-4' />
      </button>
      <span className='w-6 text-center text-sm font-medium'>{quantity}</span>
      <button
        onClick={increment}
        className='text-muted-foreground hover:bg-muted flex h-8 w-8 items-center justify-center p-1 transition-colors'
        aria-label='Increase quantity'
      >
        <LuPlus className='h-4 w-4' />
      </button>
    </div>
  );
};

export default QuantityControl;
