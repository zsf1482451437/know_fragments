import type { AppState, Project, Task } from '../types/task';

export const projects: Project[] = [
  { id: 'goals', name: '年度', description: '年度目标和长期方向' },
  { id: 'monthly', name: '本月', description: '月度重点' },
  { id: 'weekly', name: '本周', description: '周度重点' },
  { id: 'today', name: '今日', description: '今日关键动作' },
  { id: 'work', name: '工作', description: '工作相关任务' },
];

export const tasks: Task[] = [
  {
    id: 'goal-1',
    title: '系统掌握 Web3D 工程化能力',
    projectId: 'goals',
    notes: '长期目标',
    priority: 'year',
    parentId: null,
    completed: false,
    createdAt: '2026-05-27T00:00:00.000Z',
    updatedAt: '2026-05-27T00:00:00.000Z',
  },
  {
    id: 'week-1',
    title: '完成 01-basic-scene',
    projectId: 'weekly',
    notes: '本周重点任务',
    priority: 'week',
    parentId: null,
    completed: false,
    createdAt: '2026-05-27T00:00:00.000Z',
    updatedAt: '2026-05-27T00:00:00.000Z',
  },
  {
    id: 'week-1-child',
    title: '输出 basic-scene 结论文档',
    projectId: 'weekly',
    notes: '子任务示例',
    priority: 'week',
    parentId: 'week-1',
    completed: false,
    createdAt: '2026-05-27T00:00:00.000Z',
    updatedAt: '2026-05-27T00:00:00.000Z',
  },
  {
    id: 'work-1',
    title: '整理工作需求池',
    projectId: 'work',
    notes: '工作任务独立展示',
    priority: null,
    parentId: null,
    completed: false,
    createdAt: '2026-05-27T00:00:00.000Z',
    updatedAt: '2026-05-27T00:00:00.000Z',
  },
  {
    id: 'done-1',
    title: '已完成任务',
    projectId: 'work',
    notes: '',
    priority: null,
    parentId: null,
    completed: true,
    createdAt: '2026-05-27T00:00:00.000Z',
    updatedAt: '2026-05-27T00:00:00.000Z',
  },
];

export const appState: AppState = {
  projects,
  tasks,
};
