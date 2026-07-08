package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"ecommerce-system/backend/internal/handler"
	"ecommerce-system/backend/internal/middleware"
	"ecommerce-system/backend/internal/repository"
	"ecommerce-system/backend/internal/seed"
	"ecommerce-system/backend/internal/service"
)

func main() {
	dbPath := envOrDefault("ECOMMERCE_DB_PATH", "./data/ecommerce.db")
	if err := os.MkdirAll(filepath.Dir(dbPath), 0o755); err != nil {
		log.Fatalf("create data directory failed: %v", err)
	}
	store, err := repository.OpenSQLiteStore(context.Background(), dbPath, seed.Products())
	if err != nil {
		log.Fatalf("open sqlite store failed: %v", err)
	}
	defer func() {
		if err := store.Close(); err != nil {
			log.Printf("close sqlite store failed: %v", err)
		}
	}()
	api := handler.NewAPI(
		service.NewCatalogService(store),
		service.NewCheckoutService(store),
		service.NewOrderService(store),
	)
	server := &http.Server{
		Addr: ":8080",
		Handler: middleware.Chain(
			api.Routes(),
			middleware.CORS,
			middleware.RequestID,
			middleware.Logger,
			middleware.Timeout(5*time.Second),
		),
		ReadHeaderTimeout: 3 * time.Second,
	}

	go func() {
		log.Println("api listening on http://localhost:8080")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server failed: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("graceful shutdown failed: %v", err)
	}
}

func envOrDefault(key string, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}
