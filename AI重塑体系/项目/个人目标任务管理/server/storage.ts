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
  return {
    id: crypto.randomUUID(),
    title: input.title?.trim() || '未命名任务',
    projectId: input.projectId || 'goals',
    notes: input.notes || '',
    priority: input.priority || 'today',
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
    { id: 'today', name: '今日', description: '今天真正要执行的关键动作。' },
    { id: 'waiting', name: '等待', description: '等别人回复、等结果、待确认事项。' },
    { id: 'someday', name: '想做', description: '未来想做但近期不推进的事项。' },
    { id: 'work', name: '工作', description: '工作相关项目、交付物、会议后续。' }
  ],
  tasks: [
    {
      id: 'task-web3d-goal',
      title: '2026：系统掌握 Web3D 工程化能力',
      projectId: 'goals',
      notes: '年度目标，后续拆解为可执行任务。',
      priority: 'year',
      completed: false,
      createdAt: '2026-05-27T00:00:00.000Z',
      updatedAt: '2026-05-27T00:00:00.000Z'
    },
    {
      id: 'task-basic-scene',
      title: '完成 Web3D 01-basic-scene 实验',
      projectId: 'work',
      notes: '本周内完成基础实验并记录结论。',
      priority: 'today',
      completed: false,
      createdAt: '2026-05-27T00:00:00.000Z',
      updatedAt: '2026-05-27T00:00:00.000Z'
    },
    {
      id: 'task-weekly-review',
      title: '每周复盘并更新下周计划',
      projectId: 'monthly',
      notes: '每周 20 分钟，清理过期任务，更新本月重点。',
      priority: 'week',
      completed: false,
      createdAt: '2026-05-27T00:00:00.000Z',
      updatedAt: '2026-05-27T00:00:00.000Z'
    }
  ]
};
