import { describe, expect, it } from "vitest";
import { calculateSummary } from "./cartStore";

describe("calculateSummary", () => {
  it("recalculates payable when quantity changes", () => {
    const summary = calculateSummary([
      { sku: { id: "sku-1", label: "White", price: 399, stock: 10 }, quantity: 2, selected: true },
    ]);

    expect(summary).toEqual({
      subtotal: 798,
      discount: 63,
      shippingFee: 0,
      payable: 735,
    });
  });

  it("adds shipping for low value selected items", () => {
    const summary = calculateSummary([
      { sku: { id: "sku-2", label: "Pack", price: 169, stock: 10 }, quantity: 1, selected: true },
    ]);

    expect(summary.shippingFee).toBe(18);
    expect(summary.payable).toBe(187);
  });
});
