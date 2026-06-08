import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Task } from '../../types/task';
import { projects, tasks } from '../../test/fixtures';
import { TaskBoard } from './TaskBoard';

describe('TaskBoard', () => {
  it('按优先级分组展示根任务，并单独展示工作分区', () => {
    render(<TaskBoard allTasks={tasks} onAddSubtask={vi.fn()} onAdvance={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} onToggle={vi.fn()} projects={projects} tasks={tasks} />);

    expect(screen.getByRole('heading', { name: '本年' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '本周' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '工作' })).toBeInTheDocument();
    expect(screen.getByText('系统掌握 Web3D 工程化能力')).toBeInTheDocument();
    expect(screen.getByText('完成 01-basic-scene')).toBeInTheDocument();
    expect(screen.getByText('整理工作需求池')).toBeInTheDocument();
    expect(screen.queryByText('输出 basic-scene 结论文档')).not.toBeInTheDocument();
  });

  it('没有对应根任务时不展示该时间分组', () => {
    render(<TaskBoard allTasks={tasks} onAddSubtask={vi.fn()} onAdvance={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} onToggle={vi.fn()} projects={projects} tasks={tasks.filter((task) => task.priority !== 'today')} />);

    expect(screen.queryByRole('heading', { name: '今日' })).not.toBeInTheDocument();
  });

  it('分区筛选后会展示父任务不在当前结果集中的子任务和旧任务', () => {
    const weeklySubtask: Task = {
      ...tasks[2],
      id: 'weekly-child-only',
      title: '跨阶段周子任务',
      parentId: 'month-parent-outside-view',
      projectId: 'weekly',
      priority: 'week',
    };
    const legacyWeeklyTask: Task = {
      ...tasks[1],
      id: 'legacy-weekly',
      title: '旧版周任务',
      projectId: 'weekly',
      priority: null,
      parentId: null,
    };

    render(
      <TaskBoard
        allTasks={[weeklySubtask, legacyWeeklyTask]}
        onAddSubtask={vi.fn()}
        onAdvance={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onToggle={vi.fn()}
        projects={projects}
        tasks={[weeklySubtask, legacyWeeklyTask]}
      />,
    );

    expect(screen.getByRole('heading', { name: '本周' })).toBeInTheDocument();
    expect(screen.getByText('跨阶段周子任务')).toBeInTheDocument();
    expect(screen.getByText('旧版周任务')).toBeInTheDocument();
  });

  it('筛选视图中父任务仍可展开全量子任务', () => {
    const monthlyParent: Task = {
      ...tasks[0],
      id: 'month-parent',
      title: '月度父任务',
      projectId: 'monthly',
      priority: 'month',
      parentId: null,
    };
    const weeklyChild: Task = {
      ...tasks[1],
      id: 'week-child-under-month',
      title: '月任务下的周子任务',
      projectId: 'weekly',
      priority: 'week',
      parentId: 'month-parent',
    };

    render(
      <TaskBoard
        allTasks={[monthlyParent, weeklyChild]}
        onAddSubtask={vi.fn()}
        onAdvance={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onToggle={vi.fn()}
        projects={projects}
        tasks={[monthlyParent]}
      />,
    );

    expect(screen.getByRole('button', { name: '展开子任务 (1)' })).toBeInTheDocument();
  });
});
