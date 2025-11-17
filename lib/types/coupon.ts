export type Coupon = {
  id?: number;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minPurchase?: number | '';
  usageLimit?: number | '';
  usedCount?: number;
  isActive: boolean;
  productId?: number | '';
  validFrom?: string | null;
  validUntil?: string | null;
};
