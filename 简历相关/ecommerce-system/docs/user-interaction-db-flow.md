# 用户交互到数据库操作链路图

本文档用于说明本电商系统中，每个用户交互如何经过前端页面、前端状态、API 客户端、Go 后端分层，最终映射到 SQLite 表查询或写入。

后续新增需求时，必须同步补充对应的“用户交互 → API/状态 → 服务层 → 数据库操作”链路图。

## 0. 全局链路总览

```mermaid
flowchart LR
  U[用户交互] --> FE[React 页面/组件]
  FE --> State[前端状态或 API Client]
  State --> API[HTTP API /api/*]
  API --> Handler[Go handler]
  Handler --> Service[service/domain]
  Service --> Repo[repository.Store]
  Repo --> DB[(SQLite)]

  DB --> Repo
  Repo --> Service
  Service --> Handler
  Handler --> FE
  FE --> U
```

核心分层：

- 前端页面负责收集用户输入、展示状态和触发 API。
- `apiClient` 负责统一发起 `/api/*` 请求，并解析统一响应结构。
- `handler` 负责 HTTP 参数解析和错误映射。
- `service/domain` 负责业务规则，例如价格计算、库存校验、订单状态流转。
- `repository.Store` 隔离存储实现，当前默认使用 `SQLiteStore`。
- SQLite 负责商品、SKU、订单、订单项、订单时间线和库存持久化。

## 1. 应用启动与数据库初始化

虽然这不是用户点击交互，但它决定后续所有交互的数据基础。

```mermaid
sequenceDiagram
  participant Dev as 开发者
  participant Script as scripts/dev.sh
  participant API as Go 后端 main.go
  participant Store as SQLiteStore
  participant DB as SQLite
  participant Seed as seed.Products()

  Dev->>Script: 执行 ./scripts/dev.sh
  Script->>API: go run ./cmd/api
  API->>Store: OpenSQLiteStore(ctx, dbPath, seed.Products())
  Store->>DB: PRAGMA foreign_keys = ON
  Store->>DB: 执行 schema.sql
  Store->>DB: SELECT COUNT(*) FROM products
  alt 商品表为空
    Store->>Seed: 读取初始商品/SKU
    Store->>DB: INSERT INTO products
    Store->>DB: INSERT INTO product_skus
  else 已有商品数据
    Store-->>API: 跳过 seed，避免重复写入
  end
  API-->>Script: 监听 http://localhost:8080
```

数据库操作：

| 动作 | 表 | SQL 类型 |
|---|---|---|
| 初始化 schema | 全部表 | `CREATE TABLE IF NOT EXISTS` |
| 初始化索引 | 全部索引 | `CREATE INDEX IF NOT EXISTS` |
| 检查是否需要 seed | `products` | `SELECT COUNT(*)` |
| 写入初始商品 | `products` | `INSERT` |
| 写入初始 SKU | `product_skus` | `INSERT` |

## 2. 商品列表：搜索、筛选、排序、分页

用户在商品列表页输入关键词、选择分类、库存状态、排序方式或翻页时，会触发商品列表查询。

```mermaid
sequenceDiagram
  participant U as 用户
  participant Page as ProductListPage
  participant Hook as useProductSearch
  participant Client as apiClient.listProducts
  participant API as GET /api/products
  participant Handler as listProducts
  participant Catalog as CatalogService
  participant Store as SQLiteStore.ListProducts
  participant DB as SQLite

  U->>Page: 搜索/筛选/排序/翻页
  Page->>Hook: 更新 ProductQuery
  Hook->>Client: listProducts(query, signal)
  Client->>API: GET /api/products?keyword&category&sort&page&pageSize
  API->>Handler: 解析 URL 查询参数
  Handler->>Catalog: ListProducts(ProductQuery)
  Catalog->>Store: ListProducts(query)
  Store->>DB: SELECT COUNT(*) FROM products p WHERE ...
  Store->>DB: SELECT products + SUM(product_skus.stock) + ORDER BY + LIMIT/OFFSET
  Store->>DB: SELECT id,label,price,stock FROM product_skus WHERE product_id = ?
  DB-->>Store: 商品列表、SKU、分页信息
  Store-->>Catalog: PageResult<Product>
  Catalog-->>Handler: PageResult<Product>
  Handler-->>Client: JSON 响应
  Client-->>Hook: 商品和分页数据
  Hook-->>Page: 渲染商品卡片和分页
```

数据库操作：

| 用户动作 | 表 | SQL 类型 | 说明 |
|---|---|---|---|
| 搜索关键词 | `products` | `SELECT` | `lower(title)` / `lower(description)` 模糊匹配 |
| 选择分类 | `products` | `SELECT` | `category = ?` |
| 选择库存状态 | `product_skus` | `EXISTS` / `NOT EXISTS` | 判断是否存在可用库存 SKU |
| 选择排序 | `products` | `ORDER BY` | 价格、销量、评分或默认排序 |
| 翻页 | `products` | `LIMIT/OFFSET` | 返回当前页商品 |
| 展示 SKU | `product_skus` | `SELECT` | 按商品 ID 加载 SKU |

## 3. 商品详情：查看 SKU 和库存

用户从商品列表点击商品详情，会查询单个商品和它的 SKU。

```mermaid
sequenceDiagram
  participant U as 用户
  participant Page as ProductDetailPage
  participant Client as apiClient.getProduct
  participant API as GET /api/products/{id}
  participant Handler as getProduct
  participant Catalog as CatalogService
  participant Store as SQLiteStore.GetProduct
  participant DB as SQLite

  U->>Page: 点击 View detail
  Page->>Client: getProduct(productId)
  Client->>API: GET /api/products/{id}
  API->>Handler: 读取 PathValue(id)
  Handler->>Catalog: GetProduct(id)
  Catalog->>Store: GetProduct(id)
  Store->>DB: SELECT product + SUM(product_skus.stock) WHERE products.id = ?
  Store->>DB: SELECT id,label,price,stock FROM product_skus WHERE product_id = ?
  DB-->>Store: 商品详情和 SKU 列表
  Store-->>Handler: Product
  Handler-->>Client: JSON 响应
  Client-->>Page: 渲染详情、SKU、库存
```

数据库操作：

| 用户动作 | 表 | SQL 类型 | 说明 |
|---|---|---|---|
| 打开商品详情 | `products` | `SELECT` | 查询商品基础信息 |
| 展示库存 | `product_skus` | `SELECT` | 查询 SKU 价格和库存 |

## 4. 加入购物车：前端本地状态更新

当前项目的购物车是前端本地状态，不直接写数据库。数据库库存只在结算时校验和扣减。

```mermaid
sequenceDiagram
  participant U as 用户
  participant Page as ProductDetailPage
  participant Store as cartStore
  participant UI as React UI
  participant DB as SQLite

  U->>Page: 选择 SKU 和数量
  U->>Page: 点击 Add to cart
  Page->>Store: addCartItem(productId, skuId, quantity)
  Store->>Store: 合并同 SKU 数量或新增购物车项
  Store->>UI: emit 通知订阅组件刷新
  UI-->>U: 显示 Added to cart
  Note over Store,DB: 该交互不访问数据库，不扣减库存
```

数据库操作：

| 用户动作 | 表 | SQL 类型 | 说明 |
|---|---|---|---|
| 加入购物车 | 无 | 无 | 只更新前端内存状态 |

## 5. 购物车页：展示、数量调整、选中、删除

购物车页会读取商品列表来补齐商品和 SKU 展示信息；数量、选中、删除仍然只更新前端本地状态。

```mermaid
sequenceDiagram
  participant U as 用户
  participant Page as CartPage
  participant Cart as cartStore
  participant Client as apiClient.listProducts
  participant API as GET /api/products
  participant Store as SQLiteStore.ListProducts
  participant DB as SQLite

  Page->>Cart: useCartItems()
  Page->>Client: listProducts({page:1,pageSize:100})
  Client->>API: GET /api/products?page=1&pageSize=100
  API->>Store: ListProducts(query)
  Store->>DB: SELECT products
  Store->>DB: SELECT product_skus WHERE product_id = ?
  DB-->>Page: 商品和 SKU 数据
  Page->>Page: buildCartLines + calculateSummary

  U->>Page: 修改数量/勾选/删除
  Page->>Cart: updateCartItem / toggleCartItem / removeCartItem
  Cart-->>Page: emit 刷新购物车
  Page->>Page: 重新计算本地金额
```

数据库操作：

| 用户动作 | 表 | SQL 类型 | 说明 |
|---|---|---|---|
| 打开购物车页 | `products` | `SELECT` | 查询商品基础信息 |
| 打开购物车页 | `product_skus` | `SELECT` | 查询 SKU 价格和库存 |
| 修改数量 | 无 | 无 | 只更新前端本地状态 |
| 勾选商品 | 无 | 无 | 只更新前端本地状态 |
| 删除商品 | 无 | 无 | 只更新前端本地状态 |

## 6. 购物车校验：后端重新校验商品、SKU、库存和金额

`POST /api/cart/validate` 当前主要由 API 客户端提供，适合在后续需求中接入购物车页或结算页的实时后端校验。

```mermaid
sequenceDiagram
  participant U as 用户
  participant Page as 前端页面
  participant Client as apiClient.validateCart
  participant API as POST /api/cart/validate
  participant Handler as validateCart
  participant Checkout as CheckoutService.ValidateCart
  participant Store as SQLiteStore.GetProduct
  participant DB as SQLite
  participant Domain as domain.CalculateSummary

  U->>Page: 触发购物车校验
  Page->>Client: validateCart(items)
  Client->>API: POST /api/cart/validate
  API->>Handler: 解析 items
  Handler->>Checkout: ValidateCart(items)
  loop 每个购物车项
    Checkout->>Store: GetProduct(productId)
    Store->>DB: SELECT product WHERE id = ?
    Store->>DB: SELECT product_skus WHERE product_id = ?
    Checkout->>Checkout: 校验 skuId、quantity、stock
  end
  Checkout->>Domain: CalculateSummary(lines)
  Domain-->>Checkout: subtotal/discount/shippingFee/payable
  Checkout-->>Handler: lines + summary
  Handler-->>Page: 校验结果或错误
```

数据库操作：

| 用户动作 | 表 | SQL 类型 | 说明 |
|---|---|---|---|
| 校验购物车 | `products` | `SELECT` | 校验商品是否存在 |
| 校验购物车 | `product_skus` | `SELECT` | 校验 SKU 是否存在、库存是否充足 |
| 计算金额 | 无 | 无 | 在 Go domain 层计算，不落库 |

## 7. 提交结算：创建订单并扣减库存

提交结算是当前系统最核心的写链路。订单、订单项、订单时间线、库存扣减必须在同一个 SQLite 事务中完成。

```mermaid
sequenceDiagram
  participant U as 用户
  participant Page as CheckoutPage
  participant Client as apiClient.checkout
  participant API as POST /api/checkout
  participant Handler as checkoutOrder
  participant Checkout as CheckoutService.Checkout
  participant Domain as domain
  participant Store as SQLiteStore.SaveOrder
  participant DB as SQLite
  participant Router as React Router

  U->>Page: 填写收货信息并点击 Submit order
  Page->>Client: checkout({items:selectedItems, shipping})
  Client->>API: POST /api/checkout
  API->>Handler: 解析 CheckoutRequest
  Handler->>Checkout: Checkout(request)
  Checkout->>Domain: ValidateShipping(shipping)
  Checkout->>Checkout: selectedItems(items)
  Checkout->>Checkout: ValidateCart(selectedItems)
  loop 每个选中商品
    Checkout->>Store: GetProduct(productId)
    Store->>DB: SELECT product WHERE id = ?
    Store->>DB: SELECT product_skus WHERE product_id = ?
    Checkout->>Checkout: 校验 SKU 和库存
  end
  Checkout->>Domain: CalculateSummary(lines)
  Checkout->>Checkout: 构建 Order 和价格快照
  Checkout->>Store: SaveOrder(order)
  Store->>DB: BEGIN
  loop 每个订单项
    Store->>DB: SELECT stock FROM product_skus WHERE id = ? AND product_id = ?
  end
  Store->>DB: INSERT INTO orders
  loop 每个订单项
    Store->>DB: INSERT INTO order_items
    Store->>DB: UPDATE product_skus SET stock = stock - ?
  end
  Store->>DB: INSERT INTO order_timelines
  Store->>DB: COMMIT
  Store-->>Checkout: 保存成功
  Checkout-->>Handler: orderId
  Handler-->>Page: JSON 响应
  Page->>Page: clearCart()
  Page->>Router: 跳转 /orders/{orderId}
```

失败回滚：

```mermaid
flowchart TD
  A[提交结算] --> B[ValidateShipping]
  B --> C[ValidateCart]
  C --> D[SQLite BEGIN]
  D --> E[校验 SKU 库存]
  E --> F[写 orders]
  F --> G[写 order_items]
  G --> H[扣减 product_skus.stock]
  H --> I[写 order_timelines]
  I --> J[COMMIT]

  B -- 收货信息缺失 --> X[返回 VALIDATION_ERROR，不写库]
  C -- 商品/SKU/库存错误 --> X
  E -- 库存不足 --> R[ROLLBACK]
  F -- 写入失败 --> R
  G -- 写入失败 --> R
  H -- 扣减失败 --> R
  I -- 写入失败 --> R
  R --> Y[返回错误，订单和库存不产生部分变更]
```

数据库操作：

| 用户动作 | 表 | SQL 类型 | 说明 |
|---|---|---|---|
| 提交结算 | `products` | `SELECT` | 校验商品存在，生成订单快照 |
| 提交结算 | `product_skus` | `SELECT` | 校验 SKU 与库存 |
| 创建订单 | `orders` | `INSERT` | 写入订单主表、金额、收货信息、状态 |
| 创建订单项 | `order_items` | `INSERT` | 写入商品标题、SKU、成交单价、数量快照 |
| 扣减库存 | `product_skus` | `UPDATE` | `stock = stock - quantity` |
| 写时间线 | `order_timelines` | `INSERT` | 写入初始 `pending_payment` 事件 |

## 8. 订单列表：查看和按状态筛选

用户进入订单列表或切换订单状态筛选时，会查询订单主表，并补齐订单项和时间线。

```mermaid
sequenceDiagram
  participant U as 用户
  participant Page as OrderListPage
  participant Client as apiClient.listOrders
  participant API as GET /api/orders
  participant Handler as listOrders
  participant Service as OrderService
  participant Store as SQLiteStore.ListOrders
  participant DB as SQLite

  U->>Page: 进入订单页/选择状态
  Page->>Client: listOrders(status)
  Client->>API: GET /api/orders?status=paid
  API->>Handler: 解析 status
  Handler->>Service: ListOrders(status)
  Service->>Store: ListOrders(status)
  Store->>DB: SELECT orders WHERE status = ? ORDER BY created_at DESC LIMIT 20
  loop 每个订单
    Store->>DB: SELECT order_items WHERE order_id = ?
    Store->>DB: SELECT order_timelines WHERE order_id = ?
  end
  DB-->>Page: 订单列表、订单项、时间线
  Page-->>U: 渲染订单列表
```

数据库操作：

| 用户动作 | 表 | SQL 类型 | 说明 |
|---|---|---|---|
| 查看订单列表 | `orders` | `SELECT` | 查询订单主表 |
| 按状态筛选 | `orders` | `SELECT WHERE status = ?` | 按订单状态过滤 |
| 展示订单摘要 | `order_items` | `SELECT` | 加载订单项数量和快照 |
| 展示状态信息 | `order_timelines` | `SELECT` | 加载时间线 |

## 9. 订单详情：查看订单项、金额、收货信息和时间线

用户从订单列表点击订单详情，会读取一个订单的完整快照。

```mermaid
sequenceDiagram
  participant U as 用户
  participant Page as OrderDetailPage
  participant Client as apiClient.getOrder
  participant API as GET /api/orders/{id}
  participant Handler as getOrder
  participant Service as OrderService
  participant Store as SQLiteStore.GetOrder
  participant DB as SQLite

  U->>Page: 点击订单 Detail
  Page->>Client: getOrder(orderId)
  Client->>API: GET /api/orders/{id}
  API->>Handler: 读取 PathValue(id)
  Handler->>Service: GetOrder(id)
  Service->>Store: GetOrder(id)
  Store->>DB: SELECT orders WHERE id = ?
  Store->>DB: SELECT order_items WHERE order_id = ?
  Store->>DB: SELECT order_timelines WHERE order_id = ?
  DB-->>Page: 订单主信息、商品快照、金额、收货信息、时间线
  Page-->>U: 渲染订单详情
```

数据库操作：

| 用户动作 | 表 | SQL 类型 | 说明 |
|---|---|---|---|
| 打开订单详情 | `orders` | `SELECT` | 查询订单主信息 |
| 展示商品快照 | `order_items` | `SELECT` | 查询下单时的商品和价格快照 |
| 展示时间线 | `order_timelines` | `SELECT` | 查询订单状态变化记录 |

## 10. 订单状态操作：取消、支付、发货、完成、退款

用户在订单详情页点击状态按钮时，后端先校验状态机，再更新订单状态和时间线。

```mermaid
sequenceDiagram
  participant U as 用户
  participant Page as OrderDetailPage
  participant Client as apiClient.transitionOrder
  participant API as POST /api/orders/{id}/{action}
  participant Handler as transitionOrder
  participant Service as OrderService.Transition
  participant Domain as domain.NextStatus
  participant Store as SQLiteStore
  participant DB as SQLite

  U->>Page: 点击 cancel/pay/ship/complete/refund
  Page->>Client: transitionOrder(orderId, action)
  Client->>API: POST /api/orders/{id}/{action}
  API->>Handler: 读取 id 和 action
  Handler->>Service: Transition(id, action)
  Service->>Store: GetOrder(id)
  Store->>DB: SELECT orders WHERE id = ?
  Store->>DB: SELECT order_items WHERE order_id = ?
  Store->>DB: SELECT order_timelines WHERE order_id = ?
  Service->>Domain: NextStatus(currentStatus, action)
  alt 合法流转
    Service->>Store: UpdateOrder(order)
    Store->>DB: BEGIN
    Store->>DB: UPDATE orders SET status = ?
    Store->>DB: DELETE FROM order_timelines WHERE order_id = ?
    Store->>DB: INSERT INTO order_timelines 当前完整时间线
    Store->>DB: COMMIT
    Store-->>Page: 返回更新后的订单
  else 非法流转
    Domain-->>Service: invalid order transition
    Service-->>Page: VALIDATION_ERROR
  end
```

状态流转：

```mermaid
stateDiagram-v2
  [*] --> pending_payment: checkout
  pending_payment --> cancelled: cancel
  pending_payment --> paid: pay
  paid --> shipped: ship
  paid --> refunded: refund
  shipped --> completed: complete
  completed --> refunded: refund
```

数据库操作：

| 用户动作 | 表 | SQL 类型 | 说明 |
|---|---|---|---|
| 点击订单操作 | `orders` | `SELECT` | 读取当前订单状态 |
| 点击订单操作 | `order_items` | `SELECT` | 返回更新后订单详情所需快照 |
| 点击订单操作 | `order_timelines` | `SELECT` | 读取原时间线 |
| 合法状态流转 | `orders` | `UPDATE` | 更新订单状态 |
| 合法状态流转 | `order_timelines` | `DELETE` + `INSERT` | 重写完整时间线 |
| 非法状态流转 | 无 | 无 | 返回错误，不写库 |

## 11. 当前交互与数据库表关系矩阵

| 用户交互 | API/前端状态 | `products` | `product_skus` | `orders` | `order_items` | `order_timelines` |
|---|---|---:|---:|---:|---:|---:|
| 商品列表搜索/筛选/分页 | `GET /api/products` | 读 | 读 | - | - | - |
| 商品详情 | `GET /api/products/{id}` | 读 | 读 | - | - | - |
| 加入购物车 | `cartStore.addCartItem` | - | - | - | - | - |
| 修改购物车数量/选中/删除 | `cartStore.*` | - | - | - | - | - |
| 打开购物车页 | `GET /api/products` + 本地状态 | 读 | 读 | - | - | - |
| 购物车后端校验 | `POST /api/cart/validate` | 读 | 读 | - | - | - |
| 提交结算 | `POST /api/checkout` | 读 | 读/写 | 写 | 写 | 写 |
| 订单列表 | `GET /api/orders` | - | - | 读 | 读 | 读 |
| 订单详情 | `GET /api/orders/{id}` | - | - | 读 | 读 | 读 |
| 订单状态操作 | `POST /api/orders/{id}/{action}` | - | - | 读/写 | 读 | 读/写 |

## 12. 后续需求文档规范

后续每个新增需求都必须补充链路图，至少包含：

```text
用户交互
  -> 前端页面/组件
  -> 前端状态或 apiClient
  -> HTTP API
  -> handler
  -> service/domain
  -> repository
  -> SQLite 表操作
```

建议每个需求补充三类内容：

- 一张 Mermaid `sequenceDiagram`：说明从用户交互到数据库读写的完整调用链。
- 一张数据库操作表：明确读写了哪些表、使用了什么 SQL 类型。
- 一段一致性说明：如果涉及写操作，必须说明事务、回滚、幂等或错误处理策略。
