import { useEffect, useMemo, useState } from 'react';
import { CategoryBreakdown } from './components/charts/CategoryBreakdown';
import { PrincipalChart } from './components/charts/PrincipalChart';
import { RecordsTrendChart } from './components/charts/RecordsTrendChart';
import { TabBar } from './components/common/TabBar';
import { EmptyState } from './components/common/EmptyState';
import { RecordModal } from './components/records/RecordModal';
import { RecordsTable } from './components/records/RecordsTable';
import { createRecord, deleteRecord, fetchState, updateRecord } from './services/api';
import type { FinanceRecord, FinanceRecordDraft, FinanceState } from './types/finance';
import { calculateDebtAffectingPrincipal, calculateMonthSummary, getAvailableMonths, getCurrentMonth } from './utils/finance';

const tabs = [
  { id: 'breakdown', label: '分类占比' },
  { id: 'records', label: '流水' },
] as const;

const recordViewTabs = [
  { id: 'list', label: '列表' },
  { id: 'line', label: '折线图' },
] as const;

function App() {
  const [state, setState] = useState<FinanceState | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['id']>('breakdown');
  const [recordView, setRecordView] = useState<(typeof recordViewTabs)[number]['id']>('list');
  const [includePreIncome, setIncludePreIncome] = useState(false);
  const [includeFutureDebtInPrincipal, setIncludeFutureDebtInPrincipal] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinanceRecord | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchState()
      .then((nextState) => {
        setState(nextState);
        const months = getAvailableMonths(nextState.records);
        setSelectedMonth(months[0] ?? getCurrentMonth());
      })
      .catch(() => setError('无法连接 Koa 后端，请确认 npm run dev 已启动。'));
  }, []);

  const months = useMemo(() => getAvailableMonths(state?.records ?? []), [state]);
  const monthRecords = useMemo(() => (state?.records ?? []).filter((record) => record.month === selectedMonth), [selectedMonth, state]);
  const summary = useMemo(() => calculateMonthSummary(state?.records ?? [], selectedMonth), [selectedMonth, state]);
  const principalDebt = useMemo(
    () => calculateDebtAffectingPrincipal(state?.records ?? [], selectedMonth, undefined, includeFutureDebtInPrincipal),
    [includeFutureDebtInPrincipal, selectedMonth, state],
  );

  async function handleCreateRecord(record: FinanceRecordDraft) {
    const nextState = await createRecord(record);
    setState(nextState);
    setSelectedMonth(record.date.slice(0, 7));
  }

  async function handleSaveRecord(record: FinanceRecordDraft) {
    if (!editingRecord) {
      await handleCreateRecord(record);
      return;
    }

    const nextState = await updateRecord(editingRecord.id, record);
    setState(nextState);
    setSelectedMonth(record.date.slice(0, 7));
    setEditingRecord(null);
  }

  async function handleDeleteRecord(id: string) {
    setState(await deleteRecord(id));
  }

  function openCreateModal() {
    setEditingRecord(null);
    setIsRecordModalOpen(true);
  }

  function openEditModal(record: FinanceRecord) {
    setEditingRecord(record);
    setIsRecordModalOpen(true);
  }

  function closeRecordModal() {
    setEditingRecord(null);
    setIsRecordModalOpen(false);
  }

  if (error) {
    return <main className="min-h-screen bg-mint-50 p-6 text-slate-900"><div className="rounded-3xl bg-white p-8 shadow-soft">{error}</div></main>;
  }

  if (!state) {
    return <main className="min-h-screen bg-mint-50 p-6 text-slate-900"><div className="rounded-3xl bg-white p-8 shadow-soft">加载中...</div></main>;
  }

  return (
    <main className="min-h-screen bg-mint-50 px-4 py-6 text-slate-900 md:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-soft">
            <span>复盘时间</span>
            <select
              aria-label="复盘时间"
              className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-mint-300 focus:bg-white"
              onChange={(event) => setSelectedMonth(event.target.value)}
              value={selectedMonth}
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </label>
          <TabBar activeTab={activeTab} onChange={(tabId) => setActiveTab(tabId as (typeof tabs)[number]['id'])} tabs={tabs} />
        </section>
        <PrincipalChart
          includePreIncome={includePreIncome}
          includeFutureDebtInPrincipal={includeFutureDebtInPrincipal}
          onToggleIncludePreIncome={() => setIncludePreIncome((current) => !current)}
          onToggleIncludeFutureDebtInPrincipal={() => setIncludeFutureDebtInPrincipal((current) => !current)}
          principalDebt={principalDebt}
          summary={summary}
        />
        <section className="space-y-4">
          {activeTab === 'breakdown' ? (
            <CategoryBreakdown includePreIncome={includePreIncome} summary={summary} />
          ) : monthRecords.length > 0 ? (
            <>
              <div className="flex justify-end">
                <TabBar
                  activeTab={recordView}
                  ariaLabel="流水视图切换"
                  onChange={(tabId) => setRecordView(tabId as (typeof recordViewTabs)[number]['id'])}
                  tabs={recordViewTabs}
                  variant="capsule"
                />
              </div>
              {recordView === 'line' ? (
                <RecordsTrendChart records={monthRecords} />
              ) : (
                <RecordsTable onDelete={handleDeleteRecord} onEdit={openEditModal} records={monthRecords} />
              )}
            </>
          ) : (
            <EmptyState />
          )}
        </section>
      </div>
      <button
        aria-label="新增记录"
        className="fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-mint-500 text-4xl leading-none text-white shadow-soft transition hover:bg-mint-600"
        onClick={openCreateModal}
        type="button"
      >
        +
      </button>
      <RecordModal
        mode={editingRecord ? 'edit' : 'create'}
        onClose={closeRecordModal}
        onSubmit={handleSaveRecord}
        open={isRecordModalOpen}
        record={editingRecord}
      />
    </main>
  );
}

export default App;
