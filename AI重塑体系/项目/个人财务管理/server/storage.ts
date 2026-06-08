import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { FinanceRecord, FinanceRecordDraft, FinanceState, RecordType } from './types.js';

const validTypes: RecordType[] = ['preincome', 'income', 'expense', 'debt', 'investment'];

function getDataFile() {
  return process.env.FINANCE_DATA_FILE
    ? path.resolve(process.env.FINANCE_DATA_FILE)
    : path.resolve(process.cwd(), 'data', 'finance.json');
}

export async function readState(): Promise<FinanceState> {
  await ensureDataFile();
  const raw = await fs.readFile(getDataFile(), 'utf-8');
  return JSON.parse(raw) as FinanceState;
}

export async function writeState(state: FinanceState): Promise<FinanceState> {
  const dataFile = getDataFile();
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  await fs.writeFile(dataFile, `${JSON.stringify(state, null, 2)}\n`, 'utf-8');
  return state;
}

export function createRecord(input: FinanceRecordDraft): FinanceRecord {
  const now = new Date().toISOString();
  const date = normalizeDate(input.date);
  const type = normalizeType(input.type);
  const amount = normalizeAmount(input.amount);

  return {
    id: crypto.randomUUID(),
    month: normalizeMonth(input.month || date.slice(0, 7)),
    date,
    type,
    title: input.title?.trim() || '',
    amount,
    note: input.note?.trim() || '',
    createdAt: now,
    updatedAt: now,
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
    await fs.writeFile(dataFile, `${JSON.stringify({ records: [] }, null, 2)}\n`, 'utf-8');
  }
}
