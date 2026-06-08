import type { FinanceRecord, MonthSummary, RecordType, TypeMeta } from '../types/finance';

export const recordTypeMeta: Record<RecordType, TypeMeta> = {
  preincome: { label: '预收入', tone: 'text-violet-700 bg-violet-50', dotClass: 'bg-violet-400' },
  income: { label: '收入', tone: 'text-emerald-700 bg-emerald-50', dotClass: 'bg-emerald-400' },
  expense: { label: '开销', tone: 'text-rose-700 bg-rose-50', dotClass: 'bg-rose-400' },
  debt: { label: '负债', tone: 'text-amber-700 bg-amber-50', dotClass: 'bg-amber-400' },
  investment: { label: '投资', tone: 'text-sky-700 bg-sky-50', dotClass: 'bg-sky-400' },
};

export function calculatePrincipal(input: Pick<MonthSummary, 'preincome' | 'income' | 'expense' | 'investment' | 'debt'>, includePreIncome = false) {
  const inflow = input.income + (includePreIncome ? input.preincome : 0);
  return roundMoney(inflow - input.expense - input.investment - input.debt);
}

export function calculateDebtAffectingPrincipal(
  records: FinanceRecord[],
  month: string,
  currentDate = getCurrentDate(),
  includeFutureDebt = false,
) {
  return roundMoney(
    records
      .filter((record) => record.type === 'debt' && record.month === month)
      .filter((record) => includeFutureDebt || record.date <= currentDate)
      .reduce((sum, record) => sum + record.amount, 0),
  );
}

export function getRecordNetAmount(record: Pick<FinanceRecord, 'type' | 'amount'>) {
  return record.type === 'income' || record.type === 'preincome' ? roundMoney(record.amount) : roundMoney(-record.amount);
}

export function calculateMonthSummary(records: FinanceRecord[], month: string): MonthSummary {
  const monthRecords = records.filter((record) => record.month === month);
  const summary = monthRecords.reduce(
    (acc, record) => {
      acc[record.type] += record.amount;
      return acc;
    },
    { preincome: 0, income: 0, expense: 0, debt: 0, investment: 0 },
  );

  return {
    month,
    ...summary,
    principal: calculatePrincipal(summary, false),
    recordCount: monthRecords.length,
  };
}

export function getAvailableMonths(records: FinanceRecord[]) {
  const currentMonth = getCurrentMonth();
  const startMonth = records.reduce<string | null>((earliest, record) => {
    if (!earliest || record.month < earliest) {
      return record.month;
    }
    return earliest;
  }, null);

  return Array.from(new Set([currentMonth, startMonth].filter((month): month is string => Boolean(month))))
    .sort((a, b) => b.localeCompare(a));
}

export function getRecentSummaries(records: FinanceRecord[], limit = 6) {
  return getAvailableMonths(records)
    .slice(0, limit)
    .map((month) => calculateMonthSummary(records, month))
    .reverse();
}

export function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function getCurrentDate() {
  return new Date().toISOString().slice(0, 10);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    maximumFractionDigits: 0,
  }).format(value);
}

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
