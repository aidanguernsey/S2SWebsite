import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Shop" };

// Placeholder until the Shopify store is set up. The previous product grid
// (driven by getMerch()) is in git history.
export default function ShopPage() {
  return (
    <div className="container">
      <div className="page-title">
        <h1>Merch</h1>
        <p className="lede">-COMING SOON-</p>
        <p style={{ marginTop: 16 }}>
          Our merch store is on the way. Every purchase will support recordings, travel and competitions.
        </p>
        <div style={{ marginTop: 32 }}>
          <Link href="/" className="btn btn-dark">Back to home</Link>
        </div>
      </div>
    </div>
  );
}
