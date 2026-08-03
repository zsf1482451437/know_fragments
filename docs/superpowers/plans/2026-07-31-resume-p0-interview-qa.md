# 新版简历 P0 面试题与回答 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 基于当前简历生成一份包含 20 道必问题、推荐回答、追问要点和回答边界的新版面试题库。

**Architecture:** 以 `简历相关/resume_zhaisifeng.md` 为唯一事实源，按个人定位、Reolink、GogoalShop、Shopify、喜动商城五个模块组织内容。新建独立文档，不修改已有旧版题库和通用技术题文档。

**Tech Stack:** Markdown、ripgrep、Git

---

### Task 1: 建立题库结构与个人定位题

**Files:**
- Read: `简历相关/resume_zhaisifeng.md`
- Create: `简历相关/question/新版简历P0面试题与回答.md`

- [ ] **Step 1: 创建文档说明和目录**

写明使用原则、回答结构、职责边界，并建立五个章节。

- [ ] **Step 2: 编写第 1～3 题**

覆盖一分钟自我介绍、个人定位、个人职责与团队成果边界。

- [ ] **Step 3: 核对定位**

确认核心定位为“前端优势明显、具备 Node.js BFF 与商城后台交付能力的全栈工程师”。

### Task 2: 编写 Reolink P0 题

**Files:**
- Read: `简历相关/resume_zhaisifeng.md:18-43`
- Modify: `简历相关/question/新版简历P0面试题与回答.md`

- [ ] **Step 1: 编写第 4～10 题**

覆盖项目职责、自研 SSR、Hydration、BFF、后台交付、权限审计、缓存与降级。

- [ ] **Step 2: 核对服务边界**

确认 Reolink 只描述 BFF 编排、字段适配、会话和权限校验，不描述直接维护核心订单数据库或交易事务。

### Task 3: 编写 GogoalShop 与 Shopify P0 题

**Files:**
- Read: `简历相关/resume_zhaisifeng.md:26-64`
- Modify: `简历相关/question/新版简历P0面试题与回答.md`

- [ ] **Step 1: 编写第 11～14 题**

覆盖性能定位、LCP 优化、SSG/ISR/CSR 选择和多语言 SEO。

- [ ] **Step 2: 编写第 15～16 题**

覆盖 Shopify 自研原因、GraphQL/Prisma/Docker 完整交付链路。

- [ ] **Step 3: 核对指标**

只使用简历中的 `3MB -> 600KB`、`4s -> 2s`、`30% -> 20%`、年节省数万元等结果。

### Task 4: 编写喜动商城 P0 题

**Files:**
- Read: `简历相关/resume_zhaisifeng.md:65-79`
- Modify: `简历相关/question/新版简历P0面试题与回答.md`

- [ ] **Step 1: 编写第 17～20 题**

覆盖 Go 分层、结算事务与库存一致性、Session/RBAC、AI Agent/RAG 安全。

- [ ] **Step 2: 核对后端深度归属**

确保 MySQL 建模、事务、幂等和订单落库均明确来自个人项目。

### Task 5: 内容验收

**Files:**
- Verify: `简历相关/question/新版简历P0面试题与回答.md`

- [ ] **Step 1: 检查题目数量**

Run: `rg -c '^## Q[0-9]+：' '简历相关/question/新版简历P0面试题与回答.md'`

Expected: `20`

- [ ] **Step 2: 检查旧口径**

Run: `rg -n 'React Native|RN |移动端|设备接入|录像回放' '简历相关/question/新版简历P0面试题与回答.md'`

Expected: 无输出。

- [ ] **Step 3: 检查职责冲突**

Run: `rg -n 'Reolink.*(MySQL|事务|订单落库)|BFF.*(直接维护|核心数据库)' '简历相关/question/新版简历P0面试题与回答.md'`

Expected: 无输出。

- [ ] **Step 4: 检查 Markdown 格式**

Run: `git diff --check -- '简历相关/question/新版简历P0面试题与回答.md'`

Expected: 退出码为 0，无输出。

- [ ] **Step 5: 提交文档**

```bash
git add -- '简历相关/question/新版简历P0面试题与回答.md'
git commit -m 'docs: 新增新版简历面试题库'
```
