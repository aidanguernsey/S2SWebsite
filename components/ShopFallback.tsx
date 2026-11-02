import Link from "next/link";
import { shopConfigured, storeUrl } from "@/lib/fourthwall";

// Shown in place of the shop when Fourthwall isn't set up yet or can't be reached,
// so the page never breaks: people can still order on the Fourthwall store itself.
export function ShopFallback() {
  const store = shopConfigured() ? storeUrl() : undefined;
  return (
    <div className="container">
      <div className="page-title">
        <h1>Merch</h1>
        {store ? (
          <>
            <p className="lede">Our shop is having trouble loading right now.</p>
            <p style={{ marginTop: 16 }}>You can still browse and order everything on our store.</p>
            <div className="actions">
              <a href={store} className="btn btn-dark">Shop on our store ↗</a>
            </div>
          </>
        ) : (
          <>
            <p className="lede">-COMING SOON-</p>
            <p style={{ marginTop: 16 }}>
              Our merch store is on the way. Every purchase will support recordings, travel and competitions.
            </p>
            <div className="actions">
              <Link href="/" className="btn btn-dark">Back to home</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
