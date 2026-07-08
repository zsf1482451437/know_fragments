# Go 知识点地图

本文档用于沉淀本电商系统后端会用到的 Go 知识点，方便后续实现、复盘和面试表达。当前后端代码位于 `ecommerce-system/backend`。

## 1. 项目结构与 Go 模块

项目使用标准 Go 模块：

```text
backend/
├── go.mod
├── cmd/api/main.go
└── internal/
    ├── domain/
    ├── handler/
    ├── middleware/
    ├── repository/
    ├── seed/
    └── service/
```

涉及知识点：

- `go.mod`：定义模块名和 Go 版本。
- `cmd/api`：应用启动入口，适合放不同可执行程序。
- `internal`：Go 官方约定的内部包机制，外部模块不能直接 import。
- 分层架构：`handler -> service/domain -> repository`。

面试表达：

> 我在 Go 后端里采用了标准 Go 模块 + internal 包组织方式，把 HTTP 层、业务服务层、领域模型和仓储层拆开，避免业务规则散落在 handler 中。

## 2. 结构体与 JSON 标签

领域模型使用结构体表达商品、SKU、购物车、订单和价格快照：

```go
type Product struct {
    ID    string `json:"id"`
    Title string `json:"title"`
    SKUs  []SKU  `json:"skus"`
}
```

涉及知识点：

- `struct`：Go 中最常用的数据建模方式。
- 字段首字母大写表示可导出，才能被 `encoding/json` 正常序列化。
- 反引号标签：通过 `json:"fieldName"` 控制 API 字段名。
- 嵌套结构体和切片：例如 `Product.SKUs []SKU`、`Order.Items []OrderItem`。

本项目中的典型模型：

- `Product` / `SKU`：商品与规格。
- `CartItem` / `CartLine`：前端购物车输入与后端校验后的购物车行。
- `PriceSummary`：金额汇总。
- `Order` / `OrderItem` / `TimelineEvent`：订单、订单项和状态时间线。

## 3. 自定义类型与常量枚举

订单状态使用自定义字符串类型：

```go
type OrderStatus string

const (
    StatusPendingPayment OrderStatus = "pending_payment"
    StatusPaid           OrderStatus = "paid"
    StatusShipped        OrderStatus = "shipped"
)
```

涉及知识点：

- `type OrderStatus string`：提升类型语义，避免到处传裸字符串。
- `const` 常量组：集中维护合法状态。
- 状态流转函数：用 `map[OrderStatus]map[string]OrderStatus` 表达状态机。

业务价值：

- 限制订单状态流转入口。
- 非法状态转换返回错误。
- 便于写单元测试覆盖订单核心规则。

## 4. 函数、错误与业务规则

核心业务规则放在 `domain` 和 `service` 层：

- `CalculateSummary`：计算小计、折扣、运费、应付金额。
- `ValidateShipping`：校验收货信息。
- `NextStatus`：订单状态流转。
- `ValidateCart`：校验商品、SKU、数量和库存。
- `Checkout`：创建订单并保存价格快照。

涉及知识点：

- 多返回值：`(OrderStatus, error)`。
- 显式错误处理：`if err != nil { return ... }`。
- `errors.New`：创建固定错误。
- `fmt.Errorf`：携带上下文信息。
- 业务函数保持纯粹：例如金额计算不依赖 HTTP。

面试表达：

> 我把价格计算、库存校验、订单状态流转这些容易回归的规则沉到 domain/service 层，并通过单测约束，不把这些规则写在 handler 或前端页面里。

## 5. 泛型

分页结果使用 Go 泛型：

```go
type PageResult[T any] struct {
    Items []T      `json:"items"`
    Page  PageMeta `json:"page"`
}

func paginate[T any](items []T, page int, pageSize int) domain.PageResult[T] {
    // ...
}
```

涉及知识点：

- `T any`：泛型类型参数。
- 用一个分页结构复用商品列表和订单列表。
- 避免为 `ProductPageResult`、`OrderPageResult` 重复定义结构体。

项目价值：

- API 返回结构统一。
- 类型安全，不需要 `interface{}` 和类型断言。

## 6. 接口抽象与依赖倒置

仓储层定义接口：

```go
type Store interface {
    ListProducts(query domain.ProductQuery) domain.PageResult[domain.Product]
    GetProduct(id string) (domain.Product, error)
    SaveOrder(order domain.Order) error
    ListOrders(status string) domain.PageResult[domain.Order]
    GetOrder(id string) (domain.Order, error)
    UpdateOrder(order domain.Order) error
}
```

涉及知识点：

- Go 接口是隐式实现，不需要 `implements`。
- service 依赖接口，不依赖具体存储实现。
- 当前默认使用 `SQLiteStore`，`MemoryStore` 保留用于快速单元测试和实现对比；未来可以继续替换为 PostgreSQL。

面试表达：

> 我用 repository interface 隔离持久化细节，当前默认使用 SQLiteStore，handler 和 service 只依赖 Store 接口。后续如果迁移 PostgreSQL，主要替换 repository 实现，不需要大改 HTTP 层和业务流程。

## 7. 并发安全与 sync.RWMutex

内存仓储使用读写锁：

```go
type MemoryStore struct {
    mu       sync.RWMutex
    products []domain.Product
    orders   map[string]domain.Order
}
```

涉及知识点：

- `sync.RWMutex`：读多写少场景下比互斥锁更细。
- `RLock/RUnlock`：读操作加读锁。
- `Lock/Unlock`：写操作加写锁。
- `defer`：确保函数返回前释放锁。
- `map` 并发读写不安全，必须保护。

本项目使用场景：

- 商品列表、商品详情、订单列表、订单详情是读操作。
- 创建订单、更新订单状态是写操作。

## 8. HTTP 服务与路由

后端使用 Go 标准库 `net/http`：

```go
mux := http.NewServeMux()
mux.HandleFunc("GET /api/products", api.listProducts)
mux.HandleFunc("GET /api/products/{id}", api.getProduct)
```

涉及知识点：

- `http.NewServeMux`：标准库路由器。
- Go 1.22+ 支持带 Method 和路径变量的路由模式。
- `request.PathValue("id")`：读取路径参数。
- `http.Handler` / `http.HandlerFunc`：Go HTTP 中间件基础接口。
- `http.Server`：配置地址、超时和服务生命周期。

API 覆盖：

- `GET /api/products`
- `GET /api/products/{id}`
- `POST /api/cart/validate`
- `POST /api/checkout`
- `GET /api/orders`
- `GET /api/orders/{id}`
- `POST /api/orders/{id}/{action}`

## 9. JSON 编解码与统一响应

请求解析：

```go
var payload domain.CheckoutRequest
err := json.NewDecoder(request.Body).Decode(&payload)
```

响应输出：

```go
json.NewEncoder(writer).Encode(envelope[T]{
    Code: "OK",
    Message: "success",
    Data: data,
    RequestID: requestID,
})
```

涉及知识点：

- `encoding/json`：标准库 JSON 编解码。
- `json.Decoder`：从请求 body 解码。
- `json.Encoder`：向响应写 JSON。
- 泛型响应包装结构：统一 `code/message/data/requestId`。
- HTTP 状态码和业务错误码分离。

本项目错误响应：

- `BAD_REQUEST`：JSON 请求体错误。
- `NOT_FOUND`：资源不存在。
- `VALIDATION_ERROR`：库存、状态流转、收货信息等业务校验失败。
- `TIMEOUT`：请求超时。

## 10. 上下文与请求级信息

中间件使用 `context.WithValue` 注入 requestId：

```go
ctx := context.WithValue(request.Context(), RequestIDKey{}, requestID)
next.ServeHTTP(writer, request.WithContext(ctx))
```

涉及知识点：

- `context.Context`：Go 标准库里的请求级上下文。
- `context.WithValue`：传递 requestId 等请求级元信息。
- 自定义 key 类型：避免和其他包的 context key 冲突。
- `request.WithContext(ctx)`：生成携带新 context 的请求。

项目价值：

- 响应体和响应头都能携带 requestId。
- 后续可扩展链路日志、鉴权信息、超时取消等能力。

## 11. 中间件模式

本项目中间件包括：

- `RequestID`：生成或透传请求 ID。
- `Logger`：记录请求方法、路径和耗时。
- `Timeout`：设置请求超时。
- `CORS`：允许前端开发服务器跨域访问。
- `Chain`：按顺序组合中间件。

核心模式：

```go
func Logger(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        started := time.Now()
        next.ServeHTTP(w, r)
        log.Printf("%s %s %s", r.Method, r.URL.Path, time.Since(started))
    })
}
```

涉及知识点：

- 函数作为参数。
- 函数返回函数。
- 装饰器模式。
- `http.Handler` 接口组合。

面试表达：

> Go 的 HTTP 中间件本质是接收一个 `http.Handler` 并返回新的 `http.Handler`，我用这个模式实现 requestId、日志、超时和 CORS，保持 handler 只关注业务请求处理。

## 12. 排序、过滤与分页

商品列表使用标准库处理查询能力：

- `strings.Contains`：关键词搜索。
- `strings.ToLower`：大小写不敏感。
- `sort.Slice`：按价格、销量、评分排序。
- 手动分页：根据 `page/pageSize` 计算 `start/end`。
- 指针布尔值：`*bool` 区分未传 `inStock` 和显式传 `false`。

关键点：

```go
var inStock *bool
if raw := query.Get("inStock"); raw != "" {
    parsed := raw == "true"
    inStock = &parsed
}
```

业务价值：

- 支持搜索、分类、库存、评分、价格排序。
- API 行为可通过单测稳定覆盖。

## 13. 时间处理与优雅退出

项目使用 `time` 处理：

- 订单创建时间：`time.Now()`。
- 订单号生成：`now.Format("20060102150405")`。
- 请求日志耗时：`time.Since(started)`。
- 服务超时：`5 * time.Second`。
- 优雅退出超时：`context.WithTimeout`。

服务退出：

```go
stop := make(chan os.Signal, 1)
signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
<-stop

ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()
server.Shutdown(ctx)
```

涉及知识点：

- channel 接收系统信号。
- `os/signal` 和 `syscall`。
- `http.Server.Shutdown`。
- `context.WithTimeout` 控制退出时间。

## 14. 单元测试

当前测试文件：

```text
backend/internal/service/service_test.go
```

覆盖点：

- 商品筛选与排序。
- 库存不足校验。
- 金额计算。
- 下单生成待支付订单和价格快照。
- 非法订单状态流转拒绝。

涉及知识点：

- `testing` 标准库。
- `t.Fatalf`：失败并终止当前测试。
- 准备数据、执行行为、断言结果的测试结构。
- 业务规则优先测试，而不是只测 handler。

面试表达：

> 我优先给金额、库存、订单状态这些核心业务规则补单测，因为这些逻辑一旦回归，UI 层很难第一时间发现。

## 15. SQLite 与数据库标准库

当前项目默认采用 SQLite 作为运行时持久化方案，代码集中在：

```text
backend/internal/repository/schema.sql
backend/internal/repository/sqlite.go
```

涉及知识点：

- `database/sql`：Go 标准库数据库访问抽象。
- SQLite 驱动：通过空白导入注册驱动。
- `sql.Open`：创建数据库连接池句柄。
- `ExecContext`：执行 schema、insert、update。
- `QueryContext`：查询多行。
- `QueryRowContext`：查询单行。
- `sql.ErrNoRows`：映射为 repository 层 `ErrNotFound`。
- `BeginTx / Commit / Rollback`：控制事务。
- `go:embed`：把 `schema.sql` 嵌入 Go 二进制。

典型代码：

```go
tx, err := db.BeginTx(ctx, nil)
if err != nil {
    return err
}
defer tx.Rollback()

// 写入订单、写入订单项、扣减库存

return tx.Commit()
```

业务价值：

- 商品、SKU、订单、订单项、时间线真实落盘。
- 下单流程具备事务一致性。
- 服务重启后订单和库存变化仍可查询。
- 通过 `repository.Store` 保持后续迁移 PostgreSQL 的路径。

面试表达：

> 我没有直接把 SQL 写进 handler，而是在 repository 层新增 SQLiteStore。service 仍然依赖 Store interface，所以存储从 MemoryStore 切到 SQLiteStore 后，业务层和 HTTP 层基本不需要改。下单时我用事务包住库存校验、订单创建、订单项写入、时间线写入和库存扣减，避免部分成功导致数据不一致。

## 16. 索引与查询设计

当前 schema 中包含：

- `idx_products_category`：分类筛选。
- `idx_products_title`：商品标题搜索的基础索引。
- `idx_product_skus_product_id`：商品详情加载 SKU。
- `idx_orders_status`：订单状态筛选。
- `idx_orders_created_at`：订单列表按创建时间排序。
- `idx_order_items_order_id`：订单详情加载订单项。
- `idx_order_timelines_order_id`：订单详情加载时间线。

涉及知识点：

- 索引服务于查询路径，而不是越多越好。
- 电商核心查询通常围绕商品发现、订单列表、订单详情。
- SQLite 本地演示足够，后续迁移 PostgreSQL 时这些索引设计也有参考价值。

## 17. 当前项目还可以继续补强的 Go 能力

后续可以逐步加入：

- 表驱动测试：把多种价格、库存、状态流转用 case 表统一覆盖。
- `httptest`：对 HTTP 处理函数做接口级测试。
- PostgreSQL：在保留 repository interface 的前提下替换 SQLiteStore。
- 正式迁移工具：例如 goose、atlas 或 flyway。
- 配置管理：从环境变量读取端口、超时、数据库连接。
- 结构化日志：替换标准库 `log`。
- 鉴权中间件：模拟用户登录和用户级购物车。
- OpenAPI 文档：生成前后端共享 API 契约。

## 18. 面试复盘版本

可以这样概括这个项目里的 Go 使用：

> 这个电商系统后端我用 Go 标准库实现了一个分层 REST API 服务。HTTP 层基于 `net/http` 和 `ServeMux`，通过中间件处理 requestId、日志、CORS 和超时；业务层把价格计算、库存校验、订单创建和状态流转沉到 domain/service；仓储层通过 interface 隔离存储实现，默认使用 SQLiteStore，支持 schema 初始化、seed、索引和事务下单。下单时用事务保证订单、订单项、时间线和库存扣减一致，后续迁移 PostgreSQL 时主要替换 repository 实现即可。
