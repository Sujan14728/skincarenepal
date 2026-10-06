import { ReactNode } from 'react';

/**
 * Checkout, cart, order and policy pages have no dedicated MagicPath design;
 * this wrapper gives them the storefront's background and type styles.
 */
export default function ShopLayout({ children }: { children: ReactNode }) {
  return <div className='cc-shop'>{children}</div>;
}
