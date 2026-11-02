"use client";

import { useState } from "react";
import type { ShopProduct } from "@/lib/types";
import { findVariant, formatMoney, productColors, productSizes, startingPrice } from "@/lib/shop";
import { useCart } from "./CartProvider";
import { QuantityStepper } from "./QuantityStepper";

// A product's photos, color and size pickers, and price. The photos follow the
// chosen color, and the price follows the chosen size. `children` (the product
// description and details) goes below the buy button.
export function ProductView({ product, children }: { product: ShopProduct; children?: React.ReactNode }) {
  const colors = productColors(product);
  const sizes = productSizes(product);

  const start = product.variants.find((v) => v.inStock) ?? product.variants[0];
  const [color, setColor] = useState(start?.color?.name);
  const [size, setSize] = useState(start?.size);
  const [photo, setPhoto] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { add, pending, error, isOpen } = useCart();

  const selected = findVariant(product, color, size);
  const colorPhotos = product.variants.find((v) => v.color?.name === color && v.images.length)?.images;
  const photos = selected?.images.length ? selected.images : colorPhotos ?? product.images;
  const shown = photos[photo] ?? photos[0];

  function chooseColor(name: string) {
    setColor(name);
    setPhoto(0);
    // Keep the size if this color has it in stock; otherwise jump to one it does.
    if (!findVariant(product, name, size)?.inStock) {
      setSize(product.variants.find((v) => v.color?.name === name && v.inStock)?.size ?? size);
    }
  }

  const { price: lowest } = startingPrice(product);
  const price = selected?.price ?? lowest;
  const available = !product.soldOut && !!selected?.inStock;

  return (
    <div className="product-page">
      <div className="product-gallery">
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="product-gallery-main"
            src={shown.url}
            alt={`${product.name}${color ? ` in ${color}` : ""}`}
            width={shown.width}
            height={shown.height}
          />
        ) : (
          <div className="product-gallery-main placeholder" aria-hidden="true" />
        )}
        {photos.length > 1 && (
          <div className="product-thumbs">
            {photos.map((img, i) => (
              <button
                key={img.url}
                type="button"
                aria-label={`Photo ${i + 1} of ${photos.length}`}
                aria-pressed={i === photo}
                onClick={() => setPhoto(i)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="product-info">
        <div>
          <h1>{product.name}</h1>
          {price && (
            <p className="product-price">
              {formatMoney(price)}
              {selected?.compareAtPrice && (
                <s>
                  <span className="visually-hidden">Was </span>
                  {formatMoney(selected.compareAtPrice)}
                </s>
              )}
            </p>
          )}
        </div>

        {colors.length > 1 && (
          <fieldset className="option-group">
            <legend className="eyebrow">
              Color: <span className="option-value">{color}</span>
            </legend>
            <div className="swatches">
              {colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  className="swatch"
                  aria-label={c.name}
                  title={c.name}
                  aria-pressed={c.name === color}
                  onClick={() => chooseColor(c.name)}
                >
                  <span style={{ background: c.swatch }} />
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {sizes.length > 1 && (
          <fieldset className="option-group">
            <legend className="eyebrow">Size</legend>
            <div className="sizes">
              {sizes.map((s) => {
                const inStock = !!findVariant(product, color, s)?.inStock;
                return (
                  <button
                    key={s}
                    type="button"
                    className="size"
                    aria-pressed={s === size}
                    aria-label={inStock ? s : `${s}, sold out`}
                    disabled={!inStock}
                    onClick={() => setSize(s)}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        <div className="product-buy">
          {available && <QuantityStepper value={quantity} onChange={setQuantity} disabled={pending} />}
          <button
            type="button"
            className="btn btn-accent"
            disabled={!available || pending}
            onClick={() => selected && add(selected.id, quantity)}
          >
            {!available ? "Sold out" : pending ? "Adding…" : "Add to cart"}
          </button>
        </div>
        {/* Errors also show in the cart; this covers an add that fails before it opens. */}
        {error && !isOpen && (
          <p className="cart-error" role="alert">
            {error}
          </p>
        )}

        {children}
      </div>
    </div>
  );
}
