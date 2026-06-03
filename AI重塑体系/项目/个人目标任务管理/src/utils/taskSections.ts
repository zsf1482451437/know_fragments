import type { Priority, Project, Task } from '../types/task';

export const priorityToSectionId: Record<Priority, string> = {
  year: 'goals',
  month: 'monthly',
  week: 'weekly',
  today: 'today',
};

export const sectionIdToPriority: Record<string, Priority> = {
  goals: 'year',
  monthly: 'month',
  weekly: 'week',
  today: 'today',
};

export function getTaskSectionId(task: Task) {
  if (task.projectId === 'work') {
    return 'work';
  }

  if (task.priority) {
    return priorityToSectionId[task.priority];
  }

  return task.projectId;
}

export function getTaskSection(task: Task, projects: Project[]) {
  const sectionId = getTaskSectionId(task);
  return projects.find((project) => project.id === sectionId);
}
