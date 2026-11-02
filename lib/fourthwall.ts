// The shop's connection to Fourthwall, which hosts the products, carts and checkout.
// Products are managed in the Fourthwall dashboard; this file only reads them and
// edits carts. Setup and token rotation: README → "Shop".
import "server-only";
import sanitizeHtml from "sanitize-html";
import { MAX_QUANTITY } from "@/lib/shop";
import type { Cart, CartLine, Money, ShopImage, ShopProduct, ShopVariant } from "@/lib/types";

const API = "https://storefront-api.fourthwall.com/v1";
const CURRENCY = "USD";

// Products are cached for a minute, matching Fourthwall's own cache. Carts never are.
export const SHOP_CACHE_TAG = "fourthwall";

const token = () => process.env.FOURTHWALL_STOREFRONT_TOKEN?.trim();

// Accepts "shop.example.com", "https://shop.example.com/" and the like.
function shopDomain() {
  const host = process.env.FOURTHWALL_SHOP_DOMAIN?.trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .toLowerCase();
  return host && /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(host) ? host : undefined;
}

// False until both env vars are set; the shop page then links to the Fourthwall store instead.
export const shopConfigured = () => !!token() && !!shopDomain();

// The Fourthwall-hosted store, for the fallback link when the API is down.
export function storeUrl() {
  const domain = shopDomain();
  return domain && `https://${domain}`;
}

// Where the Checkout button sends people. Payment, shipping and tax all happen there.
export function checkoutUrl(cartId: string) {
  const domain = shopDomain();
  if (!domain) return undefined;
  const params = new URLSearchParams({ cartCurrency: CURRENCY, cartId });
  return `https://${domain}/checkout/?${params}`;
}

class FourthwallError extends Error {
  constructor(readonly status: number, readonly code?: string) {
    super(`Fourthwall API ${status}${code ? ` ${code}` : ""}`);
  }
}

// Thrown when someone tries to add a variant that's hidden, sold out or doesn't exist.
// Its message is safe to show to shoppers.
export class ItemUnavailableError extends Error {
  constructor() {
    super("Sorry, that item isn't available right now.");
  }
}

// The token travels in the URL, so errors report only the status and Fourthwall's
// error code, never the URL itself.
async function request<T>(path: string, init: RequestInit & { next?: NextFetchRequestConfig } = {}): Promise<T> {
  const t = token();
  if (!t) throw new FourthwallError(0, "NO_TOKEN");
  const url = `${API}${path}${path.includes("?") ? "&" : "?"}${new URLSearchParams({ storefront_token: t, currency: CURRENCY })}`;

  let res: Response;
  try {
    res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init.headers } });
  } catch {
    throw new FourthwallError(0, "NETWORK");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => undefined);
    throw new FourthwallError(res.status, body?.code ?? body?.error);
  }
  return res.json();
}

// ---- Raw API shapes (only the fields we use) ----

type ApiImage = { url: string; transformedUrl?: string; width: number; height: number };

type ApiVariant = {
  id: string;
  name: string;
  unitPrice: Money;
  compareAtPrice?: Money | null;
  attributes: { description: string; color?: { name: string; swatch: string } | null; size?: { name: string } | null };
  stock: { type: "UNLIMITED" } | { type: "LIMITED"; inStock: number };
  images: ApiImage[];
};

type ApiProduct = {
  type: "PRODUCT" | "BUNDLE";
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  access: { type: "PUBLIC" | "HIDDEN" | "PRIVATE" | "ARCHIVED" };
  state: { type: "AVAILABLE" | "SOLD_OUT" };
  images: ApiImage[];
  variants: ApiVariant[];
  additionalInformation?: { title: string; bodyHtml: string }[] | null;
};

type ApiCart = {
  id: string;
  items: { quantity: number; variant: ApiVariant & { product: { name: string; slug: string } } }[];
};

type ApiPage<T> = { results: T[]; paging: { hasNextPage: boolean } };

// ---- Mapping into the site's types ----

const image = (i: ApiImage): ShopImage => ({ url: i.transformedUrl || i.url, width: i.width, height: i.height });

const variant = (v: ApiVariant): ShopVariant => ({
  id: v.id,
  name: v.attributes.description || v.name,
  price: v.unitPrice,
  compareAtPrice: v.compareAtPrice ?? undefined,
  color: v.attributes.color ?? undefined,
  size: v.attributes.size?.name,
  inStock: v.stock.type === "UNLIMITED" || v.stock.inStock > 0,
  images: v.images.map(image),
});

// Product text is HTML typed in the Fourthwall dashboard. Only basic formatting is
// kept, so nothing in it (a script, an onclick) can run on our site.
const safeHtml = (html?: string | null) =>
  sanitizeHtml(html ?? "", {
    allowedTags: ["p", "br", "ul", "ol", "li", "strong", "b", "em", "i", "u", "h3", "h4", "a"],
    allowedAttributes: { a: ["href", "target", "rel"] }, // target and rel are always overwritten below
    allowedSchemes: ["https", "mailto"],
    transformTags: { a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer" }) },
  }).trim();

const product = (p: ApiProduct): ShopProduct => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  description: safeHtml(p.description) || undefined,
  details: (p.additionalInformation ?? [])
    .map((d) => ({ title: d.title, html: safeHtml(d.bodyHtml) }))
    .filter((d) => d.html),
  soldOut: p.state.type === "SOLD_OUT",
  images: p.images.map(image),
  variants: p.variants.map(variant),
});

// Only public products appear on the site. Hidden, private and archived ones (e.g. a
// drop that isn't announced yet) stay off it, even if someone guesses the URL.
const isListed = (p: ApiProduct) => p.type === "PRODUCT" && p.access.type === "PUBLIC";

function cart(c: ApiCart): Cart {
  const lines: CartLine[] = c.items.map((i) => ({
    product: { name: i.variant.product.name, slug: i.variant.product.slug },
    // The cart only shows one photo per item, so the rest aren't sent to the browser.
    variant: { ...variant(i.variant), images: i.variant.images.slice(0, 1).map(image) },
    quantity: i.quantity,
  }));
  return {
    id: c.id,
    lines,
    count: lines.reduce((n, l) => n + l.quantity, 0),
    // Cents, so 3 × $30.29 doesn't come out as $90.86999999.
    subtotal: {
      value: lines.reduce((sum, l) => sum + Math.round(l.variant.price.value * 100) * l.quantity, 0) / 100,
      currency: CURRENCY,
    },
  };
}

// ---- Products ----

const cached = { next: { revalidate: 60, tags: [SHOP_CACHE_TAG] } };

// Every public product, in the order set in the Fourthwall dashboard.
// null means the shop can't be reached right now (or isn't set up), so callers can fall back.
export async function getProducts(): Promise<ShopProduct[] | null> {
  if (!shopConfigured()) return null;
  try {
    const all: ApiProduct[] = [];
    for (let page = 0; ; page++) {
      const res = await request<ApiPage<ApiProduct>>(`/collections/all/products?page=${page}&size=50`, cached);
      all.push(...res.results);
      if (!res.paging.hasNextPage || page >= 20) break;
    }
    return all.filter(isListed).map(product);
  } catch (err) {
    console.error("Shop: couldn't load products.", err instanceof Error ? err.message : err);
    return null;
  }
}

// undefined means there's no public product with that slug (show a 404);
// null means the shop can't be reached right now.
export async function getProduct(slug: string): Promise<ShopProduct | undefined | null> {
  if (!shopConfigured()) return null;
  try {
    const p = await request<ApiProduct>(`/products/${encodeURIComponent(slug)}`, cached);
    return isListed(p) ? product(p) : undefined;
  } catch (err) {
    if (err instanceof FourthwallError && err.status === 404) return undefined;
    console.error("Shop: couldn't load product.", err instanceof Error ? err.message : err);
    return null;
  }
}

// ---- Carts ----
// Callers pass only a variant ID and quantity; prices always come from Fourthwall.

// Cart and variant IDs are both UUIDs.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isCartId = (id: unknown): id is string => typeof id === "string" && UUID.test(id);

function item(variantId: string, quantity: number) {
  if (!UUID.test(variantId)) throw new Error("Invalid variant ID");
  if (!Number.isInteger(quantity) || quantity < 0) throw new Error("Invalid quantity");
  return { items: [{ variantId, quantity: Math.min(quantity, MAX_QUANTITY) }] };
}

// Fourthwall's API accepts any of the shop's variants, hidden products included, so
// new items are checked against what the site actually lists.
async function assertListed(variantId: string) {
  const products = await getProducts();
  const listed = products?.some((p) => !p.soldOut && p.variants.some((v) => v.id === variantId && v.inStock));
  if (!listed) throw new ItemUnavailableError();
}

const cartPath = (id: string, action = "") => {
  if (!isCartId(id)) throw new Error("Invalid cart ID");
  return `/carts/${id}${action}`;
};

const noStore = { cache: "no-store" } as const;

// undefined when the cart has expired or never existed; the caller then starts a new one.
export async function getCart(id: string): Promise<Cart | undefined> {
  try {
    return cart(await request<ApiCart>(cartPath(id), noStore));
  } catch (err) {
    if (err instanceof FourthwallError && err.status === 404) return undefined;
    throw err;
  }
}

export async function createCart(variantId: string, quantity: number): Promise<Cart> {
  const body = JSON.stringify(item(variantId, quantity));
  await assertListed(variantId);
  return cart(await request<ApiCart>("/carts", { ...noStore, method: "POST", body }));
}

// Adds to whatever quantity is already in the cart, up to MAX_QUANTITY in total.
// undefined when the cart has expired; the caller then starts a new one.
export async function addToCart(cartId: string, variantId: string, quantity: number): Promise<Cart | undefined> {
  const current = await getCart(cartId);
  if (!current) return undefined;
  const inCart = current.lines.find((l) => l.variant.id === variantId)?.quantity ?? 0;
  const room = MAX_QUANTITY - inCart;
  if (room <= 0) return current;
  const body = JSON.stringify(item(variantId, Math.min(quantity, room)));
  await assertListed(variantId);
  return cart(await request<ApiCart>(cartPath(cartId, "/add"), { ...noStore, method: "POST", body }));
}

// Sets the quantity outright; 0 removes the item. (Fourthwall's /remove endpoint drops the
// whole line whatever quantity it's sent, so /change covers both.)
// undefined when the cart has expired.
export async function setQuantity(cartId: string, variantId: string, quantity: number): Promise<Cart | undefined> {
  const body = JSON.stringify(item(variantId, quantity));
  try {
    return cart(await request<ApiCart>(cartPath(cartId, "/change"), { ...noStore, method: "POST", body }));
  } catch (err) {
    if (err instanceof FourthwallError && err.status === 404) return undefined;
    throw err;
  }
}
