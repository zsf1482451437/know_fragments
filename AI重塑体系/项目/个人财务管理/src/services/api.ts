import type { AuthSession, FinanceRecord, FinanceRecordDraft, FinanceState, OperationLog } from '../types/finance';

const authStorageKey = 'finance-auth-session';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function getStoredAuthSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(authStorageKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    window.localStorage.removeItem(authStorageKey);
    return null;
  }
}

export function setStoredAuthSession(session: AuthSession) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(authStorageKey, JSON.stringify(session));
  }
}

export function clearStoredAuthSession() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(authStorageKey);
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const session = getStoredAuthSession();
  const headers = {
    'Content-Type': 'application/json',
    ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
    ...(options?.headers as Record<string, string> | undefined),
  };
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredAuthSession();
    }
    throw new ApiError(`请求失败：${response.status}`, response.status);
  }

  return response.json() as Promise<T>;
}

export async function login(userName: string, password: string) {
  const session = await request<AuthSession>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ userName, password }),
    headers: { 'Content-Type': 'application/json' },
  });
  setStoredAuthSession(session);
  return session;
}

export async function logout() {
  try {
    await request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' });
  } finally {
    clearStoredAuthSession();
  }
}

export function fetchState() {
  return request<FinanceState>('/api/state');
}

export function fetchLogs() {
  return request<OperationLog[]>('/api/logs');
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
