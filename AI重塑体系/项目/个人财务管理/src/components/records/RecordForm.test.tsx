import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RecordForm } from './RecordForm';

describe('RecordForm', () => {
  it('默认选中当天日期并按该日期生成月份', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<RecordForm onSubmit={onSubmit} />);

    const today = new Date().toISOString().slice(0, 10);
    const dateInput = screen.getByLabelText('日期') as HTMLInputElement;
    expect(dateInput.value).toBe(today);

    fireEvent.change(screen.getByLabelText('名称'), { target: { value: '今日工资' } });
    fireEvent.change(screen.getByLabelText('金额'), { target: { value: '1000' } });
    fireEvent.click(screen.getByRole('button', { name: '保存记录' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
        date: today,
        month: today.slice(0, 7),
        title: '今日工资',
        amount: 1000,
      }));
    });
  });

  it('名称和备注留空时按空字符串提交', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<RecordForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('金额'), { target: { value: '88' } });
    fireEvent.click(screen.getByRole('button', { name: '保存记录' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
        title: '',
        note: '',
        amount: 88,
      }));
    });
  });

  it('新增负债时提示会影响月负债', () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<RecordForm onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: '负债' }));

    expect(screen.getByText('新增一笔负债后，会计入当前复盘月份的月负债。')).toBeInTheDocument();
  });
});
