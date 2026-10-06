'use client';

import { useState } from 'react';
import { OrderStatus } from '@prisma/client';
import {
  Ban,
  CheckCircle2,
  Eye,
  Loader2,
  Mail,
  MoreHorizontal,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Truck,
  XCircle,
  type LucideIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
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
import { Button, buttonVariants } from '@/components/ui/button';
import ConfirmDelete from '../ConfirmDelete';

/** Admin-facing labels, in pipeline order. */
export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'PENDING_CONFIRMATION', label: 'Pending confirmation' },
  { value: 'PENDING_VERIFICATION', label: 'Pending verification' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REJECTED', label: 'Rejected' }
];

const statusLabel = (status: OrderStatus) =>
  ORDER_STATUS_OPTIONS.find(s => s.value === status)?.label ?? status;

const isDestructive = (status: OrderStatus) =>
  status === 'CANCELLED' || status === 'REJECTED';

const EMAIL_NOTE = 'The customer will be notified by email.';

/** Controlled confirmation used where a trigger-based dialog can't live (menus). */
function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  destructive,
  onConfirm
}: {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              destructive ? buttonVariants({ variant: 'destructive' }) : undefined
            }
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Radio list of every status, used for manual overrides. */
function StatusRadioItems({
  current,
  onSelect
}: {
  current: OrderStatus;
  onSelect: (_status: OrderStatus) => void;
}) {
  return (
    <DropdownMenuRadioGroup
      value={current}
      onValueChange={value => {
        if (value !== current) onSelect(value as OrderStatus);
      }}
    >
      {ORDER_STATUS_OPTIONS.map(option => (
        <DropdownMenuRadioItem key={option.value} value={option.value}>
          {option.label}
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  );
}

type RowProps = {
  orderNumber: string;
  status: OrderStatus;
  onView?: () => void;
  onEmail?: () => void;
  onDelete?: () => void;
  onStatusChange?: (_status: OrderStatus) => void;
};

/** Row overflow menu: view, email, change status (confirmed) and delete (confirmed). */
const OrderActions = ({
  orderNumber,
  status,
  onView,
  onEmail,
  onDelete,
  onStatusChange
}: RowProps) => {
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='icon-sm'
            className='text-muted-foreground'
            aria-label={`Actions for order ${orderNumber}`}
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-48'>
          {onView && (
            <DropdownMenuItem onSelect={onView}>
              <Eye />
              View details
            </DropdownMenuItem>
          )}
          {onEmail && (
            <DropdownMenuItem onSelect={onEmail}>
              <Mail />
              Send email
            </DropdownMenuItem>
          )}
          {onStatusChange && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <RefreshCw className='size-4 text-muted-foreground' />
                Change status
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className='w-52'>
                <StatusRadioItems current={status} onSelect={setPendingStatus} />
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}
          {onDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant='destructive'
                onSelect={() => setDeleteOpen(true)}
              >
                <Trash2 />
                Delete order
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {onStatusChange && (
        <ConfirmDialog
          open={pendingStatus !== null}
          onOpenChange={open => !open && setPendingStatus(null)}
          title={
            pendingStatus
              ? `Change status to ${statusLabel(pendingStatus).toLowerCase()}?`
              : 'Change order status?'
          }
          description={`Order ${orderNumber} moves from ${statusLabel(status).toLowerCase()} to ${pendingStatus ? statusLabel(pendingStatus).toLowerCase() : ''}. ${EMAIL_NOTE}`}
          confirmLabel='Change status'
          destructive={pendingStatus ? isDestructive(pendingStatus) : false}
          onConfirm={() => {
            if (pendingStatus) onStatusChange(pendingStatus);
            setPendingStatus(null);
          }}
        />
      )}

      {onDelete && (
        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title='Delete this order?'
          description={`Order ${orderNumber} and its items will be permanently removed. This can't be undone.`}
          confirmLabel='Delete order'
          destructive
          onConfirm={onDelete}
        />
      )}
    </>
  );
};

export default OrderActions;

/** The usual next step from each status, shown as the primary drawer action. */
const NEXT_STEP: Partial<
  Record<OrderStatus, { to: OrderStatus; label: string; icon: LucideIcon }>
> = {
  PENDING_CONFIRMATION: {
    to: 'PENDING_VERIFICATION',
    label: 'Mark as confirmed',
    icon: CheckCircle2
  },
  PENDING_VERIFICATION: {
    to: 'VERIFIED',
    label: 'Verify order',
    icon: ShieldCheck
  },
  VERIFIED: { to: 'PROCESSING', label: 'Start processing', icon: PackageCheck },
  PROCESSING: { to: 'SHIPPED', label: 'Mark as shipped', icon: Truck },
  SHIPPED: { to: 'DELIVERED', label: 'Mark as delivered', icon: CheckCircle2 }
};

/** The dead-end exit available from each open status. */
const EXIT_STEP: Partial<
  Record<OrderStatus, { to: OrderStatus; label: string; icon: LucideIcon }>
> = {
  PENDING_CONFIRMATION: { to: 'CANCELLED', label: 'Cancel order', icon: Ban },
  PENDING_VERIFICATION: { to: 'REJECTED', label: 'Reject order', icon: XCircle },
  VERIFIED: { to: 'CANCELLED', label: 'Cancel order', icon: Ban },
  PROCESSING: { to: 'CANCELLED', label: 'Cancel order', icon: Ban },
  SHIPPED: { to: 'CANCELLED', label: 'Cancel order', icon: Ban }
};

type DetailProps = {
  orderNumber: string;
  status: OrderStatus;
  updating: boolean;
  onStatusChange: (_status: OrderStatus) => void;
  onEmail: () => void;
};

/** Footer actions for the order drawer: email + override on the left, next step on the right. */
export function OrderDetailActions({
  orderNumber,
  status,
  updating,
  onStatusChange,
  onEmail
}: DetailProps) {
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const next = NEXT_STEP[status];
  const exit = EXIT_STEP[status];

  return (
    <>
      <div className='flex flex-col-reverse gap-2 sm:mr-auto sm:flex-row'>
        <Button type='button' variant='outline' onClick={onEmail}>
          <Mail />
          Send email
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type='button' variant='ghost' disabled={updating}>
              <RefreshCw />
              Change status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start' side='top' className='w-52'>
            <DropdownMenuLabel className='text-xs font-medium text-muted-foreground'>
              Set status manually
            </DropdownMenuLabel>
            <StatusRadioItems current={status} onSelect={setPendingStatus} />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {exit && (
        <ConfirmDelete
          title={`${exit.label}?`}
          description={`Order ${orderNumber} will be marked as ${statusLabel(exit.to).toLowerCase()}. ${EMAIL_NOTE}`}
          confirmLabel={exit.label}
          onConfirm={() => onStatusChange(exit.to)}
        >
          <Button
            type='button'
            variant='outline'
            disabled={updating}
            className='text-destructive hover:bg-destructive/10 hover:text-destructive'
          >
            <exit.icon />
            {exit.label}
          </Button>
        </ConfirmDelete>
      )}
      {next && (
        <Button
          type='button'
          disabled={updating}
          onClick={() => setPendingStatus(next.to)}
        >
          {updating ? <Loader2 className='animate-spin' /> : <next.icon />}
          {next.label}
        </Button>
      )}

      <ConfirmDialog
        open={pendingStatus !== null}
        onOpenChange={open => !open && setPendingStatus(null)}
        title={
          pendingStatus
            ? `Change status to ${statusLabel(pendingStatus).toLowerCase()}?`
            : 'Change order status?'
        }
        description={`Order ${orderNumber} moves from ${statusLabel(status).toLowerCase()} to ${pendingStatus ? statusLabel(pendingStatus).toLowerCase() : ''}. ${EMAIL_NOTE}`}
        confirmLabel={
          pendingStatus && pendingStatus === next?.to
            ? next.label
            : 'Change status'
        }
        destructive={pendingStatus ? isDestructive(pendingStatus) : false}
        onConfirm={() => {
          if (pendingStatus) onStatusChange(pendingStatus);
          setPendingStatus(null);
        }}
      />
    </>
  );
}
