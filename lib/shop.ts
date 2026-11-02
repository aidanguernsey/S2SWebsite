// Shop helpers that are safe to use in the browser. Anything that talks to
// Fourthwall lives in lib/fourthwall.ts, which is server-only.
import type { Money, ShopProduct, ShopVariant } from "@/lib/types";

// Per variant, per cart. Fourthwall allows up to 1000; nobody needs that many hoodies.
export const MAX_QUANTITY = 10;

// "$30.29", or "$25" for whole dollars.
export const formatMoney = (m: Money) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: m.currency,
    minimumFractionDigits: Number.isInteger(m.value) ? 0 : 2,
  }).format(m.value);

// Each color once, in the order Fourthwall lists them.
export const productColors = (product: ShopProduct) => {
  const seen = new Map<string, { name: string; swatch: string }>();
  for (const v of product.variants) if (v.color && !seen.has(v.color.name)) seen.set(v.color.name, v.color);
  return [...seen.values()];
};

// Each size once, smallest first (Fourthwall lists them in size order).
export const productSizes = (product: ShopProduct) =>
  [...new Set(product.variants.map((v) => v.size).filter((s): s is string => !!s))];

// The cheapest variant's price, and whether any variant costs more (bigger sizes often do).
export const startingPrice = (product: ShopProduct) => {
  const prices = product.variants.map((v) => v.price);
  const lowest = prices.reduce((a, b) => (b.value < a.value ? b : a), prices[0]);
  return { price: lowest, varies: prices.some((p) => p.value !== lowest?.value) };
};

export const findVariant = (product: ShopProduct, color?: string, size?: string): ShopVariant | undefined =>
  product.variants.find((v) => v.color?.name === color && v.size === size);
