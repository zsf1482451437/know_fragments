import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { tasks } from '../../test/fixtures';
import { SummaryCards } from './SummaryCards';

describe('SummaryCards', () => {
  it('展示未完成、今日、本年统计', () => {
    render(<SummaryCards tasks={tasks} />);

    expect(screen.getByText('未完成任务')).toBeInTheDocument();
    expect(screen.getByText('本年')).toBeInTheDocument();
    expect(screen.getByText('全部开放任务').previousElementSibling).toHaveTextContent('2');
    expect(screen.getByText('今日聚焦清单').previousElementSibling).toHaveTextContent('1');
  });
});
