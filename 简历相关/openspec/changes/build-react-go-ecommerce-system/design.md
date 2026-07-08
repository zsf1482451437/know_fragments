## Context

该项目目标是围绕目标 JD 构建一个可展示、可复盘、可继续扩展的电商系统。它既要覆盖真实电商链路，也要能在简历和面试中证明 React/TypeScript、浏览器与网络、工程化、AI Agent 开发、Go 后端和电商业务理解。

当前目录下已有简历、题库和 job-tracker-app 等求职资产，本变更先创建 OpenSpec 规格，不直接改动现有应用。后续实现建议作为独立项目目录承载，例如 `ecommerce-system/`，避免污染已有资料结构。

## Goals / Non-Goals

**Goals:**

- 构建一个前后端分离的电商系统，前端使用 React + TypeScript + Vite，后端使用 Go。
- 覆盖商品发现、购物车结算、订单管理三条核心业务链路。
- 通过清晰的 API 契约和领域模型体现全栈设计能力。
- 通过测试、Lint、构建、Mock 数据和接口错误处理体现工程化质量。
- 通过 OpenSpec + TDD + Agent review 体现 AI 辅助研发方法论。
- 输出能用于面试讲述的项目亮点，包括性能优化、网络协议理解、状态建模和工程治理。

**Non-Goals:**

- 不在第一阶段接入真实支付、物流、营销、推荐系统或复杂会员体系。
- 不在第一阶段实现微服务、分布式事务、搜索引擎集群或高并发压测平台。
- 不追求完整商家后台，第一阶段只保留必要的商品和订单数据能力。
- 不把该项目和现有 job-tracker-app 混合实现。

## Decisions

### Decision 1: 前端使用 React + TypeScript + Vite

选择 React + TypeScript + Vite 作为前端基础栈。React 与 JD 强匹配，TypeScript 能体现类型建模与接口契约能力，Vite 能体现现代构建工具、开发体验和产物优化理解。

备选方案是 Next.js 或 Vue。Next.js 更适合 SSR/全栈展示，但本项目重点是前后端分离和 Go 后端能力；Vue 与 JD 中 React 要求不如 React 直接匹配。

### Decision 2: 后端使用 Go 单体分层服务

后端采用 Go 单体服务，按 handler、service、repository、domain 分层。第一阶段保持部署和理解成本可控，同时保留未来拆分服务的边界。

备选方案是 Node.js BFF 或 Go 微服务。Node.js BFF 与前端协同强，但不能突出 Go 加分项；微服务会增加复杂度，容易稀释 JD 关注的前端与工程能力。

### Decision 3: API 使用 REST + JSON 契约

前后端通过 REST API 通信，接口返回统一 envelope：`code`、`message`、`data`、`requestId`。错误码、分页、筛选和排序参数保持可测试、可文档化。

备选方案是 GraphQL。GraphQL 对复杂聚合查询有优势，但本项目第一阶段业务边界清晰，REST 更利于展示 HTTP、缓存、状态码、错误处理和浏览器网络机制。

### Decision 4: 数据存储先用 SQLite 或本地持久化，预留 PostgreSQL

第一阶段可使用 SQLite 或本地文件持久化快速交付，数据模型按 PostgreSQL 迁移友好方式设计，包括商品、SKU、购物车、订单、订单项和库存字段。

备选方案是直接接入 PostgreSQL。它更接近生产，但会增加环境启动成本；作为面试展示项目，先保证可运行、可测试、可演示更重要。

### Decision 5: 前端状态按服务端状态和本地交互状态拆分

商品、订单等服务端状态通过请求层和缓存策略管理；购物车本地状态与服务端校验结果分离。UI 状态如弹窗、筛选条件和加载态保持组件内或轻量 store。

备选方案是全量放入全局 store。该方式容易让状态边界混乱，不利于解释数据流和性能优化。

### Decision 6: 研发流程采用 OpenSpec + TDD + Agent review

先通过 OpenSpec 固化需求、设计和任务，再对核心业务规则使用 TDD，例如价格计算、库存校验、订单状态流转和接口错误处理。实现完成后用 Agent review 检查回归风险、边界遗漏和工程质量。

备选方案是直接生成代码。直接生成代码速度快，但容易出现需求漂移、测试缺失和难以复盘的问题，不适合作为面试中的工程方法论展示。

## Risks / Trade-offs

- [Risk] 范围过大导致无法快速交付 → Mitigation：第一阶段只做商品发现、购物车结算、订单管理和基础工程化，不做支付、物流、营销。
- [Risk] Go 后端经验薄弱导致实现质量不稳定 → Mitigation：优先采用简单分层架构，核心逻辑用单测约束，避免过早引入复杂框架。
- [Risk] 前端项目变成普通 CRUD，无法突出 JD 匹配度 → Mitigation：在搜索筛选、缓存策略、错误处理、性能优化和工程化中刻意体现浏览器与网络基础。
- [Risk] AI Agent 生成代码偏离规格 → Mitigation：以 OpenSpec artifacts 作为上下文源，任务执行前明确验收标准，关键逻辑先写失败测试。
- [Risk] 本地演示环境复杂 → Mitigation：前端、后端、数据初始化提供一键启动脚本，第一阶段不依赖外部云服务。

## Migration Plan

1. 在当前目录下保留 OpenSpec 变更文档，不修改已有简历和题库内容。
2. 实现阶段新建独立项目目录，例如 `ecommerce-system/`。
3. 先搭建前后端骨架和 Mock 数据，保证本地可启动。
4. 分批实现商品、购物车、订单能力，每批完成后运行测试、Lint 和构建。
5. 如需回滚，删除独立项目目录并保留 OpenSpec 文档作为方案记录。

## Open Questions

- 第一阶段是否需要用户登录，还是使用匿名购物车和模拟用户？
- 数据持久化优先使用 SQLite，还是直接使用 PostgreSQL？
- UI 风格是否以“简历项目展示”为主，还是更接近真实电商 C 端页面？
- 是否需要额外补充部署方案，例如 Docker Compose 或 CI/CD？
