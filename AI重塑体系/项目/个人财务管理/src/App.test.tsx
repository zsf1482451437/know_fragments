import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { financeRecords } from './test/fixtures';

describe('App', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('加载财务数据后展示时间选择器、Tab 页面和新增记录入口', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ records: financeRecords }) }));

    render(<App />);

    await waitFor(() => expect(screen.getByLabelText('复盘时间')).toBeInTheDocument());
    const timeSelect = screen.getByLabelText('复盘时间') as HTMLSelectElement;
    expect(Array.from(timeSelect.options).map((option) => option.value)).toEqual(['2026-06']);
    expect(screen.getByRole('tab', { name: '分类占比' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '流水' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '新增记录' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '分类占比圆形图表' })).toBeInTheDocument();
    expect(screen.getByText('¥6,000 / 20%')).toBeInTheDocument();
    expect(screen.getByText('按收入计算')).toBeInTheDocument();
    expect(screen.queryByText('占比 100%')).not.toBeInTheDocument();

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
    fireEvent.click(screen.getByRole('tab', { name: '分类占比' }));
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
  });

  it('未来日期的负债默认不影响本金，打开开关后才计入', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-05T12:00:00.000Z'));
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        records: financeRecords.concat({
          id: '5',
          month: '2026-06',
          date: '2026-06-30',
          type: 'debt',
          title: '月底账单',
          amount: 3000,
          note: '',
          createdAt: '2026-06-01T00:00:00.000Z',
          updatedAt: '2026-06-01T00:00:00.000Z',
        }),
      }),
    }));

    render(<App />);

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByLabelText('复盘时间')).toBeInTheDocument();

    const principalPanel = screen.getByText('本金').closest('div');
    expect(principalPanel).not.toBeNull();
    expect(within(principalPanel as HTMLElement).getByText('¥14,000')).toBeInTheDocument();
    expect(screen.getAllByText('¥5,000').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: '未来负债' }));

    expect(within(principalPanel as HTMLElement).getByText('¥11,000')).toBeInTheDocument();
    expect(screen.getAllByText('¥5,000').length).toBeGreaterThan(0);
  });
});
