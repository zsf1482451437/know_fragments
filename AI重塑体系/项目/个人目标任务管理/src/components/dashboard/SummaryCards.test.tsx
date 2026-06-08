import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { tasks } from '../../test/fixtures';
import { SummaryCards } from './SummaryCards';

describe('SummaryCards', () => {
  it('展示未完成统计和已完成面板', () => {
    render(<SummaryCards tasks={tasks} />);

    expect(screen.getByText('未完成任务')).toBeInTheDocument();
    expect(screen.getByText('工作')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '已完成' })).toBeInTheDocument();
    expect(screen.getByText('日完成')).toBeInTheDocument();
    expect(screen.getByText('周完成')).toBeInTheDocument();
    expect(screen.getByText('月完成')).toBeInTheDocument();
    expect(screen.getByText('全部开放任务').previousElementSibling).toHaveTextContent('4');
    expect(screen.getByText('今日聚焦清单').previousElementSibling).toHaveTextContent('0');
    expect(screen.getByText('本周推进池').previousElementSibling).toHaveTextContent('2');
    expect(screen.getByText('独立工作分区').previousElementSibling).toHaveTextContent('1');
    expect(screen.getByText('今日已完成').previousElementSibling).toHaveTextContent('0');
    expect(screen.getByText('本周已完成').previousElementSibling).toHaveTextContent('0');
    expect(screen.getByText('本月已完成').previousElementSibling).toHaveTextContent('0');
  });
});
