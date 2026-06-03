/// <reference types="node" />

import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppState } from './types.js';

let originalCwd: string;
let tempDir: string;

async function loadStorage() {
  vi.resetModules();
  return import('./storage.js');
}

describe('storage', () => {
  beforeEach(async () => {
    originalCwd = process.cwd();
    tempDir = await mkdtemp(path.join(tmpdir(), 'goal-task-storage-'));
    process.chdir(tempDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await rm(tempDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('readState 在数据文件不存在时创建默认数据', async () => {
    const { readState } = await loadStorage();

    const state = await readState();
    const raw = await readFile(path.join(tempDir, 'data', 'tasks.json'), 'utf-8');

    expect(state.projects.map((project) => project.name)).toEqual(['年度', '本月', '本周', '今日', '工作']);
    expect(state.tasks.find((task) => task.projectId === 'work')?.priority).toBeNull();
    expect(JSON.parse(raw)).toEqual(state);
  });

  it('writeState 将状态写入 JSON 文件并原样返回', async () => {
    const { writeState, readState } = await loadStorage();
    const state: AppState = { projects: [], tasks: [] };

    await expect(writeState(state)).resolves.toEqual(state);
    await expect(readState()).resolves.toEqual(state);
  });

  it('createTask 规范化输入并补齐默认字段', async () => {
    const { createTask } = await loadStorage();
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('00000000-0000-4000-8000-000000000000');

    const goalTask = createTask({ title: '  新任务  ' });
    const workTask = createTask({ title: '工作任务', projectId: 'work' });

    expect(goalTask).toMatchObject({
      id: '00000000-0000-4000-8000-000000000000',
      title: '新任务',
      projectId: 'goals',
      priority: 'today',
      completed: false,
    });
    expect(workTask.priority).toBeNull();
    expect(goalTask.createdAt).toBeTruthy();
    expect(goalTask.updatedAt).toBeTruthy();
  });
});
