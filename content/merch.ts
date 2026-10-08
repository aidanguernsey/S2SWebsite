import type { MerchItem } from "@/lib/types";

// Each item links to a hosted checkout (Stripe Payment Link, Printful, Shopify).
// Check with your student activities office about how the group may collect money.
export const merch: MerchItem[] = [
  { name: "[Group] Crewneck", price: "[YOUR PRICE]", sizes: ["S", "M", "L", "XL"], buyUrl: "" },
  { name: "Logo Tee", price: "[YOUR PRICE]", sizes: ["S", "M", "L", "XL"], buyUrl: "" },
  { name: "Sticker Pack", price: "[YOUR PRICE]", buyUrl: "" },
];
