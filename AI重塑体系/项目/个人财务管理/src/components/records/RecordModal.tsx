import type { FinanceRecord, FinanceRecordDraft } from '../../types/finance';
import { RecordForm } from './RecordForm';

interface RecordModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (record: FinanceRecordDraft) => Promise<void>;
  mode?: 'create' | 'edit';
  record?: FinanceRecord | null;
}

export function RecordModal({ open, onClose, onSubmit, mode = 'create', record }: RecordModalProps) {
  if (!open) {
    return null;
  }

  async function handleSubmit(record: FinanceRecordDraft) {
    await onSubmit(record);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/35 p-4 md:items-center" role="dialog" aria-modal="true" aria-label="财务记录弹窗">
      <div className="w-full max-w-lg rounded-[2rem] bg-white p-5 shadow-soft md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-mint-600">{mode === 'edit' ? '编辑记录' : '新增记录'}</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">{mode === 'edit' ? '更新这条财务流水' : '记录今天的财务变化'}</h2>
          </div>
          <button className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-200" onClick={onClose} type="button">
            关闭
          </button>
        </div>
        <RecordForm
          initialValues={record ?? undefined}
          key={record?.id ?? mode}
          mode={mode}
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitLabel={mode === 'edit' ? '保存修改' : '保存记录'}
        />
      </div>
    </div>
  );
}
