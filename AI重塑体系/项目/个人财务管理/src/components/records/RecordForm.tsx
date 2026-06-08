import { useState } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import type { FinanceRecordDraft, RecordType } from '../../types/finance';
import { recordTypeMeta } from '../../utils/finance';

interface RecordFormProps {
  onSubmit: (record: FinanceRecordDraft) => Promise<void>;
  onCancel?: () => void;
  initialValues?: Partial<FinanceRecordDraft>;
  submitLabel?: string;
  mode?: 'create' | 'edit';
}

const types: RecordType[] = ['preincome', 'income', 'expense', 'investment', 'debt'];
const getTodayDate = () => new Date().toISOString().slice(0, 10);
const createDefaultValues = (initialValues?: Partial<FinanceRecordDraft>) => {
  const date = initialValues?.date || getTodayDate();
  return {
    type: initialValues?.type || 'expense',
    title: initialValues?.title || '',
    amount: initialValues?.amount ? String(initialValues.amount) : '',
    date,
    note: initialValues?.note || '',
  };
};

export function RecordForm({ onSubmit, onCancel, initialValues, submitLabel = '保存记录', mode = 'create' }: RecordFormProps) {
  const defaults = createDefaultValues(initialValues);
  const [type, setType] = useState<RecordType>(defaults.type);
  const [title, setTitle] = useState(defaults.title);
  const [amount, setAmount] = useState(defaults.amount);
  const [date, setDate] = useState(defaults.date);
  const [note, setNote] = useState(defaults.note);
  const [saving, setSaving] = useState(false);
  const isEditing = mode === 'edit';

  async function handleSubmit(event: Parameters<NonNullable<ComponentPropsWithoutRef<'form'>['onSubmit']>>[0]) {
    event.preventDefault();
    setSaving(true);
    await onSubmit({ month: date.slice(0, 7), date, type, title, amount: Number(amount), note });
    if (!isEditing) {
      setTitle('');
      setAmount('');
      setNote('');
      setDate(getTodayDate());
    }
    setSaving(false);
  }

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      {!isEditing ? (
        <div className="grid gap-2">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {types.map((item) => (
              <button
                className={`rounded-2xl px-3 py-2 text-sm font-semibold transition ${item === type ? recordTypeMeta[item].tone : 'bg-slate-50 text-slate-500 hover:bg-mint-50'}`}
                key={item}
                onClick={() => setType(item)}
                type="button"
              >
                {recordTypeMeta[item].label}
              </button>
            ))}
          </div>
          {type === 'debt' ? (
            <p className="rounded-2xl bg-amber-50 px-3 py-2 text-xs font-semibold leading-5 text-amber-700">
              新增一笔负债后，会计入当前复盘月份的月负债。
            </p>
          ) : null}
        </div>
      ) : null}
      <div className={`grid gap-3 ${isEditing ? '' : 'sm:grid-cols-2'}`}>
        <label className="grid gap-1 text-sm font-semibold text-slate-600">
          金额
          <input className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 outline-none transition focus:border-mint-300 focus:bg-white" min="0" onChange={(event) => setAmount(event.target.value)} placeholder="0" required type="number" value={amount} />
        </label>
        {!isEditing ? (
          <label className="grid gap-1 text-sm font-semibold text-slate-600">
            日期
            <input className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 outline-none transition focus:border-mint-300 focus:bg-white" onChange={(event) => setDate(event.target.value)} type="date" value={date} />
          </label>
        ) : null}
      </div>
      <label className="grid gap-1 text-sm font-semibold text-slate-600">
        名称
        <input className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 outline-none transition focus:border-mint-300 focus:bg-white" onChange={(event) => setTitle(event.target.value)} placeholder="可选：例如 工资、房租、基金定投" value={title} />
      </label>
      <label className="grid gap-1 text-sm font-semibold text-slate-600">
        备注
        <textarea className="min-h-20 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 outline-none transition focus:border-mint-300 focus:bg-white" onChange={(event) => setNote(event.target.value)} placeholder="可选：记录来源、决策或异常原因" value={note} />
      </label>
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel ? (
          <button className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200" onClick={onCancel} type="button">
            取消
          </button>
        ) : null}
        <button className="rounded-2xl bg-mint-500 px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-mint-600 disabled:opacity-60" disabled={saving} type="submit">
          {saving ? '保存中...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
