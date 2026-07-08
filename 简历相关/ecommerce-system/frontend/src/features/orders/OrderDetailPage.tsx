import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiClient } from "../../shared/api/client";
import type { Order } from "../../shared/types/api";
import { ErrorState, LoadingState } from "../../shared/ui/StateViews";

const actionByStatus: Record<string, string[]> = {
  pending_payment: ["cancel", "pay"],
  paid: ["ship", "refund"],
  shipped: ["complete"],
  completed: ["refund"],
  cancelled: [],
  refunded: [],
};

export function OrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    const controller = new AbortController();
    apiClient
      .getOrder(orderId, controller.signal)
      .then(setOrder)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load order"))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [orderId]);

  async function transition(action: string) {
    if (!order) return;
    try {
      setOrder(await apiClient.transitionOrder(order.id, action));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transition failed");
    }
  }

  if (loading) return <LoadingState label="Loading order detail..." />;
  if (error) return <ErrorState label={error} />;
  if (!order) return <ErrorState label="Order not found" />;

  return (
    <section className="panel">
      <Link to="/orders">Back to orders</Link>
      <h1>{order.orderNo}</h1>
      <span className="status-pill">{order.status}</span>
      <h2>Items</h2>
      <div className="line-list">
        {order.items.map((item) => (
          <div className="line-item" key={`${item.productId}-${item.skuId}`}>
            <span>
              <strong>{item.title}</strong>
              <span className="muted"> · {item.skuLabel}</span>
            </span>
            <span>¥{item.unitPrice}</span>
            <span>x {item.quantity}</span>
          </div>
        ))}
      </div>
      <div className="summary">
        <div className="summary-row">
          <span>Payable</span>
          <strong>¥{order.summary.payable}</strong>
        </div>
        <div className="summary-row">
          <span>Ship to</span>
          <span>
            {order.shipping.receiver}, {order.shipping.phone}, {order.shipping.address}
          </span>
        </div>
      </div>
      <h2>Timeline</h2>
      <ul>
        {order.timeline.map((event) => (
          <li key={`${event.status}-${event.at}`}>
            {event.status} · {new Date(event.at).toLocaleString()}
          </li>
        ))}
      </ul>
      <div>
        {(actionByStatus[order.status] ?? []).map((action) => (
          <button key={action} type="button" className="button-secondary" onClick={() => transition(action)}>
            {action}
          </button>
        ))}
      </div>
    </section>
  );
}
