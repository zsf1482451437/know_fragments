# 翟思丰
- 前端工程师 ｜ 全栈开发工程师
- GitHub：https://github.com/zsf1482451437
- 邮箱：1482451437@qq.com
- 电话：18820662170

## 专业技能
- 前端基础：熟悉 HTML5、CSS3、JavaScript/TypeScript ES6+，具备复杂页面还原、多端响应式适配、异步编程与模块化开发经验。
- React 生态：熟悉 React、React Hooks、Redux、React Router 等技术栈，具备 Next.js SSR/SSG 与 Vite 单页应用实践经验，能够围绕商城类业务完成商品、购物车、结算、订单等核心链路开发。
- 工程化能力：熟悉 Webpack/Vite、pnpm、ESLint、Prettier、Husky、Docker 与 GitHub Actions，具备构建优化、规范治理、自动化脚本、CI/CD 和 TailwindCSS 样式体系落地经验。
- 测试保障：具备单元测试、集成测试与 E2E 测试实践经验，熟悉 Jest、Vitest、Testing Library、Go Test、Playwright 等测试方式，能够围绕登录、权限、交易和智能体链路建立分层验证。
- 商城业务：熟悉商品/SKU、库存、订单、售后、活动配置、RBAC 与操作审计等领域链路；具备 Shopify Liquid、GraphQL、Prisma、Docker 部署及应用上架经验。
- 服务端开发：具备 Node.js/Express 与 Go `net/http` 服务开发经验，熟悉 `router -> controller/handler -> service/domain -> repository` 分层、REST API、GraphQL、SSE、中间件、参数校验、统一错误、Session 认证、RBAC、幂等及超时控制。
- 数据与中间件：熟悉 MySQL 关系建模、索引与约束设计、事务和并发一致性；具备 Redis Cache Aside、TTL、主动失效、Session 存储实践，并使用 Qdrant、Prisma/SQLite 完成向量检索与业务数据持久化。
- AI 工程化：具备 LLM、Embedding、RAG 与 AI Agent 实践经验，能够基于 Qdrant 构建知识索引与检索引用，处理流式输出、只读工具调用、会话持久化、操作白名单和高风险确认；能够结合 OpenSpec + TDD 完成需求拆解、方案设计、代码实现、测试验证和文档沉淀。
- 计算机基础：熟悉 HTTP/HTTPS、浏览器缓存、跨域、前端安全等基础知识，了解常见设计模式。

## 工作经历
### 深圳市睿联技术有限公司 | 全栈开发工程师 | 2024.07-至今
负责 Reolink 跨境商城及运营后台 Web 全栈研发，覆盖 Node.js 自研 SSR、商品与订单领域、后台权限、数据建模、性能治理和工程交付：
- 参与 React + Node.js 自研 SSR 链路建设，完成路由与页面映射、服务端数据预取、Hydration 数据注水、SEO 元信息及构建资源注入，支撑商品详情、活动页、解决方案等业务迭代；
- 基于 Express 分层开发商品/SKU、库存、订单和售后接口，支撑商品上下架、批量维护、订单检索、状态流转和售后审核，并统一 Schema 校验、错误码和日志上下文；
- 参与 MySQL 领域建模和组合索引设计，以事务和幂等约束订单/售后状态变更；使用 Redis Cache Aside 治理商品热点缓存，并将批量操作与数据同步任务化，支持进度和失败明细追踪；
- 建设后台 RBAC、资源归属校验及操作审计，为下游请求补充超时、重试和降级；同时完成 LCP、首屏 JS、自动化测试和上线检查治理，并沉淀 10+ AI Skills 模板。

### 淘腾网络科技有限公司 | 前端工程师 | 2023.06-2024.06
负责 GogoalShop 跨境商城 0-1 建设、性能优化、数据埋点和 Shopify 定制化应用研发：
- 参与 Next.js 商城前端工程搭建，完成路由、页面模板、组件分层、接口封装、多语言与 SEO 配置，支撑首页、商品页、活动页等核心页面快速迭代；
- 负责渲染策略与性能优化，结合 SSG/ISR、客户端动态数据、代码分割、依赖治理和图片优化，将首页 LCP 从 4s 降至 2s 以内，首屏加载时间缩短 2 秒；
- 独立开发 Shopify 自定义商品和黑名单下单拦截应用，并完成 Docker 部署、脚本化发布和商店上架，替代 2 款第三方付费应用，年节省数万元订阅成本；同时接入 GA4 埋点和提交规范，提升运营分析与协作质量。

## 项目经历
### Reolink 跨境商城与运营后台  2024.07-至今
**技术栈**：React、Node.js、TypeScript、Express、MySQL、Redis、Webpack、TailwindCSS、Axios
负责 Reolink 官网商城与运营后台 Web 全栈研发，围绕服务端渲染、商品/SKU、订单售后、权限审计、性能和稳定性，支撑业务迭代与后台运营：
- **SSR 链路落地**：参与 Node.js 自研 SSR 渲染链路建设，负责路由匹配、页面组件映射、服务端数据预取、React 服务端渲染、HTML 模板拼接和 `window.__INITIAL_DATA__` 数据注水，保障首屏 HTML 可直接返回并与客户端 Hydration 对齐；
- **服务端分层与接口治理**：基于 Express 按 `router -> controller -> service -> repository` 拆分模块，通过中间件统一请求上下文、Schema 校验、会话鉴权、错误码和结构化日志，降低领域逻辑与 HTTP、数据访问层的耦合；
- **商品与 SKU 中台**：围绕商品、SKU、分类、库存和上下架状态设计领域模型及 MySQL 表结构，完成组合索引和唯一约束；开发商品检索、详情、批量编辑、上下架和库存维护接口，支持运营侧集中管理商品数据；
- **订单与售后链路**：梳理订单、订单项、支付状态、履约状态、售后单和操作记录之间的关系，以服务层约束合法状态流转；对售后审核和状态更新设置事务边界、幂等 Key 及资源归属校验，避免重复处理和中间状态；
- **权限与操作审计**：建设后台用户、角色、权限点和数据范围模型，前端按权限控制菜单及操作入口，后端对商品修改、订单处理和售后审核执行独立鉴权；记录操作者、目标资源、前后状态和请求上下文，支持问题追溯；
- **缓存与任务治理**：针对商品详情、分类和活动配置采用 Redis Cache Aside，通过 TTL、写后失效和数据库回源维护缓存一致性；将批量上下架、导入导出和数据同步任务化，记录任务进度、成功/失败数量及错误明细；
- **性能与稳定性**：按 manifest 注入当前路由 JS/CSS，结合首屏图优先级、CDN 和页面缓存将重点活动页 LCP 控制在 2.5s 内；为下游请求增加超时、有限重试和分级降级，并通过 Trace ID、健康检查及接口测试提升可观测性；
- **测试与交付**：使用 Jest、Testing Library 与 Playwright 覆盖商品维护、订单状态、权限边界及页面交互，沉淀上线检查清单和 AI Skills 模板，减少联调返工和线上遗漏。

### GogoalShop 跨境商城  2023.06-2024.06
**技术栈**：Next.js、TypeScript、next-intl、Redux、Axios、webpack、CSS Module、TailwindCSS、GA4
作为核心开发负责跨境商城前端工程从 0 到 1 建设，主导多语言能力、性能优化、数据埋点、工程治理与业务工具建设，支撑跨境电商业务稳定增长：
- **项目架构搭建**：参与基于 Next.js + TypeScript 的商城前端工程建设，完成路由结构、页面模板、组件分层、接口封装、环境配置和样式体系落地，支撑首页、商品页、活动页等核心页面迭代；
- **渲染策略设计**：根据页面实时性和 SEO 诉求选择渲染模式，首页、商品详情、活动落地页和内容页采用 SSG/ISR 预渲染与增量更新，提升首屏加载和搜索引擎抓取效率；价格、库存、购物车入口、用户态等强实时内容通过 CSR/API 动态请求，避免整页退化为每次请求 SSR；
- **i18n 多语言建设**：采用 Next.js `[locale]` 路由 + `next-intl` + messages 字典方案，按语言拆分 `en/de/fr` 等文案资源，封装服务端文案加载、客户端语言切换、默认语言兜底和缺失 key 处理逻辑；结合多语言 Meta、`hreflang`、`canonical` 配置，提升海外搜索引擎收录友好度；
- **性能优化**：针对首页资源体积大、加载链路长的问题，通过代码分割、依赖替换、Tree Shaking 等手段，将关键 JavaScript 资源从 3MB 压缩至 600KB；结合 next/image、next/font 优化图片与字体加载，首页 LCP 从 4s 降至 2s 以内，用户跳出率从 30% 降至 20%；
- **第三方脚本治理**：按业务必要性和页面路径梳理客服、评论、营销弹窗、广告追踪等第三方脚本，通过按页加载、延迟加载和首屏资源优先级控制，减少第三方脚本对 LCP 与主线程的影响；
- **数据埋点与转化分析**：接入 GA4，按页面浏览、商品点击、加购、结账入口、营销活动点击等事件设计埋点参数，并统一事件命名、商品 ID、来源页面和活动标识，支撑运营侧分析活动转化、用户路径和广告投放效果；
- **构建与流程提效**：通过 `@next/bundle-analyzer` 分析首页和核心路由包体积，通过 `next/dynamic` 拆分非首屏模块并治理 lodash、图标库等依赖引入；完成 npm 到 pnpm 迁移，结合 `.next/cache`、pnpm store 和 Docker layer cache 优化 CI 构建与部署链路，将项目构建时间从 10s 降至 5s 以内；
- **效率工具开发**：针对多语言配置链路繁琐、人工维护成本高的痛点，开发 Chrome 翻译数据抓取插件 + Node 自动写入服务，多语言配置效率提升，降低人工操作出错率。

### Shopify 自研应用  2023.06-2024.06
**技术栈**：React、Vite、TypeScript、Fetch、Prisma、GraphQL、Docker
响应团队降本与定制化诉求，独立自研 Shopify 应用替代第三方付费工具，并沉淀团队可复用开发规范：
- **应用落地**：独立完成「自定义印号 TT-Options」「黑名单下单拦截 TTBlacklist - Order Guard」两款 Shopify 应用开发、部署与商店上架，替代第三方付费工具；
- **业务建模与拦截**：基于 Prisma 设计商品定制规则、黑名单、店铺配置和操作记录模型，对接 Shopify Admin API / GraphQL，实现商品配置读取、规则保存、订单风险识别与拦截；
- **部署与提效**：引入 Docker 镜像化部署并编写 Shell 发布脚本，解决服务器环境不兼容问题，部署成功率提升至 100%，发布操作从 5 步简化为 1 步。

### 喜动商城（个人全栈项目） 2026.05-至今 访问地址：http://47.251.26.205:8080
**前端**：React、TypeScript、React Router、TailwindCSS

**后端**：Go、net/http、REST API、SSE、Session / Cookie 认证

**数据与 AI**：MySQL、Redis、Qdrant、LLM / Embedding、RAG

**测试与工程化**：Vite、Vitest、Testing Library、Playwright、OpenSpec、Docker、GitHub Actions

面向零售电商场景，独立设计并实现覆盖商品发现、购物车、结算、订单、后台运营与 AI 智能体的全栈系统，重点验证交易一致性、权限边界、智能体安全和工程交付能力：
- **全栈交易链路**：基于 React + Vite 实现商品列表、详情、购物车、结算、订单查询和后台运营页面，封装类型化 API 客户端；基于 Go `net/http` 按 `handler -> service/domain -> repository` 分层实现 REST API，拆分商品、库存、订单、用户和后台管理模块；
- **交易一致性与数据建模**：围绕商品、SKU、库存、账号、会话、购物车、订单、订单项和订单时间线设计 MySQL 表结构；在结算事务中完成价格快照、库存校验与扣减、订单落库、时间线写入和已选购物车清理，失败统一回滚，避免超卖和脏订单；
- **认证、缓存与权限隔离**：使用 Redis 承载服务端 Session TTL 和商品读缓存，结合 HttpOnly Cookie 建立 `user/admin` 角色守卫；后端从会话派生 `userId`，确保购物车、地址、订单和智能体会话按用户归属隔离，并对后台接口实施独立权限控制；
- **客户导购智能体**：设计并实现“需求识别 -> 商品候选 -> 地址选择 -> 结算确认 -> 订单结果”的结构化导购流程，支持对话持久化与刷新恢复、权限不足中文引导、购物车状态同步；通过操作白名单、分域授权、资源归属校验、幂等 Key 和高风险二次确认约束支付、取消、退款等动作；
- **RAG 流式智能体**：构建后台只读智能体，将 README、业务文档和 OpenSpec 规范切块、Embedding 后写入 Qdrant，支持检索引用和只读商品/订单工具调用；基于 SSE 输出 `thinking/tool_call/tool_result/citation/delta/done/error` 事件，并持久化会话与消息，刷新后可恢复上下文；
- **测试与交付闭环**：使用 Vitest、Testing Library、Go Test 和 Playwright 覆盖登录、权限、结算事务、订单流转、智能体导购与流式会话；以 OpenSpec + TDD 管理需求、设计、任务和验收，通过 Docker Compose 编排 Web、API、MySQL、Redis、Qdrant，并由 GitHub Actions 构建镜像、低配服务器仅拉取部署，降低本机构建 OOM 风险。

## 教育经历
**仲恺农业工程学院** 本科 计算机科学与技术 | 2019-2023 | CET-4
