import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Header } from './Header';

describe('Header', () => {
  it('展示产品标题和任务管理闭环说明', () => {
    render(<Header />);

    expect(screen.getByRole('heading', { name: '个人目标任务管理' })).toBeInTheDocument();
    expect(screen.getByText(/目标 -> 本月 -> 本周 -> 今日/)).toBeInTheDocument();
    expect(screen.getByText('今日只保留 3-5 个关键动作')).toBeInTheDocument();
  });
});
