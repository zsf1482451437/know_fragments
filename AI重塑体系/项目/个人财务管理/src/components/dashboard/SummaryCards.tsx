import type { MonthSummary } from '../../types/finance';
import { formatCurrency } from '../../utils/finance';

interface SummaryCardsProps {
  summary: MonthSummary;
}

const cardConfig = [
  { key: 'principal', label: '本月本金', hint: '收入 - 开销 - 投资 - 负债', className: 'from-mint-500 to-emerald-400 text-white' },
  { key: 'income', label: '收入', hint: '现金流入', className: 'from-emerald-50 to-white text-emerald-700' },
  { key: 'expense', label: '开销', hint: '消费支出', className: 'from-rose-50 to-white text-rose-700' },
  { key: 'investment', label: '投资', hint: '长期资产配置', className: 'from-sky-50 to-white text-sky-700' },
  { key: 'debt', label: '负债', hint: '本月偿债或欠款', className: 'from-amber-50 to-white text-amber-700' },
] as const;

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {cardConfig.map((card) => (
        <article className={`rounded-[1.5rem] bg-gradient-to-br p-5 shadow-soft ${card.className}`} key={card.key}>
          <p className="text-sm font-semibold opacity-80">{card.label}</p>
          <p className="mt-3 text-2xl font-black tracking-tight">{formatCurrency(summary[card.key])}</p>
          <p className="mt-2 text-xs opacity-70">{card.hint}</p>
        </article>
      ))}
    </section>
  );
}
