# IPv6-only Alpine VPS 搭建 VPN

## 结论

- 推荐方案：`WireGuard`。
- 适用场景：Vultr Alpine Linux 服务器只有公网 IPv6，手机和电脑客户端通过导入 `.conf` 配置或扫描二维码即可使用。
- 关键限制：如果服务器只有 IPv6，客户端侧也必须能访问 IPv6；纯 IPv4 网络下无法直接连到这台服务器。
- 客户端：iOS、Android、macOS、Windows、Linux 均有官方 WireGuard 客户端。

## 网络限制

### IPv6-only 能做什么

- 手机流量网络通常支持 IPv6，连接成功率较高。
- 家庭宽带、公司网络是否支持 IPv6 取决于运营商和路由器配置。
- VPN 建立后，客户端可以通过服务器访问 IPv6 网络。

### IPv6-only 做不到什么

- 如果客户端当前网络没有 IPv6，无法连接到只有 IPv6 地址的 VPS。
- 如果想让客户端通过 VPN 访问 IPv4 网站，需要服务器本身具备 IPv4 出口，或额外配置 NAT64/代理/双栈中转。

### 可选增强

- 需要兼容纯 IPv4 客户端：购买双栈 VPS，或增加一台有 IPv4 的中转服务器。
- 需要访问 IPv4 网站：优先选择有 IPv4 出口的 VPS；IPv6-only 服务器不适合作为通用全局代理出口。

## 让 IPv6-only 服务器具备 IPv4 能力

### 方案对比

| 方案 | 能解决什么 | 推荐度 | 适用场景 |
| --- | --- | --- | --- |
| 新增一台有 IPv4 的中转 VPS，和当前服务器做 WireGuard 站点互联 | 客户端通过当前 VPN 访问 IPv4 网站；仍可用下载配置方式接入 | 最推荐 | 你已经有这台 IPv6-only VPS，不想迁移现有接入方式 |
| 直接换成双栈 VPS | 同时解决客户端接入和 IPv4 出口问题 | 更推荐但涉及迁移 | 新建环境，或当前业务不多 |
| 自建 NAT64/DNS64 | 让 IPv6 客户端访问部分 IPv4 网站 | 谨慎使用 | 仅做实验，能接受兼容性和维护成本 |

结论：

- 如果你要保留“手机/电脑下载 WireGuard 配置直接用”的体验，最稳方案是 `IPv6 入口机 + IPv4 中转机`。
- 这个方案能解决“连上 VPN 后访问 IPv4 网站”的问题，但不能解决“客户端所在网络完全没有 IPv6 时，无法连到入口机”的问题。
- 如果你还想兼容纯 IPv4 客户端接入，入口机本身也要有 IPv4，或者把入口机改成双栈。

### 方案 A：新增 IPv4 中转机

#### 拓扑

```text
手机/电脑 --WireGuard--> IPv6 入口机(Vultr Alpine)
                               |
                               | 站点互联 WireGuard
                               v
                         IPv4 中转机(任意 Linux)
                               |
                               v
                          公网 IPv4 网站
```

角色说明：

- `IPv6 入口机`：就是你现在这台 Vultr Alpine，用来给客户端发配置、接收客户端连接。
- `IPv4 中转机`：新增一台有公网 IPv4 的便宜 VPS，用来做 IPv4 出口 NAT。

建议地址规划：

- 客户端 VPN 网段：`10.66.0.0/24` 和 `fd00:10:10::/64`
- 入口机与中转机互联网段：`10.99.0.0/30`
- 入口机互联地址：`10.99.0.1/30`
- 中转机互联地址：`10.99.0.2/30`

#### 步骤 1：准备一台有 IPv4 的中转机

要求：

- 有公网 IPv4。
- Linux 系统即可，Ubuntu / Debian / Alpine 都行。
- 放行 `UDP 51821`，用于入口机和中转机之间的互联。

#### 步骤 2：在中转机安装 WireGuard 并开启转发

如果中转机是 Alpine：

```bash
apk update
apk add wireguard-tools iptables
cat >> /etc/sysctl.conf <<'EOF'
net.ipv4.ip_forward=1
EOF
sysctl -p
```

如果中转机是 Debian / Ubuntu：

```bash
apt update
apt install -y wireguard iptables
cat >> /etc/sysctl.conf <<'EOF'
net.ipv4.ip_forward=1
EOF
sysctl -p
```

生成中转机密钥：

```bash
mkdir -p /etc/wireguard
cd /etc/wireguard
umask 077
wg genkey | tee relay_private.key | wg pubkey > relay_public.key
```

#### 步骤 3：在入口机生成互联密钥

在现有的 Alpine 入口机执行：

```bash
cd /etc/wireguard
umask 077
wg genkey | tee uplink_private.key | wg pubkey > uplink_public.key
```

#### 步骤 4：配置中转机互联隧道

在中转机创建 `/etc/wireguard/wg-relay.conf`：

```ini
[Interface]
Address = 10.99.0.2/30
ListenPort = 51821
PrivateKey = RELAY_PRIVATE_KEY

[Peer]
PublicKey = UPLINK_PUBLIC_KEY
AllowedIPs = 10.99.0.1/32, 10.66.0.0/24
```

把 `RELAY_PRIVATE_KEY` 和 `UPLINK_PUBLIC_KEY` 替换成真实值。

启动：

```bash
wg-quick up wg-relay
wg
```

#### 步骤 5：在中转机配置 IPv4 出口 NAT

假设中转机公网网卡是 `eth0`：

```bash
iptables -t nat -A POSTROUTING -s 10.66.0.0/24 -o eth0 -j MASQUERADE
iptables -A FORWARD -i wg-relay -j ACCEPT
iptables -A FORWARD -o wg-relay -m state --state ESTABLISHED,RELATED -j ACCEPT
```

保存规则：

Alpine：

```bash
apk add iptables
rc-update add iptables
/etc/init.d/iptables save
```

Debian / Ubuntu：

```bash
apt install -y iptables-persistent
netfilter-persistent save
```

#### 步骤 6：在入口机配置到中转机的互联隧道

在入口机创建 `/etc/wireguard/wg-uplink.conf`：

```ini
[Interface]
Address = 10.99.0.1/30
ListenPort = 51821
PrivateKey = UPLINK_PRIVATE_KEY

[Peer]
PublicKey = RELAY_PUBLIC_KEY
Endpoint = RELAY_SERVER_IPV4:51821
AllowedIPs = 10.99.0.2/32, 0.0.0.0/0
PersistentKeepalive = 25
```

把 `UPLINK_PRIVATE_KEY`、`RELAY_PUBLIC_KEY`、`RELAY_SERVER_IPV4` 替换成真实值。

启动：

```bash
wg-quick up wg-uplink
wg
```

说明：

- 这里 `AllowedIPs = 0.0.0.0/0` 的意思不是让入口机所有业务都强制走中转，而是让入口机知道“IPv4 目标可以通过这个 peer 到达”。
- 如果你担心影响入口机自身默认路由，可以改成策略路由，或者只把客户端源地址 `10.66.0.0/24` 的流量转给中转机。

#### 步骤 7：修改入口机的客户端主隧道

把原先只有 IPv6 的主隧道扩成双栈，编辑入口机的 `/etc/wireguard/wg0.conf`：

```ini
[Interface]
Address = fd00:10:10::1/64, 10.66.0.1/24
ListenPort = 51820
PrivateKey = SERVER_PRIVATE_KEY

[Peer]
PublicKey = CLIENT1_PUBLIC_KEY
AllowedIPs = fd00:10:10::2/128, 10.66.0.2/32
```

客户端地址也从单栈改成双栈：

```ini
[Interface]
PrivateKey = CLIENT1_PRIVATE_KEY
Address = fd00:10:10::2/128, 10.66.0.2/32
DNS = 1.1.1.1, 2606:4700:4700::1111

[Peer]
PublicKey = SERVER_PUBLIC_KEY
Endpoint = [SERVER_PUBLIC_IPV6]:51820
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25
```

说明：

- 现在客户端的 IPv4 流量会先进入入口机，再从入口机走到中转机，最后由中转机做 IPv4 NAT 出站。
- 客户端仍然只需要导入一个 WireGuard 配置文件。

#### 步骤 8：在入口机加转发表和 NAT

入口机需要知道客户端的 IPv4 流量应该如何进入 `wg-uplink`。

最简单做法：

```bash
iptables -A FORWARD -i wg0 -j ACCEPT
iptables -A FORWARD -o wg0 -m state --state ESTABLISHED,RELATED -j ACCEPT
ip route add 0.0.0.0/0 dev wg-uplink table 100
ip rule add from 10.66.0.0/24 table 100
```

这样只有来自客户端 VPN 网段 `10.66.0.0/24` 的 IPv4 流量才走中转机，不影响入口机自己的默认路由。

如果重启后要持久化：

- Alpine 可把路由和规则写入 OpenRC 本地启动脚本。
- 也可以在 `wg-uplink` 启动后用自定义脚本追加。

#### 步骤 9：验证

客户端连上后测试：

```bash
curl -4 https://ifconfig.co
curl -6 https://ifconfig.co
```

预期：

- `curl -4` 返回中转机公网 IPv4。
- `curl -6` 返回入口机或当前 IPv6 出口地址。

入口机查看：

```bash
wg
ip rule
ip route show table 100
```

中转机查看：

```bash
wg
iptables -t nat -S
```

#### 步骤 10：多客户端扩展

每加一个客户端，要在入口机的 `wg0.conf` 中给它分配一对双栈地址，例如：

- `fd00:10:10::3/128`
- `10.66.0.3/32`

中转机一般不用为每个客户端单独加 peer，只要它能收到 `10.66.0.0/24` 的流量并做 NAT 即可。

### 方案 B：直接换双栈 VPS

#### 拓扑

```text
手机/电脑 --WireGuard(IPv4/IPv6)--> 双栈 VPS(公网 IPv4 + IPv6)
                                        |
                           +------------+------------+
                           |                         |
                           v                         v
                      IPv4 公网资源               IPv6 公网资源
```

说明：

- 这是架构最直接的一种方案。
- 客户端可以在 IPv4 网络或 IPv6 网络下接入，前提是 `Endpoint` 配置对应可达地址。
- 服务器同时承担 VPN 入口和 IPv4/IPv6 出口。

步骤最短：

1. 新买一台同时有 IPv4 和 IPv6 的 VPS。
2. 按本文的 WireGuard 流程部署。
3. 客户端配置中把 `Endpoint` 改为新服务器地址。
4. 客户端 `AllowedIPs` 可直接写 `0.0.0.0/0, ::/0`。

优点：

- 架构最简单。
- 同时解决 IPv4 出口和纯 IPv4 客户端接入问题。
- 后续维护成本最低。

缺点：

- 需要迁移现有服务端。

### 方案 C：自建 NAT64/DNS64

#### 拓扑

```text
手机/电脑 --WireGuard(IPv6)--> IPv6-only Alpine VPS
                                   |
                    +--------------+--------------+
                    |                             |
                    v                             v
                DNS64(BIND)                  NAT64(Jool)
                    |                             |
                    +--------------+--------------+
                                   |
                         合成 AAAA / 协议转换
                                   |
                                   v
                              IPv4 公网资源
```

说明：

- 客户端仍然只通过 IPv6 接入服务端。
- DNS64 负责把只有 `A` 记录的域名合成为 `AAAA`。
- NAT64 负责把客户端访问的合成 IPv6 地址转换为真实 IPv4 目标。

这个方案只适合“让 IPv6 客户端访问部分 IPv4 网站”，不等于真正给服务器或客户端增加原生 IPv4。

特点：

- 客户端仍然只能通过 IPv6 连到你的入口机。
- 依赖 DNS64 把 IPv4 域名合成 AAAA，再由 NAT64 转换。
- 对某些 App、硬编码 IPv4、非标准 DNS 行为兼容性一般。

不建议作为首选，除非你明确要做实验性质环境。

#### 原理

流程如下：

1. 客户端发起 `AAAA` 查询。
2. 如果目标域名本来就有 `AAAA`，客户端直接走原生 IPv6。
3. 如果目标域名只有 `A` 记录，`DNS64` 会把 IPv4 地址合成到一个特殊 IPv6 前缀中，常见是 `64:ff9b::/96`。
4. 客户端访问这个“合成出来的 IPv6 地址”。
5. 服务器上的 `NAT64` 组件再把这个 IPv6 目标还原成真实 IPv4，并代为访问公网 IPv4。

示例：

- 目标网站只有 IPv4：`198.51.100.10`
- DNS64 合成后返回：`64:ff9b::c633:640a`
- 客户端实际连接的是这个 IPv6 地址
- NAT64 再把它翻译回 `198.51.100.10`

#### 适用边界

能解决：

- WireGuard 客户端已经通过 IPv6 接入到你的入口机。
- 客户端访问的是“通过域名发起访问”的 IPv4 网站或服务。
- 你只想补“IPv6-only 网络访问 IPv4 内容”的能力。

不能解决：

- 客户端所在网络完全没有 IPv6，无法连接你的 IPv6-only VPS。
- App 或脚本直接写死 IPv4 地址，例如 `http://1.2.3.4:8080`。
- 某些依赖特殊 DNSSEC 行为、非标准 DNS、内嵌 DoH/DoT 的应用。
- 需要真正获得公网原生 IPv4 的场景。

#### 推荐实现

Alpine 上更适合写成：

- `WireGuard` 负责客户端接入。
- `BIND` 负责 `DNS64`。
- `Jool` 负责 `NAT64`。

说明：

- `Jool` 是 Linux 上常见的 NAT64 实现。
- Alpine 上更关键的是内核模块要和当前内核匹配，常见是 `jool-modules-lts` 或 `jool-modules-virt`。
- 如果你的 VPS 镜像内核和 Alpine 仓库模块不匹配，方案 C 的落地复杂度会明显升高，此时更建议走方案 A 或 B。

#### 步骤 1：准备前提

默认约定：

- WireGuard 网段：`fd00:10:10::/64`
- 服务端 WG 地址：`fd00:10:10::1`
- DNS64/NAT64 前缀：`64:ff9b::/96`
- 服务器具备公网 IPv6，并且客户端已经能通过 WireGuard 连上来

先确认当前内核：

```bash
uname -a
apk search jool
```

如果你使用 `linux-lts`，通常配套 `jool-modules-lts`。

如果你使用 `linux-virt`，通常优先找 `jool-modules-virt`。

#### 步骤 2：安装组件

在 Alpine 上安装：

```bash
apk update
apk add wireguard-tools iptables ip6tables bind bind-openrc jool-tools
```

然后按你的内核类型安装对应模块包，例如：

```bash
apk add linux-lts jool-modules-lts
```

或：

```bash
apk add jool-modules-virt
```

如果安装了新的内核，通常需要重启后再继续。

#### 步骤 3：开启转发

```bash
cat >> /etc/sysctl.conf <<'EOF'
net.ipv6.conf.all.forwarding=1
net.ipv4.ip_forward=1
EOF

sysctl -p
```

#### 步骤 4：配置 DNS64

编辑 `/etc/bind/named.conf` 或 Alpine 实际使用的主配置文件，增加最小递归解析配置：

```conf
options {
  directory "/var/bind";
  listen-on { any; };
  listen-on-v6 { any; };
  allow-query { any; };
  recursion yes;

  forwarders {
    1.1.1.1;
    8.8.8.8;
  };

  dns64 64:ff9b::/96 {
    clients { any; };
    recursive-only yes;
  };
};
```

说明：

- 这里 `dns64 64:ff9b::/96` 表示把只有 `A` 记录的域名合成为该前缀下的 `AAAA`。
- `recursive-only yes` 表示只对递归查询做合成，适合本机作为客户端解析器的场景。
- 如果遇到 DNSSEC 相关站点异常，可以额外评估 `break-dnssec yes;`，但不建议默认开启。

启动并设置自启：

```bash
rc-service named restart
rc-update add named default
```

#### 步骤 5：加载 Jool

先加载模块：

```bash
modprobe jool
lsmod | grep jool
```

创建一个最小 NAT64 实例：

```bash
jool instance add nat64 --netfilter --pool6 64:ff9b::/96
```

给 NAT64 分配 IPv4 出口地址池。

如果服务器只有一个公网 IPv4，这里通常填一个地址加端口范围；但你的服务器是 IPv6-only，所以这里有一个关键前提：

- 方案 C 只有在服务器侧某种方式上“能访问 IPv4 网络”时才有意义。
- 这通常意味着上游运营商、宿主网络、额外隧道或外部转换链路已经提供了 IPv4 出口。
- 如果服务器完全没有任何 IPv4 可达性，仅有公网 IPv6，那么 NAT64 也无法把请求真正发到 IPv4 互联网。

如果服务器已经具备某个本地 IPv4 出口，例如 `192.0.2.10`，示意命令如下：

```bash
jool pool4 add 192.0.2.10 61001-65535 --tcp
jool pool4 add 192.0.2.10 61001-65535 --udp
jool pool4 add 192.0.2.10 61001-65535 --icmp
```

#### 步骤 6：确保 IPv4 出口能做 NAT44

很多部署里，NAT64 后面还要配合一次传统 IPv4 NAT。

如果本机已有可出站的 IPv4 网卡 `eth0`：

```bash
iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
iptables -A FORWARD -j ACCEPT
```

这一步的作用是：

- Jool 先把 IPv6 目标翻译成 IPv4。
- 再由 Linux 的 IPv4 NAT 把内部 IPv4 会话伪装成服务器可出网的 IPv4。

#### 步骤 7：让客户端使用你的 DNS64

修改 WireGuard 客户端配置，把 DNS 指向服务端的 WG 地址：

```ini
[Interface]
PrivateKey = CLIENT_PRIVATE_KEY
Address = fd00:10:10::2/128
DNS = fd00:10:10::1

[Peer]
PublicKey = SERVER_PUBLIC_KEY
Endpoint = [SERVER_PUBLIC_IPV6]:51820
AllowedIPs = ::/0
PersistentKeepalive = 25
```

说明：

- 方案 C 不要求客户端拿到 IPv4 地址。
- 客户端继续保持 IPv6-only 即可。
- 关键是 DNS 必须使用你的 `DNS64`，否则域名不会被合成。

#### 步骤 8：验证 DNS64 是否生效

客户端或服务端执行：

```bash
dig aaaa ipv4only.arpa @fd00:10:10::1
```

预期：

- 能看到落在 `64:ff9b::/96` 前缀下的合成 AAAA。

再测试一个只有 IPv4 的站点域名：

```bash
dig aaaa example.com @fd00:10:10::1
```

如果该域名本来就有原生 `AAAA`，会优先返回原生 IPv6，不一定走 NAT64。

#### 步骤 9：验证 NAT64 是否工作

查看 Jool 状态：

```bash
jool instance display
jool stats display
jool pool4 display --tcp
```

连通性测试：

```bash
curl -6 http://ipv4only.arpa
```

或者在解析出合成地址后直接测试访问。

如果访问失败，排查顺序：

1. `dig aaaa 域名 @fd00:10:10::1` 是否拿到了 `64:ff9b::/96` 合成地址。
2. `modprobe jool` 后模块是否真的加载成功。
3. `jool instance display` 是否能看到 `nat64` 实例。
4. 服务器是否真的具备某种 IPv4 出口能力。
5. `iptables -t nat -S` 是否已存在 `POSTROUTING MASQUERADE`。
6. 客户端是否真的在使用 `fd00:10:10::1` 作为 DNS。

#### 步骤 10：持久化

Jool 实例和 NAT 规则需要在重启后恢复。

最简单的做法：

- 把 `modprobe jool`
- `jool instance add ...`
- `jool pool4 add ...`
- `iptables -t nat -A POSTROUTING ...`

写进本地启动脚本，例如 OpenRC 自定义服务脚本。

`BIND` 服务则通过：

```bash
rc-update add named default
```

#### 什么时候不该选方案 C

以下情况更建议回到方案 A 或 B：

- 你要兼容纯 IPv4 网络下的客户端接入。
- 你需要“所有 App 都像原生 IPv4 一样工作”。
- 你不想维护 DNS、内核模块、NAT64 三层组件。
- 你的 Alpine 云主机内核和 `jool` 模块包不匹配。

#### 方案 C 的现实结论

方案 C 本质上是“给 IPv6-only 客户端补一个访问 IPv4 域名服务的过渡能力”，不是完整替代双栈。

如果你只是做实验、学习 IPv6 过渡技术，方案 C 很有价值。

如果你要长期稳定自用，优先级通常还是：

1. 双栈 VPS
2. IPv6 入口机 + IPv4 中转机
3. NAT64/DNS64

## 服务端安装

### 基础拓扑

```text
手机/电脑 --WireGuard(IPv6)--> Vultr Alpine VPS(公网 IPv6)
                                   |
                                   v
                              IPv6 公网资源
```

说明：

- 这是最基础的单机方案。
- 客户端和服务端都需要具备 IPv6 连通性。
- 该拓扑默认只适合访问 IPv6 资源，不自动具备 IPv4 出口。

### 1. 登录服务器

```bash
ssh root@[你的服务器IPv6]
```

如果本地 shell 对 IPv6 地址解析异常，可以使用：

```bash
ssh root@'你的服务器IPv6'
```

### 2. 安装 WireGuard

```bash
apk update
apk add wireguard-tools iptables ip6tables qrencode
```

开启 IPv6 转发：

```bash
cat >> /etc/sysctl.conf <<'EOF'
net.ipv6.conf.all.forwarding=1
net.ipv4.ip_forward=1
EOF

sysctl -p
```

### 3. 生成密钥

```bash
mkdir -p /etc/wireguard
cd /etc/wireguard
umask 077

wg genkey | tee server_private.key | wg pubkey > server_public.key
wg genkey | tee client1_private.key | wg pubkey > client1_public.key
```

查看密钥：

```bash
cat server_private.key server_public.key client1_private.key client1_public.key
```

### 4. 创建服务端配置

假设：

- WireGuard 网段：`fd00:10:10::/64`
- 服务端 VPN 地址：`fd00:10:10::1/64`
- 客户端 VPN 地址：`fd00:10:10::2/128`
- 监听端口：`51820/udp`
- VPS 公网 IPv6 网卡：通常是 `eth0`

创建 `/etc/wireguard/wg0.conf`：

```bash
cat > /etc/wireguard/wg0.conf <<'EOF'
[Interface]
Address = fd00:10:10::1/64
ListenPort = 51820
PrivateKey = 替换为_server_private.key_内容

[Peer]
PublicKey = 替换为_client1_public.key_内容
AllowedIPs = fd00:10:10::2/128
EOF
```

替换配置中的密钥：

```bash
SERVER_PRIVATE_KEY=$(cat /etc/wireguard/server_private.key)
CLIENT_PUBLIC_KEY=$(cat /etc/wireguard/client1_public.key)

sed -i "s#替换为_server_private.key_内容#$SERVER_PRIVATE_KEY#g" /etc/wireguard/wg0.conf
sed -i "s#替换为_client1_public.key_内容#$CLIENT_PUBLIC_KEY#g" /etc/wireguard/wg0.conf
```

### 5. 放行端口

Vultr 控制台安全组和服务器防火墙都要放行 `UDP 51820`。

如果服务器本机使用 `ip6tables`：

```bash
ip6tables -A INPUT -p udp --dport 51820 -j ACCEPT
ip6tables -A FORWARD -i wg0 -j ACCEPT
ip6tables -A FORWARD -o wg0 -j ACCEPT
```

Alpine 可安装并保存规则：

```bash
apk add ip6tables
rc-update add ip6tables
/etc/init.d/ip6tables save
```

### 6. 启动 WireGuard

```bash
wg-quick up wg0
wg
```

设置开机自启：

```bash
rc-update add wg-quick@wg0 default
```

如果 `wg-quick@wg0` 服务不存在，可以用本地服务脚本：

```bash
cat > /etc/init.d/wg0 <<'EOF'
#!/sbin/openrc-run

description="WireGuard wg0"

depend() {
  need net
}

start() {
  ebegin "Starting WireGuard wg0"
  wg-quick up wg0
  eend $?
}

stop() {
  ebegin "Stopping WireGuard wg0"
  wg-quick down wg0
  eend $?
}
EOF

chmod +x /etc/init.d/wg0
rc-update add wg0 default
```

## 客户端配置

### 1. 创建客户端配置

将 `你的服务器公网IPv6` 替换成 Vultr 分配的公网 IPv6。

```bash
SERVER_PUBLIC_KEY=$(cat /etc/wireguard/server_public.key)
CLIENT_PRIVATE_KEY=$(cat /etc/wireguard/client1_private.key)

cat > /etc/wireguard/client1.conf <<EOF
[Interface]
PrivateKey = $CLIENT_PRIVATE_KEY
Address = fd00:10:10::2/128
DNS = 2606:4700:4700::1111, 2001:4860:4860::8888

[Peer]
PublicKey = $SERVER_PUBLIC_KEY
Endpoint = [你的服务器公网IPv6]:51820
AllowedIPs = ::/0
PersistentKeepalive = 25
EOF
```

说明：

- `AllowedIPs = ::/0` 表示客户端的 IPv6 流量走 VPN。
- 如果服务器没有 IPv4 出口，不要写 `0.0.0.0/0`，否则 IPv4 流量也被路由进 VPN 但无法正常出站。
- `PersistentKeepalive = 25` 适合手机网络、NAT 环境和网络切换场景。

### 2. 手机导入

服务端生成二维码：

```bash
qrencode -t ansiutf8 < /etc/wireguard/client1.conf
```

手机安装 WireGuard App：

- iOS：App Store 搜索 `WireGuard`。
- Android：Google Play 或应用商店搜索 `WireGuard`。
- 导入方式：`Add Tunnel` -> `Create from QR code`。

### 3. 电脑导入

从服务器下载配置：

```bash
scp root@[你的服务器IPv6]:/etc/wireguard/client1.conf ./client1.conf
```

然后在 WireGuard 客户端中导入 `client1.conf`。

注意：`client1.conf` 包含客户端私钥，不要发给别人。

## 新增更多客户端

每个设备单独生成一组密钥和一个独立地址。

示例：新增 `client2`，地址使用 `fd00:10:10::3/128`。

```bash
cd /etc/wireguard
umask 077
wg genkey | tee client2_private.key | wg pubkey > client2_public.key

cat >> /etc/wireguard/wg0.conf <<EOF

[Peer]
PublicKey = $(cat /etc/wireguard/client2_public.key)
AllowedIPs = fd00:10:10::3/128
EOF

wg syncconf wg0 <(wg-quick strip wg0)
```

生成客户端配置：

```bash
cat > /etc/wireguard/client2.conf <<EOF
[Interface]
PrivateKey = $(cat /etc/wireguard/client2_private.key)
Address = fd00:10:10::3/128
DNS = 2606:4700:4700::1111, 2001:4860:4860::8888

[Peer]
PublicKey = $(cat /etc/wireguard/server_public.key)
Endpoint = [你的服务器公网IPv6]:51820
AllowedIPs = ::/0
PersistentKeepalive = 25
EOF
```

## 验证

### 服务端

```bash
wg
ip -6 addr show wg0
ss -ulnp | grep 51820
```

### 客户端

连接后访问：

```bash
curl -6 https://ifconfig.co
```

预期返回服务器或 VPN 出口的 IPv6。

### 连不上的排查顺序

1. 客户端当前网络是否支持 IPv6。
2. Vultr 防火墙是否放行 `UDP 51820` 的 IPv6 入站。
3. Alpine 本机 `ip6tables` 是否放行 `51820/udp`。
4. 客户端 `Endpoint` 是否写成 `[IPv6]:51820` 格式。
5. 服务端 `wg` 是否能看到 `latest handshake`。
6. 手机是否开启了省电限制或后台网络限制。

## 访问前预判

### 能不能提前判断

可以，但只能做“高概率预判”，不能 `100%` 保证。

原因：

- 服务器可以提前检查目标域名是否有 `AAAA` 记录。
- 服务器可以直接用自己的 IPv6 或 IPv4 出口测试连通性。
- 但客户端真实访问时，还会受浏览器、App、加密 DNS、地区策略、风控和子资源域名影响。

### 预判逻辑

#### 纯 IPv6-only VPN

适用于当前文档的基础单机方案。

判断规则：

1. 目标域名有 `AAAA` 记录。
2. 服务器执行 `curl -6` 能连通。
3. 则客户端连上该 VPN 后，大概率可访问。

反之：

- 只有 `A`、没有 `AAAA`，则纯 IPv6-only VPN 下通常不可直接访问。
- 有 `AAAA` 但 `curl -6` 失败，说明仍可能被网络策略、地区、证书或子资源问题影响。

#### 方案 A / 方案 B

适用于“有 IPv4 出口”的环境。

判断规则：

1. 如果目标有 `AAAA` 且 `curl -6` 成功，则可走 IPv6。
2. 如果目标只有 `A`，但 `curl -4` 成功，则也可访问。
3. 如果 `curl -4` 和 `curl -6` 都失败，则客户端大概率也访问不了。

#### 方案 C

适用于 `DNS64 + NAT64`。

除了看 `AAAA/A` 记录外，还要检查：

1. DNS64 是否能把只有 `A` 的域名合成为 `AAAA`。
2. NAT64 是否具备可用的 IPv4 出口。
3. 客户端是否真的使用了你下发的 VPN DNS。

### 最常用的人工检查命令

查询 DNS：

```bash
dig aaaa example.com
dig a example.com
```

测试 IPv6：

```bash
curl -6 -I https://example.com
```

测试 IPv4：

```bash
curl -4 -I https://example.com
```

测试 DNS64：

```bash
dig aaaa ipv4only.arpa @fd00:10:10::1
```

结果理解：

- `有 AAAA + curl -6 成功`：纯 IPv6-only VPN 下大概率可访问。
- `只有 A + curl -4 成功`：需要方案 A 或 B，纯 IPv6-only 不够。
- `只有 A + DNS64 合成成功 + NAT64 可用`：方案 C 下有机会访问。
- `主域名能通` 不等于 `页面完整可用`，因为页面里的脚本、图片、接口可能走其他域名。

### 可执行检测脚本

下面这段脚本可以在服务器上直接运行，用于预判某个目标域名在当前 VPS 方案下是否大概率可访问。

保存为 `/root/check-site.sh`：

```bash
#!/bin/sh

set -eu

DOMAIN="${1:-}"
MODE="${2:-ipv6-only}"
DNS64_SERVER="${3:-}"

if [ -z "$DOMAIN" ]; then
  echo "用法: sh check-site.sh <domain> [ipv6-only|dualstack|nat64] [dns64_server]"
  exit 1
fi

has_aaaa=0
has_a=0
v6_ok=0
v4_ok=0
dns64_ok=0

if command -v dig >/dev/null 2>&1; then
  if dig +short AAAA "$DOMAIN" | grep -q .; then
    has_aaaa=1
  fi

  if dig +short A "$DOMAIN" | grep -q .; then
    has_a=1
  fi
else
  echo "错误: 未安装 dig，请先安装 bind-tools 或 drill"
  exit 1
fi

if curl -6 -I --connect-timeout 8 --max-time 15 "https://$DOMAIN" >/dev/null 2>&1; then
  v6_ok=1
fi

if curl -4 -I --connect-timeout 8 --max-time 15 "https://$DOMAIN" >/dev/null 2>&1; then
  v4_ok=1
fi

if [ "$MODE" = "nat64" ] && [ -n "$DNS64_SERVER" ]; then
  if dig +short AAAA "$DOMAIN" @"$DNS64_SERVER" | grep -q .; then
    dns64_ok=1
  fi
fi

echo "domain=$DOMAIN"
echo "mode=$MODE"
echo "has_aaaa=$has_aaaa"
echo "has_a=$has_a"
echo "curl_v6_ok=$v6_ok"
echo "curl_v4_ok=$v4_ok"
if [ "$MODE" = "nat64" ]; then
  echo "dns64_ok=$dns64_ok"
fi

case "$MODE" in
  ipv6-only)
    if [ "$has_aaaa" -eq 1 ] && [ "$v6_ok" -eq 1 ]; then
      echo "结论: 大概率可访问"
    elif [ "$has_aaaa" -eq 0 ] && [ "$has_a" -eq 1 ]; then
      echo "结论: 纯 IPv6-only VPN 下大概率不可直接访问"
    else
      echo "结论: 不确定，需要人工进一步验证"
    fi
    ;;
  dualstack)
    if [ "$v6_ok" -eq 1 ] || [ "$v4_ok" -eq 1 ]; then
      echo "结论: 大概率可访问"
    else
      echo "结论: 大概率不可访问"
    fi
    ;;
  nat64)
    if [ "$has_aaaa" -eq 1 ] && [ "$v6_ok" -eq 1 ]; then
      echo "结论: 大概率可访问，且可能直接走原生 IPv6"
    elif [ "$has_a" -eq 1 ] && [ "$dns64_ok" -eq 1 ]; then
      echo "结论: 依赖 DNS64/NAT64，理论上可访问，但仍需实测"
    else
      echo "结论: 大概率不可访问或 NAT64 条件不足"
    fi
    ;;
  *)
    echo "错误: mode 仅支持 ipv6-only / dualstack / nat64"
    exit 1
    ;;
esac
```

赋予执行权限：

```bash
chmod +x /root/check-site.sh
```

### 使用示例

纯 IPv6-only 预判：

```bash
sh /root/check-site.sh www.bing.com ipv6-only
sh /root/check-site.sh www.google.com ipv6-only
sh /root/check-site.sh example.com ipv6-only
```

双栈或中转方案预判：

```bash
sh /root/check-site.sh www.bing.com dualstack
sh /root/check-site.sh www.google.com dualstack
```

NAT64 预判：

```bash
sh /root/check-site.sh ipv4only.arpa nat64 fd00:10:10::1
sh /root/check-site.sh example.com nat64 fd00:10:10::1
```

### 脚本的局限

这个脚本只能做“站点入口可达性预判”，无法完全模拟真实客户端体验。

仍然可能出现这些情况：

- 主域名可以访问，但页面里的子资源域名不能访问。
- 浏览器或 App 使用自己的 `DoH/DoT`，绕过 VPN DNS。
- App 直接连接写死的 IPv4 地址。
- 网站按地区、ASN、风控规则返回不同结果。
- 某些网站禁止 `HEAD` 请求，导致 `curl -I` 的结果和浏览器不完全一致。

因此更稳的做法是：

1. 先用脚本预判。
2. 再挑关键网站用真实客户端导入配置实测。
3. 如果你关注的是 App，不只测网页主域名，还要测 API 域名、静态资源域名和登录跳转域名。

## 常见问题

### 为什么连上后打不开 IPv4 网站

因为 VPS 是 IPv6-only，没有 IPv4 出口。WireGuard 只是隧道，不会凭空提供 IPv4 网络。

解决方式：

- 最推荐：换成双栈 VPS。
- 可用方案：使用具备 IPv4 出口的代理服务作为上游。
- 复杂方案：自建 NAT64/DNS64，但仍依赖服务器或上游具备 IPv4 转换能力。

### 是否需要 OpenVPN

不推荐优先使用 OpenVPN。

原因：

- WireGuard 配置更短，手机扫码更方便。
- 性能更好，资源占用更低。
- Alpine 上部署和维护更简单。

### 配置文件能不能多人共用

不建议。

每个设备应使用独立客户端配置，方便单独吊销、限流和排查。

## 最小可用配置模板

服务端 `/etc/wireguard/wg0.conf`：

```ini
[Interface]
Address = fd00:10:10::1/64
ListenPort = 51820
PrivateKey = SERVER_PRIVATE_KEY

[Peer]
PublicKey = CLIENT_PUBLIC_KEY
AllowedIPs = fd00:10:10::2/128
```

客户端 `client1.conf`：

```ini
[Interface]
PrivateKey = CLIENT_PRIVATE_KEY
Address = fd00:10:10::2/128
DNS = 2606:4700:4700::1111, 2001:4860:4860::8888

[Peer]
PublicKey = SERVER_PUBLIC_KEY
Endpoint = [SERVER_PUBLIC_IPV6]:51820
AllowedIPs = ::/0
PersistentKeepalive = 25
```
