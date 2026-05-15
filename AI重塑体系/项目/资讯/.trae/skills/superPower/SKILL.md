---
name: superPower
description: Project entry skill for brainstorming, planning, execution, TDD, debugging, code review, verification, worktrees, parallel agents, skill writing, and project Q&A. Invoke before any project action.
---

# SuperPower

## 角色

你是当前项目的统一工程方法论入口。

你的职责不是立刻写代码，而是先对当前需求做一次治理判断，再决定是否进入更具体的流程。

## 何时触发

以下情况都应优先触发本技能：

- 用户提出任何与当前项目相关的请求
- 开始编码、改文件、跑命令、调试、评审、写计划、查状态
- 需要判断是否应该进入某个更具体的工程流程
- 需要在 14 个内置工程技能之间做路由判断
- 即使只是简单问答，只要与项目相关，也应先经过一次本技能判定

## 核心原则

- `superPower` 是唯一流程入口
- 先治理判定，再执行动作
- 先形成最小 `Load Plan`，再回答或操作
- 如存在 1% 可能适用某子流程，就优先进入子流程
- 用户显式指令优先于默认流程

## 最小 Load Plan

在开始执行前，先形成如下结构：

```text
Load Plan
- 入口：superPower
- 任务类型：<问答 / 文件修改 / 调试 / 评审 / 计划 / 执行 / 验证 / 其他>
- 候选子技能：<可能相关的流程>
- 决策：<进入哪个子流程，或无需进入子流程>
- 用户显式约束：<用户明确要求>
```

## 14 个内置子技能索引

`superPower` 负责显式管理并路由以下 14 个子技能。任何与这些场景相关的需求，都应先命中 `superPower`，再转入对应子技能。

| 子技能 | 主要用途 | 典型触发时机 | 路径 |
|---|---|---|---|
| `brainstorming` | 需求澄清、方案讨论、设计对齐 | 用户想法模糊、需要先讨论方案 | `library/brainstorming/SKILL.md` |
| `dispatching-parallel-agents` | 并行拆分独立任务 | 多个任务可并发推进 | `library/dispatching-parallel-agents/SKILL.md` |
| `executing-plans` | 按既定计划分批执行 | 计划已存在，准备进入实施 | `library/executing-plans/SKILL.md` |
| `finishing-a-development-branch` | 收尾、验收、分支完成 | 任务完成后准备交付或收尾 | `library/finishing-a-development-branch/SKILL.md` |
| `receiving-code-review` | 消化和处理 review 反馈 | 已收到代码评审意见，需要回应或修复 | `library/receiving-code-review/SKILL.md` |
| `requesting-code-review` | 主动发起代码评审 | 完成阶段性实现，准备审查 | `library/requesting-code-review/SKILL.md` |
| `subagent-driven-development` | 用子代理按任务执行开发 | 工作可拆分成多个工程子任务 | `library/subagent-driven-development/SKILL.md` |
| `systematic-debugging` | 系统化排障与根因定位 | 出现 bug、异常、行为不符预期 | `library/systematic-debugging/SKILL.md` |
| `test-driven-development` | 先测试后实现 | 改代码、补功能、修 bug 且需要稳健验证 | `library/test-driven-development/SKILL.md` |
| `using-git-worktrees` | 使用 worktree 隔离工作空间 | 需要多分支隔离、并行开发或安全试验 | `library/using-git-worktrees/SKILL.md` |
| `using-superpowers` | 元技能，总览技能使用方式 | 需要判断技能是否适用，或进入总路由治理 | `library/using-superpowers/SKILL.md` |
| `verification-before-completion` | 完成前验证 | 宣布完成前做最终核验 | `library/verification-before-completion/SKILL.md` |
| `writing-plans` | 产出实施计划和任务拆解 | 需求已清晰，准备制定执行计划 | `library/writing-plans/SKILL.md` |
| `writing-skills` | 创建或维护技能 | 用户要求创建、修改、沉淀 skill | `library/writing-skills/SKILL.md` |

## 路由规则

优先使用以下映射进行路由：

- 设计讨论、需求澄清：`brainstorming`
- 多任务并发推进：`dispatching-parallel-agents`
- 已有计划的执行推进：`executing-plans`
- 任务完成后的收尾与分支处理：`finishing-a-development-branch`
- 接收并处理评审反馈：`receiving-code-review`
- 主动发起代码评审：`requesting-code-review`
- 使用子代理执行开发：`subagent-driven-development`
- 调试和排障：`systematic-debugging`
- 实现功能、改代码、修 bug：`test-driven-development`
- 工作区隔离与多分支：`using-git-worktrees`
- 元治理与技能选择：`using-superpowers`
- 完成前核验：`verification-before-completion`
- 写方案、拆任务：`writing-plans`
- Skill 设计与维护：`writing-skills`

## 执行约束

- 不要因为“任务简单”就跳过本技能
- 不要直接进入编码、搜索、命令执行或结论输出
- 如果发现当前动作已经偏离流程，立即停止并重新做治理判断
- 项目中的业务规则继续有效，但流程编排由 `superPower` 统一负责

## 资源布局

- 入口技能：`.trae/skills/superPower/SKILL.md`
- 子流程库：`.trae/skills/superPower/library/`
- 项目治理规则：`.trae/rules/constitution.md`

## 期望结果

每次需求都先经过 `superPower` 判定，Trae 先识别这个顶层 skill，再根据任务类型进入更具体的子流程。
