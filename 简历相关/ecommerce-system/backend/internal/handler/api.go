package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"ecommerce-system/backend/internal/domain"
	"ecommerce-system/backend/internal/repository"
	"ecommerce-system/backend/internal/service"
)

type API struct {
	catalog  *service.CatalogService
	checkout *service.CheckoutService
	orders   *service.OrderService
}

func NewAPI(catalog *service.CatalogService, checkout *service.CheckoutService, orders *service.OrderService) *API {
	return &API{catalog: catalog, checkout: checkout, orders: orders}
}

func (api *API) Routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/products", api.listProducts)
	mux.HandleFunc("GET /api/products/{id}", api.getProduct)
	mux.HandleFunc("POST /api/cart/validate", api.validateCart)
	mux.HandleFunc("POST /api/checkout", api.checkoutOrder)
	mux.HandleFunc("GET /api/orders", api.listOrders)
	mux.HandleFunc("GET /api/orders/{id}", api.getOrder)
	mux.HandleFunc("POST /api/orders/{id}/{action}", api.transitionOrder)
	return mux
}

func (api *API) listProducts(writer http.ResponseWriter, request *http.Request) {
	query := request.URL.Query()
	var inStock *bool
	if raw := query.Get("inStock"); raw != "" {
		parsed := raw == "true"
		inStock = &parsed
	}
	result := api.catalog.ListProducts(domain.ProductQuery{
		Keyword:   query.Get("keyword"),
		Category:  query.Get("category"),
		MinPrice:  intParam(query.Get("minPrice"), 0),
		MaxPrice:  intParam(query.Get("maxPrice"), 0),
		InStock:   inStock,
		MinRating: intParam(query.Get("minRating"), 0),
		Sort:      query.Get("sort"),
		Page:      intParam(query.Get("page"), 1),
		PageSize:  intParam(query.Get("pageSize"), 10),
	})
	writeOK(writer, request, result)
}

func (api *API) getProduct(writer http.ResponseWriter, request *http.Request) {
	product, err := api.catalog.GetProduct(request.PathValue("id"))
	if err != nil {
		writeMappedError(writer, request, err)
		return
	}
	writeOK(writer, request, product)
}

func (api *API) validateCart(writer http.ResponseWriter, request *http.Request) {
	var payload struct {
		Items []domain.CartItem `json:"items"`
	}
	if err := json.NewDecoder(request.Body).Decode(&payload); err != nil {
		writeError(writer, request, http.StatusBadRequest, "BAD_REQUEST", "invalid json payload")
		return
	}
	lines, summary, err := api.checkout.ValidateCart(payload.Items)
	if err != nil {
		writeError(writer, request, http.StatusUnprocessableEntity, "VALIDATION_ERROR", err.Error())
		return
	}
	writeOK(writer, request, map[string]any{"lines": lines, "summary": summary})
}

func (api *API) checkoutOrder(writer http.ResponseWriter, request *http.Request) {
	var payload domain.CheckoutRequest
	if err := json.NewDecoder(request.Body).Decode(&payload); err != nil {
		writeError(writer, request, http.StatusBadRequest, "BAD_REQUEST", "invalid json payload")
		return
	}
	result, err := api.checkout.Checkout(payload)
	if err != nil {
		writeError(writer, request, http.StatusUnprocessableEntity, "VALIDATION_ERROR", err.Error())
		return
	}
	writeOK(writer, request, result)
}

func (api *API) listOrders(writer http.ResponseWriter, request *http.Request) {
	writeOK(writer, request, api.orders.ListOrders(request.URL.Query().Get("status")))
}

func (api *API) getOrder(writer http.ResponseWriter, request *http.Request) {
	order, err := api.orders.GetOrder(request.PathValue("id"))
	if err != nil {
		writeMappedError(writer, request, err)
		return
	}
	writeOK(writer, request, order)
}

func (api *API) transitionOrder(writer http.ResponseWriter, request *http.Request) {
	order, err := api.orders.Transition(request.PathValue("id"), request.PathValue("action"))
	if err != nil {
		writeMappedError(writer, request, err)
		return
	}
	writeOK(writer, request, order)
}

func intParam(raw string, fallback int) int {
	if strings.TrimSpace(raw) == "" {
		return fallback
	}
	value, err := strconv.Atoi(raw)
	if err != nil {
		return fallback
	}
	return value
}

func writeMappedError(writer http.ResponseWriter, request *http.Request, err error) {
	if errors.Is(err, repository.ErrNotFound) {
		writeError(writer, request, http.StatusNotFound, "NOT_FOUND", err.Error())
		return
	}
	writeError(writer, request, http.StatusUnprocessableEntity, "VALIDATION_ERROR", err.Error())
}
