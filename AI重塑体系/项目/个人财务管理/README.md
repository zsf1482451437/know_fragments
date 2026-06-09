# 个人财务管理

一个以“月”为单位的个人财务管理工具，使用 React + TypeScript + TailwindCSS，后端为 Koa，数据持久化为 JSON，单元测试使用 Vitest。

## 核心口径

本金是本工具的重点观察指标：

```text
本金 = 收入 - 开销 - 投资 - 负债
```

## 目录结构

- `src/components/layout`：页面头部与整体布局组件
- `src/components/dashboard`：关键指标卡片
- `src/components/months`：月份选择与月份相关交互
- `src/components/records`：财务记录表单与列表
- `src/components/charts`：轻量 SVG 图表
- `src/components/common`：通用空状态等组件
- `src/utils`：本金计算、月度汇总、格式化等纯函数
- `src/services`：前端 API 请求封装
- `server`：Koa API 与 JSON 存储
- `data`：JSON 持久化数据

## 常用命令

```bash
npm install
npm run dev
npm run test
npm run build
npm run typecheck:server
```

默认后端端口：`4176`。

## Docker 部署

项目已提供生产可用的 `Dockerfile` 和 `docker-compose.yml`，默认由 Koa 同时提供：

- 前端静态资源：`dist`
- 后端 API：`/api/*`
- 健康检查：`/api/health`

### 本地构建镜像

```bash
docker build -t personal-finance-manager:latest .
```

### 服务器使用 Docker Compose 启动

可先复制环境变量模板：

```bash
cp .env.example .env
```

```bash
docker compose up -d --build
```

默认映射端口：

- 容器内：`4176`
- 宿主机：`${APP_PORT:-4176}`

如果要改成服务器 `8080` 端口，可以这样启动：

```bash
APP_PORT=8080 docker compose up -d --build
```

### 常用运维命令

```bash
docker compose ps
docker compose logs -f finance-app
docker compose restart finance-app
docker compose down
```

### 数据持久化

`docker-compose.yml` 已配置命名卷 `finance-data` 挂载到容器内的 `/app/data`，默认数据文件路径为：

```text
/app/data/finance.json
```

这意味着：

- 重建容器不会丢失财务数据
- 登录日志和流水数据都会保存在 Docker 卷中

### 更新部署

服务器拉取新代码后，执行：

```bash
docker compose up -d --build
```

即可重新构建并滚动更新当前服务。
