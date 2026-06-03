# 个人目标任务管理

这是一个 Todoist 风格的个人目标任务管理项目，用于实践：

- `React + TypeScript + TailwindCSS` 前端
- 组件化拆分
- `Koa` 后端 API
- `JSON` 文件持久化
- 目标 -> 本月 -> 本周 -> 今日 的任务闭环
- 阶段分区顺序：年度、本月、本周、今日、工作

## 启动

```bash
npm install
npm run dev
```

启动后：

- 前端：`http://localhost:5173`
- 后端：`http://localhost:4174`
- 数据文件：`data/tasks.json`

## 目录结构

```text
src/
├── components/
│   ├── common/
│   ├── dashboard/
│   ├── layout/
│   ├── sections/
│   └── tasks/
├── services/
├── types/
├── utils/
├── App.tsx
└── main.tsx
server/
├── index.ts
├── storage.ts
└── types.ts
data/
└── tasks.json
```

## 功能

- 查看年度、本月、本周、今日、工作阶段
- 按阶段分区筛选任务
- 使用弹窗新增任务
- 使用弹窗编辑任务
- 优先级使用本年、本月、本周、今日
- 完成/取消完成任务
- 按阶段把任务从本年推进到本月、从本月推进到本周、从本周推进到今日
- 删除任务
- 所有修改持久化到 `data/tasks.json`
