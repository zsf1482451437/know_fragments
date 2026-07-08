import { useSyncExternalStore } from "react";
import type { CartItem, CartLine, PriceSummary, Product, ProductSku } from "../../shared/types/api";

type CartState = {
  items: CartItem[];
};

let state: CartState = { items: [] };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function addCartItem(productId: string, skuId: string, quantity: number) {
  const existing = state.items.find((item) => item.productId === productId && item.skuId === skuId);
  if (existing) {
    state = {
      items: state.items.map((item) =>
        item === existing ? { ...item, quantity: item.quantity + quantity, selected: true } : item,
      ),
    };
  } else {
    state = {
      items: [...state.items, { productId, skuId, quantity, selected: true }],
    };
  }
  emit();
}

export function updateCartItem(productId: string, skuId: string, quantity: number) {
  state = {
    items: state.items.map((item) =>
      item.productId === productId && item.skuId === skuId
        ? { ...item, quantity: Math.max(1, quantity) }
        : item,
    ),
  };
  emit();
}

export function toggleCartItem(productId: string, skuId: string) {
  state = {
    items: state.items.map((item) =>
      item.productId === productId && item.skuId === skuId
        ? { ...item, selected: !item.selected }
        : item,
    ),
  };
  emit();
}

export function removeCartItem(productId: string, skuId: string) {
  state = {
    items: state.items.filter((item) => item.productId !== productId || item.skuId !== skuId),
  };
  emit();
}

export function clearCart() {
  state = { items: [] };
  emit();
}

export function getCartItems() {
  return state.items;
}

export function useCartItems() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state.items,
  );
}

export function buildCartLines(products: Product[], items: CartItem[]): CartLine[] {
  return items
    .map((item) => {
      const product = products.find((candidate) => candidate.id === item.productId);
      const sku = product?.skus.find((candidate) => candidate.id === item.skuId);
      if (!product || !sku) return undefined;
      return { product, sku, quantity: item.quantity, selected: item.selected };
    })
    .filter((line): line is CartLine => Boolean(line));
}

export function calculateSummary(lines: Array<{ sku: ProductSku; quantity: number; selected: boolean }>): PriceSummary {
  const subtotal = lines
    .filter((line) => line.selected)
    .reduce((sum, line) => sum + line.sku.price * line.quantity, 0);
  const discount = subtotal >= 500 ? Math.floor(subtotal * 0.08) : 0;
  const shippingFee = subtotal === 0 || subtotal >= 299 ? 0 : 18;
  return {
    subtotal,
    discount,
    shippingFee,
    payable: subtotal - discount + shippingFee,
  };
}
