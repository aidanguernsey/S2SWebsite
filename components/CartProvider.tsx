"use client";

import { createContext, useContext, useEffect, useState, useTransition } from "react";
import { addToCartAction, getCartAction, updateQuantityAction, type CartResult } from "@/app/(site)/shop/actions";
import type { Cart } from "@/lib/types";

type CartState = {
  cart: Cart | null;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (variantId: string, quantity: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  pending: boolean;
  error?: string;
};

const CartContext = createContext<CartState | null>(null);

export function useCart() {
  const state = useContext(CartContext);
  if (!state) throw new Error("useCart must be used inside <CartProvider>");
  return state;
}

// Remembers (per browser) that there's a cart worth loading, so visitors who never
// add anything don't trigger a cart request on every page.
const HAS_CART = "s2s-has-cart";

// Holds the cart for the whole site. Pages stay static: the cart is loaded here in
// the browser, and every change goes through the Server Actions in app/(site)/shop/actions.ts.
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isOpen, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function apply(result: CartResult) {
    if (!result.ok) {
      setError(result.error);
      return false;
    }
    setError(undefined);
    setCart(result.cart);
    try {
      if (result.cart?.count) localStorage.setItem(HAS_CART, "1");
      else localStorage.removeItem(HAS_CART);
    } catch {}
    return true;
  }

  useEffect(() => {
    let hasCart = false;
    try {
      hasCart = !!localStorage.getItem(HAS_CART);
    } catch {}
    if (hasCart) getCartAction().then(apply);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const state: CartState = {
    cart,
    isOpen,
    openCart: () => setOpen(true),
    closeCart: () => setOpen(false),
    add: (variantId, quantity) =>
      startTransition(async () => {
        if (apply(await addToCartAction(variantId, quantity))) setOpen(true);
      }),
    setQuantity: (variantId, quantity) =>
      startTransition(async () => {
        apply(await updateQuantityAction(variantId, quantity));
      }),
    pending,
    error,
  };

  return <CartContext.Provider value={state}>{children}</CartContext.Provider>;
}
