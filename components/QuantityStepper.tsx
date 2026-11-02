import { MAX_QUANTITY } from "@/lib/shop";

// − 2 + control. `min` is 0 in the cart (− at 1 removes the item) and 1 on product pages.
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  disabled,
  label = "Quantity",
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <div className="qty" role="group" aria-label={label}>
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || value <= min}
        onClick={() => onChange(value - 1)}
      >
        −
      </button>
      <output aria-live="polite">{value}</output>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled || value >= MAX_QUANTITY}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  );
}
