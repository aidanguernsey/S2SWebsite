import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/lib/fourthwall";
import { ProductView } from "@/components/ProductView";
import { ShopFallback } from "@/components/ShopFallback";

type Props = { params: Promise<{ slug: string }> };

// Pre-build one page per product at deploy time. Products made public later in the
// Fourthwall dashboard get their page built on first visit.
export async function generateStaticParams() {
  return ((await getProducts()) ?? []).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return {};
  const image = product.images[0];
  return {
    title: product.name,
    description: "Official merch. Every purchase supports recordings, travel and competitions.",
    openGraph: image ? { images: [{ url: image.url, width: image.width, height: image.height }] } : undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct((await params).slug);
  if (product === null) return <ShopFallback />;
  if (!product) notFound();

  return (
    <div className="container">
      <div style={{ paddingTop: 32 }}>
        <Link href="/shop" className="more">
          ← All merch
        </Link>
      </div>
      {/* Product text is sanitized in lib/fourthwall.ts before it gets here. */}
      <ProductView product={product}>
        {product.description && (
          <div className="product-html" dangerouslySetInnerHTML={{ __html: product.description }} />
        )}
        {product.details.length > 0 && (
          <div>
            {product.details.map((d) => (
              <details key={d.title} className="product-details">
                <summary>{d.title}</summary>
                <div className="product-html" dangerouslySetInnerHTML={{ __html: d.html }} />
              </details>
            ))}
          </div>
        )}
      </ProductView>
    </div>
  );
}
