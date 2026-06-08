import type { FinanceRecord, FinanceRecordDraft, FinanceState } from '../types/finance';

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
  return request<FinanceState>('/api/state');
}

export function createRecord(record: FinanceRecordDraft) {
  return request<FinanceState>('/api/records', {
    method: 'POST',
    body: JSON.stringify(record),
  });
}

export function updateRecord(id: string, record: Partial<FinanceRecord>) {
  return request<FinanceState>(`/api/records/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(record),
  });
}

export function deleteRecord(id: string) {
  return request<FinanceState>(`/api/records/${id}`, { method: 'DELETE' });
}
