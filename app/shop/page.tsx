import type { Metadata } from "next";
import { merch } from "@/content/merch";

export const metadata: Metadata = { title: "Shop" };

export default function ShopPage() {
  return (
    <div className="container">
      <div className="page-title">
        <h1>Merch</h1>
        <p className="lede">Every purchase supports recordings, travel and competitions.</p>
      </div>
      <div className="grid" style={{ marginTop: 40 }}>
        {merch.map((p) => (
          <article key={p.name} className="product">
            {p.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image} alt={p.name} className="ratio-1" style={{ objectFit: "cover", borderRadius: 12 }} />
            ) : (
              <div className="placeholder ratio-1">[Product photo]</div>
            )}
            <div className="product-row">
              <div>
                <h2 style={{ fontFamily: "var(--body)", fontSize: 18, letterSpacing: 0 }}>{p.name}</h2>
                <div className="meta">
                  {p.price}
                  {p.sizes && ` · ${p.sizes.join(" / ")}`}
                </div>
              </div>
              {p.buyUrl ? (
                <a href={p.buyUrl} className="btn btn-dark">Buy</a>
              ) : (
                <span className="meta">Coming soon</span>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
