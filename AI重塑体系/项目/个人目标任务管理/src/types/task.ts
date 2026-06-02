export type Priority = 'year' | 'month' | 'week' | 'today';

export interface Project {
  id: string;
  name: string;
  description: string;
}

export interface Task {
  id: string;
  title: string;
  projectId: string;
  notes: string;
  priority: Priority;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  projects: Project[];
  tasks: Task[];
}

export interface TaskDraft {
  title: string;
  projectId: string;
  priority: Priority;
  notes: string;
}
