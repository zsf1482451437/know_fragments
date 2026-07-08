package repository

import (
	"context"
	"path/filepath"
	"testing"
	"time"

	"ecommerce-system/backend/internal/domain"
	"ecommerce-system/backend/internal/seed"
)

func newTestSQLiteStore(t *testing.T) *SQLiteStore {
	t.Helper()
	store, err := OpenSQLiteStore(context.Background(), filepath.Join(t.TempDir(), "test.db"), seed.Products())
	if err != nil {
		t.Fatalf("open sqlite store: %v", err)
	}
	t.Cleanup(func() {
		if err := store.Close(); err != nil {
			t.Fatalf("close sqlite store: %v", err)
		}
	})
	return store
}

func TestSQLiteStoreSeedsProductsIdempotently(t *testing.T) {
	store := newTestSQLiteStore(t)

	if err := store.SeedProducts(context.Background(), seed.Products()); err != nil {
		t.Fatalf("seed products again: %v", err)
	}
	result := store.ListProducts(domain.ProductQuery{Page: 1, PageSize: 20})
	if result.Page.Total != len(seed.Products()) {
		t.Fatalf("expected %d products after repeated seed, got %d", len(seed.Products()), result.Page.Total)
	}
}

func TestSQLiteStoreListsProductsWithFilters(t *testing.T) {
	store := newTestSQLiteStore(t)

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
	if len(result.Items[0].SKUs) == 0 {
		t.Fatal("expected product SKUs to be loaded")
	}
}

func TestSQLiteStoreSaveOrderCommitsOrderAndStockDeduction(t *testing.T) {
	store := newTestSQLiteStore(t)
	order := testOrder("order-1", 2)

	if err := store.SaveOrder(order); err != nil {
		t.Fatalf("save order: %v", err)
	}

	saved, err := store.GetOrder(order.ID)
	if err != nil {
		t.Fatalf("get saved order: %v", err)
	}
	if saved.Items[0].UnitPrice != 399 {
		t.Fatalf("expected price snapshot 399, got %d", saved.Items[0].UnitPrice)
	}
	product, err := store.GetProduct("p-camera-001")
	if err != nil {
		t.Fatalf("get product: %v", err)
	}
	if stockOf(product, "sku-camera-white") != 28 {
		t.Fatalf("expected stock 28 after deduction, got %d", stockOf(product, "sku-camera-white"))
	}
}

func TestSQLiteStoreSaveOrderRollsBackOnInsufficientStock(t *testing.T) {
	store := newTestSQLiteStore(t)
	order := testOrder("order-rollback", 99)

	if err := store.SaveOrder(order); err == nil {
		t.Fatal("expected insufficient stock error")
	}
	if _, err := store.GetOrder(order.ID); err != ErrNotFound {
		t.Fatalf("expected no partial order, got %v", err)
	}
	product, err := store.GetProduct("p-camera-001")
	if err != nil {
		t.Fatalf("get product: %v", err)
	}
	if stockOf(product, "sku-camera-white") != 30 {
		t.Fatalf("expected stock unchanged, got %d", stockOf(product, "sku-camera-white"))
	}
}

func TestSQLiteStoreUpdateOrderPersistsStatusTransition(t *testing.T) {
	store := newTestSQLiteStore(t)
	order := testOrder("order-transition", 1)
	if err := store.SaveOrder(order); err != nil {
		t.Fatalf("save order: %v", err)
	}

	order.Status = domain.StatusPaid
	order.Timeline = append(order.Timeline, domain.TimelineEvent{Status: domain.StatusPaid, At: time.Now()})
	if err := store.UpdateOrder(order); err != nil {
		t.Fatalf("update order: %v", err)
	}
	saved, err := store.GetOrder(order.ID)
	if err != nil {
		t.Fatalf("get order: %v", err)
	}
	if saved.Status != domain.StatusPaid {
		t.Fatalf("expected paid status, got %s", saved.Status)
	}
	if len(saved.Timeline) != 2 {
		t.Fatalf("expected 2 timeline events, got %d", len(saved.Timeline))
	}
}

func testOrder(id string, quantity int) domain.Order {
	now := time.Now()
	return domain.Order{
		ID:      id,
		OrderNo: "AC" + id,
		Status:  domain.StatusPendingPayment,
		Items: []domain.OrderItem{
			{
				ProductID: "p-camera-001",
				SKUID:     "sku-camera-white",
				Title:     "4K Smart Security Camera",
				SKULabel:  "White",
				UnitPrice: 399,
				Quantity:  quantity,
			},
		},
		Summary: domain.PriceSummary{
			Subtotal:    399 * quantity,
			Discount:    0,
			ShippingFee: 0,
			Payable:     399 * quantity,
		},
		Shipping:  domain.ShippingInfo{Receiver: "zf", Phone: "138", Address: "sz"},
		CreatedAt: now,
		Timeline:  []domain.TimelineEvent{{Status: domain.StatusPendingPayment, At: now}},
	}
}

func stockOf(product domain.Product, skuID string) int {
	for _, sku := range product.SKUs {
		if sku.ID == skuID {
			return sku.Stock
		}
	}
	return -1
}
