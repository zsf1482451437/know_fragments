---
alwaysApply: false
description: 
---
# SuperPower 治理宪法

## 生效方式
始终生效

---

## 1. 全局入口红线

### 1.1 每个需求必须先触发 SuperPower
- 任意用户输入都视为一次需求，包括提问、解释、修改文件、调试、重构、评审、补文档、运行命令、查看状态。
- 在回答、澄清、搜索、读文件、写代码、执行命令之前，必须先进入 `SuperPower` 入口。
- `SuperPower` 入口优先加载 `using-superpowers`，再由它判断是否继续加载具体子技能。
- `SuperPower` 负责在 14 个内置工程技能之间进行统一路由，不允许跳过顶层入口直接命中子技能。
- 即使只是简单需求，也必须完成一次 SuperPower 触发判定；若无适用子技能，在 Load Plan 中记录“无需进入子流程”。

### 1.2 入口技能
- 主入口：`SuperPower`
- 入口 Skill：`.trae/skills/superPower/SKILL.md`
- 元技能：`.trae/skills/superPower/library/using-superpowers/SKILL.md`
- 子技能目录：`.trae/skills/superPower/library/`
- 触发原则：只要存在 1% 可能相关，就必须触发对应 Skill。

### 1.3 禁止绕过
- 禁止以“只是小问题”“先看一下文件”“先问个澄清问题”“不需要正式流程”为理由跳过 SuperPower。
- 禁止直接进入编码、搜索、命令执行或结论输出。
- 禁止项目侧 Skill 独立接管流程；项目侧 Skill 只能作为 SuperPower 编排下的资产能力。

---

## 2. Load Plan 强制格式

每次需求开始前，必须先生成 Load Plan：

```text
Load Plan
- 入口：SuperPower
- 元技能：using-superpowers
- 任务类型：<问答 / 文件修改 / 调试 / 评审 / 计划 / 执行 / 验证 / 其他>
- 候选子技能：<从 14 个内置技能中列出可能相关项>
- 决策：<触发哪些子技能，或说明无需进入子流程>
- 用户显式约束：<用户明确要求、禁用项或优先级>
```

Load Plan 可以简短，但不能省略。若用户要求“直接做”，仍需保留最小 Load Plan。

---

## 3. 核心子系统索引

### 3.1 入口链扩展
[rule_governance_entry_chain_extension.md](./rule_governance_entry_chain_extension.md)（官方扩展挂载与入口红线）

### 3.2 嵌套导航标准
[rule_swifterp_nested_navigation_standard.md](./swiftERP/02_in_coding/01_technical_principles/rule_swifterp_nested_navigation_standard.md)（导航标准化与 Tab Bar 联动）

### 3.3 导航标准扩展
[rule_swifterp_nested_navigation_standard_extension.md](./swiftERP/02_in_coding/01_technical_principles/rule_swifterp_nested_navigation_standard_extension.md)（严禁行为与验证红线）

---

## 4. 核心原则：拒绝分叉（Anti-Divergence）

### 4.1 单一流程源
- **SuperPower** 是唯一流程总控；项目侧 Skill 只提供资产能力，不得承担治理编排。
- 任何流程变更必须通过 SuperPower 核心链。
- 若平台同时存在多个技能入口，必须先进入 `SuperPower`，再由 `SuperPower` 决定是否调用其他技能。

### 4.2 资产透明化
- 所有加载的 Rule/Skill 必须在 `Load Plan` 中显式列出。
- 加载顺序必须可追溯、可验证。
- 禁止隐式加载或条件加载关键治理资产。

### 4.3 主动纠偏
- 若发现正在“堆代码”而未通过闸门，必须立即停止并重新对齐治理。
- 自动检测到流程偏离时，强制触发 `brainstorming` 或 `writing-plans` 重新锚定。
- 每 30 分钟或 5 个工具调用后，进行一次治理健康检查。

## 5. 测试闭环约束

### 5.1 改动必须同步测试
- 任何业务逻辑、交互体验、路由跳转、权限边界、数据流或 UI 状态改动，都必须同步评估并更新对应测试。
- 若存在已有单测覆盖相关模块，必须同步调整或补充单测。
- 若存在已有 E2E 覆盖相关用户链路，必须同步调整或补充 E2E。
- 若确认某次改动没有适用的单测或 E2E，必须在最终说明中明确“不适用”的原因。
- 禁止在最终交付时只说明代码改动而遗漏测试影响评估。

---

## 6. 治理健康检查清单

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 是否先触发 SuperPower | ⬜ | 检查本次需求是否先经过 SuperPower 入口 |
| 是否通过 SuperPower 标准流程 | ⬜ | 检查当前任务是否遵循标准工作流 |
| 是否有 Load Plan | ⬜ | 确认所有加载的 Rule/Skill 已列出 |
| 是否偏离设计意图 | ⬜ | 验证当前操作与最初设计是否一致 |
| 是否同步测试 | ⬜ | 检查本次改动是否已同步对应单测和 E2E，或说明不适用原因 |
| 是否需要重新对齐 | ⬜ | 决定是否需要重新锚定流程 |

---

## 7. 强制工作流

任何开发任务必须遵循以下路径：

```text
用户请求
  ↓
[SuperPower] 全局入口触发
  ↓
[using-superpowers] 判断并加载相关子技能
  ↓
[brainstorming] 设计对齐
  ↓
[writing-plans] 制定计划
  ↓
[using-git-worktrees] 环境准备
  ↓
[subagent-driven-development] / [executing-plans] 执行
  ↓
[requesting-code-review] 代码审查
  ↓
[verification-before-completion] 验证
  ↓
[finishing-a-development-branch] 收尾
```

**例外**：用户显式指定跳过某个环节时，必须在 Load Plan 中记录该决策。

---

## 7. 14 个内置子技能显式映射

`SuperPower` 统一管理并路由以下 14 个内置技能。所有项目内请求都必须先经过 `SuperPower`，再进入下列对应子技能。

| 子技能 | 主要用途 | 典型触发时机 | 路径 |
|--------|----------|--------------|------|
| `brainstorming` | 需求澄清、方案讨论、设计对齐 | 用户想法模糊、需求尚未收敛、需要讨论方案 | `.trae/skills/superPower/library/brainstorming/SKILL.md` |
| `dispatching-parallel-agents` | 并行拆分独立任务 | 多个子任务可以并发推进 | `.trae/skills/superPower/library/dispatching-parallel-agents/SKILL.md` |
| `executing-plans` | 按既定计划分批执行 | 计划已存在，准备进入实施 | `.trae/skills/superPower/library/executing-plans/SKILL.md` |
| `finishing-a-development-branch` | 收尾、验收、分支完成 | 开发任务完成，准备交付、合并或结束分支 | `.trae/skills/superPower/library/finishing-a-development-branch/SKILL.md` |
| `receiving-code-review` | 消化和处理 review 反馈 | 已收到代码评审意见，需要回应、修复或澄清 | `.trae/skills/superPower/library/receiving-code-review/SKILL.md` |
| `requesting-code-review` | 主动发起代码评审 | 已完成阶段性实现，准备审查 | `.trae/skills/superPower/library/requesting-code-review/SKILL.md` |
| `subagent-driven-development` | 用子代理按任务执行开发 | 工作可以拆分成多个工程子任务 | `.trae/skills/superPower/library/subagent-driven-development/SKILL.md` |
| `systematic-debugging` | 系统化排障与根因定位 | 出现 bug、异常、行为不符预期 | `.trae/skills/superPower/library/systematic-debugging/SKILL.md` |
| `test-driven-development` | 先测试后实现 | 改代码、补功能、修 bug 且需要稳健验证 | `.trae/skills/superPower/library/test-driven-development/SKILL.md` |
| `using-git-worktrees` | 使用 worktree 隔离工作空间 | 需要多分支隔离、并行开发或安全试验 | `.trae/skills/superPower/library/using-git-worktrees/SKILL.md` |
| `using-superpowers` | 元技能，总览技能使用方式 | 需要判断技能是否适用，或进入总路由治理 | `.trae/skills/superPower/library/using-superpowers/SKILL.md` |
| `verification-before-completion` | 完成前验证 | 宣布完成前做最终核验 | `.trae/skills/superPower/library/verification-before-completion/SKILL.md` |
| `writing-plans` | 产出实施计划和任务拆解 | 需求已清晰，准备制定执行计划 | `.trae/skills/superPower/library/writing-plans/SKILL.md` |
| `writing-skills` | 创建或维护技能 | 用户要求创建、修改、沉淀 skill | `.trae/skills/superPower/library/writing-skills/SKILL.md` |

---

## 8. 需求类型到子技能路由

| 需求类型 | 必选入口 | 候选子技能 |
|----------|----------|------------|
| 新功能、需求不清、方案讨论 | `SuperPower` | `brainstorming` |
| 写方案、拆任务、执行计划 | `SuperPower` | `writing-plans`、`executing-plans` |
| 修改代码、实现功能 | `SuperPower` | `test-driven-development`、`subagent-driven-development`、`executing-plans` |
| Bug、异常、线上问题 | `SuperPower` | `systematic-debugging`、`verification-before-completion` |
| 代码评审、安全审查、合并前检查 | `SuperPower` | `requesting-code-review`、`receiving-code-review` |
| 多分支、多任务、并行开发 | `SuperPower` | `using-git-worktrees`、`dispatching-parallel-agents` |
| 收尾、验证、交付 | `SuperPower` | `verification-before-completion`、`finishing-a-development-branch` |
| 创建或改造 Skill | `SuperPower` | `writing-skills` |
| 简单问答、文件解释、状态查询 | `SuperPower` | `using-superpowers`；必要时不进入子流程 |

---

## 9. 指令优先级

1. **用户显式指令**（最高优先级）
2. **本治理宪法**
3. **SuperPower 核心技能**
4. **项目侧业务技能**
5. **默认系统行为**（最低优先级）

---

## 10. 违规处理

| 违规类型 | 自动响应 |
|----------|----------|
| 未先触发 SuperPower | 停止当前动作，补充 Load Plan，并重新从 SuperPower 入口开始 |
| 跳过设计直接编码 | 强制触发 `brainstorming` |
| 无计划执行 | 强制触发 `writing-plans` |
| 跳过测试 | 强制触发 `test-driven-development` |
| 流程偏离超过 30 分钟 | 强制治理健康检查 + 用户确认 |
