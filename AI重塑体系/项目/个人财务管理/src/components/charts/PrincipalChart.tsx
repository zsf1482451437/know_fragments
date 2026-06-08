import type { MonthSummary } from '../../types/finance';
import { calculatePrincipal, formatCurrency } from '../../utils/finance';

interface PrincipalChartProps {
  summary: MonthSummary;
  includePreIncome: boolean;
  includeFutureDebtInPrincipal: boolean;
  onToggleIncludePreIncome: () => void;
  onToggleIncludeFutureDebtInPrincipal: () => void;
  principalDebt: number;
}

export function PrincipalChart({
  summary,
  includePreIncome,
  includeFutureDebtInPrincipal,
  onToggleIncludePreIncome,
  onToggleIncludeFutureDebtInPrincipal,
  principalDebt,
}: PrincipalChartProps) {
  const principal = calculatePrincipal({ ...summary, debt: principalDebt }, includePreIncome);
  const size = 240;
  const stroke = 18;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const inflow = summary.income + (includePreIncome ? summary.preincome : 0);
  const ratioBase = Math.max(inflow, summary.expense + summary.investment + principalDebt, 1);
  const ratio = Math.min(Math.abs(principal) / ratioBase, 1);
  const dashOffset = circumference * (1 - ratio);
  const isPositive = principal >= 0;
  const accent = isPositive ? '#20ad80' : '#f43f5e';
  const caption = isPositive ? '本金状态健康' : '本金已转负，建议收缩支出';

  return (
    <section className="rounded-[1.5rem] bg-white p-5 shadow-soft">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">本金总览</h2>
          <p className="text-xs text-slate-400">{summary.month} · 当前日期后的负债默认不计入本金，可切换预收入与未来负债口径</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isPositive ? 'bg-mint-50 text-mint-600' : 'bg-rose-50 text-rose-600'}`}>{caption}</span>
          <label className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
            <span>预收入</span>
            <button
              aria-label="预收入"
              aria-pressed={includePreIncome}
              className={`relative h-6 w-11 rounded-full transition ${includePreIncome ? 'bg-violet-500' : 'bg-slate-300'}`}
              onClick={onToggleIncludePreIncome}
              type="button"
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition ${includePreIncome ? 'left-[1.45rem]' : 'left-0.5'}`} />
            </button>
          </label>
          <label className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
            <span>未来负债</span>
            <button
              aria-label="未来负债"
              aria-pressed={includeFutureDebtInPrincipal}
              className={`relative h-6 w-11 rounded-full transition ${includeFutureDebtInPrincipal ? 'bg-amber-500' : 'bg-slate-300'}`}
              onClick={onToggleIncludeFutureDebtInPrincipal}
              type="button"
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition ${includeFutureDebtInPrincipal ? 'left-[1.45rem]' : 'left-0.5'}`} />
            </button>
          </label>
        </div>
      </div>
      <div className="flex flex-col items-center gap-5 lg:flex-row lg:justify-between">
        <div className="relative flex h-64 w-64 items-center justify-center">
          <svg aria-label="本金圆形图表" className="h-64 w-64 -rotate-90" viewBox={`0 0 ${size} ${size}`} role="img">
            <circle cx={size / 2} cy={size / 2} fill="none" r={radius} stroke="#e5e7eb" strokeWidth={stroke} />
            <circle
              cx={size / 2}
              cy={size / 2}
              fill="none"
              r={radius}
              stroke={accent}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              strokeWidth={stroke}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">本金</span>
            <span className={`mt-2 text-3xl font-black ${isPositive ? 'text-mint-600' : 'text-rose-600'}`}>{formatCurrency(principal)}</span>
            <span className="mt-2 text-xs text-slate-400">占基数 {Math.round(ratio * 100)}%</span>
          </div>
        </div>
        <div className="grid w-full gap-3 lg:max-w-md">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-3xl bg-violet-50 px-4 py-3">
              <p className="text-xs font-semibold text-violet-600">预收入</p>
              <p className="mt-1 text-lg font-black text-violet-700">{formatCurrency(summary.preincome)}</p>
            </div>
            <div className="rounded-3xl bg-emerald-50 px-4 py-3">
              <p className="text-xs font-semibold text-emerald-600">收入</p>
              <p className="mt-1 text-lg font-black text-emerald-700">{formatCurrency(summary.income)}</p>
            </div>
            <div className="rounded-3xl bg-rose-50 px-4 py-3">
              <p className="text-xs font-semibold text-rose-600">总流出</p>
              <p className="mt-1 text-lg font-black text-rose-700">{formatCurrency(summary.expense + summary.debt)}</p>
            </div>
            <div className="rounded-3xl bg-sky-50 px-4 py-3">
              <p className="text-xs font-semibold text-sky-600">投资</p>
              <p className="mt-1 text-lg font-black text-sky-700">{formatCurrency(summary.investment)}</p>
            </div>
            <div className="rounded-3xl bg-orange-50 px-4 py-3">
              <p className="text-xs font-semibold text-orange-600">月负债</p>
              <p className="mt-1 text-lg font-black text-orange-700">{formatCurrency(summary.debt)}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
