import type { Metadata } from "next";
import { getProducts } from "@/lib/fourthwall";
import { ProductCard } from "@/components/ProductCard";
import { ShopFallback } from "@/components/ShopFallback";

export const metadata: Metadata = { title: "Shop" };

// Products are managed in the Fourthwall dashboard; anything public there shows here
// within a minute. Hidden products stay off the site.
export default async function ShopPage() {
  const products = await getProducts();
  if (!products) return <ShopFallback />;

  return (
    <div className="container">
      <div className="page-title">
        <h1>Merch</h1>
        <p className="lede">
          Every purchase supports recordings, travel and competitions. Printed to order and shipped by Fourthwall.
        </p>
      </div>
      {products.length > 0 ? (
        <div className="shop-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p style={{ marginTop: 32 }}>New merch is on the way. Check back soon.</p>
      )}
    </div>
  );
}
