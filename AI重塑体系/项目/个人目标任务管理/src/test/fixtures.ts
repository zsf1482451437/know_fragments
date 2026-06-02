import type { AppState, Project, Task } from '../types/task';

export const projects: Project[] = [
  { id: 'goals', name: '年度', description: '年度目标和长期方向' },
  { id: 'monthly', name: '本月', description: '月度重点' },
  { id: 'today', name: '今日', description: '今日关键动作' },
  { id: 'waiting', name: '等待', description: '等待事项' },
  { id: 'someday', name: '想做', description: '以后再做' },
  { id: 'work', name: '工作', description: '工作相关任务' },
];

export const tasks: Task[] = [
  {
    id: 'goal-1',
    title: '系统掌握 Web3D 工程化能力',
    projectId: 'goals',
    notes: '长期目标',
    priority: 'year',
    completed: false,
    createdAt: '2026-05-27T00:00:00.000Z',
    updatedAt: '2026-05-27T00:00:00.000Z',
  },
  {
    id: 'today-1',
    title: '完成 01-basic-scene',
    projectId: 'work',
    notes: '今日深度任务',
    priority: 'today',
    completed: false,
    createdAt: '2026-05-27T00:00:00.000Z',
    updatedAt: '2026-05-27T00:00:00.000Z',
  },
  {
    id: 'done-1',
    title: '已完成任务',
    projectId: 'someday',
    notes: '',
    priority: 'month',
    completed: true,
    createdAt: '2026-05-27T00:00:00.000Z',
    updatedAt: '2026-05-27T00:00:00.000Z',
  },
];

export const appState: AppState = {
  projects,
  tasks,
};
