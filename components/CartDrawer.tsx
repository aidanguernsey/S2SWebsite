"use client";

import { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { checkoutAction } from "@/app/(site)/shop/actions";
import { formatMoney } from "@/lib/shop";
import { useCart } from "./CartProvider";
import { QuantityStepper } from "./QuantityStepper";

const bagIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 7h12l-1 13H7z" />
    <path d="M9 7a3 3 0 0 1 6 0" />
  </svg>
);

const items = (n: number) => `${n} item${n === 1 ? "" : "s"}`;

// Header button, shown once something is in the cart.
export function CartButton() {
  const { cart, openCart } = useCart();
  if (!cart?.count) return null;
  return (
    <button type="button" className="btn btn-outline cart-button" onClick={openCart} aria-label={`Cart, ${items(cart.count)}`}>
      {bagIcon}
      <span className="cart-count" aria-hidden="true">
        {cart.count}
      </span>
    </button>
  );
}

// Phones only, on Shop pages: a bar above the tab bar, since the header slides away on scroll.
export function CartBar() {
  const { cart, isOpen, openCart } = useCart();
  const pathname = usePathname();
  if (!cart?.count || isOpen || !pathname.startsWith("/shop")) return null;
  return (
    <button type="button" className="cart-bar" onClick={openCart}>
      <span>
        <strong>{items(cart.count)}</strong> · {formatMoney(cart.subtotal)}
      </span>
      <span className="cart-bar-cta">View cart</span>
    </button>
  );
}

function CheckoutButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-accent" disabled={pending}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </svg>
      {pending ? "Taking you to checkout…" : "Checkout"}
    </button>
  );
}

// The cart panel. A native <dialog>, so focus stays inside it and Escape closes it.
export function CartDrawer() {
  const { cart, isOpen, closeCart, setQuantity, pending, error } = useCart();
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (isOpen && !d.open) d.showModal();
    if (!isOpen && d.open) d.close();
  }, [isOpen]);

  // Close when a link inside the cart (or anywhere) changes the page.
  useEffect(() => {
    closeCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const lines = cart?.lines ?? [];

  return (
    <dialog
      ref={dialog}
      className="cart-drawer"
      aria-labelledby="cart-title"
      onClose={closeCart}
      // A click on the dimmed area outside the panel lands on the <dialog> itself.
      onClick={(e) => e.target === e.currentTarget && closeCart()}
    >
      <div className="cart-head">
        <h2 id="cart-title">Your cart</h2>
        <button type="button" className="icon-button" onClick={closeCart} aria-label="Close cart">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      {lines.length === 0 ? (
        <div className="cart-empty">
          <p>Your cart is empty.</p>
          <Link href="/shop" className="btn btn-dark">
            Browse merch
          </Link>
        </div>
      ) : (
        <ul className="cart-lines" aria-busy={pending}>
          {lines.map((l) => {
            const image = l.variant.images[0];
            return (
              <li key={l.variant.id} className="cart-line">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image.url} alt="" width={76} height={95} />
                ) : (
                  <span className="cart-thumb" aria-hidden="true" />
                )}
                <div className="cart-line-info">
                  <div className="cart-line-top">
                    <Link href={`/shop/${l.product.slug}`}>{l.product.name}</Link>
                    <span>{formatMoney({ ...l.variant.price, value: l.variant.price.value * l.quantity })}</span>
                  </div>
                  <span className="meta">{l.variant.name}</span>
                  <div className="cart-line-actions">
                    <QuantityStepper
                      value={l.quantity}
                      min={0}
                      disabled={pending}
                      label={`Quantity of ${l.product.name}, ${l.variant.name}`}
                      onChange={(q) => setQuantity(l.variant.id, q)}
                    />
                    <button type="button" className="cart-remove" disabled={pending} onClick={() => setQuantity(l.variant.id, 0)}>
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {error && (
        <p className="cart-error" role="alert">
          {error}
        </p>
      )}

      {cart && lines.length > 0 && (
        <form action={checkoutAction} className="cart-foot">
          <div className="cart-subtotal">
            <span>Subtotal</span>
            <strong>{formatMoney(cart.subtotal)}</strong>
          </div>
          <p className="cart-note">Shipping and tax are added at checkout.</p>
          <CheckoutButton />
          <p className="cart-note">You’ll pay on our secure checkout, powered by Fourthwall.</p>
        </form>
      )}
    </dialog>
  );
}
