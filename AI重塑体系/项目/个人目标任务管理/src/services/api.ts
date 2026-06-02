import type { AppState, Task, TaskDraft } from '../types/task';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`请求失败：${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function fetchState() {
  return request<AppState>('/api/state');
}

export function createTask(task: TaskDraft) {
  return request<AppState>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(task),
  });
}

export function updateTask(id: string, updates: Partial<Task>) {
  return request<AppState>(`/api/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export function deleteTask(id: string) {
  return request<AppState>(`/api/tasks/${id}`, {
    method: 'DELETE',
  });
}
