export type Coupon = {
  id?: number;
  code: string;
  discountAmount: number;
  isPercentage: boolean;
  active: boolean;
  usageLimit: number | null;
  usedCount?: number;
  validFrom: string | null;
  validUntil: string | null;
};
