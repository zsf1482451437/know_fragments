# 部署与 CI/CD 手册

本文档沉淀当前项目在服务器上的部署流程，包括以下内容：

- 私有仓库在服务器上的拉取方式
- 基于 `pnpm + Docker Compose` 的手动部署
- 基于 GitHub Actions 的自动部署
- 仅在依赖或容器配置变更时执行 `--no-cache` 构建
- 常见问题与排查方式

如果你已经完成过首个项目部署，现在要在**同一台服务器**继续接第二个、第三个项目，请改看：

- [多项目部署复用指南](file:///Users/bytedance/Desktop/项目/know_fragments/AI重塑体系/CICD/deploy-reusable-template.md)

## 1. 前置约定

以下示例基于当前项目约定：

- GitHub 仓库分支：`master`
- 服务器项目目录：`/root/finance-manager`
- 容器服务名：`finance-app`
- 对外端口：`4176`
- 健康检查地址：`http://127.0.0.1:4176/api/health`
- 包管理器：`pnpm@9.15.9`

如果你的服务器路径或端口不同，请自行替换下面命令中的对应值。

## 2. 服务器首次准备

### 2.1 安装 Docker 与 Compose

先确认服务器已安装 Docker 和 Compose：

```bash
docker -v
docker compose version
```

如果命令不存在，请先安装 Docker。

### 2.2 为服务器配置 GitHub SSH 访问

由于仓库是私有仓库，推荐在服务器上使用 SSH 拉取代码。

在服务器执行：

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
ssh-keygen -t ed25519 -C "server-deploy" -f ~/.ssh/id_ed25519
```

查看公钥：

```bash
cat ~/.ssh/id_ed25519.pub
```

将输出内容添加到 GitHub：

- GitHub `Settings`
- `SSH and GPG keys`
- `New SSH key`

测试服务器到 GitHub 的连接：

```bash
ssh -T git@github.com
```

首次连接如果出现确认提示，输入：

```bash
yes
```

成功时会看到类似输出：

```bash
Hi <your-name>! You've successfully authenticated, but GitHub does not provide shell access.
```

### 2.3 拉取私有仓库

在服务器执行：

```bash
cd /root
git clone git@github.com:zsf1482451437/finance-manager.git
cd /root/finance-manager
```

## 3. 本地切换到 pnpm

如果本地项目还没有切到 `pnpm`，按下面步骤处理。

进入项目目录：

```bash
cd "/Users/bytedance/Desktop/项目/finance-manager"
```

启用 `corepack` 并固定 `pnpm` 版本：

```bash
corepack enable
corepack prepare pnpm@9.15.9 --activate
pnpm -v
```

从原有锁文件迁移：

```bash
pnpm import
pnpm install
```

确认 `package.json` 包含：

```json
"packageManager": "pnpm@9.15.9"
```

验证本地构建与测试：

```bash
pnpm test -- --run
pnpm run lint
pnpm run build
pnpm run build:server
```

提交 `pnpm` 切换结果：

```bash
git add package.json pnpm-lock.yaml
git add -u
git commit -m "build: migrate to pnpm"
git push origin master
```

## 4. 当前 Dockerfile 说明

当前项目使用 `pnpm` 的多阶段构建：

- `builder` 阶段：
  - 启用 `corepack`
  - 固定 `pnpm@9.15.9`
  - 安装依赖
  - 执行前端和服务端构建
  - `pnpm prune --prod`
- `runner` 阶段：
  - 仅拷贝生产运行所需文件
  - 使用 `node build/server/index.js` 启动服务

当前 `Dockerfile` 已适配服务器环境，无需额外修改。

## 5. 服务器手动部署

### 5.1 首次准备环境变量

进入服务器项目目录：

```bash
cd /root/finance-manager
```

如果还没有 `.env`，先复制模板：

```bash
cp .env.example .env
```

### 5.2 手动部署命令

普通部署：

```bash
docker compose up -d --build
```

查看状态：

```bash
docker compose ps
docker compose logs -f finance-app
```

验证健康接口：

```bash
curl http://127.0.0.1:4176/api/health
```

### 5.3 什么情况下需要 `--no-cache`

大多数普通代码更新不需要清缓存，直接使用：

```bash
docker compose up -d --build
```

仅在以下文件发生变化时，建议执行无缓存构建：

- `package.json`
- `pnpm-lock.yaml`
- `Dockerfile`
- `docker-compose.yml`

对应命令：

```bash
docker compose build --no-cache
docker compose up -d
```

如果怀疑构建缓存异常，可以额外清理 builder 缓存：

```bash
docker builder prune -af
```

## 6. GitHub Actions 自动部署

### 6.1 目标

实现以下流程：

1. 本地推送到 `master`
2. GitHub Actions 自动执行测试、Lint、构建
3. 验证通过后通过 SSH 登录服务器
4. 服务器拉取最新代码并重启容器

### 6.2 为 Actions 准备 SSH 密钥

这一步在本地执行，用于 GitHub Actions 连接服务器。

生成一把专用私钥：

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_finance_deploy
```

查看公钥：

```bash
cat ~/.ssh/github_actions_finance_deploy.pub
```

把公钥写入服务器的 `authorized_keys`：

```bash
cat ~/.ssh/github_actions_finance_deploy.pub | ssh root@<server-ip> 'mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys'
```

查看私钥：

```bash
cat ~/.ssh/github_actions_finance_deploy
```

将整段私钥内容配置到 GitHub 仓库 `Settings -> Secrets and variables -> Actions`：

- `SERVER_HOST`：服务器 IP 或域名
- `SERVER_USER`：服务器用户名，例如 `root`
- `SERVER_PORT`：SSH 端口，默认 `22`
- `SERVER_SSH_KEY`：上一步输出的私钥完整内容

### 6.3 当前工作流说明

当前工作流文件位于：

- `.github/workflows/deploy.yml`

工作流分两段：

#### `test` 阶段

执行以下命令：

```bash
pnpm install --frozen-lockfile
pnpm test -- --run
pnpm run lint
pnpm run build
pnpm run build:server
```

#### `deploy` 阶段

执行以下逻辑：

```bash
cd /root/finance-manager
git fetch --all
git reset --hard origin/master
```

然后根据本次提交是否改到了以下文件，决定是否无缓存构建：

- `package.json`
- `pnpm-lock.yaml`
- `Dockerfile`
- `docker-compose.yml`

命中上述文件时执行：

```bash
docker compose build --no-cache
docker compose up -d
```

否则执行：

```bash
docker compose up -d --build
```

### 6.4 部署后的健康检查

部署完成后，工作流会先执行：

```bash
docker compose ps
```

然后进行带重试的健康检查：

```bash
for i in 1 2 3 4 5 6 7 8 9 10; do
  if curl --fail --silent http://127.0.0.1:4176/api/health; then
    echo
    echo "Health check passed"
    exit 0
  fi
  echo "Waiting for service to become healthy... ($i/10)"
  sleep 3
done

echo "Health check failed, printing container logs"
docker compose logs --tail=200 finance-app
exit 1
```

这可以避免容器刚启动但服务尚未完全就绪时，因单次 `curl` 失败导致误报。

### 6.5 触发自动部署

完成工作流和 Secrets 配置后，正常开发只需要：

```bash
git add .
git commit -m "feat: your change"
git push origin master
```

然后到 GitHub 仓库的 `Actions` 页面查看执行结果。

## 7. 常用命令

### 7.1 服务器侧

进入项目目录：

```bash
cd /root/finance-manager
```

拉最新代码：

```bash
git fetch --all
git reset --hard origin/master
```

普通重建：

```bash
docker compose up -d --build
```

无缓存重建：

```bash
docker compose build --no-cache
docker compose up -d
```

查看容器：

```bash
docker compose ps
```

查看日志：

```bash
docker compose logs -f finance-app
```

查看健康接口：

```bash
curl http://127.0.0.1:4176/api/health
```

### 7.2 本地侧

安装依赖：

```bash
pnpm install
```

运行测试：

```bash
pnpm test -- --run
```

运行 Lint：

```bash
pnpm run lint
```

构建前端：

```bash
pnpm run build
```

构建服务端：

```bash
pnpm run build:server
```

## 8. 常见问题

### 8.1 `project name must not be empty`

通常是因为当前目录名被 Docker Compose 解析后不合法。

解决方法：

- 在 `docker-compose.yml` 顶部添加 `name`
- 或执行时手动指定项目名

例如：

```bash
docker compose -p finance-manager up -d --build
```

### 8.2 GitHub 私有仓库无法 clone

不要使用 GitHub 账号密码直接 `git clone`。

正确方式：

- 使用 SSH：

```bash
git clone git@github.com:zsf1482451437/finance-manager.git
```

### 8.3 容器已启动，但健康检查失败

常见原因：

- 服务尚未完全启动
- 容器刚重建完成，端口还未稳定

排查命令：

```bash
docker compose ps
docker compose logs --tail=200 finance-app
curl http://127.0.0.1:4176/api/health
```

### 8.4 自动部署把服务器改动覆盖了

当前工作流使用：

```bash
git reset --hard origin/master
```

这会覆盖服务器项目目录内的本地改动。

因此建议：

- 不要在服务器里手改业务代码
- 服务器仅作为部署环境
- 所有改动都走本地提交和 GitHub Actions 部署

## 9. 建议的日常流程

推荐的稳定流程如下：

1. 本地开发并验证：

```bash
pnpm test -- --run
pnpm run lint
pnpm run build
pnpm run build:server
```

2. 推送到 `master`：

```bash
git add .
git commit -m "feat: update feature"
git push origin master
```

3. GitHub Actions 自动完成：

- 测试
- Lint
- 构建
- SSH 到服务器
- 重新部署
- 健康检查

这样以后不需要每次手动登录服务器部署，只需要在 GitHub Actions 中查看结果即可。
