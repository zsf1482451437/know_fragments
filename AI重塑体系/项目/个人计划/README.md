# 个人计划系统

一个基于 React + TypeScript + Tailwind CSS 的本地个人计划系统，计划数据使用 JSON 文件维护，并通过 Vite 本地 API 实现读写。

## 核心能力

- 今日计划：固定 4 小时时间盒，直接更新任务状态。
- 近期计划：管理中短期目标，并基于子任务计算进度。
- 明日候选：勾选候选任务，作为下一轮计划输入。
- JSON 持久化：页面保存后写回 `data/plan.json`。
- 单元测试：使用 Vitest + Testing Library 覆盖核心逻辑和页面行为。

## 启动开发

```bash
npm install
npm run dev
```

## 运行测试

```bash
npm test
```

## 构建预览

```bash
npm run build
npm run preview
```

## 数据维护方式

- 批量修改：直接编辑 `data/plan.json`
- 页面修改：在 UI 中更新任务状态或勾选明日候选，然后点击“保存到 JSON”
- 如果后续要扩展多日归档，可在 `data/archive/` 下按日期拆分 JSON 文件

## 说明

静态构建产物本身不具备写文件能力；本项目的 JSON 持久化依赖 Vite 开发服务器或 `vite preview` 提供的本地 API 中间件。
