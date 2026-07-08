import { lazy, Suspense } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { LoadingState } from "./shared/ui/StateViews";

const ProductListPage = lazy(() =>
  import("./features/products/ProductListPage").then((module) => ({
    default: module.ProductListPage,
  })),
);
const ProductDetailPage = lazy(() =>
  import("./features/products/ProductDetailPage").then((module) => ({
    default: module.ProductDetailPage,
  })),
);
const CartPage = lazy(() =>
  import("./features/cart/CartPage").then((module) => ({ default: module.CartPage })),
);
const CheckoutPage = lazy(() =>
  import("./features/checkout/CheckoutPage").then((module) => ({
    default: module.CheckoutPage,
  })),
);
const OrderListPage = lazy(() =>
  import("./features/orders/OrderListPage").then((module) => ({
    default: module.OrderListPage,
  })),
);
const OrderDetailPage = lazy(() =>
  import("./features/orders/OrderDetailPage").then((module) => ({
    default: module.OrderDetailPage,
  })),
);

export function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/products" className="brand">
          Agentic Commerce
        </Link>
        <nav>
          <Link to="/products">Products</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/orders">Orders</Link>
        </nav>
      </header>
      <main>
        <Suspense fallback={<LoadingState label="Loading route..." />}>
          <Routes>
            <Route path="/" element={<Navigate to="/products" replace />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrderListPage />} />
            <Route path="/orders/:orderId" element={<OrderDetailPage />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
