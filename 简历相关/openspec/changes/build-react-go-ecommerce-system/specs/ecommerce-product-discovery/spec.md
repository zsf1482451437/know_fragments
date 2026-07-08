## ADDED Requirements

### Requirement: Product list browsing
The system SHALL display a paginated product list with product name, image placeholder, price, category, sales count, rating, and stock status.

#### Scenario: User opens product list
- **WHEN** the user visits the product list page
- **THEN** the system displays the first page of products with pagination metadata

#### Scenario: Product list is empty
- **WHEN** no products match the current query
- **THEN** the system displays an empty state with a clear reset-filter action

### Requirement: Product search and filters
The system SHALL allow users to search products by keyword and filter by category, price range, stock status, and rating.

#### Scenario: Keyword search returns matching products
- **WHEN** the user enters a keyword and submits search
- **THEN** the system returns products whose title or description matches the keyword

#### Scenario: Multiple filters are applied
- **WHEN** the user selects category, price range, and in-stock filters
- **THEN** the system returns only products matching all selected filters

### Requirement: Product sorting
The system SHALL allow users to sort products by default relevance, price ascending, price descending, sales count, and rating.

#### Scenario: User sorts by price ascending
- **WHEN** the user selects price ascending sort
- **THEN** the system displays products ordered from lowest price to highest price

### Requirement: Product detail view
The system SHALL display product detail information including images, title, description, price, SKU options, stock, rating, and add-to-cart action.

#### Scenario: User opens product detail
- **WHEN** the user selects a product from the list
- **THEN** the system displays complete product detail and available SKU options

#### Scenario: Product does not exist
- **WHEN** the user opens an unknown product ID
- **THEN** the system displays a not-found state and a link back to the product list
