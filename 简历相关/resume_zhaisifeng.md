# 翟思丰
- 前端工程师 ｜ Web 全栈方向
- GitHub：https://github.com/zsf1482451437
- 邮箱：1482451437@qq.com
- 电话：18820662170

## 专业技能
- 前端与 React：熟悉 HTML5、CSS3、JavaScript/TypeScript、React Hooks、Redux 与 React Router，具备复杂页面、响应式布局、业务组件抽象和商城核心链路交付经验。
- 渲染与性能：具备 Next.js SSG/ISR、React + Node.js 自研 SSR 实践，熟悉服务端数据预取、数据注水、Hydration、SEO 和按路由资源注入；能够使用 Lighthouse、Performance、Network 与 Bundle Analyzer 定位并治理 LCP、首屏 JavaScript 和第三方脚本。
- 工程质量：熟悉 Webpack/Vite、pnpm、ESLint、Prettier、Husky、Docker 与 GitHub Actions，具备构建缓存、发布脚本、CI/CD 和上线检查实践；使用 Jest、Vitest、Testing Library、Go Test 与 Playwright 建立分层验证。
- 商城业务：熟悉商品/SKU、库存、购物车、结算、订单、售后、活动配置、RBAC 与操作审计，能够完成商城前台、运营后台及接口联动交付；具备 Shopify Liquid、GraphQL、Prisma 和应用上架经验。
- Node.js BFF：具备 Express BFF 开发经验，能够完成多服务聚合、字段裁剪、会话透传、参数校验、统一错误、缓存、超时、有限重试和分级降级。
- Go 与数据：具备 Go `net/http`、MySQL 和 Redis 实践，能够按 `handler -> service/domain -> repository` 分层实现业务服务，处理事务、幂等、库存并发、Session、Cache Aside 与资源归属校验。
- AI 应用：能够基于 LLM、Embedding 与 Qdrant 实现 RAG 和 AI Agent，处理 SSE 流式输出、检索引用、只读工具调用、会话持久化、操作白名单和高风险确认。

## 工作经历
### 深圳市睿联技术有限公司 | Web 全栈开发工程师 | 2024.07-至今
负责 Reolink 跨境商城及运营后台研发，以 React 前端为主，参与 Node.js BFF、SSR、接口编排、性能治理和工程交付：
- 交付商品详情、活动页和解决方案页 SSR 接入，使商品卖点、活动信息与 SEO Meta 可在首屏 HTML 中直接输出，支撑商城内容发布与搜索抓取；
- 交付商品/SKU、库存、订单售后等运营后台及批量任务流程，支持运营完成商品维护、订单检索、售后审核，并通过失败明细和审计上下文追踪异常操作；
- 基于 Express BFF 聚合商品、价格、库存、活动和用户数据，统一页面字段模型、会话透传与错误码，避免前端直接编排多套下游服务，降低商城页面与后端协议的耦合；
- 治理首屏图片、页面缓存与 BFF 超时降级，在统一 Lighthouse 移动端测试条件下将重点活动页 LCP 控制在 2.5s 内，并通过自动化测试与上线检查降低活动发布回归风险。

### 淘腾网络科技有限公司 | 前端工程师 | 2023.06-2024.06
负责 GogoalShop 跨境商城 0-1 建设、性能优化、数据埋点和 Shopify 定制化应用研发：
- 参与 Next.js 商城从 0 到 1 建设，负责路由模板、组件分层、多语言、SEO 与 SSG/ISR 渲染策略，支撑首页、商品页和活动页持续迭代；
- 通过代码分割、依赖治理、图片字体优化和第三方脚本延迟加载，将首页路由关键 JavaScript 构建体积从 3MB 降至 600KB，统一 Lighthouse 移动端测试下 LCP 从 4s 降至 2s 以内；
- 接入 GA4 商品浏览、加购、结账入口和营销活动埋点，同期首页跳出率由 30% 降至 20%，为运营分析用户路径与活动效果提供数据；
- 独立交付两款 Shopify 应用并完成 Docker 部署、脚本化发布和商店上架，替代第三方付费工具，年节省数万元订阅成本，发布操作从 5 步简化为 1 步。

## 项目经历
### Reolink 跨境商城与运营后台  2024.07-至今
**技术栈**：React、Node.js、TypeScript、Express、Redis、Webpack、TailwindCSS、Axios
负责 Reolink 官网商城与运营后台研发，以 React 业务交付为主，并承担 Node.js BFF、服务端渲染、接口聚合、权限审计、性能和稳定性治理：
- **商城内容与 SEO**：交付商品详情、活动页和解决方案页 SSR 接入，使商品卖点、活动信息与 Meta 可在首屏 HTML 中输出；完成路由匹配、服务端数据预取、React 服务端渲染、HTML 模板拼接和 `window.__INITIAL_DATA__` 注水，保持客户端 Hydration 数据一致；
- **BFF 接口编排**：基于 Express 聚合商品、价格、库存、活动和用户等下游数据，按页面裁剪 DTO；通过中间件统一 Schema 校验、会话透传、错误映射和 Trace ID，降低前端与下游协议的耦合；
- **运营后台交付**：完成商品/SKU 检索与批量维护、库存展示、订单详情和售后审核，封装筛选表单、状态展示和任务反馈等复用模块，支撑运营集中处理商品与订单售后业务；
- **权限与任务追踪**：前端按权限控制菜单和操作入口，BFF 校验会话与资源权限并透传审计上下文；批量任务展示进度、成功/失败数量和错误明细，支持运营定位失败任务，核心业务状态由下游领域服务维护；
- **性能与发布质量**：按 manifest 注入当前路由 JS/CSS，治理首屏图片优先级、CDN 和页面缓存，在统一 Lighthouse 移动端测试下将重点活动页 LCP 控制在 2.5s 内；为 BFF 下游调用增加超时、有限重试与分级降级，并使用 Jest、Testing Library、Playwright 和上线检查清单覆盖关键回归链路。

### GogoalShop 跨境商城  2023.06-2024.06
**技术栈**：Next.js、TypeScript、next-intl、Redux、Axios、webpack、CSS Module、TailwindCSS、GA4
作为核心开发参与跨境商城前端工程从 0 到 1 建设，主要负责多语言、性能优化、数据埋点、工程治理与业务工具建设：
- **商城页面交付**：基于 Next.js + TypeScript 搭建路由模板、组件分层、接口封装和样式体系，支撑首页、商品页与活动页持续迭代；按 SEO 与实时性选择 SSG/ISR 和 CSR，静态输出商品与活动主体内容，价格、库存、购物车和用户态通过客户端接口更新；
- **海外站点与 SEO**：采用 `[locale]` 路由、`next-intl` 和分语言 messages 字典，封装服务端文案加载、客户端切换、默认语言与缺失 Key 兜底；配置多语言 Meta、`hreflang` 和 `canonical`，支持不同语言页面独立发布与索引；
- **性能与体验**：通过 Bundle Analyzer、Network 和 Lighthouse 定位首屏瓶颈，使用代码分割、`next/dynamic`、依赖替换、Tree Shaking、`next/image` 和 `next/font`，将首页路由关键 JavaScript 构建体积从 3MB 降至 600KB，LCP 从 4s 降至 2s 以内；
- **营销分析与脚本治理**：对客服、评论、营销弹窗和广告追踪脚本按页或延迟加载；统一 GA4 商品浏览、加购、结账入口和营销活动事件参数，同期首页跳出率由 30% 降至 20%，为运营分析用户路径和活动效果提供数据；
- **交付效率**：完成 npm 到 pnpm 迁移，结合 pnpm store、`.next/cache` 和 Docker layer cache 将依赖安装时间从 10s 降至 5s 以内；开发 Chrome 翻译数据抓取插件与 Node 写入服务，减少多语言配置的重复操作和人工错误。

### Shopify 自研应用  2023.06-2024.06
**技术栈**：React、Vite、TypeScript、Fetch、Prisma、GraphQL、Docker
响应团队降本与定制化诉求，独立自研 Shopify 应用替代第三方付费工具，并沉淀团队可复用开发规范：
- **应用落地**：独立完成「自定义印号 TT-Options」「黑名单风险订单管理 TTBlacklist - Order Guard」两款 Shopify 应用开发、部署与商店上架，替代第三方付费工具；
- **业务建模与风险处置**：基于 Prisma 设计商品定制规则、黑名单、店铺配置和操作记录模型，对接 Shopify Admin API / GraphQL，实现商品配置读取、规则保存以及风险订单识别、标记与运营处置；
- **部署与提效**：引入 Docker 镜像化部署并编写 Shell 发布脚本，降低服务器环境差异导致的发布失败，发布操作从 5 步简化为 1 步。

### 喜动商城（个人全栈项目） 2026.05-至今 访问地址：http://47.251.26.205:8080
**前端**：React、TypeScript、React Router、TailwindCSS

**后端**：Go、net/http、REST API、SSE、Session / Cookie 认证

**数据与 AI**：MySQL、Redis、Qdrant、LLM / Embedding、RAG

**测试与工程化**：Vite、Vitest、Testing Library、Playwright、OpenSpec、Docker、GitHub Actions

面向零售电商场景，独立设计并实现覆盖商品发现、购物车、结算、订单、后台运营与 AI 智能体的全栈系统，重点验证交易一致性、权限边界、智能体安全和工程交付能力：
- **前端业务闭环**：基于 React + Vite 交付商品列表、详情、购物车、结算、订单查询和后台运营页面，封装类型化 API 客户端，串联用户购物与后台管理流程；
- **Go 服务与交易一致性**：基于 `net/http` 按 `handler -> service/domain -> repository` 拆分商品、库存、订单和用户模块；围绕商品、SKU、库存、购物车、订单项和订单时间线设计 MySQL 表，在结算事务中完成价格快照、条件库存扣减、订单落库和购物车清理，失败统一回滚，并以幂等 Key 约束重复提交；
- **认证、缓存与权限**：使用 Redis 承载 Session TTL 与商品读缓存，结合 HttpOnly Cookie 建立 `user/admin` 角色守卫；后端从会话派生 `userId`，按资源归属隔离购物车、地址、订单和智能体会话，并通过 Cache Aside、TTL 与主动失效维护商品缓存；
- **Agent 与 RAG 安全**：实现“需求识别 -> 商品候选 -> 地址选择 -> 结算确认 -> 订单结果”的导购流程，并构建带检索引用的后台只读 RAG Agent；通过工具白名单、服务端鉴权、资源归属校验、幂等 Key 和高风险二次确认约束工具调用；
- **流式交付与验证**：基于 SSE 输出 `thinking/tool_call/tool_result/citation/delta/done/error` 事件，持久化会话与消息并支持刷新恢复；使用 Vitest、Testing Library、Go Test 和 Playwright 覆盖登录、权限、结算事务、订单流转及智能体链路，通过 Docker Compose 与 GitHub Actions 完成镜像构建和低配服务器部署。

## 教育经历
**仲恺农业工程学院** 本科 计算机科学与技术 | 2019-2023 | CET-4
