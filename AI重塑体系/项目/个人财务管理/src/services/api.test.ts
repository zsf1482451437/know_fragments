import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearStoredAuthSession, createRecord, deleteRecord, fetchLogs, fetchState, getStoredAuthSession, login, logout, setStoredAuthSession } from './api';

describe('finance api', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    clearStoredAuthSession();
  });

  it('获取后端财务状态', async () => {
    setStoredAuthSession({ token: 'token-1', userName: 'wenxin' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ records: [], logs: [] }) }));

    await expect(fetchState()).resolves.toEqual({ records: [], logs: [] });
    expect(fetch).toHaveBeenCalledWith('/api/state', expect.objectContaining({
      headers: expect.objectContaining({
        'Content-Type': 'application/json',
        Authorization: 'Bearer token-1',
      }),
    }));
  });

  it('登录成功后会缓存会话', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'token-2', userName: 'sifeng' }),
    }));

    await expect(login('sifeng', '1314')).resolves.toEqual({ token: 'token-2', userName: 'sifeng' });
    expect(getStoredAuthSession()).toEqual({ token: 'token-2', userName: 'sifeng' });
  });

  it('创建记录时提交 JSON body', async () => {
    setStoredAuthSession({ token: 'token-1', userName: 'wenxin' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ records: [], logs: [] }) }));

    await createRecord({ month: '2026-06', date: '2026-06-01', type: 'expense', isRepayment: true, title: '信用卡还款', amount: 100, note: '' });

    expect(fetch).toHaveBeenCalledWith('/api/records', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ Authorization: 'Bearer token-1' }),
      body: expect.stringContaining('"isRepayment":true'),
    }));
  });

  it('删除记录时使用 DELETE 方法', async () => {
    setStoredAuthSession({ token: 'token-1', userName: 'wenxin' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ records: [], logs: [] }) }));

    await deleteRecord('record-1');

    expect(fetch).toHaveBeenCalledWith('/api/records/record-1', expect.objectContaining({ method: 'DELETE' }));
  });

  it('获取日志和退出登录都会调用对应接口', async () => {
    setStoredAuthSession({ token: 'token-1', userName: 'wenxin' });
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ([]) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) }));

    await expect(fetchLogs()).resolves.toEqual([]);
    await logout();

    expect(fetch).toHaveBeenNthCalledWith(1, '/api/logs', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer token-1' }),
    }));
    expect(fetch).toHaveBeenNthCalledWith(2, '/api/auth/logout', expect.objectContaining({ method: 'POST' }));
    expect(getStoredAuthSession()).toBeNull();
  });
});
