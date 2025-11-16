// hooks/useCheckout.ts
import { useState, useEffect } from 'react';
import { ICartItem } from '@/lib/types/cart';
import { Product } from '@/lib/types/product';
import { getCartFromLocal } from '@/lib/utils/local-storage';

type SiteSetting = {
  id: number;
  deliveryCost: number;
  freeShippingThreshold: number;
  qrImageUrl: string | null;
  updatedAt: string;
};

export const useCheckout = (buyParam: string | null) => {
  const [settings, setSettings] = useState<SiteSetting | null>(null);
  const [cartItems, setCartItems] = useState<ICartItem[]>(() => getCartFromLocal() || []);
  const [singleProductMode, setSingleProductMode] = useState(false);
  const [singleQty, setSingleQty] = useState<number>(1);
  const [singleProduct, setSingleProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [isDeliveryFree, setIsDeliveryFree] = useState(false);

  // Load site settings
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setSettings(data))
      .catch(console.error);
  }, []);

  // Load single product if buyParam exists
  useEffect(() => {
    if (!buyParam) return;

    const id = Number(buyParam);
    if (Number.isNaN(id)) return;

    setSingleProductMode(true);
    setLoadingProduct(true);

    let mounted = true;
    fetch(`/api/products/${id}`)
      .then(res => res.ok ? res.json() : Promise.reject('Product fetch failed'))
      .then(p => {
        if (!mounted) return;
        setSingleProduct(p);
        setSingleQty(1);
        setCartItems([{
          id: p.id,
          name: p.name,
          image: Array.isArray(p.images) ? p.images[0] : '',
          price: p.price,
          salePrice: p.salePrice ?? null,
          quantity: 1
        }]);
      })
      .catch(console.error)
      .finally(() => mounted && setLoadingProduct(false));

    return () => { mounted = false; };
  }, [buyParam]);

  // Compute free shipping
  useEffect(() => {
    if (!settings) return;
    let subtotal = 0;
    if (singleProductMode && singleProduct) {
      subtotal = (singleProduct.salePrice ?? singleProduct.price) * singleQty;
    } else {
      subtotal = cartItems.reduce((sum, i) => sum + (i.salePrice ?? i.price) * i.quantity, 0);
    }
    setIsDeliveryFree(settings.freeShippingThreshold ? subtotal >= settings.freeShippingThreshold : false);
  }, [cartItems, settings, singleProductMode, singleProduct, singleQty]);

  return {
    settings,
    cartItems,
    setCartItems,
    singleProductMode,
    singleProduct,
    singleQty,
    setSingleQty,
    loadingProduct,
    isDeliveryFree
  };
};
