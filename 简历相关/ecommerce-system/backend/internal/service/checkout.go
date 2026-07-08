package service

import (
	"errors"
	"fmt"
	"time"

	"ecommerce-system/backend/internal/domain"
	"ecommerce-system/backend/internal/repository"
)

type CheckoutService struct {
	store repository.Store
	clock func() time.Time
}

func NewCheckoutService(store repository.Store) *CheckoutService {
	return &CheckoutService{store: store, clock: time.Now}
}

func (service *CheckoutService) ValidateCart(items []domain.CartItem) ([]domain.CartLine, domain.PriceSummary, error) {
	if len(items) == 0 {
		return nil, domain.PriceSummary{}, errors.New("cart is empty")
	}
	lines := make([]domain.CartLine, 0, len(items))
	for _, item := range items {
		if item.Quantity <= 0 {
			return nil, domain.PriceSummary{}, errors.New("cart quantity must be positive")
		}
		product, err := service.store.GetProduct(item.ProductID)
		if err != nil {
			return nil, domain.PriceSummary{}, fmt.Errorf("product not found: %s", item.ProductID)
		}
		sku, ok := findSKU(product, item.SKUID)
		if !ok {
			return nil, domain.PriceSummary{}, fmt.Errorf("sku not found: %s", item.SKUID)
		}
		if sku.Stock < item.Quantity {
			return nil, domain.PriceSummary{}, fmt.Errorf("insufficient stock for %s", product.Title)
		}
		lines = append(lines, domain.CartLine{Product: product, SKU: sku, Quantity: item.Quantity, Selected: item.Selected})
	}
	return lines, domain.CalculateSummary(lines), nil
}

func (service *CheckoutService) Checkout(request domain.CheckoutRequest) (domain.CheckoutResult, error) {
	if err := domain.ValidateShipping(request.Shipping); err != nil {
		return domain.CheckoutResult{}, err
	}
	lines, summary, err := service.ValidateCart(selectedItems(request.Items))
	if err != nil {
		return domain.CheckoutResult{}, err
	}
	now := service.clock()
	orderID := fmt.Sprintf("order-%d", now.UnixNano())
	order := domain.Order{
		ID:        orderID,
		OrderNo:   fmt.Sprintf("AC%s", now.Format("20060102150405")),
		Status:    domain.StatusPendingPayment,
		Summary:   summary,
		Shipping:  request.Shipping,
		CreatedAt: now,
		Timeline:  []domain.TimelineEvent{{Status: domain.StatusPendingPayment, At: now}},
	}
	for _, line := range lines {
		order.Items = append(order.Items, domain.OrderItem{
			ProductID: line.Product.ID,
			SKUID:     line.SKU.ID,
			Title:     line.Product.Title,
			SKULabel:  line.SKU.Label,
			UnitPrice: line.SKU.Price,
			Quantity:  line.Quantity,
		})
	}
	if err := service.store.SaveOrder(order); err != nil {
		return domain.CheckoutResult{}, err
	}
	return domain.CheckoutResult{OrderID: orderID}, nil
}

func findSKU(product domain.Product, skuID string) (domain.SKU, bool) {
	for _, sku := range product.SKUs {
		if sku.ID == skuID {
			return sku, true
		}
	}
	return domain.SKU{}, false
}

func selectedItems(items []domain.CartItem) []domain.CartItem {
	var selected []domain.CartItem
	for _, item := range items {
		if item.Selected {
			selected = append(selected, item)
		}
	}
	return selected
}
