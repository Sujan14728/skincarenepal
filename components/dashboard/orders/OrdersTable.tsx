'use client';

import { Order, OrderItem, OrderStatus, Product, User } from '@prisma/client';
import { Paperclip } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatNPR } from '../format';
import OrderActions from './OrderActions';
import OrderStatusBadge from './OrderStatusBadge';

export type OrderWithRelations = Order & {
  user?: Pick<User, 'id' | 'name' | 'email'> | null;
  items?: (OrderItem & { product?: Product | null })[];
};

export const PAYMENT_METHOD_LABEL: Record<Order['paymentMethod'], string> = {
  COD: 'Cash on delivery',
  ONLINE: 'Online payment'
};

export function PaymentMethodBadge({
  method
}: {
  method: Order['paymentMethod'];
}) {
  return (
    <Badge
      variant={method === 'ONLINE' ? 'default' : 'secondary'}
      title={PAYMENT_METHOD_LABEL[method]}
    >
      {method === 'ONLINE' ? 'Online' : 'COD'}
    </Badge>
  );
}

export const itemCount = (order: OrderWithRelations) =>
  order.items?.reduce((sum, item) => sum + item.quantity, 0);

type Props = {
  orders: OrderWithRelations[];
  loading?: boolean;
  skeletonRows?: number;
  onDelete?: (_orderId: number) => void;
  onView?: (_orderId: number) => void;
  onStatusChange?: (_orderId: number, _status: OrderStatus) => void;
  onEmail?: (_orderId: number) => void;
};

const HEAD = 'px-4 py-2.5 font-medium first:pl-5 last:pr-5';
const CELL = 'px-4 py-3 first:pl-5 last:pr-5';

const OrdersTable = ({
  orders,
  loading = false,
  skeletonRows = 5,
  onDelete,
  onView,
  onStatusChange,
  onEmail
}: Props) => {
  return (
    <div className='overflow-x-auto'>
      <table className='w-full min-w-[880px] text-sm'>
        <thead>
          <tr className='border-b bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground'>
            <th className={HEAD}>Order</th>
            <th className={HEAD}>Customer</th>
            <th className={`${HEAD} text-right`}>Items</th>
            <th className={`${HEAD} text-right`}>Total</th>
            <th className={HEAD}>Payment</th>
            <th className={HEAD}>Status</th>
            <th className={HEAD}>Placed</th>
            <th className={HEAD}>
              <span className='sr-only'>Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className='divide-y'>
          {loading
            ? Array.from({ length: skeletonRows }).map((_, idx) => (
                <tr key={`skeleton-${idx}`}>
                  <td className={CELL}>
                    <Skeleton className='h-4 w-28' />
                  </td>
                  <td className={CELL}>
                    <div className='flex flex-col gap-1.5'>
                      <Skeleton className='h-4 w-32' />
                      <Skeleton className='h-3 w-24' />
                    </div>
                  </td>
                  <td className={CELL}>
                    <Skeleton className='ml-auto h-4 w-6' />
                  </td>
                  <td className={CELL}>
                    <Skeleton className='ml-auto h-4 w-16' />
                  </td>
                  <td className={CELL}>
                    <Skeleton className='h-5 w-14 rounded-md' />
                  </td>
                  <td className={CELL}>
                    <Skeleton className='h-5 w-28 rounded-md' />
                  </td>
                  <td className={CELL}>
                    <Skeleton className='h-4 w-20' />
                  </td>
                  <td className={CELL}>
                    <Skeleton className='ml-auto size-8 rounded-md' />
                  </td>
                </tr>
              ))
            : orders.map(order => {
                const customer = order.name ?? order.user?.name ?? 'Guest';
                const contact = order.phone ?? order.email ?? order.user?.email;
                const count = itemCount(order);
                return (
                  <tr
                    key={order.id}
                    onClick={onView ? () => onView(order.id) : undefined}
                    className='cursor-pointer transition-colors hover:bg-muted/30'
                  >
                    <td className={CELL}>
                      <button
                        type='button'
                        onClick={e => {
                          e.stopPropagation();
                          onView?.(order.id);
                        }}
                        className='rounded-sm font-mono text-xs font-medium text-foreground outline-none hover:text-primary hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50'
                      >
                        {order.orderNumber}
                      </button>
                    </td>
                    <td className={`${CELL} max-w-[240px]`}>
                      <p className='truncate font-medium text-foreground'>
                        {customer}
                      </p>
                      {contact && (
                        <p className='truncate text-sm text-muted-foreground'>
                          {contact}
                        </p>
                      )}
                    </td>
                    <td
                      className={`${CELL} text-right tabular-nums text-muted-foreground`}
                    >
                      {count ?? '—'}
                    </td>
                    <td
                      className={`${CELL} whitespace-nowrap text-right font-medium tabular-nums text-foreground`}
                    >
                      {formatNPR(order.total)}
                    </td>
                    <td className={CELL}>
                      <div className='flex items-center gap-1.5'>
                        <PaymentMethodBadge method={order.paymentMethod} />
                        {order.paymentSlipUrl && (
                          <Paperclip
                            className='size-3.5 text-muted-foreground'
                            aria-label='Payment slip attached'
                          />
                        )}
                      </div>
                    </td>
                    <td className={CELL}>
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td
                      className={`${CELL} whitespace-nowrap text-muted-foreground`}
                    >
                      {order.placedAt ? formatDate(order.placedAt) : '—'}
                    </td>
                    <td
                      className={`${CELL} text-right`}
                      onClick={e => e.stopPropagation()}
                    >
                      <OrderActions
                        orderNumber={order.orderNumber}
                        status={order.status}
                        onView={onView ? () => onView(order.id) : undefined}
                        onEmail={onEmail ? () => onEmail(order.id) : undefined}
                        onDelete={
                          onDelete ? () => onDelete(order.id) : undefined
                        }
                        onStatusChange={
                          onStatusChange
                            ? status => onStatusChange(order.id, status)
                            : undefined
                        }
                      />
                    </td>
                  </tr>
                );
              })}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
