# 多项目部署复用指南

本文档只讨论一个前提：

- 你已经有一台跑着至少一个项目的服务器
- Docker、Docker Compose、GitHub SSH 拉取、GitHub Actions SSH 部署链路已经打通

目标是把这些**已经打通的基础能力**复用到第二个、第三个及后续项目上，避免每次都从零梳理。

## 1. 哪些可以复用

同一台服务器继续部署新项目时，通常可以直接复用以下内容：

- Docker
- Docker Compose
- 服务器访问 GitHub 的 SSH key
- GitHub Actions 连接服务器的 SSH 私钥
- 服务器本身的防火墙基础策略
- 反向代理软件本体，例如 Nginx / Caddy

也就是说，后续项目一般**不需要重新安装 Docker**，也**不需要重新生成一套新的服务器到 GitHub 的 SSH key**。

## 2. 哪些必须按项目区分

虽然底层环境可复用，但下面这些值必须按项目拆开，否则会互相覆盖或冲突。

### 2.1 服务器项目目录

每个项目都必须有独立目录：

```bash
/root/finance-manager
/root/markdown-reader-editor
/root/another-project
```

不要把多个项目放进同一个 Git 工作区。

### 2.2 Docker Compose 项目名

建议每个项目都在 `docker-compose.yml` 顶部显式声明唯一名称：

```yaml
name: markdown-reader-editor
```

或者在命令中显式指定：

```bash
docker compose -p markdown-reader-editor up -d --build
```

这个值会影响容器前缀、网络、volume 命名。

### 2.3 容器名

如果使用了 `container_name`，必须保证全机唯一：

```yaml
container_name: markdown-reader-editor
```

### 2.4 端口

每个项目必须占用不同端口，例如：

- `finance-manager`: `4176`
- `markdown-reader-editor`: `4174`
- `another-project`: `4180`

需要同步修改的地方通常包括：

- `.env`
- `docker-compose.yml`
- 健康检查地址
- Nginx / Caddy 配置
- 安全组 / 防火墙放行规则

### 2.5 持久化目录或 volume

任何会写文件、数据库、缓存、上传内容的项目，都必须使用独立的持久化位置。

例如命名 volume：

```yaml
volumes:
  - markdown-data:/app/data
```

或者宿主机挂载：

```yaml
volumes:
  - /data/markdown-reader-editor:/app/data
```

不要让两个项目共用同一个 volume，除非它们本来就设计为共享数据。

### 2.6 项目环境变量

每个项目的 `.env` 应独立维护，至少确认以下值是否独立：

- 服务端口
- 数据目录
- 工作区目录
- 域名
- 日志目录
- 第三方服务账号和密钥

例如 Markdown 项目可明确：

```bash
SERVER_PORT=4174
MARKDOWN_WORKSPACE_ROOT=/data/markdown-reader-editor/workspace
```

### 2.7 健康检查地址

每个项目的健康检查地址必须独立维护：

```bash
http://127.0.0.1:4174/api/health
```

不要把旧项目的端口和路径直接复制过来。

## 3. 建议抽成变量的部署参数

如果你希望后续项目的 GitHub Actions 基本复用同一套工作流，建议把下面这些值抽成仓库级 Variables 或 Secrets。

### 3.1 可在不同仓库复用的连接信息

通常这些值在同一台服务器上可以复用：

- `SERVER_HOST`
- `SERVER_USER`
- `SERVER_PORT`
- `SERVER_SSH_KEY`

### 3.2 必须按项目单独配置的变量

下面这些值建议每个仓库单独维护：

- `SERVER_APP_DIR`
- `COMPOSE_PROJECT_NAME`
- `APP_PORT`
- `HEALTHCHECK_URL`

如果项目还存在工作区目录、数据路径等运行参数，也建议继续抽成：

- `WORKSPACE_ROOT`
- `DATA_DIR`
- `PUBLIC_DOMAIN`

## 4. 建议的通用 deploy.yml 变量化方式

如果把工作流写成通用模板，核心脚本建议尽量少写死项目名和路径。

例如：

```yaml
- name: Deploy on Server
  uses: appleboy/ssh-action@v1.0.3
  with:
    host: ${{ secrets.SERVER_HOST }}
    username: ${{ secrets.SERVER_USER }}
    port: ${{ secrets.SERVER_PORT }}
    key: ${{ secrets.SERVER_SSH_KEY }}
    script: |
      set -e
      cd "${{ vars.SERVER_APP_DIR }}"
      git fetch --all
      git reset --hard origin/master

      if [ "${{ steps.changes.outputs.no_cache_rebuild }}" = "true" ]; then
        docker compose -p "${{ vars.COMPOSE_PROJECT_NAME }}" build --no-cache
        docker compose -p "${{ vars.COMPOSE_PROJECT_NAME }}" up -d
      else
        docker compose -p "${{ vars.COMPOSE_PROJECT_NAME }}" up -d --build
      fi

      docker compose -p "${{ vars.COMPOSE_PROJECT_NAME }}" ps

      for i in 1 2 3 4 5 6 7 8 9 10; do
        if curl --fail --silent "${{ vars.HEALTHCHECK_URL }}"; then
          echo
          echo "Health check passed"
          exit 0
        fi
        echo "Waiting for service to become healthy... ($i/10)"
        sleep 3
      done

      docker compose -p "${{ vars.COMPOSE_PROJECT_NAME }}" logs --tail=200
      exit 1
```

这样你后面新建仓库时，大概率只需要：

1. 复制工作流
2. 配置该仓库自己的 Variables / Secrets
3. 根据项目实际启动方式微调一两处

## 5. 新项目接入服务器的最小步骤

以第二个项目 `markdown-reader-editor` 为例。

### 5.1 拉代码

```bash
cd /root
git clone git@github.com:<your-name>/markdown-reader-editor.git
cd /root/markdown-reader-editor
```

### 5.2 准备环境变量

```bash
cp .env.example .env
```

然后至少确认：

- 端口不冲突
- 数据路径独立
- 工作区路径独立

### 5.3 检查 Compose 配置

部署前，至少检查以下项是否唯一：

- `name`
- `container_name`
- `ports`
- `volumes`

### 5.4 先手动部署验证

```bash
docker compose up -d --build
docker compose ps
curl http://127.0.0.1:<your-port>/api/health
```

只有手动验证通过后，再接 GitHub Actions 自动部署。

### 5.5 配置仓库级 Secrets / Variables

至少确认该仓库已经有：

- Secrets:
  - `SERVER_HOST`
  - `SERVER_USER`
  - `SERVER_PORT`
  - `SERVER_SSH_KEY`
- Variables:
  - `SERVER_APP_DIR`
  - `COMPOSE_PROJECT_NAME`
  - `APP_PORT`
  - `HEALTHCHECK_URL`

## 6. 多项目复用检查清单

每新增一个项目，都检查以下内容是否独立：

- Git 目录
- Compose 项目名
- 容器名
- 对外端口
- 健康检查地址
- volume 名称
- 宿主机持久化目录
- `.env`
- 域名
- Nginx / Caddy 站点配置
- GitHub Actions 的仓库变量

## 7. 适用边界

这份文档适用于：

- 同一台 Linux 服务器
- Docker Compose 部署
- GitHub Actions 通过 SSH 登录服务器执行部署

如果后续切换到：

- Kubernetes
- 多台机器分环境部署
- 蓝绿发布 / 灰度发布
- 镜像推送到私有仓库再拉取

那部署模型会变化，这份文档只能复用其中一部分思路，不能直接照抄。
