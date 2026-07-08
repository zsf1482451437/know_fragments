import type {
  ApiEnvelope,
  CartItem,
  CheckoutRequest,
  CheckoutResult,
  Order,
  OrderStatus,
  PageResult,
  PriceSummary,
  Product,
  ProductQuery,
} from "../types/api";

const API_BASE = "/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly requestId: string,
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { signal?: AbortSignal } = {},
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || payload.code !== "OK") {
    throw new ApiError(payload.message, payload.code, payload.requestId);
  }
  return payload.data;
}

function toQuery(params: ProductQuery) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const apiClient = {
  listProducts(params: ProductQuery, signal?: AbortSignal) {
    return request<PageResult<Product>>(`/products${toQuery(params)}`, { signal });
  },
  getProduct(productId: string, signal?: AbortSignal) {
    return request<Product>(`/products/${productId}`, { signal });
  },
  validateCart(items: CartItem[], signal?: AbortSignal) {
    return request<{ lines: unknown[]; summary: PriceSummary }>("/cart/validate", {
      method: "POST",
      body: JSON.stringify({ items }),
      signal,
    });
  },
  checkout(payload: CheckoutRequest) {
    return request<CheckoutResult>("/checkout", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  listOrders(status?: OrderStatus, signal?: AbortSignal) {
    const query = status ? `?status=${status}` : "";
    return request<PageResult<Order>>(`/orders${query}`, { signal });
  },
  getOrder(orderId: string, signal?: AbortSignal) {
    return request<Order>(`/orders/${orderId}`, { signal });
  },
  transitionOrder(orderId: string, action: string) {
    return request<Order>(`/orders/${orderId}/${action}`, { method: "POST" });
  },
};
