export type RecordType = 'preincome' | 'income' | 'expense' | 'debt' | 'investment';
export type AuthUserName = 'wenxin' | 'sifeng';

export interface FinanceRecord {
  id: string;
  month: string;
  date: string;
  owner: AuthUserName;
  type: RecordType;
  isRepayment?: boolean;
  title: string;
  amount: number;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface OperationLog {
  id: string;
  actor: AuthUserName | 'anonymous';
  action: string;
  target: string;
  detail: string;
  recordId?: string;
  recordMonth?: string;
  createdAt: string;
}

export interface AuthSession {
  token: string;
  userName: AuthUserName;
}

export interface FinanceState {
  records: FinanceRecord[];
  logs: OperationLog[];
}

export interface FinanceRecordDraft {
  month?: string;
  date?: string;
  type?: RecordType;
  isRepayment?: boolean;
  title?: string;
  amount?: number;
  note?: string;
}
