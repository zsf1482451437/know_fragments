import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState, ErrorState, LoadingState } from "../../shared/ui/StateViews";
import type { ProductQuery } from "../../shared/types/api";
import { useProductSearch } from "./useProductSearch";

const categories = ["", "security", "smart-home", "accessory"];

export function ProductListPage() {
  const [query, setQuery] = useState<ProductQuery>({ page: 1, pageSize: 8, sort: "default" });
  const [keyword, setKeyword] = useState("");
  const { products, page, loading, error } = useProductSearch(query);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    setQuery((current) => ({ ...current, keyword, page: 1 }));
  }

  function resetFilters() {
    setKeyword("");
    setQuery({ page: 1, pageSize: 8, sort: "default" });
  }

  return (
    <section>
      <div className="panel">
        <h1>Product Discovery</h1>
        <p className="muted">Search, filter, and sort products through typed HTTP APIs.</p>
        <form className="toolbar" onSubmit={submitSearch}>
          <input
            aria-label="Search keyword"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Search camera, sensor..."
          />
          <select
            aria-label="Category"
            value={query.category ?? ""}
            onChange={(event) =>
              setQuery((current) => ({ ...current, category: event.target.value || undefined, page: 1 }))
            }
          >
            {categories.map((category) => (
              <option key={category || "all"} value={category}>
                {category || "All categories"}
              </option>
            ))}
          </select>
          <select
            aria-label="Stock"
            value={query.inStock === undefined ? "" : String(query.inStock)}
            onChange={(event) =>
              setQuery((current) => ({
                ...current,
                inStock: event.target.value === "" ? undefined : event.target.value === "true",
                page: 1,
              }))
            }
          >
            <option value="">All stock</option>
            <option value="true">In stock</option>
            <option value="false">Out of stock</option>
          </select>
          <select
            aria-label="Sort"
            value={query.sort}
            onChange={(event) =>
              setQuery((current) => ({ ...current, sort: event.target.value as ProductQuery["sort"] }))
            }
          >
            <option value="default">Default</option>
            <option value="price_asc">Price asc</option>
            <option value="price_desc">Price desc</option>
            <option value="sales">Sales</option>
            <option value="rating">Rating</option>
          </select>
          <button type="submit" className="button-primary">
            Search
          </button>
        </form>
      </div>

      {loading ? <LoadingState label="Loading products..." /> : null}
      {error ? <ErrorState label={error} onAction={() => setQuery((current) => ({ ...current }))} /> : null}
      {!loading && !error && products.length === 0 ? (
        <EmptyState label="No products found" actionLabel="Reset filters" onAction={resetFilters} />
      ) : null}
      {!loading && !error && products.length > 0 ? (
        <>
          <div className="grid product-grid" style={{ marginTop: 18 }}>
            {products.map((product) => (
              <article className="product-card" key={product.id}>
                <img src={product.imageUrl} alt="" loading="lazy" />
                <div className="product-card-body">
                  <h2>{product.title}</h2>
                  <p className="muted">{product.category}</p>
                  <p className="price">¥{product.price}</p>
                  <p className="muted">
                    Rating {product.rating} · Sales {product.salesCount} · Stock {product.stock}
                  </p>
                  <Link to={`/products/${product.id}`}>View detail</Link>
                </div>
              </article>
            ))}
          </div>
          <div className="summary">
            <div className="summary-row">
              <span>
                Page {page?.page ?? 1} / {page?.totalPages ?? 1}
              </span>
              <span>Total {page?.total ?? products.length}</span>
            </div>
            <div>
              <button
                type="button"
                className="button-secondary"
                disabled={!page || page.page <= 1}
                onClick={() => setQuery((current) => ({ ...current, page: Math.max(1, (current.page ?? 1) - 1) }))}
              >
                Prev
              </button>{" "}
              <button
                type="button"
                className="button-secondary"
                disabled={!page || page.page >= page.totalPages}
                onClick={() => setQuery((current) => ({ ...current, page: (current.page ?? 1) + 1 }))}
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
