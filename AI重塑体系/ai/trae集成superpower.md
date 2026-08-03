# Trae 集成 SuperPower

## 目标

把 `obra/superpowers` 接入 Trae，但不把一组 upstream skills 直接平铺到项目的 `.trae/skills` 下，避免污染项目已有技能空间。

## 集成方案

### 1. 隔离保存上游仓库

将上游仓库 clone 到项目内：

```bash
git clone https://github.com/obra/superpowers.git .trae/vendor/superpowers
```

用途：

- 作为上游来源，便于后续升级
- 不直接暴露给 Trae 作为多 skill 入口

### 2. 封装成单一 skill 包

只新增一个入口技能：

```text
.trae/skills/superPower/SKILL.md
```

并把上游 `skills/` 内容收纳到：

```text
.trae/skills/superPower/library/
```

这样 Trae 只感知一个 `superPower`，而不是感知十几个并列技能。

### 3. 总入口规则

在以下位置增加总入口规则文件：

```text
.trae/rule/constitution.md
```

规则职责：

- 定义什么时候优先进入 `superPower`
- 定义什么时候继续使用项目已有技能
- 定义 `superPower` 包内部的路由关系

## 当前目录约定

```text
.trae/
  rule/
    constitution.md
  skills/
    superPower/
      SKILL.md
      library/
  vendor/
    superpowers/
```

## 路由原则

- 设计讨论：`brainstorming`
- 写计划：`writing-plans`
- 按计划执行：`executing-plans`
- TDD：`test-driven-development`
- 调试：`systematic-debugging`
- 代码评审：`requesting-code-review`
- 完成验证：`verification-before-completion`
- worktree / 多 agent：`using-git-worktrees`、`dispatching-parallel-agents`、`subagent-driven-development`
- 分支收尾：`finishing-a-development-branch`

## 边界

- `superPower` 提供的是工程方法论能力
- 项目已有的业务型技能仍保留原优先级
- 用户明确指定的做法始终高于 `superPower` 默认流程

## 维护方式

上游更新时，建议按以下顺序同步：

```bash
git -C .trae/vendor/superpowers pull
rsync -a .trae/vendor/superpowers/skills/ .trae/skills/superPower/library/
```
