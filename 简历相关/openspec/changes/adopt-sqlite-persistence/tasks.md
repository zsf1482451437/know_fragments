## 1. SQLite Dependency and Schema

- [x] 1.1 Select SQLite driver and add it to `ecommerce-system/backend/go.mod`.
- [x] 1.2 Create `ecommerce-system/backend/internal/repository/schema.sql` with products, product_skus, orders, order_items, and order_timelines tables.
- [x] 1.3 Add indexes for product category, product title, SKU product ID, order status, and order created time.
- [x] 1.4 Add repository schema initialization logic that runs `CREATE TABLE IF NOT EXISTS` safely on startup.

## 2. SQLite Store Implementation

- [x] 2.1 Create `SQLiteStore` under `ecommerce-system/backend/internal/repository`.
- [x] 2.2 Implement product list query with keyword, category, price range, stock, rating, sorting, and pagination.
- [x] 2.3 Implement product detail query that loads product and SKU rows.
- [x] 2.4 Implement order list and order detail queries that load order items and timeline records.
- [x] 2.5 Map missing rows and constraint errors to existing repository/domain errors.

## 3. Seed and Startup Wiring

- [x] 3.1 Add SQLite seed logic that inserts initial products and SKUs idempotently.
- [x] 3.2 Read database path from environment variable with default `./data/ecommerce.db`.
- [x] 3.3 Update `cmd/api/main.go` to initialize SQLiteStore as the default runtime repository.
- [x] 3.4 Keep MemoryStore available for fast unit tests and isolated in-memory scenarios.

## 4. Transactional Checkout

- [x] 4.1 Implement checkout transaction for stock validation, order creation, order item insertion, timeline insertion, and SKU stock deduction.
- [x] 4.2 Ensure transaction rolls back on insufficient stock, missing SKU, invalid shipping, or write failure.
- [x] 4.3 Ensure committed checkout persists order detail and updated SKU stock across process restarts.
- [x] 4.4 Preserve existing checkout API response shape and frontend compatibility.

## 5. Tests

- [x] 5.1 Add SQLite repository test helper that creates a temporary database per test.
- [x] 5.2 Test schema initialization and seed idempotency.
- [x] 5.3 Test product list filters, sorting, pagination, and product detail loading from SQLite.
- [x] 5.4 Test checkout transaction commit persists order, order items, timeline, and stock deduction.
- [x] 5.5 Test checkout rollback leaves orders and stock unchanged on validation or write failure.
- [x] 5.6 Test order status transition persistence and invalid transition behavior.

## 6. Documentation

- [x] 6.1 Update `ecommerce-system/README.md` with SQLite setup, database path, reset instructions, and verification commands.
- [x] 6.2 Update `ecommerce-system/docs/go-knowledge-map.md` with `database/sql`, SQLite driver, transactions, indexes, and `sql.ErrNoRows` mapping.
- [x] 6.3 Update `ecommerce-system/docs/agentic-workflow.md` with SQLite first, PostgreSQL ready persistence decision.

## 7. Verification

- [x] 7.1 Run backend tests with Go toolchain and fix all failures.
- [x] 7.2 Run backend server and smoke test product list, checkout, order detail, and restart persistence.
- [x] 7.3 Run frontend `npm run verify` to ensure API contract compatibility remains intact.
- [x] 7.4 Update OpenSpec tasks after successful verification.
