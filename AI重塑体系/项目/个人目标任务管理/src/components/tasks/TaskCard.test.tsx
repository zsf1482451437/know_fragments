import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { projects, tasks } from '../../test/fixtures';
import { TaskCard } from './TaskCard';

describe('TaskCard', () => {
  const task = tasks[1];
  const project = projects.find((item) => item.id === task.projectId);

  it('展示任务详情、项目分区和优先级', () => {
    render(<TaskCard onDelete={vi.fn()} onEdit={vi.fn()} onPromoteToday={vi.fn()} onToggle={vi.fn()} project={project} task={task} />);

    expect(screen.getByText('完成 01-basic-scene')).toBeInTheDocument();
    expect(screen.getByText('工作')).toBeInTheDocument();
    expect(screen.getByText('今日')).toBeInTheDocument();
  });

  it('点击操作按钮时触发对应回调', () => {
    const onToggle = vi.fn();
    const onPromoteToday = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(<TaskCard onDelete={onDelete} onEdit={onEdit} onPromoteToday={onPromoteToday} onToggle={onToggle} project={project} task={task} />);

    fireEvent.click(screen.getByLabelText('切换完成状态'));
    fireEvent.click(screen.getByRole('button', { name: '放到今日' }));
    fireEvent.click(screen.getByRole('button', { name: '编辑' }));
    fireEvent.click(screen.getByRole('button', { name: '删除' }));

    expect(onToggle).toHaveBeenCalledWith(task);
    expect(onPromoteToday).toHaveBeenCalledWith(task);
    expect(onEdit).toHaveBeenCalledWith(task);
    expect(onDelete).toHaveBeenCalledWith(task);
  });
});
