## ADDED Requirements

### Requirement: OpenSpec-driven planning
The development workflow SHALL use OpenSpec artifacts as the source of truth before implementation begins.

#### Scenario: Developer starts a new capability
- **WHEN** a developer starts work on a capability
- **THEN** the developer reviews proposal, design, specs, and tasks before editing production code

### Requirement: TDD for core business rules
The development workflow SHALL require failing tests before implementing core business rules including price calculation, stock validation, order creation, and status transitions.

#### Scenario: Developer implements order status transition
- **WHEN** a developer implements a new order status transition rule
- **THEN** a failing test for the transition behavior exists before production code is changed

### Requirement: Agent-assisted code review
The development workflow SHALL use AI Agent review after each implementation batch to identify correctness, maintainability, performance, and test coverage risks.

#### Scenario: Implementation batch is complete
- **WHEN** a feature batch passes local verification
- **THEN** an Agent review is performed before the work is considered ready

### Requirement: Verification before completion
The development workflow SHALL run automated verification for frontend, backend, and integration boundaries before marking tasks complete.

#### Scenario: Developer completes checkout capability
- **WHEN** checkout implementation is ready
- **THEN** frontend tests, backend tests, linting, and build verification pass

### Requirement: Interview-ready documentation
The development workflow SHALL maintain concise notes that explain technical decisions, trade-offs, metrics, and JD mapping.

#### Scenario: Project milestone is completed
- **WHEN** a milestone is completed
- **THEN** the system records what was built, which JD points it maps to, and which engineering trade-offs were made
