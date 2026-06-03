import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { projects, tasks } from '../../test/fixtures';
import { TaskForm } from './TaskForm';

describe('TaskForm', () => {
  it('填写任务并提交标准任务草稿', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TaskForm onSubmit={onSubmit} projects={projects} />);

    fireEvent.change(screen.getByLabelText('任务标题'), { target: { value: '写周复盘' } });
    fireEvent.change(screen.getByLabelText('备注'), { target: { value: '总结本周目标进展' } });
    fireEvent.change(screen.getByLabelText('阶段分区'), { target: { value: 'weekly' } });
    fireEvent.change(screen.getByLabelText('优先级'), { target: { value: 'week' } });
    fireEvent.click(screen.getByRole('button', { name: '添加任务' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      title: '写周复盘',
      notes: '总结本周目标进展',
      projectId: 'weekly',
      priority: 'week',
    })));
  });

  it('工作分区隐藏优先级并提交 null', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TaskForm onSubmit={onSubmit} projects={projects} />);

    fireEvent.change(screen.getByLabelText('阶段分区'), { target: { value: 'work' } });
    expect(screen.queryByLabelText('优先级')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('任务标题'), { target: { value: '整理工作任务' } });
    fireEvent.click(screen.getByRole('button', { name: '添加任务' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      projectId: 'work',
      priority: null,
    })));
  });

  it('编辑模式会回填任务并提交修改后的任务草稿', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TaskForm initialTask={tasks[1]} onSubmit={onSubmit} projects={projects} submitLabel="保存修改" />);

    expect(screen.getByLabelText('任务标题')).toHaveValue('完成 01-basic-scene');
    fireEvent.change(screen.getByLabelText('任务标题'), { target: { value: '完成 01-basic-scene 编辑版' } });
    fireEvent.click(screen.getByRole('button', { name: '保存修改' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      title: '完成 01-basic-scene 编辑版',
      projectId: 'weekly',
      priority: 'week',
    })));
  });

  it('子任务模式会继承父任务默认值', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TaskForm initialValues={{ projectId: 'weekly', priority: 'week', parentId: 'week-1' }} onSubmit={onSubmit} projects={projects} />);

    fireEvent.change(screen.getByLabelText('任务标题'), { target: { value: '子任务草稿' } });
    fireEvent.click(screen.getByRole('button', { name: '添加任务' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      title: '子任务草稿',
      projectId: 'weekly',
      priority: 'week',
      parentId: 'week-1',
    })));
  });
});
