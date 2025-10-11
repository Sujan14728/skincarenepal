export interface ICartItem {
  id: number;
  name: string;
  price: number;
  salePrice: number;
  quantity: number;
  image: string;
}

export interface ICartTotals {
  subtotal: number;
  shipping: number;
  total: number;
  isFreeShipping: boolean;
  remainingForFreeShipping: number;
}
