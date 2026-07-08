package repository

import (
	"errors"
	"sort"
	"strings"
	"sync"

	"ecommerce-system/backend/internal/domain"
)

var ErrNotFound = errors.New("not found")

type Store interface {
	ListProducts(query domain.ProductQuery) domain.PageResult[domain.Product]
	GetProduct(id string) (domain.Product, error)
	SaveOrder(order domain.Order) error
	ListOrders(status string) domain.PageResult[domain.Order]
	GetOrder(id string) (domain.Order, error)
	UpdateOrder(order domain.Order) error
}

type MemoryStore struct {
	mu       sync.RWMutex
	products []domain.Product
	orders   map[string]domain.Order
}

func NewMemoryStore(products []domain.Product) *MemoryStore {
	return &MemoryStore{
		products: append([]domain.Product(nil), products...),
		orders:   make(map[string]domain.Order),
	}
}

func (store *MemoryStore) ListProducts(query domain.ProductQuery) domain.PageResult[domain.Product] {
	store.mu.RLock()
	defer store.mu.RUnlock()

	var filtered []domain.Product
	for _, product := range store.products {
		if !matchProduct(product, query) {
			continue
		}
		filtered = append(filtered, product)
	}
	sortProducts(filtered, query.Sort)
	return paginate(filtered, query.Page, query.PageSize)
}

func (store *MemoryStore) GetProduct(id string) (domain.Product, error) {
	store.mu.RLock()
	defer store.mu.RUnlock()
	for _, product := range store.products {
		if product.ID == id {
			return product, nil
		}
	}
	return domain.Product{}, ErrNotFound
}

func (store *MemoryStore) SaveOrder(order domain.Order) error {
	store.mu.Lock()
	defer store.mu.Unlock()
	for _, item := range order.Items {
		productIndex, skuIndex, ok := store.findProductSKU(item.ProductID, item.SKUID)
		if !ok {
			return ErrNotFound
		}
		if store.products[productIndex].SKUs[skuIndex].Stock < item.Quantity {
			return errors.New("insufficient stock")
		}
	}
	for _, item := range order.Items {
		productIndex, skuIndex, _ := store.findProductSKU(item.ProductID, item.SKUID)
		store.products[productIndex].SKUs[skuIndex].Stock -= item.Quantity
		store.products[productIndex].Stock = totalStock(store.products[productIndex].SKUs)
	}
	store.orders[order.ID] = order
	return nil
}

func (store *MemoryStore) ListOrders(status string) domain.PageResult[domain.Order] {
	store.mu.RLock()
	defer store.mu.RUnlock()
	var orders []domain.Order
	for _, order := range store.orders {
		if status == "" || string(order.Status) == status {
			orders = append(orders, order)
		}
	}
	sort.Slice(orders, func(i, j int) bool {
		return orders[i].CreatedAt.After(orders[j].CreatedAt)
	})
	return paginate(orders, 1, 20)
}

func (store *MemoryStore) GetOrder(id string) (domain.Order, error) {
	store.mu.RLock()
	defer store.mu.RUnlock()
	order, ok := store.orders[id]
	if !ok {
		return domain.Order{}, ErrNotFound
	}
	return order, nil
}

func (store *MemoryStore) UpdateOrder(order domain.Order) error {
	store.mu.Lock()
	defer store.mu.Unlock()
	if _, ok := store.orders[order.ID]; !ok {
		return ErrNotFound
	}
	store.orders[order.ID] = order
	return nil
}

func (store *MemoryStore) findProductSKU(productID string, skuID string) (int, int, bool) {
	for productIndex, product := range store.products {
		if product.ID != productID {
			continue
		}
		for skuIndex, sku := range product.SKUs {
			if sku.ID == skuID {
				return productIndex, skuIndex, true
			}
		}
	}
	return 0, 0, false
}

func totalStock(skus []domain.SKU) int {
	total := 0
	for _, sku := range skus {
		total += sku.Stock
	}
	return total
}

func matchProduct(product domain.Product, query domain.ProductQuery) bool {
	if query.Keyword != "" {
		needle := strings.ToLower(query.Keyword)
		if !strings.Contains(strings.ToLower(product.Title), needle) &&
			!strings.Contains(strings.ToLower(product.Description), needle) {
			return false
		}
	}
	if query.Category != "" && product.Category != query.Category {
		return false
	}
	if query.MinPrice > 0 && product.Price < query.MinPrice {
		return false
	}
	if query.MaxPrice > 0 && product.Price > query.MaxPrice {
		return false
	}
	if query.InStock != nil && (*query.InStock) != (product.Stock > 0) {
		return false
	}
	if query.MinRating > 0 && product.Rating < query.MinRating {
		return false
	}
	return true
}

func sortProducts(products []domain.Product, sortKey string) {
	sort.Slice(products, func(i, j int) bool {
		switch sortKey {
		case "price_asc":
			return products[i].Price < products[j].Price
		case "price_desc":
			return products[i].Price > products[j].Price
		case "sales":
			return products[i].SalesCount > products[j].SalesCount
		case "rating":
			return products[i].Rating > products[j].Rating
		default:
			return products[i].ID < products[j].ID
		}
	})
}

func paginate[T any](items []T, page int, pageSize int) domain.PageResult[T] {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}
	total := len(items)
	totalPages := (total + pageSize - 1) / pageSize
	start := (page - 1) * pageSize
	if start > total {
		start = total
	}
	end := start + pageSize
	if end > total {
		end = total
	}
	return domain.PageResult[T]{
		Items: items[start:end],
		Page: domain.PageMeta{
			Page:       page,
			PageSize:   pageSize,
			Total:      total,
			TotalPages: totalPages,
		},
	}
}
