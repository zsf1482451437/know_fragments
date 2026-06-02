import type { Priority, Task } from '../types/task';

export const priorityLabels: Record<Priority, string> = {
  year: '本年',
  month: '本月',
  week: '本周',
  today: '今日',
};

export const priorityStyles: Record<Priority, string> = {
  year: 'border-violet-200 bg-violet-50 text-violet-700',
  month: 'border-amber-200 bg-amber-50 text-amber-700',
  week: 'border-sky-200 bg-sky-50 text-sky-700',
  today: 'border-rose-200 bg-rose-50 text-rose-700',
};

export function countOpenTasks(tasks: Task[]) {
  return tasks.filter((task) => !task.completed).length;
}

export function countByPriority(tasks: Task[], priority: Priority) {
  return tasks.filter((task) => task.priority === priority && !task.completed).length;
}
