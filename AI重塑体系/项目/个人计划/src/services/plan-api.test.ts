import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchPlan, persistPlan } from './plan-api';
import type { PlanData } from '../types/plan';

const mockPlan: PlanData = {
  updatedAt: '2026-05-21T00:00:00.000Z',
  principles: [],
  activeDate: '2026-05-21',
  entries: [
    {
      date: '2026-05-21',
      coreGoal: '目标',
      totalHours: 4,
      status: '未开始',
      tasks: [],
      recentPlans: [],
      subTasks: [],
      tomorrowCandidates: [],
      review: {
        completed: '',
        unfinished: '',
        blockers: '',
        tomorrowFocus: '',
        postponedOrDropped: ''
      }
    }
  ]
};

describe('plan-api', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('加载计划 JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => mockPlan }));

    await expect(fetchPlan()).resolves.toEqual(mockPlan);
    expect(fetch).toHaveBeenCalledWith('/api/plan');
  });

  it('保存计划 JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => mockPlan }));

    await expect(persistPlan(mockPlan)).resolves.toEqual(mockPlan);
    expect(fetch).toHaveBeenCalledWith('/api/plan', expect.objectContaining({
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockPlan)
    }));
  });

  it('请求失败时抛出清晰错误', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    await expect(fetchPlan()).rejects.toThrow('计划数据请求失败');
  });
});
