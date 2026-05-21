import type { PlanData, PlanEntry, RecentPlan, SubTask, TaskFormValues, TaskStatus, TodayTask } from '../types/plan';

const completedStatuses: TaskStatus[] = ['已完成'];
const ignoredStatuses: TaskStatus[] = ['取消'];

export function parseHours(value: string): number {
  const matched = value.match(/(\d+(?:\.\d+)?)/);
  return matched ? Number(matched[1]) : 0;
}

export function sumTodayHours(tasks: TodayTask[]): number {
  return tasks.reduce((total, task) => total + parseHours(task.timebox), 0);
}

export function calculateCompletionRate(tasks: Array<{ status: TaskStatus }>): number {
  const effectiveTasks = tasks.filter((task) => !ignoredStatuses.includes(task.status));

  if (effectiveTasks.length === 0) {
    return 0;
  }

  const completedCount = effectiveTasks.filter((task) => completedStatuses.includes(task.status)).length;
  return Math.round((completedCount / effectiveTasks.length) * 100);
}

export function getPlanSubTasks(subTasks: SubTask[], planId: string): SubTask[] {
  return subTasks.filter((task) => task.planId === planId);
}

export function getPlanProgress(plan: RecentPlan, subTasks: SubTask[]): number {
  const tasks = getPlanSubTasks(subTasks, plan.id);
  return tasks.length > 0 ? calculateCompletionRate(tasks) : plan.progress;
}

export function getActiveEntry(plan: PlanData): PlanEntry {
  return plan.entries.find((entry) => entry.date === plan.activeDate) ?? plan.entries[0];
}

export function sortEntriesByDate(entries: PlanEntry[]): PlanEntry[] {
  return [...entries].sort((left, right) => right.date.localeCompare(left.date));
}

function updateActiveEntry(plan: PlanData, updater: (entry: PlanEntry) => PlanEntry): PlanData {
  const activeEntry = getActiveEntry(plan);
  return {
    ...plan,
    entries: plan.entries.map((entry) => entry.date === activeEntry.date ? updater(entry) : entry)
  };
}

export function setActiveDate(plan: PlanData, nextDate: string): PlanData {
  return { ...plan, activeDate: nextDate };
}

export function findInvalidTodayTasks(entry: PlanEntry): TodayTask[] {
  const validIds = new Set(entry.recentPlans.map((item) => item.id));
  validIds.add('MAINTAIN');
  return entry.tasks.filter((task) => !validIds.has(task.planId));
}

export function updateTodayTaskStatus(plan: PlanData, taskId: string, status: TodayTask['status']): PlanData {
  return updateActiveEntry(plan, (entry) => ({
    ...entry,
    tasks: entry.tasks.map((task) => task.id === taskId ? { ...task, status } : task)
  }));
}

export function toggleTomorrowCandidate(plan: PlanData, candidateId: string): PlanData {
  return updateActiveEntry(plan, (entry) => ({
    ...entry,
    tomorrowCandidates: entry.tomorrowCandidates.map((candidate) =>
      candidate.id === candidateId ? { ...candidate, selected: !candidate.selected } : candidate
    )
  }));
}

export function reorderTodayTasks(plan: PlanData, sourceIndex: number, targetIndex: number): PlanData {
  return updateActiveEntry(plan, (entry) => {
    if (sourceIndex === targetIndex || sourceIndex < 0 || targetIndex < 0) {
      return entry;
    }

    const nextTasks = [...entry.tasks];
    const [movedTask] = nextTasks.splice(sourceIndex, 1);
    nextTasks.splice(targetIndex, 0, movedTask);

    return {
      ...entry,
      tasks: nextTasks
    };
  });
}

export function upsertTodayTask(plan: PlanData, values: TaskFormValues): PlanData {
  return updateActiveEntry(plan, (entry) => {
    const nextTask: TodayTask = {
      id: values.id ?? `D-${Math.random().toString(36).slice(2, 8)}`,
      timebox: values.timebox,
      title: values.title,
      planId: values.planId,
      deliverable: values.deliverable,
      doneCriteria: values.doneCriteria,
      status: values.status
    };

    const tasks = values.id
      ? entry.tasks.map((task) => task.id === values.id ? nextTask : task)
      : [...entry.tasks, nextTask];

    return {
      ...entry,
      tasks
    };
  });
}

export function createArchiveEntry(plan: PlanData, date: string): PlanData {
  if (plan.entries.some((entry) => entry.date === date)) {
    return { ...plan, activeDate: date };
  }

  const source = getActiveEntry(plan);
  const nextEntry: PlanEntry = {
    ...source,
    date,
    coreGoal: '待补充今日核心目标',
    status: '未开始',
    tasks: [],
    tomorrowCandidates: source.tomorrowCandidates.map((candidate) => ({
      ...candidate,
      selected: false
    })),
    review: {
      completed: '',
      unfinished: '',
      blockers: '',
      tomorrowFocus: '',
      postponedOrDropped: ''
    }
  };

  return {
    ...plan,
    activeDate: date,
    entries: sortEntriesByDate([...plan.entries, nextEntry])
  };
}
