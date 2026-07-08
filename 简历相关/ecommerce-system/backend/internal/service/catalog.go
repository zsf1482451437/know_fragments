package service

import (
	"ecommerce-system/backend/internal/domain"
	"ecommerce-system/backend/internal/repository"
)

type CatalogService struct {
	store repository.Store
}

func NewCatalogService(store repository.Store) *CatalogService {
	return &CatalogService{store: store}
}

func (service *CatalogService) ListProducts(query domain.ProductQuery) domain.PageResult[domain.Product] {
	return service.store.ListProducts(query)
}

func (service *CatalogService) GetProduct(id string) (domain.Product, error) {
	return service.store.GetProduct(id)
}
