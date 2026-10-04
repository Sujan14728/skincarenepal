import { Badge } from '@/components/ui/badge';
import { OrderStatus } from '@prisma/client';

type Props = {
  status: OrderStatus;
};

// Soft tints grouped by stage: waiting on us (amber), in progress (blue),
// done (green), dead end (red). The label always carries the meaning too.
const STATUS: Record<
  OrderStatus,
  { variant: 'warning' | 'blue' | 'success' | 'red'; label: string }
> = {
  PENDING_CONFIRMATION: { variant: 'warning', label: 'Pending confirmation' },
  PENDING_VERIFICATION: { variant: 'warning', label: 'Pending verification' },
  VERIFIED: { variant: 'blue', label: 'Verified' },
  PROCESSING: { variant: 'blue', label: 'Processing' },
  SHIPPED: { variant: 'blue', label: 'Shipped' },
  DELIVERED: { variant: 'success', label: 'Delivered' },
  CANCELLED: { variant: 'red', label: 'Cancelled' },
  REJECTED: { variant: 'red', label: 'Rejected' }
};

const OrderStatusBadge = ({ status }: Props) => {
  const { variant, label } = STATUS[status] ?? {
    variant: 'warning' as const,
    label: status
  };

  return (
    <Badge variant={variant} className='gap-1.5'>
      <span className='size-1.5 rounded-full bg-current' aria-hidden />
      {label}
    </Badge>
  );
};

export default OrderStatusBadge;
