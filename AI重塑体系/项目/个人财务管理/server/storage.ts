import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { AuthUserName, FinanceRecord, FinanceRecordDraft, FinanceState, OperationLog, RecordType } from './types.js';

const validTypes: RecordType[] = ['preincome', 'income', 'expense', 'debt', 'investment'];

function getDataFile() {
  return process.env.FINANCE_DATA_FILE
    ? path.resolve(process.env.FINANCE_DATA_FILE)
    : path.resolve(process.cwd(), 'data', 'finance.json');
}

export async function readState(): Promise<FinanceState> {
  await ensureDataFile();
  const raw = await fs.readFile(getDataFile(), 'utf-8');
  return normalizeState(JSON.parse(raw) as Partial<FinanceState>);
}

export async function writeState(state: FinanceState): Promise<FinanceState> {
  const normalized = normalizeState(state);
  const dataFile = getDataFile();
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  await fs.writeFile(dataFile, `${JSON.stringify(normalized, null, 2)}\n`, 'utf-8');
  return normalized;
}

export function createRecord(input: FinanceRecordDraft, owner: AuthUserName): FinanceRecord {
  const now = new Date().toISOString();
  const date = normalizeDate(input.date);
  const type = normalizeType(input.type);
  const amount = normalizeAmount(input.amount);
  const isRepayment = type === 'expense' ? Boolean(input.isRepayment) : false;

  return {
    id: crypto.randomUUID(),
    month: normalizeMonth(input.month || date.slice(0, 7)),
    date,
    owner,
    type,
    isRepayment,
    title: input.title?.trim() || '',
    amount,
    note: input.note?.trim() || '',
    createdAt: now,
    updatedAt: now,
  };
}

export function createOperationLog(input: Omit<OperationLog, 'id' | 'createdAt'>): OperationLog {
  return {
    id: crypto.randomUUID(),
    actor: input.actor,
    action: input.action,
    target: input.target,
    detail: input.detail,
    recordId: input.recordId,
    recordMonth: input.recordMonth,
    createdAt: new Date().toISOString(),
  };
}

function normalizeState(state: Partial<FinanceState>): FinanceState {
  return {
    records: Array.isArray(state.records)
      ? state.records.map((record) => ({
        ...record,
        owner: record.owner === 'wenxin' || record.owner === 'sifeng' ? record.owner : 'sifeng',
      }))
      : [],
    logs: Array.isArray(state.logs) ? state.logs : [],
  };
}

function normalizeDate(value?: string) {
  const fallback = new Date().toISOString().slice(0, 10);
  const date = value?.trim() || fallback;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return fallback;
  }
  return date;
}

function normalizeMonth(value?: string) {
  const fallback = new Date().toISOString().slice(0, 7);
  const month = value?.trim() || fallback;
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return fallback;
  }
  return month;
}

function normalizeType(type?: RecordType) {
  return type && validTypes.includes(type) ? type : 'expense';
}

function normalizeAmount(amount?: number) {
  if (!Number.isFinite(amount) || amount === undefined) {
    return 0;
  }
  return Math.max(0, Math.round(amount * 100) / 100);
}

async function ensureDataFile() {
  const dataFile = getDataFile();
  try {
    await fs.access(dataFile);
  } catch {
    await fs.mkdir(path.dirname(dataFile), { recursive: true });
    await fs.writeFile(dataFile, `${JSON.stringify({ records: [], logs: [] }, null, 2)}\n`, 'utf-8');
  }
}
