import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { projects, tasks } from '../../test/fixtures';
import { ProjectSidebar } from './ProjectSidebar';

describe('ProjectSidebar', () => {
  it('按指定顺序展示项目分区和未完成任务数', () => {
    render(<ProjectSidebar onSelect={vi.fn()} projects={projects} selectedProjectId="all" tasks={tasks} />);

    expect(screen.getByText('项目分区')).toBeInTheDocument();
    const projectButtons = screen.getAllByRole('button').slice(1).map((button) => button.textContent ?? '');
    expect(projectButtons.map((text) => text.replace(/\d+/g, '').trim())).toEqual(['年度年度目标和长期方向', '本月月度重点', '今日今日关键动作', '等待等待事项', '想做以后再做', '工作工作相关任务']);

    const workButton = screen.getByRole('button', { name: /工作/ });
    expect(within(workButton).getByText('1')).toBeInTheDocument();
  });

  it('点击项目时回传项目 id', () => {
    const onSelect = vi.fn();
    render(<ProjectSidebar onSelect={onSelect} projects={projects} selectedProjectId="all" tasks={tasks} />);

    fireEvent.click(screen.getByRole('button', { name: /工作/ }));

    expect(onSelect).toHaveBeenCalledWith('work');
  });
});
