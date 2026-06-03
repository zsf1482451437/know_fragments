import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { projects, tasks } from '../../test/fixtures';
import { SectionSidebar } from './SectionSidebar';

describe('SectionSidebar', () => {
  it('按指定顺序展示阶段分区和未完成任务数', () => {
    render(<SectionSidebar onSelect={vi.fn()} projects={projects} selectedSectionId="all" tasks={tasks} />);

    expect(screen.getByText('阶段分区')).toBeInTheDocument();
    const sectionButtons = screen.getAllByRole('button').slice(1).map((button) => button.textContent ?? '');
    expect(sectionButtons.map((text) => text.replace(/\d+/g, '').trim())).toEqual(['年度年度目标和长期方向', '本月月度重点', '本周周度重点', '今日今日关键动作', '工作工作相关任务']);

    const weeklyButton = screen.getByRole('button', { name: /本周/ });
    expect(within(weeklyButton).getByText('2')).toBeInTheDocument();
  });

  it('点击阶段时回传阶段 id', () => {
    const onSelect = vi.fn();
    render(<SectionSidebar onSelect={onSelect} projects={projects} selectedSectionId="all" tasks={tasks} />);

    fireEvent.click(screen.getByRole('button', { name: /工作/ }));

    expect(onSelect).toHaveBeenCalledWith('work');
  });
});
