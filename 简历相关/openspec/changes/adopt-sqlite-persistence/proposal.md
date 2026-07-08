## Why

当前电商系统后端使用内存仓储，适合快速演示，但重启后商品、库存和订单数据会丢失，无法体现真实电商系统对事务、索引和持久化可靠性的要求。采用 SQLite 可以在保持本地零服务依赖的前提下，引入 SQL、事务和真实数据持久化，同时为后续迁移 PostgreSQL 保留清晰路径。

该变更适合作为 Go 后端能力的第二阶段增强：既能补强面试中的数据库与事务表达，也能让项目从 demo 走向更接近生产的工程样板。

## What Changes

- 新增 SQLite 持久化实现，替代当前仅运行期有效的 `MemoryStore` 作为默认仓储。
- 保留 `repository.Store` interface，确保 handler 和 service 不依赖具体数据库实现。
- 新增数据库 schema，覆盖商品、SKU、订单、订单项、订单时间线和库存字段。
- 新增 seed 初始化流程，用于首次启动时写入商品和 SKU 初始数据。
- 下单流程使用事务包裹库存校验、订单创建、订单项写入、时间线写入和库存扣减。
- 增加 SQLite 相关测试，覆盖持久化查询、订单创建、库存扣减和非法状态流转。
- 更新启动文档和 Go 知识点文档，补充 `database/sql`、事务、索引和错误映射说明。
- 不改变前端 REST API 契约，前端无需因为存储方案变化而改动接口调用。

## Capabilities

### New Capabilities

- `sqlite-persistence`: SQLite 数据库 schema、初始化、仓储实现、事务下单、查询索引和持久化测试能力。

### Modified Capabilities

- 无。

## Impact

- 影响后端仓储层：新增 SQLiteStore，并将默认运行仓储从 MemoryStore 切换为 SQLiteStore。
- 影响后端启动配置：需要数据库文件路径、初始化 schema 和 seed 逻辑。
- 影响后端测试：新增 SQLite 仓储测试和事务测试；原有 MemoryStore 测试可保留作为轻量单元测试。
- 影响文档：README、Go 知识点地图和 Agent 工作流说明需要补充 SQLite first、PostgreSQL ready 的持久化策略。
- 不影响前端页面和 API 类型定义；响应 envelope、路由和字段保持兼容。
