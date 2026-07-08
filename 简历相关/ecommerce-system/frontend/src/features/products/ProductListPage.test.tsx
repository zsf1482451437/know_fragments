import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProductListPage } from "./ProductListPage";

const product = {
  id: "p-camera-001",
  title: "4K Smart Security Camera",
  description: "AI motion detection.",
  category: "security",
  imageUrl: "/camera.png",
  price: 399,
  salesCount: 1240,
  rating: 5,
  stock: 42,
  skus: [{ id: "sku-camera-white", label: "White", price: 399, stock: 42 }],
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ProductListPage", () => {
  it("renders product list and supports keyword search", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        code: "OK",
        message: "success",
        requestId: "req-1",
        data: { items: [product], page: { page: 1, pageSize: 8, total: 1, totalPages: 1 } },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <MemoryRouter>
        <ProductListPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("4K Smart Security Camera")).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Search keyword"), "camera");
    await userEvent.click(screen.getByRole("button", { name: "Search" }));

    await waitFor(() => expect(fetchMock).toHaveBeenLastCalledWith(expect.stringContaining("keyword=camera"), expect.anything()));
  });

  it("shows retryable error state", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ code: "ERROR", message: "network failed", requestId: "req-2", data: {} }),
      }),
    );

    render(
      <MemoryRouter>
        <ProductListPage />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent("network failed");
  });
});
