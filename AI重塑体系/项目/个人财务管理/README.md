# 个人财务管理

一个以“月”为单位的个人财务管理工具，使用 React + TypeScript + TailwindCSS，后端为 Koa，数据持久化为 JSON，单元测试使用 Vitest。

## 核心口径

本金是本工具的重点观察指标：

```text
本金 = 收入 - 开销 - 投资 - 负债
```

## 目录结构

- `src/components/layout`：页面头部与整体布局组件
- `src/components/dashboard`：关键指标卡片
- `src/components/months`：月份选择与月份相关交互
- `src/components/records`：财务记录表单与列表
- `src/components/charts`：轻量 SVG 图表
- `src/components/common`：通用空状态等组件
- `src/utils`：本金计算、月度汇总、格式化等纯函数
- `src/services`：前端 API 请求封装
- `server`：Koa API 与 JSON 存储
- `data`：JSON 持久化数据

## 常用命令

```bash
npm install
npm run dev
npm run test
npm run build
npm run typecheck:server
```

默认后端端口：`4176`。
