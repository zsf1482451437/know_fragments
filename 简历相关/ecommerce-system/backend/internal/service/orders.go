package service

import (
	"time"

	"ecommerce-system/backend/internal/domain"
	"ecommerce-system/backend/internal/repository"
)

type OrderService struct {
	store repository.Store
	clock func() time.Time
}

func NewOrderService(store repository.Store) *OrderService {
	return &OrderService{store: store, clock: time.Now}
}

func (service *OrderService) ListOrders(status string) domain.PageResult[domain.Order] {
	return service.store.ListOrders(status)
}

func (service *OrderService) GetOrder(id string) (domain.Order, error) {
	return service.store.GetOrder(id)
}

func (service *OrderService) Transition(id string, action string) (domain.Order, error) {
	order, err := service.store.GetOrder(id)
	if err != nil {
		return domain.Order{}, err
	}
	next, err := domain.NextStatus(order.Status, action)
	if err != nil {
		return domain.Order{}, err
	}
	order.Status = next
	order.Timeline = append(order.Timeline, domain.TimelineEvent{Status: next, At: service.clock()})
	if err := service.store.UpdateOrder(order); err != nil {
		return domain.Order{}, err
	}
	return order, nil
}
