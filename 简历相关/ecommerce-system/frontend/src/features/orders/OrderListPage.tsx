import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../../shared/api/client";
import type { Order, OrderStatus, PageMeta } from "../../shared/types/api";
import { EmptyState, ErrorState, LoadingState } from "../../shared/ui/StateViews";

const statuses: Array<"" | OrderStatus> = [
  "",
  "pending_payment",
  "paid",
  "shipped",
  "completed",
  "cancelled",
  "refunded",
];

export function OrderListPage() {
  const [status, setStatus] = useState<"" | OrderStatus>("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    apiClient
      .listOrders(status || undefined, controller.signal)
      .then((result) => {
        setOrders(result.items);
        setPage(result.page);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load orders"))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [status]);

  return (
    <section className="panel">
      <h1>Orders</h1>
      <select
        aria-label="Order status"
        value={status}
        onChange={(event) => setStatus(event.target.value as "" | OrderStatus)}
      >
        {statuses.map((candidate) => (
          <option key={candidate || "all"} value={candidate}>
            {candidate || "All statuses"}
          </option>
        ))}
      </select>

      {loading ? <LoadingState label="Loading orders..." /> : null}
      {error ? <ErrorState label={error} /> : null}
      {!loading && !error && orders.length === 0 ? <EmptyState label="No orders found" /> : null}
      {!loading && !error && orders.length > 0 ? (
        <div className="line-list">
          {orders.map((order) => (
            <article className="line-item" key={order.id}>
              <div>
                <strong>{order.orderNo}</strong>
                <p className="muted">
                  {order.items.length} items · {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <span className="status-pill">{order.status}</span>
              <Link to={`/orders/${order.id}`}>Detail</Link>
            </article>
          ))}
          <p className="muted">
            Page {page?.page ?? 1} / {page?.totalPages ?? 1}, total {page?.total ?? orders.length}
          </p>
        </div>
      ) : null}
    </section>
  );
}
