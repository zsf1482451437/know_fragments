## conf中定义变量

```bash
server {
    listen 80;
    server_name dev.appsmith.com;
    return 301 https://$host$request_uri;
}

server {
    listen 3600;
    location / {
        proxy_pass http://localhost:80;
    }
    return 301 https://$host$request_uri;
}

server {
	set $backend_url "http://10.10.14.135:8080";
	
    listen 443 ssl http2;
    server_name dev.appsmith.com;
    client_max_body_size 100m;

	# 证书跟本配置文件，均放在conf.d目录下
    ssl_certificate conf.d/dev.appsmith.com.pem;
    ssl_certificate_key conf.d/dev.appsmith.com-key.pem;

    # include /etc/letsencrypt/options-ssl-nginx.conf;
    # ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    gzip on;

    proxy_ssl_server_name on;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header Accept-Encoding "";

    sub_filter_once off;
	
	# 前端服务
    location / {
        proxy_pass http://localhost:3000;
		# sub_filter __BMAP_AK__ '';
        # sub_filter __APPSMITH_BMAP_AK__ '';
    }

    location /favicon.ico {
        proxy_pass http://localhost:3000/favicon.ico;
    }

    location /f {
       proxy_pass https://cdn.optimizely.com/;
    }

	# 后端服务
    location /api {
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_pass $backend_url;
    }
	
	# 后端服务
    location /oauth2 {
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_pass $backend_url;
    }

	# 后端服务
    location /login {
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_pass $backend_url;
    }
}


```

## 域名转发

**步骤 1：安装 Nginx**

首先，确保你已经安装了 Nginx。如果没有安装，可以使用适用于你的操作系统的包管理工具进行安装。例如，在 Ubuntu 上可以使用以下命令：

```
sudo apt update
sudo apt install nginx
```

**步骤 2：获取 SSL 证书**

要启用 HTTPS，你需要获取一个有效的 SSL 证书。你可以从证书颁发机构（CA）购买，也可以使用免费的证书颁发机构（如 Let's Encrypt）获取证书。

如果你使用 Let's Encrypt，可以按照以下步骤安装 Certbot 工具并获取证书：

1. 安装 Certbot：

   ```
   sudo apt install certbot python3-certbot-nginx
   ```

2. 获取证书（假设你的域名是 example.com）：

   ```
   sudo certbot --nginx -d example.com -d www.example.com
   ```

**步骤 3：配置 Nginx 支持 HTTPS**

1. 打开 Nginx 的站点配置文件，通常位于 `/etc/nginx/` 目录下。选择你想配置 HTTPS 的站点，并编辑配置文件：

   ```
   sudo nano /etc/nginx/sites-available/your_site_config_file
   ```

2. 在配置文件中添加以下内容，以启用 HTTPS：

   ```nginx
   server {
       listen 80;
       server_name example.com www.example.com;
   
       # Redirect HTTP to HTTPS
       return 301 https://$host$request_uri;
   }
   
   server {
       listen 443 ssl;
       server_name example.com www.example.com;
   
       ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
   
       # SSL settings
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_prefer_server_ciphers off;
   
       location / {
           # Your other server configuration directives
       }
   }
   ```

   注意替换 `example.com` 和配置文件的路径，确保 ssl_certificate 和 ssl_certificate_key 的路径正确指向你的 SSL 证书。

3. 保存并关闭文件。

**步骤 4：测试配置并重新加载 Nginx**

1. 检查 Nginx 配置是否正确：

   ```
   sudo nginx -t
   ```

2. 如果没有错误，重新加载 Nginx 配置：

   ```
   sudo systemctl reload nginx
   ```

**步骤 5：设置自动续签**

Let's Encrypt 证书的有效期为 90 天。为了避免证书过期，你可以设置自动续签。可以创建一个 cron 作业来定期续签证书。

编辑 crontab 文件：

```
sudo crontab -e
```

在文件末尾添加以下行（每天凌晨续签）：

```
0 0 * * * /usr/bin/certbot renew --quiet
```

保存并关闭文件。

## 防火墙规则查看

```
sudo iptables -L
```

## 查看端口已经被占用

```
sudo netstat -tuln | grep 81
```

## 杀死所有nginx进程

```
sudo pkill nginx
```

## 配置

设置变量时，不要用localhost，直接用127.0.0.1；

```
set $backend_url "http://127.0.0.1:8080";
```



## 疑难杂症

想重启nginx

执行`nignx -s stop`时

1.nginx: [error] invalid PID number "" in "/run/nginx.pid"

nginx -s reload 仅用于告诉正在运行的 nginx 进程重新加载其配置。停止后，没有正在运行的 nginx 进程来发送信号。只需运行nginx（可能使用-c /path/to/config/file）

2.执行`sudo systemctl reload nginx`日志

```bash
Failed to reload nginx.service: Connection timed out
See system logs and 'systemctl status nginx.service' for details.
```

可并不是是用systemctl管理nginx的，可以试试
`nginx -s reload`

> 301

想访问某个站点时，页面提示301永久重定向（之前可以的）