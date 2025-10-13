'use client';

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@/components/ui/table';
import OrderActions from './OrderActions';
import OrderStatusBadge from './OrderStatusBadge';
import { Order, OrderStatus, User } from '@prisma/client';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

export type OrderWithRelations = Order & {
  user?: Pick<User, 'id' | 'name' | 'email'> | null;
};

type Props = {
  orders: OrderWithRelations[];
  onDelete?: (orderId: number) => void;
  onView?: (orderId: number) => void;
  onStatusChange?: (orderId: number, status: OrderStatus) => void;
  onEmail?: (orderId: number) => void;
};

const OrdersTable = ({
  orders,
  onDelete,
  onView,
  onStatusChange,
  onEmail
}: Props) => {
  return (
    <div className='border-border bg-background rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow className='text-muted-foreground'>
            <TableHead>Order #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Payment Slip</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map(order => (
            <TableRow key={order.id} className='hover:bg-muted/50'>
              <TableCell className='text-foreground font-medium'>
                {order.orderNumber}
              </TableCell>
              <TableCell>{order.name ?? order.user?.name ?? '-'}</TableCell>
              <TableCell>{order.phone ?? '-'}</TableCell>
              <TableCell>Rs. {order.total}</TableCell>
              <TableCell>
                {order.placedAt
                  ? new Date(order.placedAt).toLocaleDateString()
                  : '-'}
              </TableCell>
              <TableCell>
                {order.paymentSlipUrl ? (
                  <a
                    href={order.paymentSlipUrl}
                    target='_blank'
                    rel='noreferrer'
                  >
                    <Image
                      src={order.paymentSlipUrl}
                      alt='Payment slip'
                      width={40}
                      height={40}
                      className='h-10 w-10 rounded object-cover'
                    />
                  </a>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                <div className='flex items-center gap-2'>
                  <OrderStatusBadge status={order.status} />
                  {onStatusChange && (
                    <RowStatusSelect
                      orderId={order.id}
                      current={order.status}
                      onConfirm={onStatusChange}
                    />
                  )}
                </div>
              </TableCell>
              <TableCell className='text-right'>
                <OrderActions
                  onView={onView ? () => onView(order.id) : undefined}
                  onDelete={onDelete ? () => onDelete(order.id) : undefined}
                  onEmail={onEmail ? () => onEmail(order.id) : undefined}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrdersTable;

type RowStatusSelectProps = {
  orderId: number;
  current: OrderStatus;
  onConfirm: (orderId: number, status: OrderStatus) => void;
};

function RowStatusSelect({
  orderId,
  current,
  onConfirm
}: RowStatusSelectProps) {
  const [pending, setPending] = useState<OrderStatus | null>(null);
  const [open, setOpen] = useState(false);
  return (
    <>
      <Select
        value={current}
        onValueChange={val => {
          setPending(val as OrderStatus);
          setOpen(true);
        }}
      >
        <SelectTrigger className='h-8 w-[180px]'>
          <SelectValue placeholder='Change status' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='PENDING_CONFIRMATION'>
            Pending Confirmation
          </SelectItem>
          <SelectItem value='PENDING_VERIFICATION'>
            Pending Verification
          </SelectItem>
          <SelectItem value='VERIFIED'>Verified</SelectItem>
          <SelectItem value='REJECTED'>Rejected</SelectItem>
          <SelectItem value='PROCESSING'>Processing</SelectItem>
          <SelectItem value='SHIPPED'>Shipped</SelectItem>
          <SelectItem value='DELIVERED'>Delivered</SelectItem>
          <SelectItem value='CANCELLED'>Cancelled</SelectItem>
        </SelectContent>
      </Select>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change order status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the status of this order? The
              customer will be notified by email.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pending) onConfirm(orderId, pending);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
