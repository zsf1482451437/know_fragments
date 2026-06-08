import { describe, expect, it } from 'vitest';
import { financeRecords } from '../test/fixtures';
import { calculateDebtAffectingPrincipal, calculateMonthSummary, calculatePrincipal, getAvailableMonths, getRecentSummaries, getRecordNetAmount } from './finance';

describe('finance utils', () => {
  it('按收入、开销、投资、负债计算本金', () => {
    expect(calculatePrincipal({ preincome: 5000, income: 30000, expense: 6000, investment: 8000, debt: 2000 })).toBe(14000);
    expect(calculatePrincipal({ preincome: 5000, income: 30000, expense: 6000, investment: 8000, debt: 2000 }, true)).toBe(19000);
  });

  it('流水净额中收入为正值，支出类为负值', () => {
    expect(getRecordNetAmount({ type: 'income', amount: 1000 })).toBe(1000);
    expect(getRecordNetAmount({ type: 'preincome', amount: 500 })).toBe(500);
    expect(getRecordNetAmount({ type: 'expense', amount: 200 })).toBe(-200);
    expect(getRecordNetAmount({ type: 'investment', amount: 300 })).toBe(-300);
    expect(getRecordNetAmount({ type: 'debt', amount: 400 })).toBe(-400);
  });

  it('按月份汇总财务记录并产出本金', () => {
    expect(calculateMonthSummary(financeRecords, '2026-06')).toMatchObject({
      preincome: 5000,
      income: 30000,
      expense: 6000,
      investment: 8000,
      debt: 2000,
      principal: 14000,
      recordCount: 5,
    });
  });

  it('同月新增多笔负债记录时会累计到总负债', () => {
    const recordsWithMoreDebt = financeRecords.concat({
      id: '5',
      month: '2026-06',
      date: '2026-06-05',
      type: 'debt',
      title: '消费分期',
      amount: 1200,
      note: '',
      createdAt: '2026-06-05T00:00:00.000Z',
      updatedAt: '2026-06-05T00:00:00.000Z',
    });

    expect(calculateMonthSummary(recordsWithMoreDebt, '2026-06')).toMatchObject({
      preincome: 5000,
      debt: 3200,
      principal: 12800,
      recordCount: 6,
    });
  });

  it('未来日期的负债默认不计入本金，打开开关后才计入', () => {
    const recordsWithFutureDebt = financeRecords.concat({
      id: '5',
      month: '2026-06',
      date: '2026-06-30',
      type: 'debt',
      title: '月底账单',
      amount: 3000,
      note: '',
      createdAt: '2026-06-01T00:00:00.000Z',
      updatedAt: '2026-06-01T00:00:00.000Z',
    });

    expect(calculateDebtAffectingPrincipal(recordsWithFutureDebt, '2026-06', '2026-06-05')).toBe(2000);
    expect(calculateDebtAffectingPrincipal(recordsWithFutureDebt, '2026-06', '2026-06-05', true)).toBe(5000);
  });

  it('月份列表按倒序排列并包含当前月', () => {
    const months = getAvailableMonths(financeRecords);
    const currentMonth = new Date().toISOString().slice(0, 7);
    const expected = [currentMonth];
    expect(months).toEqual(expected);
  });

  it('最近月度趋势按时间正序返回', () => {
    const summaries = getRecentSummaries(financeRecords, 2);
    expect(summaries).toHaveLength(1);
    expect(summaries[0].month).toBe('2026-06');
  });
});
