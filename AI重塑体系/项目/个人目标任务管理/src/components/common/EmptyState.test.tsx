import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('展示空状态提示', () => {
    render(<EmptyState />);

    expect(screen.getByText('当前筛选下没有任务')).toBeInTheDocument();
    expect(screen.getByText('可以新增一个下一步动作，或者切换到全部阶段。')).toBeInTheDocument();
  });
});
