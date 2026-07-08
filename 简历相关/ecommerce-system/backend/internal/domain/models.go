package domain

import (
	"errors"
	"fmt"
	"time"
)

type Product struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Category    string `json:"category"`
	ImageURL    string `json:"imageUrl"`
	Price       int    `json:"price"`
	SalesCount  int    `json:"salesCount"`
	Rating      int    `json:"rating"`
	Stock       int    `json:"stock"`
	SKUs        []SKU  `json:"skus"`
}

type SKU struct {
	ID    string `json:"id"`
	Label string `json:"label"`
	Price int    `json:"price"`
	Stock int    `json:"stock"`
}

type CartItem struct {
	ProductID string `json:"productId"`
	SKUID     string `json:"skuId"`
	Quantity  int    `json:"quantity"`
	Selected  bool   `json:"selected"`
}

type CartLine struct {
	Product  Product `json:"product"`
	SKU      SKU     `json:"sku"`
	Quantity int     `json:"quantity"`
	Selected bool    `json:"selected"`
}

type PriceSummary struct {
	Subtotal    int `json:"subtotal"`
	Discount    int `json:"discount"`
	ShippingFee int `json:"shippingFee"`
	Payable     int `json:"payable"`
}

type ShippingInfo struct {
	Receiver string `json:"receiver"`
	Phone    string `json:"phone"`
	Address  string `json:"address"`
}

type CheckoutRequest struct {
	Items    []CartItem    `json:"items"`
	Shipping ShippingInfo `json:"shipping"`
}

type CheckoutResult struct {
	OrderID string `json:"orderId"`
}

type OrderStatus string

const (
	StatusPendingPayment OrderStatus = "pending_payment"
	StatusPaid           OrderStatus = "paid"
	StatusShipped        OrderStatus = "shipped"
	StatusCompleted      OrderStatus = "completed"
	StatusCancelled      OrderStatus = "cancelled"
	StatusRefunded       OrderStatus = "refunded"
)

type OrderItem struct {
	ProductID string `json:"productId"`
	SKUID     string `json:"skuId"`
	Title     string `json:"title"`
	SKULabel  string `json:"skuLabel"`
	UnitPrice int    `json:"unitPrice"`
	Quantity  int    `json:"quantity"`
}

type TimelineEvent struct {
	Status OrderStatus `json:"status"`
	At     time.Time   `json:"at"`
}

type Order struct {
	ID        string          `json:"id"`
	OrderNo   string          `json:"orderNo"`
	Status    OrderStatus     `json:"status"`
	Items     []OrderItem     `json:"items"`
	Summary   PriceSummary    `json:"summary"`
	Shipping  ShippingInfo    `json:"shipping"`
	CreatedAt time.Time       `json:"createdAt"`
	Timeline  []TimelineEvent `json:"timeline"`
}

type ProductQuery struct {
	Keyword   string
	Category  string
	MinPrice  int
	MaxPrice  int
	InStock   *bool
	MinRating int
	Sort      string
	Page      int
	PageSize  int
}

type PageMeta struct {
	Page       int `json:"page"`
	PageSize   int `json:"pageSize"`
	Total      int `json:"total"`
	TotalPages int `json:"totalPages"`
}

type PageResult[T any] struct {
	Items []T      `json:"items"`
	Page  PageMeta `json:"page"`
}

func CalculateSummary(lines []CartLine) PriceSummary {
	subtotal := 0
	for _, line := range lines {
		if line.Selected {
			subtotal += line.SKU.Price * line.Quantity
		}
	}
	discount := 0
	if subtotal >= 500 {
		discount = subtotal * 8 / 100
	}
	shipping := 0
	if subtotal > 0 && subtotal < 299 {
		shipping = 18
	}
	return PriceSummary{
		Subtotal:    subtotal,
		Discount:    discount,
		ShippingFee: shipping,
		Payable:     subtotal - discount + shipping,
	}
}

func ValidateShipping(shipping ShippingInfo) error {
	if shipping.Receiver == "" || shipping.Phone == "" || shipping.Address == "" {
		return errors.New("shipping information is incomplete")
	}
	return nil
}

func NextStatus(current OrderStatus, action string) (OrderStatus, error) {
	transitions := map[OrderStatus]map[string]OrderStatus{
		StatusPendingPayment: {"cancel": StatusCancelled, "pay": StatusPaid},
		StatusPaid:           {"ship": StatusShipped, "refund": StatusRefunded},
		StatusShipped:        {"complete": StatusCompleted},
		StatusCompleted:      {"refund": StatusRefunded},
	}
	if next, ok := transitions[current][action]; ok {
		return next, nil
	}
	return current, fmt.Errorf("invalid order transition: %s -> %s", current, action)
}
