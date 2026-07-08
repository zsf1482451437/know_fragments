## ADDED Requirements

### Requirement: SQLite is the default runtime store
The backend SHALL use SQLite as the default runtime persistence store while keeping the existing repository interface as the service boundary.

#### Scenario: Backend starts with SQLite store
- **WHEN** the backend application starts with no explicit storage override
- **THEN** the application initializes a SQLite database and uses SQLiteStore for product, order, and inventory operations

#### Scenario: Service layer remains storage agnostic
- **WHEN** checkout, catalog, or order services access persistence
- **THEN** they depend on the repository interface rather than SQLite-specific APIs

### Requirement: Database schema covers commerce entities
The SQLite schema SHALL define tables for products, product SKUs, orders, order items, and order timelines with indexes for common query paths.

#### Scenario: Schema is initialized
- **WHEN** the backend initializes an empty database file
- **THEN** all required tables and indexes are created if they do not already exist

#### Scenario: Product list query uses persisted data
- **WHEN** the product list endpoint is called after schema and seed initialization
- **THEN** products and SKU stock are read from SQLite and returned through the existing API envelope

### Requirement: Seed data initializes products and SKUs
The backend SHALL seed initial product and SKU data into SQLite without duplicating records across repeated starts.

#### Scenario: Backend starts for the first time
- **WHEN** the SQLite database contains no product rows
- **THEN** the backend inserts the initial products and SKUs from seed data

#### Scenario: Backend restarts after seed
- **WHEN** the SQLite database already contains seeded products
- **THEN** the backend does not duplicate product or SKU records

### Requirement: Checkout uses a transaction
The checkout flow MUST create orders, create order items, create timeline records, and deduct SKU inventory within a single SQLite transaction.

#### Scenario: Checkout transaction succeeds
- **WHEN** selected cart items have sufficient stock and shipping information is valid
- **THEN** the transaction commits order, order items, timeline, and SKU stock deduction together

#### Scenario: Checkout transaction fails
- **WHEN** any step in order creation or stock deduction fails
- **THEN** the transaction rolls back and leaves orders, order items, timelines, and stock unchanged

### Requirement: Persistence survives process restart
The backend SHALL preserve orders and inventory changes across process restarts when using the same SQLite database file.

#### Scenario: Order remains after restart
- **WHEN** a user creates an order and the backend process restarts
- **THEN** the order detail endpoint can still return the created order from SQLite

#### Scenario: Inventory deduction remains after restart
- **WHEN** checkout deducts SKU inventory and the backend process restarts
- **THEN** the product detail endpoint returns the updated SKU stock from SQLite

### Requirement: SQLite errors map to domain errors
The backend SHALL map SQLite not-found and constraint errors to existing repository or validation errors without leaking database internals to API clients.

#### Scenario: Missing product is requested
- **WHEN** a product ID does not exist in SQLite
- **THEN** the backend returns the existing NOT_FOUND API response shape

#### Scenario: Constraint violation occurs during checkout
- **WHEN** SQLite rejects a write due to a constraint violation
- **THEN** the backend returns a validation error response and rolls back the transaction

### Requirement: SQLite repository has automated tests
The backend SHALL include tests for SQLite schema initialization, seed idempotency, product queries, checkout transaction behavior, order persistence, and status transitions.

#### Scenario: SQLite test database is created
- **WHEN** repository tests run
- **THEN** each test initializes an isolated temporary SQLite database

#### Scenario: Transaction rollback is tested
- **WHEN** a checkout test triggers an invalid stock or write failure condition
- **THEN** the test verifies no partial order data is persisted
