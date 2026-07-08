export type ApiEnvelope<T> = {
  code: string;
  message: string;
  data: T;
  requestId: string;
};

export type PageMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type PageResult<T> = {
  items: T[];
  page: PageMeta;
};

export type ProductSku = {
  id: string;
  label: string;
  price: number;
  stock: number;
};

export type Product = {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  price: number;
  salesCount: number;
  rating: number;
  stock: number;
  skus: ProductSku[];
};

export type ProductQuery = {
  keyword?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  minRating?: number;
  sort?: "default" | "price_asc" | "price_desc" | "sales" | "rating";
  page?: number;
  pageSize?: number;
};

export type CartItem = {
  productId: string;
  skuId: string;
  quantity: number;
  selected: boolean;
};

export type CartLine = {
  product: Product;
  sku: ProductSku;
  quantity: number;
  selected: boolean;
};

export type PriceSummary = {
  subtotal: number;
  discount: number;
  shippingFee: number;
  payable: number;
};

export type CheckoutRequest = {
  items: CartItem[];
  shipping: ShippingInfo;
};

export type ShippingInfo = {
  receiver: string;
  phone: string;
  address: string;
};

export type CheckoutResult = {
  orderId: string;
};

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "shipped"
  | "completed"
  | "cancelled"
  | "refunded";

export type OrderItem = {
  productId: string;
  skuId: string;
  title: string;
  skuLabel: string;
  unitPrice: number;
  quantity: number;
};

export type Order = {
  id: string;
  orderNo: string;
  status: OrderStatus;
  items: OrderItem[];
  summary: PriceSummary;
  shipping: ShippingInfo;
  createdAt: string;
  timeline: Array<{ status: OrderStatus; at: string }>;
};
