---
name: "cicd-deploy-guide"
description: "Use when a user wants project-specific deployment or CI/CD guidance and needs a step-by-step, confirmation-driven rollout for first-time or subsequent projects."
---

# CICD Deploy Guide

## Overview

这个 Skill 用于把“一个项目如何部署到服务器并接入 CI/CD”拆成可执行的逐步流程。

它适用于两类场景：

- 第一个项目第一次部署到新服务器
- 已有服务器基础设施后，继续接第二个、第三个项目

核心要求：

- 必须根据当前项目输入，输出**每一步需要的文件**
- 必须**逐步推进**
- 每完成一步，都要明确询问用户：**“这一步是否已操作？”**
- 在用户未确认前，不得跳到下一步

## When to Use

在以下场景触发：

- 用户要把某个项目部署到服务器
- 用户要为项目补 Docker / Docker Compose / CI/CD
- 用户要判断某个项目部署过程中需要哪些文件
- 用户要在同一台服务器继续部署第二个或后续项目
- 用户要求按步骤推进，并在每一步确认是否已完成

不适用：

- 纯代码实现问题，与部署无关
- 单纯解释 Docker / GitHub Actions 概念，不需要形成项目级部署步骤

## Required Inputs

开始执行前，优先收集这些信息；若缺失，则先询问，不要硬猜。

- 项目名称
- Git 仓库地址
- 分支名
- 是否私有仓库
- 包管理器：`npm / pnpm / yarn`
- 构建命令
- 服务启动命令
- 服务监听端口
- 健康检查地址
- 是否使用 Docker
- 是否使用 Docker Compose
- 服务器目录
- 是否是首个项目首次部署，还是后续项目接入
- 是否需要持久化数据
- 数据目录 / 工作区目录
- 是否需要域名 / 反向代理

如果用户没有一次性提供完整，按最小必要信息逐项补问。

## Mandatory Workflow

### 1. 先判断部署类型

先把任务归为以下两类之一：

- `首次部署`：服务器上第一次落项目，可能还没装 Docker、还没配 SSH、还没打通 Actions
- `后续项目部署`：服务器基础能力已具备，只是接入新项目

如果用户没有明确说明，先问清楚。

### 2. 先输出“本项目部署所需文件清单”

拿到项目信息后，先给出一个**项目级文件清单**，至少覆盖：

- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`
- `.env.example`
- `.env`
- `.github/workflows/deploy.yml`
- `README.md` 或 `docs/deploy.md`

如果项目需要额外能力，再补充：

- `nginx.conf` / 站点配置
- `Caddyfile`
- 持久化目录说明
- 健康检查脚本
- 数据迁移脚本

输出格式使用下面模板：

```text
部署文件清单
- 必需文件：
  - <文件路径>：<用途>
- 可选文件：
  - <文件路径>：<什么时候需要>
```

### 3. 必须逐步推进，不得一次性把全部步骤抛给用户

执行时按步骤推进，每一步都使用下面结构：

```text
Step X：<步骤名>
- 目标：<这一阶段要完成什么>
- 需要检查/创建的文件：
  - <文件 1>
  - <文件 2>
- 需要执行的命令：
  <command>
- 完成标准：
  - <可验证结果>
```

然后立刻停下，询问用户：

```text
这一步是否已操作？
1. 已完成
2. 未完成，需要我继续指导
3. 已完成但报错，需要排查
4. 不确定，需要先解释
```

在用户明确回答前，不进入下一步。

### 4. 每一步都要带“文件视角”

任何步骤都不能只讲命令，必须同时说明该步骤涉及哪些文件。

例如：

- 本地改造阶段：`package.json`、`pnpm-lock.yaml`、`Dockerfile`
- 容器编排阶段：`docker-compose.yml`、`.env`
- 自动部署阶段：`.github/workflows/deploy.yml`
- 文档沉淀阶段：`README.md`、`docs/deploy.md`

### 5. 如果是后续项目，必须提醒区分复用项和项目专属项

后续项目部署时，必须显式区分：

可复用：

- Docker
- Docker Compose
- 服务器 SSH 访问能力
- GitHub Actions 到服务器的 SSH 连接能力

必须独立：

- 项目目录
- Compose 项目名
- 容器名
- 端口
- 健康检查地址
- volume / 数据目录
- `.env`
- 域名和反向代理配置

## Recommended Step Order

默认按下面顺序推进，必要时可删减，但不要跳过确认环节。

### A. 项目输入确认

确认项目的：

- 仓库
- 包管理器
- 启动方式
- 端口
- 健康检查
- 持久化需求
- 首次部署 / 后续项目

### B. 输出部署文件清单

根据项目现状列出：

- 已有文件
- 缺失文件
- 需要新增或修改的文件

### C. 本地构建与容器化准备

通常涉及：

- `package.json`
- 锁文件
- `Dockerfile`
- `.dockerignore`

### D. Docker Compose 编排

通常涉及：

- `docker-compose.yml`
- `.env`

### E. 服务器准备

首次部署通常涉及：

- Docker / Compose 安装
- 服务器到 GitHub 的 SSH key
- 项目目录拉取

后续项目通常只需要：

- 新建项目目录
- 拉代码
- 复制 `.env`
- 调整端口和数据目录

### F. 手动部署验证

通常要求输出：

- 启动命令
- 查看日志命令
- 健康检查命令

### G. GitHub Actions 自动部署

通常涉及：

- `.github/workflows/deploy.yml`
- 仓库 Secrets
- 仓库 Variables

### H. 反向代理与域名

只有在用户需要公网域名时才展开。

### I. 文档沉淀

最终提醒同步更新：

- `README.md`
- `docs/deploy.md`

## File Mapping Reference

### 首次部署常见必需文件

- `package.json`
- 锁文件：`pnpm-lock.yaml` / `package-lock.json` / `yarn.lock`
- `Dockerfile`
- `.dockerignore`
- `docker-compose.yml`
- `.env.example`
- `.env`
- `.github/workflows/deploy.yml`
- `README.md` 或 `docs/deploy.md`

### 后续项目额外重点检查

- `docker-compose.yml` 里的 `name`
- `docker-compose.yml` 里的 `container_name`
- `docker-compose.yml` 里的 `ports`
- `docker-compose.yml` 里的 `volumes`
- `.env` 中的端口、数据目录、工作区目录
- `deploy.yml` 中的服务器目录、Compose 项目名、健康检查地址

## Response Rules

### 必须做

- 先判断首个项目还是后续项目
- 先输出文件清单，再进入步骤
- 每一步都带文件列表、命令、完成标准
- 每一步都停下来确认是否已操作
- 用户说“报错”时，切到排查模式，不继续下一步
- 用户说“已完成”后，才继续下一步

### 禁止做

- 一次性输出完整长篇部署教程，然后不确认
- 只给命令，不说明改哪些文件
- 后续项目场景下继续沿用旧项目的端口和目录
- 在用户未确认的情况下自动跳到下一阶段

## Knowledge Base

本 Skill 优先复用以下文档口径：

- `/Users/bytedance/Desktop/项目/know_fragments/AI重塑体系/CICD/deploy-cicd.md`
- `/Users/bytedance/Desktop/项目/know_fragments/AI重塑体系/CICD/deploy-reusable-template.md`

使用时：

- `deploy-cicd.md` 负责首个项目首次部署
- `deploy-reusable-template.md` 负责第二个及后续项目的复用策略

## Starter Output Template

首次响应建议使用下面格式：

```text
我会按部署向导方式推进，先确认项目信息，再逐步给出每一步需要的文件和命令；每一步结束后我都会停下来问你是否已操作。

当前判断：
- 部署类型：<首次部署 / 后续项目部署 / 待确认>

部署文件清单
- 必需文件：
  - <文件路径>：<用途>
- 可选文件：
  - <文件路径>：<什么时候需要>

Step 1：<步骤名>
- 目标：<目标>
- 需要检查/创建的文件：
  - <文件>
- 需要执行的命令：
  <command>
- 完成标准：
  - <标准>

这一步是否已操作？
1. 已完成
2. 未完成，需要我继续指导
3. 已完成但报错，需要排查
4. 不确定，需要先解释
```
