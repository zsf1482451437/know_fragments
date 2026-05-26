# 阿里云 Ubuntu VLESS + REALITY 镜像化 SOP

## 目标

- 这份文档用于在 `阿里云 Ubuntu` 服务器上落地一个个人用的 `VLESS + REALITY` 节点服务。
- 服务器同时支持 `IPv4` 和 `IPv6`。
- 手机推荐通过 `v2rayNG` 接入。
- 电脑推荐通过 `Clash Verge`、`Mihomo` 或其他支持 `vless + reality` 的客户端接入。
- 服务端尽量采用 `镜像 / Docker Compose` 形式运行，便于后续复用。

这份 SOP 选用的主方案是：

- `Xray Docker 镜像`
- `VLESS + REALITY`

原因：

- 不强依赖你自己准备域名和证书
- Android 和电脑端都能找到兼容客户端
- 服务端适合容器化，方便后续迁移和复用

---

## 适用前提

- 一台阿里云 `Ubuntu` 服务器
- 有 `root` 权限，或者有 `sudo`
- 服务器安全组可放行端口
- 你的客户端支持 `REALITY`

如果你手上的 `Clash` 客户端不支持 `vless` 或 `REALITY`，Android 端请直接改用 `v2rayNG`。

---

## 最终产物

你最终会得到这 4 类产物：

- 服务器上的 `docker-compose.yml`
- 服务器上的 `config.json`
- 手机端可导入的 `vless://...` 链接
- 电脑端可选的 `clash-aliyun-reality.yaml`

后续如果你要迁移机器，核心就是把：

- `config.json`
- `docker-compose.yml`

一起带走，再保留一份客户端参数笔记即可。

---

## 步骤 1：准备变量

先在服务器上准备这些变量：

```bash
export XRAY_DIR="/opt/xray-reality"
export PORT="8443"
export SERVER_NAME="www.cloudflare.com"
```

说明：

- `XRAY_DIR`
  - 服务端配置目录
- `PORT`
  - 对外监听端口，建议用 `8443`
- `SERVER_NAME`
  - `REALITY` 伪装目标域名，不是你自己的域名

---

## 步骤 2：放行端口

### 阿里云安全组

在阿里云控制台放行：

- `8443/tcp`

### Ubuntu 本机防火墙

如果你启用了 `ufw`：

```bash
sudo ufw allow 8443/tcp
sudo ufw status
```

如果你不用 `ufw`，可以跳过这一步。

---

## 步骤 3：安装 Docker 和 Compose

在 Ubuntu 上执行：

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable docker
sudo systemctl restart docker
sudo docker version
sudo docker compose version
```

预期：

- `docker version` 能正常输出
- `docker compose version` 能正常输出

---

## 步骤 4：创建目录

```bash
sudo mkdir -p $XRAY_DIR
cd $XRAY_DIR
```

---

## 步骤 5：生成 UUID

任选一个命令：

```bash
uuidgen
```

或：

```bash
python3 -c "import uuid; print(uuid.uuid4())"
```

把结果保存下来：

```bash
export UUID="替换成你刚生成的UUID"
```

---

## 步骤 6：生成 REALITY 密钥对

直接用镜像临时执行：

```bash
sudo docker run --rm ghcr.io/xtls/xray-core:latest x25519
```

你会看到类似输出：

```text
Private key: xxxxxxxxx
Public key: yyyyyyyyy
```

保存成变量：

```bash
export PRIVATE_KEY="替换成Private key"
export PUBLIC_KEY="替换成Public key"
```

---

## 步骤 7：生成 shortId

```bash
openssl rand -hex 8
```

保存结果：

```bash
export SHORT_ID="替换成刚生成的shortId"
```

---

## 步骤 8：写入服务端 config.json

在服务器上执行：

```bash
sudo tee $XRAY_DIR/config.json > /dev/null <<EOF
{
  "log": {
    "loglevel": "warning"
  },
  "inbounds": [
    {
      "listen": "::",
      "port": ${PORT},
      "protocol": "vless",
      "settings": {
        "clients": [
          {
            "id": "${UUID}",
            "flow": "xtls-rprx-vision"
          }
        ],
        "decryption": "none"
      },
      "streamSettings": {
        "network": "tcp",
        "security": "reality",
        "realitySettings": {
          "show": false,
          "dest": "${SERVER_NAME}:443",
          "xver": 0,
          "serverNames": [
            "${SERVER_NAME}"
          ],
          "privateKey": "${PRIVATE_KEY}",
          "shortIds": [
            "${SHORT_ID}"
          ]
        }
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom"
    }
  ]
}
EOF
```

注意：

- 这里监听端口改的是 `${PORT}`，也就是你对外提供服务的端口
- `realitySettings.dest` 里的 `:443` 不要改，它表示 REALITY 伪装目标的远端端口，不是你本机监听端口

查看写入结果：

```bash
sed -n '1,220p' $XRAY_DIR/config.json
```

---

## 步骤 9：写入 docker-compose.yml

在服务器上执行：

```bash
sudo tee $XRAY_DIR/docker-compose.yml > /dev/null <<'EOF'
services:
  xray:
    image: ghcr.io/xtls/xray-core:latest
    container_name: xray-reality
    restart: unless-stopped
    network_mode: host
    cap_add:
      - NET_BIND_SERVICE
    volumes:
      - ./config.json:/etc/xray/config.json:ro
    command: ["run", "-c", "/etc/xray/config.json"]
EOF
```

查看文件：

```bash
sed -n '1,120p' $XRAY_DIR/docker-compose.yml
```

这里选择 `network_mode: host`，原因是：

- 简单
- 少一层 Docker 端口映射
- 更适合这种单服务节点场景

---

## 步骤 10：启动服务

在服务器上执行：

```bash
cd $XRAY_DIR
sudo docker compose up -d
sudo docker compose ps
sudo docker compose logs --tail=50
```

预期：

- 容器状态为 `running`
- 日志中没有明显的配置错误

---

## 步骤 11：验证服务器监听

执行：

```bash
ss -tlnp | grep ${PORT}
sudo docker compose -f $XRAY_DIR/docker-compose.yml ps
```

预期：

- `8443` 端口已监听
- `xray-reality` 容器状态正常

如果这里失败，先不要导入客户端。

---

## 步骤 12：确认服务器公网 IP

分别看 IPv4 和 IPv6：

```bash
curl -4 https://ifconfig.me
curl -6 https://api64.ipify.org
```

把结果记下来。

后面客户端可以优先填：

- 阿里云公网 `IPv4`

如果你的客户端和网络环境对 IPv6 更友好，也可以填公网 `IPv6`。

如果这里出现下面这种情况：

- `curl -4` 正常返回公网 IP
- `curl -6` 连接失败

说明这台机器当前没有真正可用的公网 IPv6，此时客户端先填公网 `IPv4` 即可，不影响这套方案先跑通。

---

## 步骤 13：生成客户端配置

这一节分成两种客户端：

- Android：推荐 `v2rayNG`
- 电脑：可选 `Clash Verge`、`Mihomo` 或其他支持 `vless + reality` 的客户端

### 13.1 Android 用 v2rayNG

直接生成一条 `vless://` 链接：

```text
vless://YOUR_UUID@YOUR_SERVER_IP:YOUR_SERVER_PORT?security=reality&encryption=none&pbk=YOUR_PUBLIC_KEY&fp=chrome&type=tcp&flow=xtls-rprx-vision&sni=YOUR_SERVER_NAME&sid=YOUR_SHORT_ID#Aliyun-Reality
```

替换这些值：

- `YOUR_UUID`
  - 第 5 步生成的 UUID
- `YOUR_SERVER_IP`
  - 阿里云公网 `IPv4` 或 `IPv6`
- `YOUR_SERVER_PORT`
  - 一般就是 `8443`
- `YOUR_PUBLIC_KEY`
  - 第 6 步生成的 `PUBLIC_KEY`
- `YOUR_SERVER_NAME`
  - 第 1 步设置的 `SERVER_NAME`，例如 `www.cloudflare.com`
- `YOUR_SHORT_ID`
  - 第 7 步生成的 `SHORT_ID`

注意：

- 这条链接里不要额外加 `headerType=http`
- `type=tcp` 即可
- 如果你重新生成过 `PRIVATE_KEY`，一定要同步更新 `PUBLIC_KEY`

### 13.2 电脑端用 Clash / Mihomo

在你本地电脑上新建 `clash-aliyun-reality.yaml`：

```yaml
mixed-port: 7890
allow-lan: false
mode: rule
log-level: info
ipv6: true

dns:
  enable: true
  ipv6: true
  enhanced-mode: fake-ip
  nameserver:
    - 223.5.5.5
    - 1.1.1.1
  fallback:
    - https://1.1.1.1/dns-query
    - https://dns.google/dns-query

proxies:
  - name: Aliyun-Reality
    type: vless
    server: YOUR_SERVER_IP
    port: YOUR_SERVER_PORT
    uuid: YOUR_UUID
    network: tcp
    tls: true
    udp: true
    flow: xtls-rprx-vision
    servername: YOUR_SERVER_NAME
    client-fingerprint: chrome
    reality-opts:
      public-key: YOUR_PUBLIC_KEY
      short-id: YOUR_SHORT_ID

proxy-groups:
  - name: 节点选择
    type: select
    proxies:
      - Aliyun-Reality
      - DIRECT

rules:
  - GEOIP,CN,DIRECT
  - MATCH,节点选择
```

---

## 步骤 14：导入 Android

这里默认你使用的是 `v2rayNG`。

在 `v2rayNG` 中：

1. 导入第 13.1 步生成的 `vless://...` 链接
2. 选中该节点
3. 打开连接开关
4. 授予 VPN 权限
5. 打开日志
6. 直接访问测试网站，不要只看延迟测试

验收标准：

- 配置可以正常导入
- 没有 `unsupported proxy type: vless`
- 能正常打开 `https://www.google.com/generate_204`
- 能正常访问目标网站

---

## 步骤 15：导入电脑

在 `Clash Verge`、`Clash.Meta` 或 `Mihomo` 中：

1. 导入第 13.2 步生成的 `clash-aliyun-reality.yaml`
2. 启用该配置
3. 打开日志

验收标准：

- 能正常连接
- 日志里能看到命中 `Aliyun-Reality`
- 能正常访问应走代理的网站

---

## 一份演示版配置

下面这份是伪造但完整的示例。

### 服务端 config.json

```json
{
  "log": {
    "loglevel": "warning"
  },
  "inbounds": [
    {
      "listen": "::",
      "port": 8443,
      "protocol": "vless",
      "settings": {
        "clients": [
          {
            "id": "8f4f1cb8-7d7c-4cb0-9f59-3cc2e8d2c0aa",
            "flow": "xtls-rprx-vision"
          }
        ],
        "decryption": "none"
      },
      "streamSettings": {
        "network": "tcp",
        "security": "reality",
        "realitySettings": {
          "show": false,
          "dest": "www.cloudflare.com:443",
          "xver": 0,
          "serverNames": [
            "www.cloudflare.com"
          ],
          "privateKey": "REPLACE_WITH_PRIVATE_KEY",
          "shortIds": [
            "a1b2c3d4e5f60708"
          ]
        }
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom"
    }
  ]
}
```

### 客户端 clash-aliyun-reality.yaml

```yaml
mixed-port: 7890
allow-lan: false
mode: rule
log-level: info
ipv6: true

dns:
  enable: true
  ipv6: true
  enhanced-mode: fake-ip
  nameserver:
    - 223.5.5.5
    - 1.1.1.1
  fallback:
    - https://1.1.1.1/dns-query
    - https://dns.google/dns-query

proxies:
  - name: Aliyun-Reality
    type: vless
    server: YOUR_SERVER_IP
    port: 8443
    uuid: YOUR_UUID
    network: tcp
    tls: true
    udp: true
    flow: xtls-rprx-vision
    servername: YOUR_SERVER_NAME
    client-fingerprint: chrome
    reality-opts:
      public-key: YOUR_PUBLIC_KEY
      short-id: YOUR_SHORT_ID

proxy-groups:
  - name: 节点选择
    type: select
    proxies:
      - Aliyun-Reality
      - DIRECT

rules:
  - GEOIP,CN,DIRECT
  - MATCH,节点选择
```

---

## 常见报错速查

### `unknown field reality-opts`

说明：

- 客户端不支持 `REALITY`

处理：

- 更换支持 `Mihomo / Clash Meta` 的客户端

### `unsupported proxy type: vless`

说明：

- 当前 `Clash` 客户端不支持 `vless`

处理：

- Android 端改用 `v2rayNG`
- 电脑端改用支持 `vless + reality` 的 `Mihomo / Clash Meta`

### `connection timeout`

优先检查：

```bash
ss -tlnp | grep ${PORT}
sudo docker compose -f $XRAY_DIR/docker-compose.yml ps
```

再检查：

- 阿里云安全组
- Ubuntu 本机防火墙

### REALITY 握手失败

优先检查：

- `PUBLIC_KEY` 是否与服务端 `PRIVATE_KEY` 成对
- `SHORT_ID` 是否一致
- `SERVER_NAME` 是否一致
- `flow` 是否为 `xtls-rprx-vision`
- 是否误用了旧导出的 `PUBLIC_KEY`

### 能连接但打不开网站

优先检查：

- Clash 是否命中 `DIRECT`
- `dns.enable` 是否开启
- 服务端出站是否正常

---

## 镜像复用建议

如果你后续要复用这个方案，建议保留这几个资产：

- 服务端目录：`$XRAY_DIR`
- 服务端配置：`config.json`
- 服务编排：`docker-compose.yml`
- 手机端链接模板：`vless://...`
- 电脑端配置：`clash-aliyun-reality.yaml`
- 一份参数笔记：
  - `服务器 IP`
  - `PORT`
  - `UUID`
  - `PRIVATE_KEY`
  - `PUBLIC_KEY`
  - `SHORT_ID`
  - `SERVER_NAME`

后续换机器时，核心流程就是：

1. 安装 Docker
2. 把目录复制过去
3. 改 `server IP`
4. `docker compose up -d`

---

## 最终上线前检查清单

- 阿里云安全组已放行 `8443/tcp`
- Ubuntu 防火墙已放行 `8443/tcp`
- `docker compose ps` 状态正常
- `ss -tlnp | grep 8443` 能看到监听
- Android `v2rayNG` 可导入并连接
- 电脑端客户端可导入配置
- 手机和电脑都能正常访问目标网站
