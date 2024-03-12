# 下载官方offic

1.进入 https://www.youtube.com/redirect?event=video_description&redir_token=QUFFLUhqbWlRUEIxWWZrVU9OaGQ1cTlPZFdfQzhlUXdMUXxBQ3Jtc0trbG5PN1E5Y2FneS1uRm9GdWxhUjY4OVZ4ZTI2YmlnLURrdVhBaTFva2tJZWxfTnBQU2l4RTdEY0ZDaUhnTzJ2UFB2eWsySW01Y3U1RGJVbWJndUw0VE5iOXR1dnRrSmYxSDRsQ1hHRlR1Y2Exbm83SQ&q=https%3A%2F%2Fwww.microsoft.com%2Fen-us%2Fdownload%2Fdetails.aspx%3Fid%3D49117&v=Kl1j2GjhaRA 下载工具, 存放到目录a；

2.进入 https://www.youtube.com/redirect?event=video_description&redir_token=QUFFLUhqbF9UUWwxX0FXUVlaRlNJWkNvNWY1Sno1RXhXUXxBQ3Jtc0tsZUlwREd5RFB4RXB3YkI5Y1ZHbHpCbzB3UzIwbXI5X0x3TEFQeWpLaWttSVV4cVdsU2hJVEExSnZwTkoyWU1IY0FLc3BBVGczZkN1T3VEOVFOREhMRlgyczJUR2lmcjRIbjhYczYwbGlGaVR0Tlg5WQ&q=https%3A%2F%2Fconfig.office.com%2Fdeploymentsettings&v=Kl1j2GjhaRA 选择套件，导出配置，命名为config.xml，存放到目录a；

3.进入目录a，管理员打开终端（或powershell），执行 `setup.exe /download config.xml` 或 `.\setup.exe /download config.xml` （需要时间），再执行 `setup.exe /configure config.xml` 或 `.\setup.exe /configure config.xml`（需要时间）；

4.新建个doc文件打开，回首页，看到产品未激活；

5.在  C:\Program Files(x86)\Microsoft Office\Office16 或  C:\Program Files\Microsoft Office\Office16 下打开终端（或powershell），执行 `cscript ospp.vbs /sethst:kms.03k.org ` ，再执行 `cscript ospp.vbs /act`

备选的kms：

- kms.03k.org 
- kms.chinancce.com 
- kms.luody.info 
- kms.lotro.cc 
- kms.luochenzhimu.com 
- kms8.MSGuides.com 
- kms9.MSGuides.com

再次回到首页发现产品已激活

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

