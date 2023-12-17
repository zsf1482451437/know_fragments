- 检查某个进程
- 查看某个端口使用情况
- nginx操作
- 以管理员方式运行终端

# 检查某个进程

**linux**

```bash
ps -ef | grep nginx
```

 -e：显示所有进程，包括没有控制终端的进程

-f：使用完整的格式显示进程信息，包括进程的 UID、PID、PPID、CPU 占用率、内存占用量、启动时间、进程命令等。)
**window**

```bash
tasklist | findstr "nginx"
```

# 查看某个端口使用情况

**linux**

```bash
netstat -tunlp | grep 8080
```

 -t 参数表示只显示 TCP 协议的连接

-u 参数表示只显示 UDP 协议的连接

-n 参数表示以数字形式显示端口号和 IP 地址

-l 参数表示只显示监听状态的连接，-p 参数表示显示进程 ID
**linux**

```bash
lsof -i :8080 
```

-i 参数表示只显示网络连接信息

-p 参数表示显示进程 ID
**window**

```bash
netstat -ano | findstr "8080" 
```

-a 参数表示显示所有的连接和监听端口

-n 参数表示以数字形式显示端口号

-o 参数表示显示进程 ID

# nginx操作

## 重新加载配置文件

linux

```bash
nginx -s reload
```

 -s 参数用于向 Nginx 进程发送信号，告诉它如何处理这个命令。

- -s 参数后面可以跟以下几个参数：
  stop：停止 Nginx 进程。这个命令将会优雅地关闭 Nginx，并在关闭前完成正在处理的请求。使用该命令将会中断 Nginx 的服务，直到再次手动启动它;
- quit：优雅地退出 Nginx 进程。这个命令将会让 Nginx 完成正在处理的请求，并优雅地关闭连接。使用该命令将不会中断 Nginx 的服务，直到再次手动启动它;
- reload：重新加载 Nginx 的配置文件，并在不中断现有连接的情况下重启 Nginx。该命令通常用于在修改 Nginx 配置文件后，重新加载配置文件并使修改生效，而无需停止 Nginx 并重新启动它。使用该命令将会重启 Nginx，但不会中断现有连接;
- reopen：重新打开 Nginx 的日志文件。这个命令通常用于在 Nginx 运行期间，切换日志文件。使用该命令将会让 Nginx 关闭当前日志文件，并重新打开一个新的日志文件。)

**window**

```bash
nginx.exe -s reload
```

需要注意的是，如果新的配置选项涉及到 Nginx 监听的端口或者其他需要重新启动 Nginx 才能生效的配置选项，那么执行 `nginx.exe -s reload` 命令可能无法使新的配置选项生效。在这种情况下，你需要停止 Nginx 进程并重新启动它，才能使新的配置选项生效。可以使用 `nginx.exe -s stop` 命令停止 Nginx 进程，然后使用 nginx.exe 命令重新启动 Nginx。

## 启动nginx

linux

```bash
nginx
```

window

```bash
nginx.exe
```

## 测试配置文件

重新加载配置文件之前需要进行语法检查

linux

```bash
nginx -t
```

window

```bash
nginx.exe -t
```

## 以管理员方式运行终端

window

```bash
runas /user:Administrator cmd 
```

需要填写密码啥的