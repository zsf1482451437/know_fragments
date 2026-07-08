import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiClient } from "../../shared/api/client";
import type { Product, ProductSku } from "../../shared/types/api";
import { EmptyState, ErrorState, LoadingState } from "../../shared/ui/StateViews";
import { addCartItem } from "../cart/cartStore";

export function ProductDetailPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [sku, setSku] = useState<ProductSku | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!productId) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    apiClient
      .getProduct(productId, controller.signal)
      .then((nextProduct) => {
        setProduct(nextProduct);
        setSku(nextProduct.skus[0] ?? null);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Product not found"))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [productId]);

  if (loading) return <LoadingState label="Loading product detail..." />;
  if (error) return <ErrorState label={error} />;
  if (!product) {
    return <EmptyState label="Product does not exist" actionLabel="Back to products" />;
  }

  const canAdd = sku && sku.stock >= quantity;

  function addToCart() {
    if (!product || !sku) return;
    if (!canAdd) {
      setMessage("Selected SKU is out of stock.");
      return;
    }
    addCartItem(product.id, sku.id, quantity);
    setMessage("Added to cart.");
  }

  return (
    <section className="panel">
      <Link to="/products">Back to products</Link>
      <img className="product-hero" src={product.imageUrl} alt="" loading="lazy" />
      <h1>{product.title}</h1>
      <p className="muted">{product.description}</p>
      <p className="price">¥{sku?.price ?? product.price}</p>
      <div className="form-grid">
        <label>
          SKU
          <select
            aria-label="SKU"
            value={sku?.id ?? ""}
            onChange={(event) =>
              setSku(product.skus.find((candidate) => candidate.id === event.target.value) ?? null)
            }
          >
            {product.skus.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.label} · stock {candidate.stock}
              </option>
            ))}
          </select>
        </label>
        <label>
          Quantity
          <input
            aria-label="Quantity"
            min={1}
            type="number"
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
          />
        </label>
        <button type="button" className="button-primary" onClick={addToCart}>
          Add to cart
        </button>
        {message ? <p role="status">{message}</p> : null}
      </div>
    </section>
  );
}
