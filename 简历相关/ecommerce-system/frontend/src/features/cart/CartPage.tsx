import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../../shared/api/client";
import type { Product } from "../../shared/types/api";
import { EmptyState, ErrorState, LoadingState } from "../../shared/ui/StateViews";
import {
  buildCartLines,
  calculateSummary,
  removeCartItem,
  toggleCartItem,
  updateCartItem,
  useCartItems,
} from "./cartStore";

export function CartPage() {
  const items = useCartItems();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    apiClient
      .listProducts({ page: 1, pageSize: 100 }, controller.signal)
      .then((result) => setProducts(result.items))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load cart products"))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  if (loading) return <LoadingState label="Loading cart..." />;
  if (error) return <ErrorState label={error} />;

  const lines = buildCartLines(products, items);
  const summary = calculateSummary(lines);

  if (lines.length === 0) {
    return <EmptyState label="Cart is empty" actionLabel="Browse products" />;
  }

  return (
    <section className="panel">
      <h1>Shopping Cart</h1>
      <div className="line-list">
        {lines.map((line) => (
          <div className="line-item" key={`${line.product.id}-${line.sku.id}`}>
            <label>
              <input
                aria-label={`Select ${line.product.title}`}
                checked={line.selected}
                type="checkbox"
                onChange={() => toggleCartItem(line.product.id, line.sku.id)}
              />{" "}
              <strong>{line.product.title}</strong>
              <span className="muted"> · {line.sku.label}</span>
            </label>
            <input
              aria-label={`Quantity ${line.product.title}`}
              min={1}
              max={line.sku.stock}
              type="number"
              value={line.quantity}
              onChange={(event) => updateCartItem(line.product.id, line.sku.id, Number(event.target.value))}
            />
            <button
              type="button"
              className="button-secondary"
              onClick={() => removeCartItem(line.product.id, line.sku.id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="summary">
        <div className="summary-row">
          <span>Subtotal</span>
          <strong>¥{summary.subtotal}</strong>
        </div>
        <div className="summary-row">
          <span>Discount</span>
          <strong>-¥{summary.discount}</strong>
        </div>
        <div className="summary-row">
          <span>Shipping</span>
          <strong>¥{summary.shippingFee}</strong>
        </div>
        <div className="summary-row">
          <span>Payable</span>
          <strong>¥{summary.payable}</strong>
        </div>
      </div>
      <p>
        <Link className="button-primary" to="/checkout">
          Checkout
        </Link>
      </p>
    </section>
  );
}
