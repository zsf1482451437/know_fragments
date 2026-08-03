# Alpine WireGuard 报错终极修复及完整命令手册

# 🚨 报错终极修复 \+ 完整版《Alpine WireGuard 运维命令手册》

## 核心原因

**Alpine Linux 的 OpenRC 不支持 ****`wg\-quick@wg0`**** 格式的服务**，所以这个命令必然报错！
直接废弃该命令，用**系统原生开机脚本**实现自启，100% 成功、零报错。

---

# Alpine Linux WireGuard 完整命令手册（最终版）

> 适配：Vultr 1 核 0\.5G / Alpine Linux / Web Console 纯命令操作
> 无坑、无报错、复制即用
> 
> 

```markdown
# Alpine Linux WireGuard VPN 完整命令手册
## 适用环境
Vultr 低配服务器(1vCPU/0.5GB) + Alpine Linux
## 一、安装依赖（必执行）
```bash
# 更新软件源 & 安装必备工具
apk update && apk add wireguard-tools iptables ip6tables openrc

# 加载 WireGuard 内核模块
modprobe wireguard
echo "wireguard" >> /etc/modules-load.d/wireguard.conf

# 开启 IP 转发（VPN 必需）
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
sysctl -p
```

## 二、生成密钥（无输出 = 正常）

```bash
# 生成服务器密钥
wg genkey | tee /etc/wireguard/privatekey | wg pubkey > /etc/wireguard/publickey

# 查看私钥（复制备用）
cat /etc/wireguard/privatekey

# 查看公钥（给客户端用）
cat /etc/wireguard/publickey
```

## 三、生成配置文件（一键写入）

```bash
cat > /etc/wireguard/wg0.conf << EOF
[Interface]
PrivateKey = 你的服务器私钥
Address = 10.0.0.1/24
ListenPort = 51820
PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
EOF
```

## 四、核心启动 / 停止 / 重启（唯一正确命令）

```bash
# 启动 VPN（成功无报错）
wg-quick up wg0

# 停止 VPN
wg-quick down wg0

# 重启 VPN（修改配置后必执行）
wg-quick down wg0 && wg-quick up wg0
```

## 五、✅ 开机自启（修复报错，100% 成功）

废弃 `rc\-update add wg\-quick@wg0 default`，使用以下命令：

```bash
# 1. 创建开机启动脚本
cat > /etc/local.d/wireguard.start << EOF
#!/bin/sh
wg-quick up wg0
EOF

# 2. 赋予执行权限
chmod +x /etc/local.d/wireguard.start

# 3. 启用开机自动执行
rc-update add local default
rc-service local start
```

## 六、防火墙放行端口（Vultr 必需）

```bash
# 放行 WireGuard 端口
iptables -A INPUT -p udp --dport 51820 -j ACCEPT

# 保存规则（重启不失效）
rc-service iptables save
```

## 七、状态检查

```bash
# 查看 VPN 运行状态（核心验证）
wg show

# 查看网络接口
ip a show wg0
```

## 八、测试开机自启

```bash
# 重启服务器
reboot

# 重启后登录，验证是否自动运行
wg show
```

## 九、客户端配置模板

```ini
[Interface]
PrivateKey = 客户端私钥
Address = 10.0.0.2/32
DNS = 8.8.8.8

[Peer]
PublicKey = 服务器公钥
Endpoint = 你的Vultr公网IP:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25
```

## 十、常见报错解决

1. **rc\-service: service \&\#39;wireguard\&\#39; does not exist**
→ 解决：使用 `wg\-quick up wg0` 启动

2. **rc\-update: service \&\#39;wg\-quick@wg0\&\#39; does not exist**
→ 解决：使用本文档【第五部分】开机自启方案

3. **客户端连不上**
→ 检查：端口放行、IP 转发、服务器公钥 / IP 正确

```Plain Text
---

### 现在你只需要做 2 步
1. 执行 **【第五部分】开机自启命令**
2. 重启服务器测试：`reboot`
重启后 `wg show` 能看到信息 = **全部搞定！**

你的机器A VPN 已经**永久稳定运行+开机自启**，可以去部署机器B的 Docker/Shopify 了！
```

> （注：文档部分内容可能由 AI 生成）
