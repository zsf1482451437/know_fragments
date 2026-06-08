import type { Task } from '../../types/task';
import { countByPriority, countCompletedByPriority, countOpenTasks, countWorkTasks } from '../../utils/taskFilters';

interface SummaryCardsProps {
  tasks: Task[];
}

export function SummaryCards({ tasks }: SummaryCardsProps) {
  const cards = [
    { label: '未完成任务', value: countOpenTasks(tasks), hint: '全部开放任务' },
    { label: '今日', value: countByPriority(tasks, 'today'), hint: '今日聚焦清单' },
    { label: '本周', value: countByPriority(tasks, 'week'), hint: '本周推进池' },
    { label: '工作', value: countWorkTasks(tasks), hint: '独立工作分区' },
  ];
  const completedCards = [
    { label: '日完成', value: countCompletedByPriority(tasks, 'today'), hint: '今日已完成' },
    { label: '周完成', value: countCompletedByPriority(tasks, 'week'), hint: '本周已完成' },
    { label: '月完成', value: countCompletedByPriority(tasks, 'month'), hint: '本月已完成' },
  ];

  return (
    <section className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm text-slate-500">{card.label}</p>
            <div className="mt-3 flex items-end justify-between">
              <strong className="text-3xl font-bold text-slate-950">{card.value}</strong>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{card.hint}</span>
            </div>
          </article>
        ))}
      </div>
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-soft">
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-emerald-900">已完成</h2>
            <p className="text-sm text-emerald-700">跟踪今日、本周和本月已经闭环的动作。</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {completedCards.map((card) => (
            <article key={card.label} className="rounded-2xl border border-emerald-100 bg-white/80 p-4">
              <p className="text-sm text-emerald-700">{card.label}</p>
              <div className="mt-3 flex items-end justify-between">
                <strong className="text-3xl font-bold text-emerald-950">{card.value}</strong>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">{card.hint}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
