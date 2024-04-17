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