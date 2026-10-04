export type Kpis = {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  inStockProducts: number;
  unreadMessages: number;
};

export type AnalyticsRange = '7d' | '30d' | '90d' | '12m';

export type TrendPoint = {
  date: string;
  label: string;
  revenue: number;
  orders: number;
};

export type Metric = { value: number; previous: number };

export type AnalyticsResponse = {
  range: AnalyticsRange;
  bucket: 'day' | 'week' | 'month';
  kpis: {
    revenue: Metric;
    orders: Metric;
    aov: Metric;
    paidOrders: Metric;
  };
  attention: {
    pendingConfirmation: number;
    pendingVerification: number;
    unreadMessages: number;
    lowStock: number;
  };
  trend: TrendPoint[];
  statusBreakdown: { status: string; count: number }[];
  topProducts: { name: string; revenue: number; units: number }[];
  lowStock: {
    id: number;
    name: string;
    stock: number;
    status: string;
    image: string | null;
  }[];
  lowStockThreshold: number;
  recentOrders: {
    id: number;
    orderNumber: string;
    name: string | null;
    email: string | null;
    total: number;
    status: string;
    placedAt: string;
  }[];
};
