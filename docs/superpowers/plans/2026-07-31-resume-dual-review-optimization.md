# 简历双视角产出强化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按前端 65%、后端 35% 的能力权重重构简历，使项目产出同时经得住资深前端和后端面试官追问。

**Architecture:** 仅修改 `简历相关/resume_zhaisifeng.md`。技能区负责建立清晰定位，工作经历负责快速呈现代表结果，项目经历通过“问题、动作、结果、边界”补充技术深度。

**Tech Stack:** Markdown、ripgrep、Git

---

### Task 1: 重构专业技能

**Files:**
- Modify: `简历相关/resume_zhaisifeng.md:7-16`

- [ ] **Step 1: 压缩技能分类**

将技能压缩为 React/TypeScript、SSR/性能、工程质量、商城业务、Node.js BFF、Go/数据、AI 应用七类。

- [ ] **Step 2: 调整熟练度措辞**

公司项目能力使用“熟悉、具备”，个人项目能力使用“具备实践、能够实现”，不使用“精通”。

### Task 2: 重构工作经历

**Files:**
- Modify: `简历相关/resume_zhaisifeng.md:18-30`

- [ ] **Step 1: 重写睿联经历**

保留 SSR/BFF、商城后台、性能稳定性和测试交付四类代表结果，明确以 React 前端为主。

- [ ] **Step 2: 重写淘腾经历**

保留 Next.js 0-1、多语言 SEO、性能指标和 Shopify 降本结果，删除项目经历中的重复实现细节。

### Task 3: 强化 Reolink 项目

**Files:**
- Modify: `简历相关/resume_zhaisifeng.md:32-41`

- [ ] **Step 1: 收敛五类产出**

按 SSR/SEO、BFF、商城后台、性能稳定性、测试交付组织。

- [ ] **Step 2: 明确职责边界**

写明核心商品、库存、订单和售后状态由下游领域服务维护，BFF 只负责页面级编排、校验和适配。

### Task 4: 强化 GogoalShop 与 Shopify 项目

**Files:**
- Modify: `简历相关/resume_zhaisifeng.md:43-60`

- [ ] **Step 1: 合并 GogoalShop 重复项**

将渲染、多语言、性能、数据分析、工程提效和效率工具收敛为五条。

- [ ] **Step 2: 保留可验证指标**

保留关键 JavaScript `3MB -> 600KB`、LCP `4s -> 2s`、同期 GA4 跳出率、依赖安装 `10s -> 5s`。

- [ ] **Step 3: 收紧 Shopify 表述**

只描述风险订单识别、标记与运营处置，保留年节省数万元和发布 `5 -> 1`。

### Task 5: 强化喜动商城证据链

**Files:**
- Modify: `简历相关/resume_zhaisifeng.md:62-77`

- [ ] **Step 1: 平衡前后端产出**

保留 React 商城和后台交付，并突出 Go 分层、事务一致性、Session/RBAC、RAG 与 Agent 安全。

- [ ] **Step 2: 限制个人项目口径**

不新增生产并发、真实用户、交易规模或商业收益。

### Task 6: 双视角验收

**Files:**
- Verify: `简历相关/resume_zhaisifeng.md`

- [ ] **Step 1: 检查风险表述**

Run: `rg -n '精通|成功率 100%|大幅提升|高并发|百万|千万' '简历相关/resume_zhaisifeng.md'`

Expected: 无输出。

- [ ] **Step 2: 检查 Reolink 后端越界**

Run: `awk '/### Reolink 跨境商城与运营后台/{flag=1} /### GogoalShop 跨境商城/{flag=0} flag' '简历相关/resume_zhaisifeng.md' | rg -n 'MySQL|订单落库|库存扣减|事务边界|repository'`

Expected: 无输出。

- [ ] **Step 3: 检查指标口径**

Run: `rg -n '3MB|600KB|4s|2s|30%|20%|10s|5s|数万元' '简历相关/resume_zhaisifeng.md'`

Expected: 指标均附带构建体积、Lighthouse、同期 GA4、依赖安装或订阅成本语境。

- [ ] **Step 4: 检查格式**

Run: `git diff --check -- '简历相关/resume_zhaisifeng.md'`

Expected: 退出码为 0，无输出。

- [ ] **Step 5: 保留用户未提交状态**

不提交 `简历相关/resume_zhaisifeng.md`，由用户确认最终版本后决定是否提交。
