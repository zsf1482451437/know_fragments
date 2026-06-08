import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SummaryCards } from './SummaryCards';

describe('SummaryCards', () => {
  it('突出展示本月本金和公式说明', () => {
    render(<SummaryCards summary={{ month: '2026-06', preincome: 0, income: 30000, expense: 6000, investment: 8000, debt: 2000, principal: 14000, recordCount: 4 }} />);

    expect(screen.getByText('本月本金')).toBeInTheDocument();
    expect(screen.getByText('收入 - 开销 - 投资 - 负债')).toBeInTheDocument();
    expect(screen.getByText('¥14,000')).toBeInTheDocument();
  });
});
