## ADDED Requirements

### Requirement: Order creation
The system SHALL create an order from validated checkout data and persist order items, price snapshot, shipping information, and initial status.

#### Scenario: Order is created from checkout
- **WHEN** checkout validation succeeds
- **THEN** the system creates an order with status `pending_payment` and immutable item price snapshots

### Requirement: Order list
The system SHALL display a paginated order list with order number, status, payable amount, item summary, and created time.

#### Scenario: User views order list
- **WHEN** the user opens the order list page
- **THEN** the system displays orders sorted by created time descending

#### Scenario: User filters orders by status
- **WHEN** the user selects an order status filter
- **THEN** the system displays only orders with that status

### Requirement: Order detail
The system SHALL display order detail including order number, status, items, price breakdown, shipping information, and timeline.

#### Scenario: User opens order detail
- **WHEN** the user selects an order from the order list
- **THEN** the system displays complete order detail information

### Requirement: Order status transition
The system SHALL enforce valid order status transitions for pending payment, paid, shipped, completed, cancelled, and refunded states.

#### Scenario: User cancels pending payment order
- **WHEN** the user cancels an order in `pending_payment` status
- **THEN** the system changes the order status to `cancelled`

#### Scenario: Invalid status transition is rejected
- **WHEN** the system receives a request to ship a `cancelled` order
- **THEN** the system rejects the transition and keeps the original order status
