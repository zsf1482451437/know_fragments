export type RecordType = 'preincome' | 'income' | 'expense' | 'debt' | 'investment';

export interface FinanceRecord {
  id: string;
  month: string;
  date: string;
  type: RecordType;
  title: string;
  amount: number;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceRecordDraft {
  month: string;
  date: string;
  type: RecordType;
  title: string;
  amount: number;
  note: string;
}

export interface FinanceState {
  records: FinanceRecord[];
}

export interface MonthSummary {
  month: string;
  preincome: number;
  income: number;
  expense: number;
  debt: number;
  investment: number;
  principal: number;
  recordCount: number;
}

export interface TypeMeta {
  label: string;
  tone: string;
  dotClass: string;
}
