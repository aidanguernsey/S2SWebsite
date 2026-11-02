"use server";

// The cart's Server Actions. Anyone can POST to these directly, so every input is
// checked here: the browser only ever sends a variant ID and a quantity, and the
// cart itself is found through an httpOnly cookie that page scripts can't read.
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  addToCart,
  checkoutUrl,
  createCart,
  getCart,
  isCartId,
  ItemUnavailableError,
  setQuantity,
} from "@/lib/fourthwall";
import { MAX_QUANTITY } from "@/lib/shop";
import type { Cart } from "@/lib/types";

export type CartResult = { ok: true; cart: Cart | null } | { ok: false; error: string };

const COOKIE = "s2s_cart";
const TRY_AGAIN = "Couldn't update your cart. Please try again.";

async function cartId() {
  const id = (await cookies()).get(COOKIE)?.value;
  return isCartId(id) ? id : undefined;
}

async function remember(cart: Cart) {
  (await cookies()).set(COOKIE, cart.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // Fourthwall may expire it sooner; then a new cart starts.
  });
  return cart;
}

async function forget() {
  (await cookies()).delete(COOKIE);
}

// Best effort: each server instance keeps its own count, which is still enough to stop
// a script from using our token to flood Fourthwall (and getting the shop blocked).
const hits = new Map<string, { count: number; resetAt: number }>();
async function tooManyRequests() {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const now = Date.now();
  if (hits.size > 5000) for (const [key, h] of hits) if (h.resetAt < now) hits.delete(key);
  const h = hits.get(ip);
  if (!h || h.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  return ++h.count > 40;
}

// Details go to the server log; shoppers get a plain message.
function failed(err: unknown): CartResult {
  if (err instanceof ItemUnavailableError) return { ok: false, error: err.message };
  console.error("Shop: cart update failed.", err instanceof Error ? err.message : err);
  return { ok: false, error: TRY_AGAIN };
}

const isQuantity = (q: unknown, min: number): q is number =>
  typeof q === "number" && Number.isInteger(q) && q >= min && q <= MAX_QUANTITY;

export async function getCartAction(): Promise<CartResult> {
  const id = await cartId();
  if (!id) return { ok: true, cart: null };
  try {
    const cart = await getCart(id);
    if (!cart) await forget();
    return { ok: true, cart: cart ?? null };
  } catch (err) {
    return failed(err);
  }
}

export async function addToCartAction(variantId: unknown, quantity: unknown): Promise<CartResult> {
  if (typeof variantId !== "string" || !isQuantity(quantity, 1)) return { ok: false, error: TRY_AGAIN };
  if (await tooManyRequests()) return { ok: false, error: "Too many changes at once. Please wait a minute." };
  try {
    const id = await cartId();
    // No cart yet, or it expired: start a new one.
    const cart = (id && (await addToCart(id, variantId, quantity))) || (await createCart(variantId, quantity));
    return { ok: true, cart: await remember(cart) };
  } catch (err) {
    return failed(err);
  }
}

// Sets an item's quantity; 0 removes it.
export async function updateQuantityAction(variantId: unknown, quantity: unknown): Promise<CartResult> {
  if (typeof variantId !== "string" || !isQuantity(quantity, 0)) return { ok: false, error: TRY_AGAIN };
  if (await tooManyRequests()) return { ok: false, error: "Too many changes at once. Please wait a minute." };
  const id = await cartId();
  if (!id) return { ok: true, cart: null };
  try {
    const cart = await setQuantity(id, variantId, quantity);
    if (!cart) await forget();
    return { ok: true, cart: cart ?? null };
  } catch (err) {
    return failed(err);
  }
}

// Sends the shopper to Fourthwall's checkout for their cart. The URL is built here
// from FOURTHWALL_SHOP_DOMAIN, never taken from the browser.
export async function checkoutAction() {
  const id = await cartId();
  const cart = id ? await getCart(id).catch(() => undefined) : undefined;
  const url = cart && cart.count > 0 ? checkoutUrl(cart.id) : undefined;
  redirect(url ?? "/shop");
}
