import Link from "next/link";
import type { ShopProduct } from "@/lib/types";
import { formatMoney, productColors, productSizes, startingPrice } from "@/lib/shop";

// A product in the Shop grid, linking to its own page.
export function ProductCard({ product }: { product: ShopProduct }) {
  const { price, varies } = startingPrice(product);
  const colors = productColors(product).length;
  const sizes = productSizes(product);
  const meta = [colors > 1 && `${colors} colors`, sizes.length > 1 && `${sizes[0]}–${sizes.at(-1)}`]
    .filter(Boolean)
    .join(" · ");
  const image = product.images[0];

  return (
    <Link href={`/shop/${product.slug}`} className="card product-card">
      <div className="photo-wrap">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="product-card-img" src={image.url} alt="" width={image.width} height={image.height} loading="lazy" />
        ) : (
          <div className="product-card-img placeholder" aria-hidden="true">
            {product.name.slice(0, 1)}
          </div>
        )}
        {product.soldOut && <span className="pill">Sold out</span>}
      </div>
      <div>
        <div className="product-card-row">
          <h3>{product.name}</h3>
          {price && (
            <span className="price">
              {varies && "From "}
              {formatMoney(price)}
            </span>
          )}
        </div>
        {meta && <div className="meta">{meta}</div>}
      </div>
    </Link>
  );
}
