# nginx操作

## 重载配置文件

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

## 启动

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

> window

```bash
netstat -ano | findstr "8080" 
```

-a 参数表示显示所有的连接和监听端口

-n 参数表示以数字形式显示端口号

-o 参数表示显示进程 ID

## 查看某个进程

```bash
ps -ef | grep nginx
```

>  window

```bash
tasklist | findstr "nginx"
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

## 删除文件

```bash
rm

rm --help
```

## 删除目录

```bash
rmdir
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

# 部署

## 自动化部署

### 传统开发模式

1. code
2. build
3. test
4. release
5. operate

线上bug隐患，当线上出现bug时，所有环节都需要加班；

### DevOps开发模式

某个模块写完就可以build，**持续集成**和**持续交付**；

开发完**代码**会放进**代码仓库**，然后一个**服务器**会**自动构建并部署**代码，当**测试**出现问题后，会**反馈**回开发；

### 自动化部署流程

1. 本地开发
2. 代码仓库
3. Jenkins服务器（安装java环境，node环境等等）
4. 创建任务（隔段时间**拉下代码并构建后发布**）
5. 测试就可以在测试服务器上访问项目，用户在线上服务器上访问项目

### 服务器环境安装

#### **远程连接服务器**

在云服务器打开终端，执行命令

```
ssh 用户名@公网ip
```

接着输入密码即可

#### **安装Jenkins环境**

由于Jenkins是依赖java的，所以先安装java环境；

先做一个搜索

```
dnf search java-1.8
```

##### **安装**java环境

```
dnf install java-1.8.0-openjdk.x86_64
```

安装完成后执行命令，检验安装是否成功

```
java
```

##### **安装Jenkins**

搜索发现是python的，不是这个；

需要先下载，执行命令（参数-O是大写）

```
wget -O /etc/yum.repos.d/jenkins.repo http://pkg.jenkins-ci.org/redhat-stable/jenkins.repo
```

如果没有下载到**/etc/yum.repos.d/**下，需要移动到那里，在**jenkin.repo文件**目录下执行命令

```
mv jenkins.repo /etc/yum.repos.d/
```

可以使用 `cd /etc/yum.repos.d/` 命令移动工作目录

然后使用 `ls` 命令列出该目录下所有文件，查看是否有**jenkins.repo**

###### **导入密钥**

有了jenkins.repo文件，使用dnf命令就可以安装了；

不过linux操作系统会进行一些验证，确保软件合法；

先导入密钥以确保需下载的软件合法，在**jenkin.repo文件**目录下执行命令

```
rpm --import https://pkg.jenkins.io/redhat/jenkins.io.key
```

###### **编辑jenkins.repo**

如果不能安装，那下载的jenkins.repo可能有点问题，需要编辑，在**jenkin.repo文件**目录下执行命令

```
vi jenkins.repo
```

然后点击 **i** 进入编辑模式；

删除baseurl的值后面的 **-stable**；

然后按esc退出编辑模式；

接着同时按 **shift 和 :** ，左下角出现冒号，输入 **wq** 保存；

###### 安装

在**jenkin.repo文件**目录下执行命令

```
dnf install jenkins
```

#### 启动jenkins

需要启动jenkins，在**jenkin.repo文件**目录下执行命令

```
systemctl start jenkins
```

执行 **systemctl status jenkins** 查看状态

#### 设置jenkins自启动

如果不想手动启动jenkins，可以在**jenkin.repo文件**目录下执行命令

```
systemctl enable jenkins
```

#### jenkins图形化界面

jenkins启动后开启一个服务，默认在服务器的8080端口；

但是在防火墙（安全组）并没有允许访问**8080**端口，需要手动添加；

浏览器输入网址 **服务器的公网ip:8080** 进入；

执行 `cat /var/lib/jenkins/secrets/initialAdminPassword` 获取管理员密码；

图形化界面需要这段**密码**；

然后安装**推荐的插件**；

创建一个jenkins**管理员用户**；

#### 安装Nginx

Nginx是一个高性能的web服务器，可以配置负载均衡和高并发等等；

执行命令 `dnf install nginx`

#### 启动nginx

执行命令 `systemctl start nginx` 启动;

执行命令 `systemctl status nginx` 查看**启动状态**;

执行命令 `systemctl enable nginx` 设置nginx随着操作系统启动而启动;



#### 配置nginx

执行 `cd ~` 回到**根目录**；

执行 `mkdir mail_cms` 创建mail_cms**目录**;

执行 `cd mail_cms` 移动到该目录下；

执行 `touch index.html` 创建**index.html**文件;

这样，访问nginx的默认页面替换成index.html；

同理，访问nginx的默认页面可以替换成打包后项目的index.html，需要进行一些配置;

可以执行 `vi /etc/nginx/nginx.conf` 编辑nginx的配置文件；

修改完nginx配置后，执行以下两条命令（第三条尽量不要，如果配置错误可能更长时间等待，严重会宕机）

```
nginx -t # 检验配置是否正确
nginx -s reload # 重新加载配置
service nginx restart # 
```

nginx其它常用命令

```
启动nignx：$ service nginx start
停止nignx：$ service nginx stop
```

服务器端口常用命令

```
查看端口是否可访问：telnet ip 端口号
开放的端口位于/etc/sysconfig/iptables中
查看时通过 cat  /etc/sysconfig/iptables 命令查看

使用netstat列出当前开放的所有端口，不限协议（可以是TCP和UDP）
netstat -lntu
```

防止终端修改文件出错，可以使用vscode修改远程文件；

打包压缩后，nginx的配置注意处理匹配资源文件

```
server
    {
        listen 888;
        server_name 120.25.154.83;
        #index index.html index.htm index.php;
        # root  /www/server/phpmyadmin;
            location ~ /tmp/ {
                return 403;
            }

        #error_page   404   /404.html;
        include enable-php.conf;

        location / {
               root project/admin;
               index index.html;
        }

        location ~ .*\.(gif|jpg|jpeg|png|bmp|swf|ico)$
        {
            root project/admin;
            expires      30d;
        }

        location ~ .*\.(js|css)?$
        {
            root project/admin;
            expires      12h;
        }

        location ~ /\.
        {
            deny all;
        }
        access_log  /www/wwwlogs/access.log;
}
```



##### vscode连接远程服务器

安装vscode插件 **Remote-SSH**；

然后在vscode左侧有对应的图标，点击，+号，输入 `root@公网ip`；

接着输入**密码**，连接成功后vscode左下角有公网ip，点击，然后打开文件夹，剩下的操作就是找你要修改的文件；

找到/etc/nginx/下的**nginx.conf**文件，修改内容；

用户要改变，使用root用户

```
user root;
```

修改代理访问的默认路径，server内容里注释掉它的默认访问路径

```
## root /usr/share/nginx/html;
```

location那部分修改为(这个路径就是你放项目的路径)

```
location / {
	root /root/mall_cms;
	index index.html;
}
```

##### 重启nginx

修改完配置重启，执行 `systemctl restart nginx`

### 创建jenkins任务

新建freestyle project类型的任务；

还需要在服务器上安装git，执行 `dnf install git`；

填写远程仓库地址、认证；

github个人信息那里生成token（新规密码认证已经不行了）；

选择分支；

构建触发器，选定时构建，日程表五位分表代：分 时 天  月 周；

```
H/30****
表示每30分钟构建一次
```

构建环境，在此之前，Jenkins添加nodeJS插件，添加全局配置，保存后即可安装nodejs；

接着配置jenkins任务，构建环境那一项多出node那一栏，选上；

构建那一栏，选shell脚本，内容如下

```
npm install
npm run build
echo '构建完成'
rm -rf /root/mail_cms/* # 清一下
mv -rf ./dist/* /root/mail_cms/ # 递归移动dist目录下的文件到/root/mail_cms/
```

保存，以上操作一个任务已经创建了，点击立即构建就可以立即构建；



移动文件操作时，jenkins可能没有权限，需要配置一下；

在/etc/sysconfig/下找到**jenkins文件**，编辑，修改成这样，保存；

```
JENKINS_USER="root"
```

执行 `systemctl restart jenkins` 重启jenkins





生成文件树的命令，需要用到tree工具，没有自行百度下载

```
tree -I "node_modules" # 忽略文件夹
```





# 疑难杂症



