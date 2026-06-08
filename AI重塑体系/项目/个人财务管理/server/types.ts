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

export interface FinanceState {
  records: FinanceRecord[];
}

export interface FinanceRecordDraft {
  month?: string;
  date?: string;
  type?: RecordType;
  title?: string;
  amount?: number;
  note?: string;
}
