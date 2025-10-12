import { ICartItem } from '../types/cart';

const CART_STORAGE_KEY = 'ecomm_shopping_cart';

/**
 * @function getCartFromLocal
 * Retrieves cart items from localStorage.
 * @returns An array of ICartItem or an empty array if not found or parsing fails.
 */
export const getCartFromLocal = (): ICartItem[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const serializedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (serializedCart === null) {
      return [];
    }
    const cart = JSON.parse(serializedCart);
    // Simple runtime type check to ensure data integrity
    if (
      Array.isArray(cart) &&
      cart.every(item => item.id && typeof item.price === 'number')
    ) {
      return cart as ICartItem[];
    }
    console.error('Local storage cart data is corrupted.');
    return [];
  } catch (error) {
    console.error('Error reading cart from local storage:', error);
    return [];
  }
};

/**
 * @function saveCartToLocal
 * Saves the current cart items to localStorage.
 * @param items - The array of cart items to save.
 */
export const saveCartToLocal = (items: ICartItem[]): void => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const serializedCart = JSON.stringify(items);
    localStorage.setItem(CART_STORAGE_KEY, serializedCart);
    window.dispatchEvent(new Event('cartUpdated'));
  } catch (error) {
    console.error('Error saving cart to local storage:', error);
  }
};

export const addItemToCart = (item: ICartItem) => {
  const existingCart = getCartFromLocal() || [];

  // Check if item with same ID already exists
  const existingItemIndex = existingCart.findIndex(
    cartItem => cartItem.id === item.id
  );

  let updatedCart: ICartItem[];

  if (existingItemIndex !== -1) {
    // Item exists, increment quantity
    updatedCart = existingCart.map((cartItem, index) =>
      index === existingItemIndex
        ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
        : cartItem
    );
  } else {
    // Item doesn't exist, add new item
    updatedCart = [...existingCart, item];
  }

  saveCartToLocal(updatedCart);
};

export const totalItemsInCart = () => {
  const cart = getCartFromLocal();
  return cart.length;
};
