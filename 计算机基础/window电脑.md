# 命令

> 查看最近修改或新增文件

```bash
dir /O-D /T:W
```

> 查看当前分配的ip

```bash
ipconfig | findstr /i "ipv4"
```

只关注IPv4

你可以使用`ipconfig /all`命令来查看更多关于你的网络接口的信息。

> 重新分配ip

释放当前ip

```bash
ipconfig /release
```

获取新ip

```bash
ipconfig /renew
```

只适用于使用 DHCP 的网络;如果网络使用静态 IP 地址，需要手动更改你的 IP 地址设置。

但是 DHCP 服务器用于确保特定的设备总是获取到相同的 IP 地址，所以一般这样ip也不变

# 快捷键

> 设备管理器

```bash
win+x
```



# 疑难杂症

## window提示你需要xxx的权限才能删除？

修改文件夹名称，再删

## 临时文件

系统的**临时文件**存放位置配置在非C盘，通过**环境变量**配置，当磁盘内存紧缺时可以去那里清理

## cmd.exe在哪

**C:\Windows\System32\cmd.exe**

## 找到nvm的安装路径

```bash
echo %NVM_HOME%
```

