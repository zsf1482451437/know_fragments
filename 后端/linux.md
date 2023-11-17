# 角色管理



# 网络

## 查看主机ip

Windows 系统：

1. 打开命令提示符（Command Prompt）或 PowerShell。

2. 运行以下命令：

   ```
   ipconfig
   ```

   这将显示主机的网络配置信息，包括 IP 地址、子网掩码、默认网关等。在输出中找到 "IPv4 地址"，即可查看主机的 IP 地址。

Linux 系统：

1. 打开终端。

2. 运行以下命令之一：

   - 对于使用 ifconfig 命令的旧版 Linux 发行版：

     ```
     ifconfig
     ```

   - 对于使用 ip 命令的较新 Linux 发行版：

     ```
     ip addr show
     ```

   这将显示主机的网络接口信息，包括 IP 地址、子网掩码、广播地址等。在输出中找到与你的网络接口相关的部分，即可查看主机的 IP 地址。

请注意，在 Linux 中，你可能需要以管理员权限（使用 sudo 命令）运行上述命令才能查看完整的网络信息。

## 查看ip地址

```
ipconfig | findstr "IPv4"
```



# 进程

## 查看端口进程

1.netstat

```bash
netstat -tuln | grep 7777
```

这将显示所有正在监听（LISTEN）该端口的进程以及相关的详细信息。

- `-t`：只显示 TCP 协议相关的连接信息。
- `-u`：只显示 UDP 协议相关的连接信息。
- `-l`：只显示正在监听（LISTEN）的连接信息。
- `-n`：以数字形式显示 IP 地址和端口号，而不进行反向解析。
- `-a`：显示所有连接，包括正在监听（LISTEN）和已建立的连接。
- `-p`：显示与连接关联的进程/程序的PID和名称。
- `-s`：显示统计信息，如接收和发送的数据包数量。
- `-r`：显示路由表信息。
- `-c`：连续输出，持续显示连接信息。

**例子**

执行 `netstat -aln | grep 7777`

输出

```bash
tcp  0 0 0.0.0.0:7777 0.0.0.0:* LISTEN
tcp6 0 0 :::7777      :::*      LISTEN
```

输出结果说明了以下情况：

1. 第一行输出显示了一个 TCP 连接，它正在监听（LISTEN）0.0.0.0:7777 这个地址。这表示该主机上的所有**网络接口**都可以通过 **TCP 协议**连接到端口 7777。IP 地址 0.0.0.0 是一个通配符，表示所有可用的网络接口。
2. 第二行输出显示了一个 **TCP6** 连接，它也在监听（LISTEN）端口 7777。`:::` 是 IPv6 的通配符地址，表示所有可用的 IPv6 网络接口。

综上所述，这两行输出表明有两个不同的监听连接，一个是通过 IPv4（tcp） 监听 0.0.0.0:7777，另一个是通过 IPv6（tcp6） 监听 :::7777。这意味着有一个正在运行的进程在这两个地址上监听 7777 端口，等待来自**其他计算机**的连接。

2.lsof

```bash
lsof -i :7777
```

这将列出正在使用该指定端口的进程信息，包括进程ID（PID）和进程名称。

3.ss  需要安装 `iproute2` 包

```bash
ss -tuln | grep 7777
```

## 查看某个进程

```bash
ps -ef | grep nginx
```

## 终止进程

```bash
sudo kill -s TERM 进程号
```

以[超级用户]权限向进程ID为14391的进程发送[终止信号]，请求该进程正常退出。

# 文件

## 查看文件或目录路径

```bash
find / -name <文件或目录名称>
```



# 日志

## 查看命令日志

```bash
history | grep 关键词
```



# bash

## 案例

**构建镜像和pull到远程仓库**

```bash
#!/bin/bash

push_image() {
  # 获取参数
  registry="$1"
  repository="$2"
  password="$3"

  # 获取当前时间戳
  timestamp=$(date '+%Y%m%d%H%M%S')

  # 构建 Docker 镜像
  docker build -t "$registry/$repository:$timestamp" .
  if [ $? -eq 0 ]; then
    echo "Docker 镜像构建成功！"
  else
    echo "Docker 镜像构建失败！"
    exit 1
  fi

  # 登录到 Harbor 仓库
  echo "$password" | docker login -u admin --password-stdin "$registry"
  if [ $? -eq 0 ]; then
    echo "登录 Harbor 仓库成功！"
  else
    echo "登录 Harbor 仓库失败！"
    exit 1
  fi

  # 推送镜像到 Harbor 仓库
  docker push "$registry/$repository:$timestamp"
  if [ $? -eq 0 ]; then
    echo "镜像推送成功！"
  else
    echo "镜像推送失败！"
    exit 1
  fi
}

# 获取用户输入
read -p "请输入 Harbor 仓库地址： " registry
read -p "请输入镜像仓库名称： " repository
read -p "请输入登录密码： " password

echo # 换行

# 调用函数，并传递用户输入的参数
push_image "$registry" "$repository" "$password"

```



# 疑难杂症



