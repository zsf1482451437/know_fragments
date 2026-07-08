## Context

当前 `ecommerce-system/backend` 已经具备 Go 分层结构：`handler -> service/domain -> repository`，并通过 `repository.Store` interface 隔离存储实现。现有默认仓储是 `MemoryStore`，可以支撑快速 demo 和单元测试，但不具备真实持久化能力，订单和库存状态在服务重启后会丢失。

原始设计中将“SQLite 或本地持久化，预留 PostgreSQL”作为开放问题。本变更将该方向收敛为明确决策：第一阶段采用 SQLite 作为默认持久化方案，并保留 PostgreSQL 迁移路径。

## Goals / Non-Goals

**Goals:**

- 使用 SQLite 作为后端默认持久化方案，替代运行期内存存储。
- 保持现有 REST API 契约不变，前端无需改接口字段。
- 通过 `repository.Store` interface 保持 handler/service 与具体数据库解耦。
- 支持商品、SKU、订单、订单项、订单时间线和库存数据持久化。
- 下单流程使用事务，保证订单创建、订单项写入、时间线写入和库存扣减的一致性。
- 提供 schema 初始化、seed 数据初始化和本地数据库文件配置。
- 增加 SQLiteStore 测试，覆盖持久化查询、事务下单和状态流转。

**Non-Goals:**

- 不在本阶段接入 PostgreSQL，只保留迁移友好的 schema 和 repository 边界。
- 不实现复杂迁移工具链，例如 goose、atlas 或 flyway。
- 不实现多用户鉴权、支付、物流或商家后台。
- 不引入 Redis 作为订单或库存主存储。

## Decisions

### Decision 1: 默认持久化采用 SQLite

SQLite 能在本地零服务依赖运行，同时支持 SQL、事务、索引和真实磁盘持久化，适合当前面试展示型项目。相比 JSON 文件，SQLite 避免手写文件锁、并发写入和部分写失败恢复逻辑；相比 PostgreSQL，SQLite 的本地启动和演示成本更低。

备选方案：

- JSON 文件：实现简单，但事务、查询、并发写和恢复能力弱。
- PostgreSQL：生产化更强，但第一阶段环境成本较高。
- Redis：适合缓存和会话，不适合作为订单主存储。

### Decision 2: 保留 `repository.Store` interface

handler 和 service 继续只依赖 `repository.Store`，新增 `SQLiteStore` 实现接口。`MemoryStore` 保留用于快速单测和对比，不再作为默认运行仓储。

这样可以让持久化替换只发生在 repository 和启动装配层，避免业务逻辑依赖 SQLite 细节。

### Decision 3: 使用 `database/sql` 抽象数据库访问

SQLiteStore 使用 Go 标准库 `database/sql` 作为访问入口，SQLite driver 作为底层驱动。业务代码通过 context 传递请求生命周期，数据库查询和事务方法使用 `QueryContext`、`QueryRowContext`、`ExecContext` 和 `BeginTx`。

该选择能体现 Go 标准库能力，并让未来迁移 PostgreSQL 时保留相似访问模型。

### Decision 4: 下单使用事务边界

下单事务包含以下步骤：

```text
BEGIN
  读取并校验 SKU 库存
  创建 orders
  创建 order_items
  创建 order_timelines
  扣减 product_skus.stock
COMMIT
```

任一步失败必须 rollback，避免出现订单创建成功但库存未扣减、或库存扣减但订单缺失的问题。

### Decision 5: Schema 迁移保持轻量

第一阶段使用 `schema.sql` 做初始化，启动时执行 `CREATE TABLE IF NOT EXISTS` 和必要索引。后续如果项目继续演进，再引入正式 migration 工具。

这能降低当前实现复杂度，同时让本地演示和测试可重复执行。

## Risks / Trade-offs

- [Risk] SQLite driver 增加 CGO 或平台依赖 → Mitigation：优先评估纯 Go SQLite driver；若使用 CGO driver，在 README 中明确本地依赖。
- [Risk] 事务实现与现有 service 边界冲突 → Mitigation：将事务封装在 SQLiteStore 或专门的 checkout repository 方法中，service 只表达业务流程。
- [Risk] Schema 设计过早复杂化 → Mitigation：只覆盖商品、SKU、订单、订单项、时间线和库存字段，不提前设计支付、物流、营销表。
- [Risk] SQLite 与 PostgreSQL SQL 方言差异 → Mitigation：避免使用 SQLite 特有高级能力，字段类型和索引设计保持 PostgreSQL 迁移友好。
- [Risk] 测试依赖真实文件导致污染 → Mitigation：测试使用临时目录数据库文件，每个测试独立初始化 schema 和 seed。

## Migration Plan

1. 新增 `backend/internal/repository/sqlite.go`，实现 `repository.Store`。
2. 新增 `backend/internal/repository/schema.sql`，定义表和索引。
3. 新增 SQLite seed 初始化逻辑，将现有 `seed.Products()` 写入数据库。
4. 修改 `cmd/api/main.go`，默认装配 SQLiteStore，数据库路径从环境变量读取，默认使用 `./data/ecommerce.db`。
5. 保留 MemoryStore 和原有单测，新增 SQLiteStore 集成测试。
6. 更新 README 和 `docs/go-knowledge-map.md`，补充 SQLite、`database/sql`、事务和索引说明。
7. 验证后端测试、前端 verify，以及手动链路：商品查询、下单、重启服务、订单仍可查询。

## Open Questions

- SQLite driver 选择纯 Go 实现还是 CGO 实现？
- 是否在第一阶段实现库存扣减后的商品总库存同步，还是只以 SKU 库存为准？
- 是否需要提供重置本地数据库脚本，例如 `make db-reset`？
