import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { clearStoredAuthSession } from './services/api';
import { financeRecords } from './test/fixtures';

const baseLogs = [
  {
    id: 'log-1',
    actor: 'wenxin',
    action: '登录',
    target: 'auth',
    detail: '登录系统',
    createdAt: '2026-06-05T00:00:00.000Z',
  },
  {
    id: 'log-2',
    actor: 'sifeng',
    action: '编辑流水',
    target: 'record',
    detail: '工资 32000',
    recordId: '1',
    recordMonth: '2026-06',
    createdAt: '2026-06-04T09:30:00.000Z',
  },
] as const;

describe('App', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    clearStoredAuthSession();
  });

  it('登录后展示财务页面并可查看只读日志', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ token: 'token-1', userName: 'wenxin' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ records: financeRecords, logs: baseLogs }) })
      .mockResolvedValueOnce({ ok: true, json: async () => baseLogs }));

    render(<App />);

    expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '登录' }));

    await waitFor(() => expect(screen.getByLabelText('月份')).toBeInTheDocument());
    const timeSelect = screen.getByLabelText('月份') as HTMLSelectElement;
    expect(Array.from(timeSelect.options).map((option) => option.value)).toEqual(['2026-06']);
    expect(screen.getByText('当前用户')).toBeInTheDocument();
    const currentUserPanel = screen.getByText('当前用户').closest('div');
    expect(currentUserPanel).not.toBeNull();
    expect(within(currentUserPanel as HTMLElement).getByRole('button', { name: 'wenxin' })).toBeInTheDocument();
    expect(within(currentUserPanel as HTMLElement).getByRole('button', { name: 'sifeng' })).toBeInTheDocument();
    expect(within(currentUserPanel as HTMLElement).getByRole('button', { name: '两人' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'sifeng' })).toHaveLength(1);
    expect(screen.queryByText('本金用户')).not.toBeInTheDocument();
    const principalPanel = screen.getByText('本金').closest('div');
    expect(principalPanel).not.toBeNull();
    expect(within(principalPanel as HTMLElement).getByText('¥0')).toBeInTheDocument();
    expect(screen.getByText('wenxin 当前默认未配置本金数据')).toBeInTheDocument();
    expect(screen.queryByText('¥6,000 / 20%')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'sifeng' }));
    expect(within(principalPanel as HTMLElement).getByText('¥14,000')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '流水' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '分类' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '操作日志' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '新增记录' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '分类圆形图表' })).toBeInTheDocument();
    expect(screen.getByText('¥6,000 / 20%')).toBeInTheDocument();
    expect(screen.getByText('按收入计算')).toBeInTheDocument();
    expect(screen.queryByText('占比 100%')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '两人' }));
    expect(within(principalPanel as HTMLElement).getByText('¥14,000')).toBeInTheDocument();
    expect(screen.getByText((_, node) => node?.textContent === '0 + 5,000')).toBeInTheDocument();
    expect(screen.getByText((_, node) => node?.textContent === '0 + 30,000')).toBeInTheDocument();
    expect(screen.getByText('¥6,000 / 20%')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: '流水' }));
    expect(screen.getByText('项目回款预计')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '列表' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '折线图' })).toBeInTheDocument();
    expect(screen.getByText('工资')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '编辑' }).length).toBeGreaterThan(0);
    expect(screen.getAllByText('预收入').length).toBeGreaterThan(0);
    expect(screen.getByText('+¥5,000')).toBeInTheDocument();
    expect(screen.getByText('+¥30,000')).toBeInTheDocument();
    expect(screen.getByText('-¥6,000')).toBeInTheDocument();
    expect(screen.getByText('总流出')).toBeInTheDocument();
    expect(screen.getAllByText('投资').length).toBeGreaterThan(0);
    expect(screen.getAllByText('月负债').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: '预收入' }));
    expect(screen.getByText('¥19,000')).toBeInTheDocument();
    expect(screen.getByText('¥2,000')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: '分类' }));
    expect(screen.getByText('按收入 + 预收入计算')).toBeInTheDocument();
    expect(screen.getByText('¥6,000 / 17%')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: '流水' }));
    fireEvent.click(screen.getByRole('tab', { name: '折线图' }));
    expect(screen.getByRole('img', { name: '流水折线图' })).toBeInTheDocument();
    expect(screen.getByText('收入线')).toBeInTheDocument();
    expect(screen.getByText('支出线')).toBeInTheDocument();
    expect(screen.getByText('2000')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: '列表' }));
    expect(screen.getByRole('heading', { name: '流水' })).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: '编辑' })[0]);
    expect(screen.getByRole('dialog', { name: '财务记录弹窗' })).toBeInTheDocument();
    expect((screen.getByLabelText('名称') as HTMLInputElement).value).toBe('项目回款预计');
    expect(screen.getByLabelText('金额')).toBeInTheDocument();
    expect(screen.getByLabelText('备注')).toBeInTheDocument();
    expect(screen.queryByLabelText('日期')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '收入' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: '操作日志' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: '操作日志' })).toBeInTheDocument());
    expect(screen.getByRole('heading', { name: '本金总览' })).toBeInTheDocument();
    expect(screen.getByLabelText('月份')).toBeInTheDocument();
    expect(screen.queryByText('日志仅支持查看')).not.toBeInTheDocument();
    expect(screen.getAllByText('登录').length).toBeGreaterThan(0);
    expect(screen.getAllByText('编辑流水').length).toBeGreaterThan(0);
    expect(screen.getByText('2026-06-05')).toBeInTheDocument();
    expect(screen.getByText('2026-06-04')).toBeInTheDocument();
    expect(screen.getByText('08:00:00')).toBeInTheDocument();
    expect(screen.getByText('17:30:00')).toBeInTheDocument();
    expect(screen.queryByText('查看流水')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('日志用户筛选'), { target: { value: 'sifeng' } });
    expect(screen.getByText('工资 32000')).toBeInTheDocument();
    expect(screen.queryByText('登录系统')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('日志操作筛选'), { target: { value: '删除流水' } });
    expect(screen.getByText('当前筛选条件下暂无日志')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('日志用户筛选'), { target: { value: 'all' } });
    fireEvent.change(screen.getByLabelText('日志操作筛选'), { target: { value: '登录' } });
    expect(screen.getByText('登录系统')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('日志操作筛选'), { target: { value: '编辑流水' } });
    fireEvent.change(screen.getByLabelText('日志用户筛选'), { target: { value: 'sifeng' } });
    fireEvent.click(screen.getByRole('button', { name: '查看流水 工资 32000' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: '流水' })).toBeInTheDocument());
    expect(screen.getByText('工资').closest('article')).toHaveAttribute('data-record-id', '1');
  });

  it('wenxin 视角新增收入后会同步更新总览收入块', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ token: 'token-1', userName: 'wenxin' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ records: financeRecords, logs: baseLogs }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          records: [{
            id: 'wenxin-income-1',
            month: '2026-06',
            date: '2026-06-09',
            owner: 'wenxin',
            type: 'income',
            title: 'wenxin 收入',
            amount: 1200,
            note: '',
            createdAt: '2026-06-09T00:00:00.000Z',
            updatedAt: '2026-06-09T00:00:00.000Z',
          }, ...financeRecords],
          logs: [{
            id: 'log-3',
            actor: 'wenxin',
            action: '新增流水',
            target: 'record',
            detail: 'wenxin 收入 1200',
            recordId: 'wenxin-income-1',
            recordMonth: '2026-06',
            createdAt: '2026-06-09T00:00:00.000Z',
          }, ...baseLogs],
        }),
      }));

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '登录' }));

    await waitFor(() => expect(screen.getByLabelText('月份')).toBeInTheDocument());
    const principalSection = screen.getByText('本金总览').closest('section');
    expect(principalSection).not.toBeNull();
    expect(within(principalSection as HTMLElement).getAllByText('¥0').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: '新增记录' }));
    fireEvent.click(screen.getByRole('button', { name: '收入' }));
    fireEvent.change(screen.getByLabelText('金额'), { target: { value: '1200' } });
    fireEvent.change(screen.getByLabelText('名称'), { target: { value: 'wenxin 收入' } });
    fireEvent.click(screen.getByRole('button', { name: '保存记录' }));

    const incomeCard = within(principalSection as HTMLElement).getByText('收入').closest('div');
    expect(incomeCard).not.toBeNull();
    await waitFor(() => expect(within(incomeCard as HTMLElement).getByText('¥1,200')).toBeInTheDocument());
  });

  it('未来日期的负债默认不影响本金，打开开关后才计入', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-05T12:00:00.000Z'));
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ token: 'token-1', userName: 'sifeng' }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          records: financeRecords.concat({
            id: '5',
            month: '2026-06',
            date: '2026-06-30',
            owner: 'sifeng',
            type: 'debt',
            title: '月底账单',
            amount: 3000,
            note: '',
            createdAt: '2026-06-01T00:00:00.000Z',
            updatedAt: '2026-06-01T00:00:00.000Z',
          }),
          logs: baseLogs,
        }),
      }));

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '登录' }));

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByLabelText('月份')).toBeInTheDocument();

    const principalPanel = screen.getByText('本金').closest('div');
    expect(principalPanel).not.toBeNull();
    expect(within(principalPanel as HTMLElement).getByText('¥14,000')).toBeInTheDocument();
    expect(screen.getAllByText('¥5,000').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: '未来负债' }));

    expect(within(principalPanel as HTMLElement).getByText('¥11,000')).toBeInTheDocument();
    expect(screen.getAllByText('¥5,000').length).toBeGreaterThan(0);
  });

  it('新增标记为还款的开销后会冲减月负债', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ token: 'token-1', userName: 'sifeng' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ records: financeRecords, logs: baseLogs }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          records: [
            {
              id: '5',
              month: '2026-06',
              date: '2026-06-05',
              owner: 'sifeng',
              type: 'expense',
              isRepayment: true,
              title: '信用卡还款',
              amount: 500,
              note: '',
              createdAt: '2026-06-05T00:00:00.000Z',
              updatedAt: '2026-06-05T00:00:00.000Z',
            },
            ...financeRecords,
          ],
          logs: [
            {
              id: 'log-3',
              actor: 'wenxin',
              action: '新增流水',
              target: 'record',
              detail: '信用卡还款 500',
              recordId: '5',
              recordMonth: '2026-06',
              createdAt: '2026-06-05T00:00:02.000Z',
            },
            ...baseLogs,
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          {
            id: 'log-3',
            actor: 'wenxin',
            action: '新增流水',
            target: 'record',
            detail: '信用卡还款 500',
            recordId: '5',
            recordMonth: '2026-06',
            createdAt: '2026-06-05T00:00:02.000Z',
          },
          ...baseLogs,
        ]),
      }));

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '登录' }));

    await waitFor(() => expect(screen.getByLabelText('月份')).toBeInTheDocument());
    expect(screen.getByText('¥2,000')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '新增记录' }));
    fireEvent.change(screen.getByLabelText('金额'), { target: { value: '500' } });
    fireEvent.change(screen.getByLabelText('名称'), { target: { value: '信用卡还款' } });
    fireEvent.click(screen.getByRole('button', { name: '还款' }));
    fireEvent.click(screen.getByRole('button', { name: '保存记录' }));

    await waitFor(() => expect(screen.getByText('¥1,500')).toBeInTheDocument());
    expect(fetch).toHaveBeenNthCalledWith(3, '/api/records', expect.objectContaining({
      method: 'POST',
      body: expect.stringContaining('"isRepayment":true'),
    }));

    fireEvent.click(screen.getByRole('tab', { name: '操作日志' }));
    await waitFor(() => expect(screen.getAllByText('新增流水').length).toBeGreaterThan(0));
    expect(screen.getByText('信用卡还款 500')).toBeInTheDocument();
  });

  it('支持密码显隐，并且流水和日志按10条分页', async () => {
    const pagedRecords = Array.from({ length: 12 }, (_, index) => ({
      id: `record-${index + 1}`,
      month: '2026-06',
      date: `2026-06-${String((index % 9) + 1).padStart(2, '0')}`,
      owner: 'sifeng' as const,
      type: 'income' as const,
      title: `记录${index + 1}`,
      amount: 1000 + index,
      note: '',
      createdAt: `2026-06-${String((index % 9) + 1).padStart(2, '0')}T00:00:00.000Z`,
      updatedAt: `2026-06-${String((index % 9) + 1).padStart(2, '0')}T00:00:00.000Z`,
    }));
    const pagedLogs = Array.from({ length: 12 }, (_, index) => ({
      id: `log-page-${index + 1}`,
      actor: index % 2 === 0 ? 'wenxin' as const : 'sifeng' as const,
      action: '新增流水',
      target: 'record',
      detail: `日志${index + 1}`,
      recordId: `record-${index + 1}`,
      recordMonth: '2026-06',
      createdAt: `2026-06-${String(12 - index).padStart(2, '0')}T00:00:00.000Z`,
    }));

    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ token: 'token-1', userName: 'wenxin' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ records: pagedRecords, logs: pagedLogs }) })
      .mockResolvedValueOnce({ ok: true, json: async () => pagedLogs }));

    render(<App />);

    const passwordInput = screen.getByLabelText('密码', { selector: 'input' }) as HTMLInputElement;
    expect(passwordInput.type).toBe('password');
    fireEvent.click(screen.getByRole('button', { name: '显示密码' }));
    expect(passwordInput.type).toBe('text');
    fireEvent.click(screen.getByRole('button', { name: '隐藏密码' }));
    expect(passwordInput.type).toBe('password');

    fireEvent.click(screen.getByRole('button', { name: '登录' }));
    await waitFor(() => expect(screen.getByLabelText('月份')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('tab', { name: '流水' }));
    expect(screen.getByText('记录1')).toBeInTheDocument();
    expect(screen.getByText('记录10')).toBeInTheDocument();
    expect(screen.queryByText('记录11')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '跳转到第2页' }));
    expect(screen.getByText('记录11')).toBeInTheDocument();
    expect(screen.getByText('记录12')).toBeInTheDocument();
    expect(screen.queryByText('记录1')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: '操作日志' }));
    await waitFor(() => expect(screen.getByText('日志1')).toBeInTheDocument());
    expect(screen.getByRole('heading', { name: '本金总览' })).toBeInTheDocument();
    expect(screen.getByText('日志10')).toBeInTheDocument();
    expect(screen.queryByText('日志11')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '跳转到第2页' }));
    expect(screen.getByText('日志11')).toBeInTheDocument();
    expect(screen.getByText('日志12')).toBeInTheDocument();
    expect(screen.queryByText('日志1')).not.toBeInTheDocument();
  });
});
