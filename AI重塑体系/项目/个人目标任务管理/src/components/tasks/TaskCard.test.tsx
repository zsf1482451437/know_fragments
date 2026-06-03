import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { projects, tasks } from '../../test/fixtures';
import { TaskCard } from './TaskCard';

describe('TaskCard', () => {
  const timedTask = tasks[1];
  const yearTask = tasks[0];
  const workTask = tasks[3];

  it('展示时间任务的阶段分区、优先级和子任务进度', () => {
    render(
      <TaskCard
        onAddSubtask={vi.fn()}
        onAdvance={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onToggle={vi.fn()}
        projects={projects}
        tasks={tasks}
        task={timedTask}
      />,
    );

    expect(screen.getByText('完成 01-basic-scene')).toBeInTheDocument();
    expect(screen.getAllByText('本周')).toHaveLength(2);
    expect(screen.getByRole('button', { name: '推进到今日' })).toBeInTheDocument();
    expect(screen.getByText('子任务进度 0/1')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: '子任务完成度' })).toHaveAttribute('aria-valuenow', '0');
  });

  it('本年任务展示推进到本月，工作任务不展示推进按钮', () => {
    const { rerender } = render(
      <TaskCard
        onAddSubtask={vi.fn()}
        onAdvance={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onToggle={vi.fn()}
        projects={projects}
        tasks={tasks}
        task={yearTask}
      />,
    );

    expect(screen.getByRole('button', { name: '推进到本月' })).toBeInTheDocument();

    rerender(
      <TaskCard
        onAddSubtask={vi.fn()}
        onAdvance={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onToggle={vi.fn()}
        projects={projects}
        tasks={tasks}
        task={workTask}
      />,
    );

    const card = screen.getByText('整理工作需求池').closest('article');
    expect(card).not.toBeNull();
    expect(within(card as HTMLElement).getByText('工作')).toBeInTheDocument();
    expect(within(card as HTMLElement).queryByRole('button', { name: /推进到/ })).not.toBeInTheDocument();
  });

  it('支持展开子任务和触发操作回调', () => {
    const onToggle = vi.fn();
    const onAdvance = vi.fn();
    const onEdit = vi.fn();
    const onAddSubtask = vi.fn();
    const onDelete = vi.fn();

    render(
      <TaskCard
        onAddSubtask={onAddSubtask}
        onAdvance={onAdvance}
        onDelete={onDelete}
        onEdit={onEdit}
        onToggle={onToggle}
        projects={projects}
        tasks={tasks}
        task={timedTask}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '展开子任务 (1)' }));
    expect(screen.getByText('输出 basic-scene 结论文档')).toBeInTheDocument();

    fireEvent.click(screen.getAllByLabelText('切换完成状态')[0]);
    fireEvent.click(screen.getAllByRole('button', { name: '推进到今日' })[0]);
    fireEvent.click(screen.getAllByRole('button', { name: '编辑' })[0]);
    fireEvent.click(screen.getAllByRole('button', { name: '新增子任务' })[0]);
    fireEvent.click(screen.getAllByRole('button', { name: '删除' })[0]);

    expect(onToggle).toHaveBeenCalledWith(timedTask);
    expect(onAdvance).toHaveBeenCalledWith(timedTask);
    expect(onEdit).toHaveBeenCalledWith(timedTask);
    expect(onAddSubtask).toHaveBeenCalledWith(timedTask);
    expect(onDelete).toHaveBeenCalledWith(timedTask);
  });
});
