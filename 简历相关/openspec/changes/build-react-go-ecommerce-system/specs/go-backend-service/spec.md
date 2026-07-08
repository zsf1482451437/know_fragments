## ADDED Requirements

### Requirement: Go service structure
The backend SHALL use Go and organize code into handler, service, repository, domain model, middleware, and configuration layers.

#### Scenario: Developer locates order creation logic
- **WHEN** a developer investigates order creation behavior
- **THEN** HTTP parsing is handled in handler layer and business rules are handled in service/domain layer

### Requirement: REST API contract
The backend SHALL expose REST endpoints for products, cart validation, checkout, orders, and order status updates.

#### Scenario: Frontend requests product list
- **WHEN** the frontend calls the product list endpoint with pagination and filters
- **THEN** the backend returns a JSON response with data, pagination metadata, message, code, and request ID

### Requirement: Domain validation
The backend SHALL validate inventory, SKU availability, cart quantity, price snapshots, and order status transitions in domain or service logic.

#### Scenario: Checkout validates stock
- **WHEN** checkout includes an item whose quantity exceeds available stock
- **THEN** the backend rejects checkout and returns a structured validation error

### Requirement: Persistence abstraction
The backend SHALL isolate persistence behind repository interfaces so storage can evolve from local persistence to a relational database.

#### Scenario: Repository implementation changes
- **WHEN** storage changes from local persistence to SQL database
- **THEN** handler and service behavior remains unchanged

### Requirement: Operational error handling
The backend SHALL provide consistent error responses, request logging, timeout handling, and graceful shutdown behavior.

#### Scenario: Request times out
- **WHEN** a request exceeds the configured timeout
- **THEN** the backend cancels the request context and returns a timeout error response
