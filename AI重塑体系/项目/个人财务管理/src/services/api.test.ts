import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRecord, deleteRecord, fetchState } from './api';

describe('finance api', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('获取后端财务状态', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ records: [] }) }));

    await expect(fetchState()).resolves.toEqual({ records: [] });
    expect(fetch).toHaveBeenCalledWith('/api/state', expect.objectContaining({ headers: { 'Content-Type': 'application/json' } }));
  });

  it('创建记录时提交 JSON body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ records: [] }) }));

    await createRecord({ month: '2026-06', date: '2026-06-01', type: 'income', title: '工资', amount: 100, note: '' });

    expect(fetch).toHaveBeenCalledWith('/api/records', expect.objectContaining({ method: 'POST', body: expect.stringContaining('工资') }));
  });

  it('删除记录时使用 DELETE 方法', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ records: [] }) }));

    await deleteRecord('record-1');

    expect(fetch).toHaveBeenCalledWith('/api/records/record-1', expect.objectContaining({ method: 'DELETE' }));
  });
});
