export const ProductStatus = {
  IN_STOCK: 'IN_STOCK',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  DISCONTINUED: 'DISCONTINUED',
  COMING_SOON: 'COMING_SOON'
} as const;

export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

export const PaymentMethod = {
  COD: 'COD',
  ONLINE: 'ONLINE'
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];
