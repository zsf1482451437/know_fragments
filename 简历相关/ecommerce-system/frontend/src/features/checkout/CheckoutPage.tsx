import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "../../shared/api/client";
import type { ShippingInfo } from "../../shared/types/api";
import { EmptyState, ErrorState } from "../../shared/ui/StateViews";
import { clearCart, getCartItems, useCartItems } from "../cart/cartStore";

const initialShipping: ShippingInfo = {
  receiver: "翟思峰",
  phone: "13800000000",
  address: "深圳市南山区科技园",
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const cartItems = useCartItems();
  const selectedItems = cartItems.filter((item) => item.selected);
  const [shipping, setShipping] = useState(initialShipping);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await apiClient.checkout({ items: selectedItems, shipping });
      clearCart();
      navigate(`/orders/${result.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (getCartItems().length === 0) {
    return <EmptyState label="No items for checkout" actionLabel="Back to products" />;
  }

  return (
    <section className="panel">
      <h1>Checkout</h1>
      <p className="muted">Backend validates selected items, stock, price snapshot, and shipping information.</p>
      {error ? <ErrorState label={error} /> : null}
      <form className="form-grid" onSubmit={submit}>
        <label>
          Receiver
          <input
            value={shipping.receiver}
            onChange={(event) => setShipping({ ...shipping, receiver: event.target.value })}
            required
          />
        </label>
        <label>
          Phone
          <input
            value={shipping.phone}
            onChange={(event) => setShipping({ ...shipping, phone: event.target.value })}
            required
          />
        </label>
        <label>
          Address
          <textarea
            value={shipping.address}
            onChange={(event) => setShipping({ ...shipping, address: event.target.value })}
            required
          />
        </label>
        <button className="button-primary" disabled={submitting || selectedItems.length === 0} type="submit">
          {submitting ? "Submitting..." : "Submit order"}
        </button>
      </form>
      <p>
        <Link to="/cart">Back to cart</Link>
      </p>
    </section>
  );
}
