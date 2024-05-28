## 服务端渲染

### React Server Components

这是一种可以在服务器上渲染并可选缓存的UI。它有助于：

- 数据获取
- 安全性
- 缓存
- 性能优化
- 初始页面加载
- 首次内容绘制（FCP）
- 搜索引擎优化
- 社交网络分享能力
- 流式传输

### Next.js中使用

默认情况下，Next.js使用服务端组件，无需额外配置即可实现服务端渲染。可以在需要时选择使用客户端组件。

### 渲染策略

- **静态渲染**：在构建时或在数据重新验证后在后台渲染路由。结果被缓存并可以推送到CDN。这种优化允许你在用户和服务器请求之间共享渲染工作的结果。
- **动态渲染**：在每个用户的请求时渲染路由。当路由有用户个性化的数据或只能在请求时知道的信息时，动态渲染很有用。
- **流式渲染**：允许你将渲染工作分割成块，并在它们准备好时将它们流式传输到客户端。这允许用户在服务器上渲染整个页面之前看到页面的部分内容。



## 开始

1. 安装脚手架
2. 安装依赖
3. 运行

安装脚手架

```
npx create-next-app@latest nextjs-dashboard --use-npm --example "https://github.com/vercel/next-learn/tree/main/dashboard/starter-example"
```

参数作用：

- create-next-app@latest（**创建nextjs应用脚手架**）

- --use-npm（**使用npm包管理器**，默认是yarn）
- --example（**使用案例代码**）

项目命名为 `nextjs-dashboard`

切换到 目录 `nextjs-dashboard`

安装依赖 `npm i`

运行 `npm run dev`

## 项目结构

- **app** 路由、组件、部分逻辑
- **app/lib** 函数，例如可复用的工具函数，获取数据的函数；
- **public** 静态文件，例如图片；
- **scripts** 种子脚本；
- **配置文件** 各种配置文件；

## 样式

- 全局样式
- tailwind css 和 模块css 
- 动态类名

### 全局样式

`/app/ui` 下有个global.css

可以在任意组件内导入该样式表，但是推荐在**最顶层**组件导入；

### tailwind css

- 独立不冲突
- 熟悉之后很快

### 模块css

- 独立不冲突
- xxx.module.css

这两种方案在next应用中可以同时使用

动态添加类名

### 动态类名

clsx库

```jsx
import clsx from 'clsx';
 
export default function InvoiceStatus({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-1 text-sm',
        {
          'bg-gray-100 text-gray-500': status === 'pending',
          'bg-green-500 text-white': status === 'paid',
        },
      )}
    >
    // ...
)}
```

### 其他方案

当然，next项目也支持其他方案：

- scss
- css-in-js（style-jsx、style-component、emotion）

## 疑难杂症

```js
Warning: Expected server HTML to contain a matching <div> in <div>.
```

参考链接：https://stackoverflow.com/questions/46865880/react-16-warning-expected-server-html-to-contain-a-matching-div-in-div-due?answertab=scoredesc#tab-top