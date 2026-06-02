import type { Task } from '../../types/task';
import { countByPriority, countOpenTasks } from '../../utils/taskFilters';

interface SummaryCardsProps {
  tasks: Task[];
}

export function SummaryCards({ tasks }: SummaryCardsProps) {
  const cards = [
    { label: '未完成任务', value: countOpenTasks(tasks), hint: '全部开放任务' },
    { label: '今日', value: countByPriority(tasks, 'today'), hint: '今日聚焦清单' },
    { label: '本周', value: countByPriority(tasks, 'week'), hint: '本周推进池' },
    { label: '本年', value: countByPriority(tasks, 'year'), hint: '年度方向' },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article key={card.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-slate-500">{card.label}</p>
          <div className="mt-3 flex items-end justify-between">
            <strong className="text-3xl font-bold text-slate-950">{card.value}</strong>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{card.hint}</span>
          </div>
        </article>
      ))}
    </section>
  );
}
