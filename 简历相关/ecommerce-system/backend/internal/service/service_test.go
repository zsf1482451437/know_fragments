package service

import (
	"testing"

	"ecommerce-system/backend/internal/domain"
	"ecommerce-system/backend/internal/repository"
	"ecommerce-system/backend/internal/seed"
)

func TestListProductsFiltersAndSorts(t *testing.T) {
	store := repository.NewMemoryStore(seed.Products())
	result := store.ListProducts(domain.ProductQuery{
		Keyword:  "camera",
		Category: "security",
		Sort:     "price_asc",
		Page:     1,
		PageSize: 10,
	})

	if result.Page.Total != 1 {
		t.Fatalf("expected 1 product, got %d", result.Page.Total)
	}
	if result.Items[0].ID != "p-camera-001" {
		t.Fatalf("expected camera product, got %s", result.Items[0].ID)
	}
}

func TestValidateCartRejectsInsufficientStock(t *testing.T) {
	store := repository.NewMemoryStore(seed.Products())
	checkout := NewCheckoutService(store)

	_, _, err := checkout.ValidateCart([]domain.CartItem{
		{ProductID: "p-hub-003", SKUID: "sku-hub-basic", Quantity: 1, Selected: true},
	})

	if err == nil {
		t.Fatal("expected stock validation error")
	}
}

func TestCalculateSummaryAppliesDiscountAndShipping(t *testing.T) {
	summary := domain.CalculateSummary([]domain.CartLine{
		{SKU: domain.SKU{Price: 399}, Quantity: 2, Selected: true},
	})

	if summary.Subtotal != 798 {
		t.Fatalf("expected subtotal 798, got %d", summary.Subtotal)
	}
	if summary.Discount != 63 {
		t.Fatalf("expected 8 percent integer discount 63, got %d", summary.Discount)
	}
	if summary.ShippingFee != 0 {
		t.Fatalf("expected free shipping, got %d", summary.ShippingFee)
	}
	if summary.Payable != 735 {
		t.Fatalf("expected payable 735, got %d", summary.Payable)
	}
}

func TestCheckoutCreatesPendingPaymentOrderWithSnapshot(t *testing.T) {
	store := repository.NewMemoryStore(seed.Products())
	checkout := NewCheckoutService(store)

	result, err := checkout.Checkout(domain.CheckoutRequest{
		Items: []domain.CartItem{
			{ProductID: "p-camera-001", SKUID: "sku-camera-white", Quantity: 1, Selected: true},
		},
		Shipping: domain.ShippingInfo{Receiver: "zf", Phone: "138", Address: "sz"},
	})
	if err != nil {
		t.Fatalf("checkout failed: %v", err)
	}
	order, err := store.GetOrder(result.OrderID)
	if err != nil {
		t.Fatalf("order not saved: %v", err)
	}
	if order.Status != domain.StatusPendingPayment {
		t.Fatalf("expected pending status, got %s", order.Status)
	}
	if order.Items[0].UnitPrice != 399 {
		t.Fatalf("expected immutable price snapshot 399, got %d", order.Items[0].UnitPrice)
	}
}

func TestInvalidOrderTransitionIsRejected(t *testing.T) {
	_, err := domain.NextStatus(domain.StatusCancelled, "ship")
	if err == nil {
		t.Fatal("expected invalid transition error")
	}
}
