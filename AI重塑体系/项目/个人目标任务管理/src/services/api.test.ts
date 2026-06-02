import { afterEach, describe, expect, it, vi } from 'vitest';
import { appState } from '../test/fixtures';
import { createTask, deleteTask, fetchState, updateTask } from './api';

function mockFetch(ok = true, body: unknown = appState, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    status,
    json: vi.fn().mockResolvedValue(body),
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('api service', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('获取完整应用状态', async () => {
    const fetchMock = mockFetch();

    await expect(fetchState()).resolves.toEqual(appState);
    expect(fetchMock).toHaveBeenCalledWith('/api/state', { headers: { 'Content-Type': 'application/json' } });
  });

  it('创建任务时提交 POST 和 JSON body', async () => {
    const fetchMock = mockFetch();
    const draft = { title: '新任务', projectId: 'today', priority: 'today' as const, notes: '' };

    await createTask(draft);

    expect(fetchMock).toHaveBeenCalledWith('/api/tasks', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(draft),
    }));
  });

  it('更新任务时提交 PATCH', async () => {
    const fetchMock = mockFetch();

    await updateTask('task-1', { completed: true });

    expect(fetchMock).toHaveBeenCalledWith('/api/tasks/task-1', expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify({ completed: true }),
    }));
  });

  it('删除任务时提交 DELETE', async () => {
    const fetchMock = mockFetch();

    await deleteTask('task-1');

    expect(fetchMock).toHaveBeenCalledWith('/api/tasks/task-1', expect.objectContaining({ method: 'DELETE' }));
  });

  it('请求失败时抛出状态码错误', async () => {
    mockFetch(false, { message: 'fail' }, 500);

    await expect(fetchState()).rejects.toThrow('请求失败：500');
  });
});
