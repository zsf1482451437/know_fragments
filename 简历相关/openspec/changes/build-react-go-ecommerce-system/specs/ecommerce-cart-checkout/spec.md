## ADDED Requirements

### Requirement: Add product to cart
The system SHALL allow users to add a selected product SKU to the shopping cart with a valid quantity.

#### Scenario: User adds available SKU to cart
- **WHEN** the user selects an available SKU and quantity then clicks add to cart
- **THEN** the system adds the item to the cart and shows the updated cart quantity

#### Scenario: User adds out-of-stock SKU to cart
- **WHEN** the user selects an out-of-stock SKU and clicks add to cart
- **THEN** the system prevents the action and displays an out-of-stock message

### Requirement: Cart item management
The system SHALL allow users to update item quantity, remove items, and select items for checkout.

#### Scenario: User updates item quantity
- **WHEN** the user changes a cart item quantity within available stock
- **THEN** the system updates the cart item and recalculates totals

#### Scenario: User removes cart item
- **WHEN** the user removes an item from the cart
- **THEN** the system removes the item and recalculates totals

### Requirement: Price calculation
The system SHALL calculate subtotal, discount amount, shipping fee, and payable amount using deterministic rules.

#### Scenario: Cart totals are calculated
- **WHEN** the cart contains selected items with valid prices and quantities
- **THEN** the system displays subtotal, discount amount, shipping fee, and final payable amount

#### Scenario: Quantity changes affect totals
- **WHEN** the user changes the quantity of a selected item
- **THEN** the system recalculates the payable amount immediately

### Requirement: Checkout validation
The system SHALL validate selected items, stock, price snapshot, and shipping information before creating an order.

#### Scenario: Checkout succeeds
- **WHEN** selected cart items are valid and shipping information is complete
- **THEN** the system creates an order and returns the order ID

#### Scenario: Stock changes before checkout
- **WHEN** an item stock becomes insufficient before checkout
- **THEN** the system blocks order creation and returns the latest stock status
