import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { projects, tasks } from '../../test/fixtures';
import { TaskBoard } from './TaskBoard';

describe('TaskBoard', () => {
  it('按优先级分组展示根任务，并单独展示工作分区', () => {
    render(<TaskBoard onAddSubtask={vi.fn()} onAdvance={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} onToggle={vi.fn()} projects={projects} tasks={tasks} />);

    expect(screen.getByRole('heading', { name: '本年' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '本周' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '工作' })).toBeInTheDocument();
    expect(screen.getByText('系统掌握 Web3D 工程化能力')).toBeInTheDocument();
    expect(screen.getByText('完成 01-basic-scene')).toBeInTheDocument();
    expect(screen.getByText('整理工作需求池')).toBeInTheDocument();
    expect(screen.queryByText('输出 basic-scene 结论文档')).not.toBeInTheDocument();
  });

  it('没有对应根任务时不展示该时间分组', () => {
    render(<TaskBoard onAddSubtask={vi.fn()} onAdvance={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} onToggle={vi.fn()} projects={projects} tasks={tasks.filter((task) => task.priority !== 'today')} />);

    expect(screen.queryByRole('heading', { name: '今日' })).not.toBeInTheDocument();
  });
});
