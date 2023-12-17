大家好~，我是平头哥

我的项目用**nginx**部署，找到nginx的配置文件（nginx.conf）

加入以下规则

```js
location / {
  try_files $uri $uri/ /index.html;
}
```

要是其它方式部署的如**Apache**、 原生 **Node.js**、**Caddy**、 **Firebase 主机**等等

请移步官网:point_right:https://v3.router.vuejs.org/zh/guide/essentials/history-mode.html#%E5%90%8E%E7%AB%AF%E9%85%8D%E7%BD%AE%E4%BE%8B%E5%AD%90

**官网能解决的，都不叫问题~**（多看官网）

**提示**

这么做，对于所有路径（**有些路径可能不存在**）都会返回 `index.html` 文件，服务器不再返回 404 错误页面了，这样对用户并不友好！对于**不存在的路径，应该给用户404**提示，不然用户觉得是你们服务器出问题了~

所以呢

应该**新增一个路由规则**，自定义一个**404组件**NotFound.vue

```js
const routes = [
  {
    path: '*',
    component: NotFound
  },
  ...
]

const router = new VueRouter({
  routes,
  mode: 'history'
})
```

**相信技术，传递价值~**