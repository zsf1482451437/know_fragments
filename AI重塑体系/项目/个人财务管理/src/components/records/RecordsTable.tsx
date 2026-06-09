import { useEffect, useMemo, useState } from 'react';
import type { FinanceRecord } from '../../types/finance';
import { Pagination } from '../common/Pagination';
import { formatCurrency, getRecordNetAmount, recordTypeMeta } from '../../utils/finance';

interface RecordsTableProps {
  records: FinanceRecord[];
  onDelete: (id: string) => Promise<void>;
  onEdit: (record: FinanceRecord) => void;
  highlightedRecordId?: string | null;
}

export function RecordsTable({ records, onDelete, onEdit, highlightedRecordId = null }: RecordsTableProps) {
  const pageSize = 10;
  const [manualPage, setManualPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(records.length / pageSize));
  const highlightedPage = useMemo(() => {
    if (!highlightedRecordId) {
      return null;
    }

    const index = records.findIndex((record) => record.id === highlightedRecordId);
    return index >= 0 ? Math.floor(index / pageSize) + 1 : null;
  }, [highlightedRecordId, records]);
  const currentPage = highlightedPage ?? Math.min(manualPage, totalPages);
  const pagedRecords = useMemo(
    () => records.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, records],
  );

  useEffect(() => {
    if (!highlightedRecordId) {
      return;
    }

    const element = document.querySelector<HTMLElement>(`[data-record-id="${highlightedRecordId}"]`);
    if (element && typeof element.scrollIntoView === 'function') {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedRecordId]);

  return (
    <section className="rounded-[1.5rem] bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900">流水</h2>
        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">{records.length} 条</span>
      </div>
      <div className="space-y-3">
        {pagedRecords.map((record) => {
          const meta = recordTypeMeta[record.type];
          const netAmount = getRecordNetAmount(record);
          const isPositive = netAmount >= 0;
          const isHighlighted = record.id === highlightedRecordId;
          return (
            <article
              className={`flex items-center justify-between gap-3 rounded-3xl border p-4 transition hover:border-mint-100 hover:bg-mint-50/30 ${isHighlighted ? 'border-mint-300 bg-mint-50/70 ring-2 ring-mint-100' : 'border-slate-100'}`}
              data-record-id={record.id}
              key={record.id}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${meta.tone}`}>{meta.label}</span>
                  <h3 className="truncate text-sm font-bold text-slate-900">{record.title}</h3>
                </div>
                <p className="mt-1 text-xs text-slate-400">{record.date}{record.note ? ` · ${record.note}` : ''}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className={`text-sm font-black ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {`${isPositive ? '+' : '-'}${formatCurrency(Math.abs(netAmount))}`}
                </span>
                <button className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-mint-50 hover:text-mint-600" onClick={() => onEdit(record)} type="button">编辑</button>
                <button className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600" onClick={() => onDelete(record.id)} type="button">删除</button>
              </div>
            </article>
          );
        })}
      </div>
      <Pagination currentPage={currentPage} onChange={setManualPage} totalPages={totalPages} />
    </section>
  );
}
