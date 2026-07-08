import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OrderDetailPage } from "./OrderDetailPage";

const order = {
  id: "order-1",
  orderNo: "AC202607070001",
  status: "pending_payment",
  items: [
    {
      productId: "p-camera-001",
      skuId: "sku-camera-white",
      title: "4K Smart Security Camera",
      skuLabel: "White",
      unitPrice: 399,
      quantity: 1,
    },
  ],
  summary: { subtotal: 399, discount: 0, shippingFee: 0, payable: 399 },
  shipping: { receiver: "zf", phone: "138", address: "sz" },
  createdAt: "2026-07-07T00:00:00Z",
  timeline: [{ status: "pending_payment", at: "2026-07-07T00:00:00Z" }],
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("OrderDetailPage", () => {
  it("renders order detail and performs valid action", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ code: "OK", message: "success", requestId: "req-1", data: order }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: "OK",
          message: "success",
          requestId: "req-2",
          data: { ...order, status: "cancelled" },
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <MemoryRouter initialEntries={["/orders/order-1"]}>
        <Routes>
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("AC202607070001")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "cancel" }));

    expect(await screen.findByText("cancelled")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenLastCalledWith("/api/orders/order-1/cancel", expect.objectContaining({ method: "POST" }));
  });
});
