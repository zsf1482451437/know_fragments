## 1. Project Setup

- [x] 1.1 Create `ecommerce-system/` as an independent project directory under the current workspace.
- [x] 1.2 Create frontend project with React, TypeScript, Vite, routing, linting, testing, and build scripts.
- [x] 1.3 Create backend project with Go module, HTTP server, routing, middleware, configuration, and test command.
- [x] 1.4 Add local development documentation covering frontend start, backend start, tests, lint, and build.
- [x] 1.5 Add seed data for products, SKUs, inventory, cart examples, and orders.

## 2. API Contract and Domain Model

- [x] 2.1 Define shared API contract for response envelope, pagination, errors, products, cart, checkout, and orders.
- [x] 2.2 Implement backend domain models for product, SKU, cart item, checkout request, order, order item, and order status.
- [x] 2.3 Implement repository interfaces and local persistence implementation.
- [x] 2.4 Add backend request logging, request ID, timeout handling, and consistent error responses.
- [x] 2.5 Add backend unit tests for domain validation and repository behavior.

## 3. Product Discovery

- [x] 3.1 Write failing backend tests for product list pagination, keyword search, filters, sorting, and product detail not found.
- [x] 3.2 Implement product list and product detail REST endpoints in Go.
- [x] 3.3 Write frontend API service and TypeScript models for product list, filters, sorting, and product detail.
- [x] 3.4 Implement product list page with pagination, search, filters, sorting, loading state, empty state, and error state.
- [x] 3.5 Implement product detail page with SKU selection, stock display, and add-to-cart entry.
- [x] 3.6 Add frontend tests for product list rendering, filter interaction, stale request handling, and product detail not-found state.

## 4. Cart and Checkout

- [x] 4.1 Write failing backend tests for cart quantity validation, stock validation, price calculation, and checkout blocking.
- [x] 4.2 Implement cart validation and checkout service in Go.
- [x] 4.3 Implement checkout REST endpoint that returns order ID on success and structured validation errors on failure.
- [x] 4.4 Implement frontend cart state, cart page, quantity update, item removal, selected items, and total calculation display.
- [x] 4.5 Implement checkout flow with shipping form, backend validation, success state, and failure recovery.
- [x] 4.6 Add frontend tests for cart update, totals recalculation, out-of-stock handling, and checkout failure display.

## 5. Order Management

- [x] 5.1 Write failing backend tests for order creation, immutable price snapshots, order list filtering, order detail, and invalid status transitions.
- [x] 5.2 Implement order creation, order list, order detail, and status transition services.
- [x] 5.3 Implement order REST endpoints for list, detail, cancellation, payment simulation, shipping simulation, completion, and refund simulation.
- [x] 5.4 Implement frontend order list page with pagination, status filter, and order summary.
- [x] 5.5 Implement frontend order detail page with item snapshot, price breakdown, shipping information, timeline, and valid actions.
- [x] 5.6 Add frontend tests for order list filtering, order detail rendering, cancellation, and invalid transition handling.

## 6. Frontend Engineering Quality

- [x] 6.1 Organize frontend code by feature modules for products, cart, checkout, orders, shared services, shared UI, and shared types.
- [x] 6.2 Add route-level code splitting and lazy loading for product detail, cart, checkout, order list, and order detail pages.
- [x] 6.3 Add request cancellation or stale-response protection for product search, filters, sorting, and pagination.
- [x] 6.4 Add reusable UI states for loading, empty, error, and retry.
- [x] 6.5 Add image lazy loading and stable list key strategy for product list rendering.
- [x] 6.6 Ensure frontend verification command runs lint, type check, tests, and production build.

## 7. Agentic Development Workflow

- [x] 7.1 Add project notes explaining how OpenSpec proposal, design, specs, and tasks map to implementation.
- [x] 7.2 Add TDD notes for price calculation, stock validation, checkout, and order status transition rules.
- [x] 7.3 Add an Agent review checklist covering correctness, maintainability, performance, security, and test coverage.
- [x] 7.4 Add milestone documentation mapping the project to JD points: React, TypeScript, browser/network, Vite, AI Agent, Go, and e-commerce.
- [x] 7.5 Record implementation trade-offs and rejected alternatives for interview复盘.

## 8. Verification and Delivery

- [ ] 8.1 Run backend tests and fix all failures.
- [x] 8.2 Run frontend tests and fix all failures.
- [x] 8.3 Run frontend lint, type check, and production build.
- [ ] 8.4 Run backend build and smoke test core API endpoints.
- [ ] 8.5 Verify manual user journeys: product search, product detail, add to cart, checkout, order list, order detail, and order cancellation.
- [x] 8.6 Prepare a concise README with project overview, architecture diagram text, local startup commands, test commands, and interview highlights.
