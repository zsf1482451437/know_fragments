# AI Agent 电商系统

React + TypeScript + Go 的电商系统样板项目，用于围绕前端 JD 展示 React 工程能力、浏览器与网络理解、Go 后端能力、电商业务建模，以及 OpenSpec + TDD + AI Agent 的研发流程。

## 项目定位

这个项目不是单页 demo，而是一个可本地运行、可测试、具备真实持久化的电商系统样板。

核心目标：

- 用 React 生态实现商品发现、购物车、结算和订单管理。
- 用 Go 标准库实现 REST API、服务分层、中间件和优雅退出。
- 用 SQLite 落地商品、SKU、订单、订单项、订单时间线和库存持久化。
- 用 OpenSpec 管理提案、设计、规格和任务清单。
- 用测试覆盖价格计算、库存校验、订单状态流转和 SQLite 事务行为。

## 技术栈

前端：

- React 19
- TypeScript
- Vite
- React Router
- Vitest
- Testing Library
- ESLint

后端：

- Go 1.22+
- `net/http`
- `database/sql`
- SQLite 驱动：`modernc.org/sqlite`
- SQLite
- Go 测试

研发流程：

- OpenSpec
- TDD
- AI Agent 辅助研发

## 架构

```text
前端 React/Vite
  -> 按业务特性拆分模块
  -> 类型化 API 客户端
  -> REST + 统一 JSON 响应
  -> 后端接口代理

后端 Go net/http
  -> HTTP 处理层
  -> 服务层/领域层
  -> repository.Store 接口
  -> SQLiteStore 持久化实现
  -> SQLite 数据库文件
```

后端分层原则：

- `handler`：只处理 HTTP 请求、参数解析和响应映射。
- `service`：承载商品、结算、订单状态流转等业务流程。
- `domain`：承载领域模型、价格计算、状态机和校验规则。
- `repository`：隔离持久化实现，默认使用 SQLiteStore，保留 MemoryStore 用于轻量测试和对比。

## 目录结构

```text
ecommerce-system/
├── backend/
│   ├── cmd/api/main.go
│   ├── internal/domain/
│   ├── internal/handler/
│   ├── internal/middleware/
│   ├── internal/repository/
│   ├── internal/seed/
│   └── internal/service/
├── frontend/
│   ├── src/features/
│   ├── src/services/
│   ├── src/shared/
│   └── src/types/
└── docs/
    ├── agentic-workflow.md
    └── go-knowledge-map.md
```

## 本地启动

### 推荐方式：一键启动前后端

在项目根目录执行：

```bash
./scripts/dev.sh
```

脚本会自动完成：

- 启动 Go 后端：`http://localhost:8080`
- 等待后端 API 就绪
- 启动 Vite 前端：`http://localhost:5174`
- 如果前端依赖未安装，自动执行 `npm install`
- 按 `Ctrl+C` 时同时停止前后端进程

如需指定 SQLite 数据库路径：

```bash
ECOMMERCE_DB_PATH=./backend/data/ecommerce.db ./scripts/dev.sh
```

### 手动方式：分别启动

启动后端：

```bash
cd backend
go mod tidy
go test ./...
go run ./cmd/api
```

默认 API 地址：

```text
http://localhost:8080
```

启动前端：

```bash
cd frontend
npm install
npm run dev
```

默认前端地址：

```text
http://localhost:5174
```

前端开发服务器会把 `/api` 代理到：

```text
http://localhost:8080
```

## SQLite 持久化

后端默认使用 SQLite。数据库路径通过 `ECOMMERCE_DB_PATH` 控制：

```bash
cd backend
ECOMMERCE_DB_PATH=./data/ecommerce.db go run ./cmd/api
```

默认路径：

```text
backend/data/ecommerce.db
```

首次启动时会自动：

- 初始化 `internal/repository/schema.sql`
- 创建商品、SKU、订单、订单项、订单时间线相关表
- 创建查询索引
- 在商品表为空时写入 seed 商品数据

重置本地数据：

```bash
cd backend
rm -f ./data/ecommerce.db
go run ./cmd/api
```

## 核心功能

- 商品发现：关键词搜索、分类筛选、价格筛选、库存筛选、评分筛选、排序、分页。
- 商品详情：SKU 展示、库存展示、加入购物车入口。
- 购物车：本地购物车状态、数量更新、选中项、金额汇总。
- 结算：收货信息校验、库存校验、价格快照、订单创建。
- 订单管理：订单列表、订单详情、状态时间线、支付/发货/完成/取消等状态流转。
- 持久化：订单和库存变化写入 SQLite，服务重启后仍可查询。

## 接口概览

| 请求方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/api/products` | 商品列表，支持搜索、筛选、排序、分页 |
| `GET` | `/api/products/{id}` | 商品详情 |
| `POST` | `/api/cart/validate` | 购物车校验和金额计算 |
| `POST` | `/api/checkout` | 创建订单并扣减库存 |
| `GET` | `/api/orders` | 订单列表，可按状态过滤 |
| `GET` | `/api/orders/{id}` | 订单详情 |
| `POST` | `/api/orders/{id}/{action}` | 订单状态流转 |

响应统一使用 JSON 包装结构，包含 `code`、`message`、`data` 和 `requestId`。

## 验证命令

前端完整验证：

```bash
cd frontend
npm run verify
```

包含：

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`

后端验证：

```bash
cd backend
go test ./...
```

后端冒烟验证：

```bash
curl http://localhost:8080/api/products

curl -X POST http://localhost:8080/api/checkout \
  -H 'Content-Type: application/json' \
  -d '{"items":[{"productId":"p-camera-001","skuId":"sku-camera-white","quantity":1,"selected":true}],"shipping":{"receiver":"zf","phone":"13800000000","address":"shenzhen"}}'
```

## 已验证状态

当前项目已完成：

- 前端 `npm run verify` 通过。
- 后端 `go test ./...` 通过。
- 后端冒烟验证通过：商品列表、下单、订单详情、服务重启后订单仍可查询。
- OpenSpec `adopt-sqlite-persistence` 变更已完成 `30/30`。

## JD 能力映射

- React/TypeScript：特性模块拆分、类型化 API、路由级懒加载、组件状态分层。
- HTML/CSS/浏览器：列表渲染稳定 key、图片懒加载、加载/空/错误/重试状态。
- 网络协议与 API：REST 路由、HTTP 状态码、统一响应结构、requestId、超时中间件。
- Vite 工程化：开发、测试、类型检查、lint、生产构建一体化脚本。
- Go：标准库 HTTP 服务、分层架构、interface 抽象、context、优雅退出、单元测试。
- SQLite：`database/sql`、schema、索引、事务、`sql.ErrNoRows` 错误映射。
- 电商业务：商品发现、SKU 库存、购物车校验、订单价格快照、状态流转。
- AI Agent：OpenSpec 驱动需求拆解，TDD 覆盖高风险业务规则。

## 面试表达

可以这样介绍：

> 我围绕目标 JD 做了一个 React + Go 的电商系统。前端用 React、TypeScript 和 Vite 实现商品发现、购物车、结算、订单管理，重点处理了类型化 API、路由懒加载、异步状态和测试验证。后端用 Go 标准库实现 REST API，并通过 handler、service、domain、repository 分层隔离业务和存储。持久化没有停留在内存 demo，而是接入 SQLite，支持 schema 初始化、seed、索引和事务下单。下单时订单、订单项、时间线和库存扣减在一个事务里完成，服务重启后订单和库存变化仍然可查。

## 相关文档

- `docs/agentic-workflow.md`：OpenSpec、TDD 和 AI Agent 工作流说明。
- `docs/go-knowledge-map.md`：本项目涉及的 Go 知识点地图。
- `docs/user-interaction-db-flow.md`：用户交互到数据库操作的完整链路图。
- `openspec/changes/build-react-go-ecommerce-system`：项目初始建设变更。
- `openspec/changes/adopt-sqlite-persistence`：SQLite 持久化变更。
