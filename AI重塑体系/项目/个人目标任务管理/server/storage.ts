import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { AppState, Task } from './types.js';

const dataDir = path.resolve(process.cwd(), 'data');
const dataFile = path.join(dataDir, 'tasks.json');

export async function readState(): Promise<AppState> {
  await ensureDataFile();
  const raw = await fs.readFile(dataFile, 'utf-8');
  return JSON.parse(raw) as AppState;
}

export async function writeState(state: AppState): Promise<AppState> {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataFile, `${JSON.stringify(state, null, 2)}\n`, 'utf-8');
  return state;
}

export function createTask(input: Partial<Task>): Task {
  const now = new Date().toISOString();
  const isWorkTask = input.projectId === 'work';

  return {
    id: crypto.randomUUID(),
    title: input.title?.trim() || '未命名任务',
    projectId: input.projectId || 'goals',
    notes: input.notes || '',
    priority: isWorkTask ? null : input.priority || 'today',
    parentId: input.parentId ?? null,
    completed: false,
    createdAt: now,
    updatedAt: now,
  };
}

async function ensureDataFile() {
  try {
    await fs.access(dataFile);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(dataFile, `${JSON.stringify(defaultState, null, 2)}\n`, 'utf-8');
  }
}

const defaultState: AppState = {
  projects: [
    { id: 'goals', name: '年度', description: '年度目标和长期方向。' },
    { id: 'monthly', name: '本月', description: '承接本月最重要的 3-5 件事。' },
    { id: 'weekly', name: '本周', description: '本周重点推进任务。' },
    { id: 'today', name: '今日', description: '今天真正要执行的关键动作。' },
    { id: 'work', name: '工作', description: '工作相关事项、交付物、会议后续。' }
  ],
  tasks: [
    {
      id: 'task-web3d-goal',
      title: '系统掌握 Web3D 工程化能力',
      projectId: 'goals',
      notes: '年度目标，后续拆解为可执行任务。',
      priority: 'year',
      parentId: null,
      completed: false,
      createdAt: '2026-05-27T00:00:00.000Z',
      updatedAt: '2026-05-27T00:00:00.000Z'
    },
    {
      id: 'task-web3d-plan',
      title: '完成 Web3D 01-basic-scene 实验',
      projectId: 'weekly',
      notes: '本周内完成基础实验并记录结论。',
      priority: 'week',
      parentId: null,
      completed: false,
      createdAt: '2026-05-27T00:00:00.000Z',
      updatedAt: '2026-05-27T00:00:00.000Z'
    },
    {
      id: 'task-web3d-note',
      title: '整理实验结论并沉淀文档',
      projectId: 'weekly',
      notes: '作为 01-basic-scene 的子任务。',
      priority: 'week',
      parentId: 'task-web3d-plan',
      completed: false,
      createdAt: '2026-05-27T00:00:00.000Z',
      updatedAt: '2026-05-27T00:00:00.000Z'
    },
    {
      id: 'task-work-demo',
      title: '整理工作任务池',
      projectId: 'work',
      notes: '工作任务不参与时间优先级分组。',
      priority: null,
      parentId: null,
      completed: false,
      createdAt: '2026-05-27T00:00:00.000Z',
      updatedAt: '2026-05-27T00:00:00.000Z'
    }
  ]
};
