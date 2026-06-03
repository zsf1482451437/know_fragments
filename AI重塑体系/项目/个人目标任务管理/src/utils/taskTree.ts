import type { Task } from '../types/task';

export function getDirectSubtasks(tasks: Task[], taskId: string) {
  return tasks.filter((task) => task.parentId === taskId);
}

export function getDescendantTasks(tasks: Task[], taskId: string) {
  const descendants: Task[] = [];
  const stack = getDirectSubtasks(tasks, taskId);

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) {
      continue;
    }
    descendants.push(current);
    stack.push(...getDirectSubtasks(tasks, current.id));
  }

  return descendants;
}

export function getAncestorTasks(tasks: Task[], taskId: string) {
  const taskMap = new Map(tasks.map((task) => [task.id, task]));
  const ancestors: Task[] = [];
  let current = taskMap.get(taskId);

  while (current?.parentId) {
    const parent = taskMap.get(current.parentId);
    if (!parent) {
      break;
    }
    ancestors.push(parent);
    current = parent;
  }

  return ancestors;
}

export function getTaskProgress(tasks: Task[], taskId: string) {
  const descendants = getDescendantTasks(tasks, taskId);
  const completedCount = descendants.filter((task) => task.completed).length;

  return {
    totalCount: descendants.length,
    completedCount,
    percentage: descendants.length === 0 ? 0 : Math.round((completedCount / descendants.length) * 100),
  };
}
