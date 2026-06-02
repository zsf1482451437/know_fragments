import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { projects, tasks } from '../../test/fixtures';
import { TaskBoard } from './TaskBoard';

describe('TaskBoard', () => {
  it('按优先级分组展示任务', () => {
    render(<TaskBoard onDelete={vi.fn()} onEdit={vi.fn()} onPromoteToday={vi.fn()} onToggle={vi.fn()} projects={projects} tasks={tasks} />);

    expect(screen.getByRole('heading', { name: '本年' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '今日' })).toBeInTheDocument();
    expect(screen.getByText('系统掌握 Web3D 工程化能力')).toBeInTheDocument();
    expect(screen.getByText('完成 01-basic-scene')).toBeInTheDocument();
  });

  it('不展示没有任务的优先级分组', () => {
    render(<TaskBoard onDelete={vi.fn()} onEdit={vi.fn()} onPromoteToday={vi.fn()} onToggle={vi.fn()} projects={projects} tasks={tasks.filter((task) => task.priority !== 'week')} />);

    expect(screen.queryByRole('heading', { name: '本周' })).not.toBeInTheDocument();
  });
});
