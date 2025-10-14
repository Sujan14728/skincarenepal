import { Badge } from '@/components/ui/badge';
import { OrderStatus } from '@prisma/client';

type Props = {
  status: OrderStatus;
};

const OrderStatusBadge = ({ status }: Props) => {
  const getVariantAndLabel = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING_CONFIRMATION':
        return { variant: 'secondary' as const, label: 'Pending Confirmation' };
      case 'PENDING_VERIFICATION':
        return { variant: 'default' as const, label: 'Pending Verification' };
      case 'PROCESSING':
        return { variant: 'default' as const, label: 'Processing' };
      case 'SHIPPED':
        return { variant: 'default' as const, label: 'Shipped' };
      case 'DELIVERED':
        return { variant: 'default' as const, label: 'Delivered' };
      case 'CANCELLED':
        return { variant: 'destructive' as const, label: 'Cancelled' };
      case 'REJECTED':
        return { variant: 'destructive' as const, label: 'Rejected' };
      case 'VERIFIED':
        return { variant: 'success' as const, label: 'Verified' };
      default:
        return { variant: 'secondary' as const, label: status };
    }
  };

  const { variant, label } = getVariantAndLabel(status);

  return <Badge variant={variant}>{label}</Badge>;
};

export default OrderStatusBadge;
