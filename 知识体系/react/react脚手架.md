三大主流框架都有对应的脚手架

- vue---@vue/cli
- angular---@angular/cli
- react---react-create-app(CRA)

# react-create-app

## 创建项目

```
create-react-app 项目名称
```

**项目名称**不能包含**大写字母**

## 项目结构

### manifest.json

配置该网页应用部分功能在**移动端桌面**的显示效果

### robots.txt

**爬虫**相关，可以配置网站那些内容可以被爬虫

### PWA

(Progressive Web App),渐进式web应用

一个PWA应用首先是**一个网页**，可以通过**web技术**编写出网页应用；

随后添加上**App manifest**和**service worker**来实现PWA的**安装和离线**等功能；

假设开发出来的网站是一个PWA，在**Android**移动端的**Chrome**浏览器跑起来，**左/右上角**会有三个点，点击会出现一个**菜单**，里面包含一个功能，可以将这个网站变成**桌面图标**；

而**service worker**负责**离线缓存**，当丢失网络时，某些功能离线也可以使用~；

并且也可以实现**消息推送**；

通过第三方包**react-scripts**可以查看**webpack**配置；

