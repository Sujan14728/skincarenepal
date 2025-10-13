import { SiteSetting } from '@prisma/client';
import { ICartItem, ICartTotals } from '../types/cart';

export const SHIPPING_COST = 100;
export let FREE_SHIPPING_THRESHOLD = 2000;

/**
 * @function formatCurrency
 * Formats a number into the Indian Rupees (Rs.) currency format.
 * @param amount - The numerical amount to format.
 * @returns The formatted string.
 */
export const formatCurrency = (amount: number): string => {
  return `Rs. ${amount.toLocaleString('en-IN')}`;
};

/**
 * @function calculateCartTotals
 * Calculates the subtotal, shipping, and total for the given cart items.
 * @param items - The array of cart items.
 * @returns The calculated totals.
 */
export const calculateCartTotals = (
  items: ICartItem[],
  settings: SiteSetting
): ICartTotals => {
  const subtotal = items.reduce(
    (sum, item) =>
      sum +
      (item.salePrice && item.salePrice < item.price
        ? item.salePrice
        : item.price) *
        item.quantity,
    0
  );
  

  if (settings && settings.freeShippingThreshold) {
    FREE_SHIPPING_THRESHOLD = settings.freeShippingThreshold;
  }

  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = isFreeShipping ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;
  const remainingForFreeShipping = isFreeShipping
    ? 0
    : FREE_SHIPPING_THRESHOLD - subtotal;

  return {
    subtotal,
    shipping,
    total,
    isFreeShipping,
    remainingForFreeShipping
  };
};
