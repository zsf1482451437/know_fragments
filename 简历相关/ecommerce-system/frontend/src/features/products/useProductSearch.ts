import { useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "../../shared/api/client";
import type { PageMeta, Product, ProductQuery } from "../../shared/types/api";

export function useProductSearch(query: ProductQuery) {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestSeq = useRef(0);
  const stableQuery = useMemo(() => JSON.stringify(query), [query]);

  useEffect(() => {
    const controller = new AbortController();
    const seq = requestSeq.current + 1;
    requestSeq.current = seq;
    setLoading(true);
    setError(null);
    apiClient
      .listProducts(JSON.parse(stableQuery) as ProductQuery, controller.signal)
      .then((result) => {
        if (requestSeq.current !== seq) return;
        setProducts(result.items);
        setPage(result.page);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted || requestSeq.current !== seq) return;
        setError(err instanceof Error ? err.message : "Failed to load products");
      })
      .finally(() => {
        if (requestSeq.current === seq) setLoading(false);
      });
    return () => controller.abort();
  }, [stableQuery]);

  return { products, page, loading, error };
}
