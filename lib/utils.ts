import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Kpis } from './types/dashboard';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatKpiValue = (v: number | undefined) => {
  if (v === undefined) return '—';
  // Format currency for revenue, plain numbers for others.
  return v >= 1000 && v % 1000 === 0 ? v.toLocaleString() : v.toLocaleString();
};

export const badgeText = (key: keyof Kpis) => {
  switch (key) {
    case 'totalRevenue':
      return 'revenue';
    case 'totalOrders':
      return 'orders';
    case 'pendingOrders':
      return 'pending';
    case 'deliveredOrders':
      return 'delivered';
    case 'inStockProducts':
      return 'in stock';
    case 'unreadMessages':
      return 'messages';
    default:
      return '';
  }
};

export const orderStatusVariant = (status: string) => {
  switch (status) {
    case 'PENDING_CONFIRMATION':
      return 'secondary';
    case 'VERIFIED':
      return 'default';
    case 'DELIVERED':
      return 'success';
    case 'REJECTED':
    case 'CANCELLED':
      return 'destructive';
    default:
      return 'outline';
  }
};

export const formatStatus = (status: string) => {
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase());
};

export const productStatusVariant = (status: string) => {
  switch (status) {
    case "IN_STOCK":
      return "success";
    case "OUT_OF_STOCK":
      return "secondary";
    case "COMING_SOON":
      return "outline";
    case "DISCONTINUED":
      return "destructive";
    default:
      return "outline";
  }
}
