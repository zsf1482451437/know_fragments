import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { projects, tasks } from '../../test/fixtures';
import { TaskModal } from './TaskModal';

describe('TaskModal', () => {
  it('关闭时不渲染弹窗', () => {
    render(<TaskModal onClose={vi.fn()} onSubmit={vi.fn()} open={false} projects={projects} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('新增提交后调用保存并关闭', async () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TaskModal onClose={onClose} onSubmit={onSubmit} open projects={projects} />);

    fireEvent.change(screen.getByLabelText('任务标题'), { target: { value: '弹窗新增任务' } });
    fireEvent.click(screen.getByRole('button', { name: '添加任务' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ title: '弹窗新增任务' })));
    expect(onClose).toHaveBeenCalled();
  });

  it('编辑模式展示保存修改按钮', () => {
    render(<TaskModal onClose={vi.fn()} onSubmit={vi.fn()} open projects={projects} task={tasks[1]} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '保存修改' })).toBeInTheDocument();
  });
});
