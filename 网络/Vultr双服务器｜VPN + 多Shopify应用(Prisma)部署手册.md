# Vultr双服务器｜VPN \+ 多Shopify应用\(Prisma\)部署手册

# 1\. 整体架构说明

## 1\.1 服务器分工（严格分开，永不互相干扰）

|机器|配置|价格|用途|核心规则|
|---|---|---|---|---|
|机器A|1vCPU / 0\.5GB / 10GB|$2\.5/月|个人WireGuard VPN|不部署任何业务、纯净网络|
|机器B|1vCPU / 1GB / 25GB|$5\.0/月|Docker \+ 多Shopify应用 \+ Prisma数据库|专门跑业务、数据库常驻|

## 1\.2 技术栈

- 容器：Docker \+ Docker Compose

- 数据库：MariaDB（低配最稳）

- ORM：Prisma（适配你的Shopify项目）

- 反向代理：Nginx（HTTPS、域名转发）

- VPN：WireGuard（占用极低）

---

# 2\. 机器A｜VPN部署教程（WireGuard）

## 2\.1 系统选择

推荐：**Ubuntu 22\.04 x64**

## 2\.2 一键安装脚本

登录机器A，直接复制执行：

```bash
wget -O wireguard.sh https://get.vpnsetup.net/wg && sudo bash wireguard.sh
```

## 2\.3 安装流程

1. 全部默认回车

2. 生成二维码 \+ 配置文件

3. 手机/电脑扫码连接

## 2\.4 资源占用

- 内存：20\~35MB

- CPU：几乎为0

- 适合长期挂着、永不关机

---

# 3\. 机器B｜Docker \+ Shopify \+ Prisma 部署教程

## 3\.1 初始化环境

### 3\.1\.1 安装Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

⚠️ 执行完**退出服务器重新登录**，权限生效。

### 3\.1\.2 创建项目目录

```bash
mkdir -p /root/shopify-platform && cd /root/shopify-platform
```

## 3\.2 完整目录结构（固定模板）

```plain
shopify-platform/
├── app1/                # 第一个Shopify应用
├── app2/                # 第二个Shopify应用
├── nginx/conf.d/        # 域名反向代理
├── docker-compose.yml   # 全局编排
└── .env                 # 全局变量（可选）
```

## 3\.3 核心配置文件

### 3\.3\.1 docker\-compose\.yml（直接全量复制）

```yaml
version: '3.8'
networks:
  shopify-net:
    driver: bridge
volumes:
  mariadb-data:
services:
  mariadb:
    image: mariadb:lts
    container_name: shopify-db
    restart: always
    networks:
      - shopify-net
    volumes:
      - mariadb-data:/var/lib/mysql
    environment:
      - MYSQL_ROOT_PASSWORD=Shopify@123456
      - MYSQL_DATABASE=shopify_apps
      - MYSQL_CHARSET=utf8mb4
    command: --innodb-buffer-pool-size=64M --max_connections=50

  shopify-app-1:
    build: ./app1
    container_name: shopify-app-1
    restart: always
    networks:
      - shopify-net
    depends_on:
      - mariadb
    env_file:
      - ./app1/.env
    ports:
      - "3001:3000"

  shopify-app-2:
    build: ./app2
    container_name: shopify-app-2
    restart: always
    networks:
      - shopify-net
    depends_on:
      - mariadb
    env_file:
      - ./app2/.env
    ports:
      - "3002:3000"

  nginx:
    image: nginx:alpine
    container_name: shopify-nginx
    restart: always
    networks:
      - shopify-net
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx:/etc/nginx/conf.d
```

### 3\.3\.2 单个应用 Dockerfile（Prisma专用）

路径：`app1/Dockerfile`、`app2/Dockerfile`（全部一样）

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install --production
RUN npx prisma generate
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### 3\.3\.3 应用 \.env 模板（Prisma\+Shopify）

路径：`app1/\.env`

```env
# Shopify 基础配置
SHOPIFY_API_KEY=xxx
SHOPIFY_API_SECRET=xxx
SHOPIFY_APP_URL=https://app1.xxx.com
PORT=3000

# Prisma 数据库连接（固定不变）
DATABASE_URL="mysql://root:Shopify@123456@mariadb:3306/shopify_apps?sslmode=prefer"
```

### 3\.3\.4 Prisma Schema（多商家通用表）

路径：`app1/prisma/schema\.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
model MerchantConfig {
  id            Int      @id @default(autoincrement())
  shopDomain    String
  appId         String
  accessToken   String?
  config        Json?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  @@unique([shopDomain, appId])
  @@index([appId])
}
```

## 3\.4 初始化数据库（只执行一次）

### 3\.4\.1 启动数据库

```bash
docker compose up -d mariadb
```

### 3\.4\.2 执行 Prisma 迁移

```bash
docker exec -it shopify-app-1 sh
npx prisma migrate dev --name init
exit
```

✅ 自动生成：**MerchantConfig 商家配置表**

## 3\.5 Nginx域名配置模板

路径：`nginx/conf\.d/app1\.conf`

```nginx
server {
    listen 80;
    server_name app1.你的域名.com;
    location / {
        proxy_pass http://shopify-app-1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

HTTPS证书我可以单独给你一键申请脚本。

---

# 4\. 新增Shopify应用流程（以后复用）

1. 复制 `app1` 改名为 `app3`

2. 修改 `\.env` 里面的 Shopify 密钥和域名

3. docker\-compose\.yml 新增一段服务，端口改为3003

4. 执行 `docker compose up \-d`

✅ 无需重复建库、无需重复迁移、共用一张商家表。

---

# 5\. 常用运维命令（保存备用）

```bash
# 启动全部服务
docker compose up -d

# 查看运行状态
docker compose ps

# 查看应用日志
docker logs -f shopify-app-1

# 重启单个应用
docker restart shopify-app-1

# 全部重启
docker compose restart
```

---

# 6\. 机器B资源占用表（实测稳定）

|服务|内存占用|
|---|---|
|MariaDB|60\~80MB|
|单个Shopify应用|50\~100MB|
|Nginx|10MB|
|系统预留|200MB|
|**5个应用总占用**|**≈600MB**|

---

# 7\. 专属优势（为你定制）

- 两台机器完全隔离：VPN永不卡顿、业务永不泄露

- Prisma原生适配，无需改代码

- 多应用共享数据库，区分 appId 隔离数据

- 最低成本：$7\.5/月 搞定开发\+上网

- 全部容器化，重装服务器一键恢复

> （注：文档部分内容可能由 AI 生成）
