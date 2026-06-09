import { useEffect, useMemo, useState } from 'react';
import { LoginForm } from './components/auth/LoginForm';
import { CategoryBreakdown } from './components/charts/CategoryBreakdown';
import { PrincipalChart } from './components/charts/PrincipalChart';
import { RecordsTrendChart } from './components/charts/RecordsTrendChart';
import { TabBar } from './components/common/TabBar';
import { EmptyState } from './components/common/EmptyState';
import { ActivityLogs } from './components/logs/ActivityLogs';
import { RecordModal } from './components/records/RecordModal';
import { RecordsTable } from './components/records/RecordsTable';
import { ApiError, clearStoredAuthSession, createRecord, deleteRecord, fetchLogs, fetchState, getStoredAuthSession, login, logout, updateRecord } from './services/api';
import type { AuthSession, AuthUserName, FinanceRecord, FinanceRecordDraft, FinanceState, OperationLog, PrincipalViewUser } from './types/finance';
import { calculateDebtAffectingPrincipal, calculateMonthSummary, getAvailableMonths, getCurrentMonth } from './utils/finance';

const tabs = [
  { id: 'records', label: '流水' },
  { id: 'breakdown', label: '分类' },
  { id: 'logs', label: '操作日志' },
] as const;

const recordViewTabs = [
  { id: 'list', label: '列表' },
  { id: 'line', label: '折线图' },
] as const;

function App() {
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => getStoredAuthSession());
  const [state, setState] = useState<FinanceState | null>(null);
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [principalUser, setPrincipalUser] = useState<PrincipalViewUser>(() => getStoredAuthSession()?.userName ?? 'wenxin');
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['id']>('breakdown');
  const [recordView, setRecordView] = useState<(typeof recordViewTabs)[number]['id']>('list');
  const [includePreIncome, setIncludePreIncome] = useState(false);
  const [includeFutureDebtInPrincipal, setIncludeFutureDebtInPrincipal] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinanceRecord | null>(null);
  const [highlightedRecordId, setHighlightedRecordId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (!authSession) {
      return;
    }

    fetchState()
      .then((nextState) => {
        setState(nextState);
        setLogs(nextState.logs);
        const months = getAvailableMonths(nextState.records);
        setSelectedMonth(months[0] ?? getCurrentMonth());
        setError('');
      })
      .catch((nextError) => {
        if (isUnauthorizedError(nextError)) {
          handleSessionExpired();
          return;
        }
        setError('无法连接 Koa 后端，请确认 npm run dev 已启动。');
      });
  }, [authSession]);

  useEffect(() => {
    if (!authSession || activeTab !== 'logs') {
      return;
    }

    fetchLogs()
      .then((nextLogs) => {
        setLogs(nextLogs);
        setError('');
      })
      .catch((nextError) => {
        if (isUnauthorizedError(nextError)) {
          handleSessionExpired();
          return;
        }
        setError('日志加载失败，请稍后重试。');
      });
  }, [activeTab, authSession]);

  const months = useMemo(() => getAvailableMonths(state?.records ?? []), [state]);
  const monthRecords = useMemo(() => (state?.records ?? []).filter((record) => record.month === selectedMonth), [selectedMonth, state]);
  const wenxinRecords = useMemo(
    () => (state?.records ?? []).filter((record) => record.owner === 'wenxin'),
    [state],
  );
  const sifengRecords = useMemo(
    () => (state?.records ?? []).filter((record) => record.owner === 'sifeng'),
    [state],
  );
  const wenxinSummary = useMemo(() => calculateMonthSummary(wenxinRecords, selectedMonth), [selectedMonth, wenxinRecords]);
  const sifengSummary = useMemo(() => calculateMonthSummary(sifengRecords, selectedMonth), [selectedMonth, sifengRecords]);
  const wenxinDebt = useMemo(
    () => calculateDebtAffectingPrincipal(wenxinRecords, selectedMonth, undefined, includeFutureDebtInPrincipal),
    [includeFutureDebtInPrincipal, selectedMonth, wenxinRecords],
  );
  const sifengDebt = useMemo(
    () => calculateDebtAffectingPrincipal(sifengRecords, selectedMonth, undefined, includeFutureDebtInPrincipal),
    [includeFutureDebtInPrincipal, selectedMonth, sifengRecords],
  );
  const principalSummary = useMemo(() => {
    if (principalUser === 'wenxin') {
      return wenxinSummary;
    }
    if (principalUser === 'sifeng') {
      return sifengSummary;
    }

    return {
      month: selectedMonth,
      preincome: wenxinSummary.preincome + sifengSummary.preincome,
      income: wenxinSummary.income + sifengSummary.income,
      expense: wenxinSummary.expense + sifengSummary.expense,
      debt: wenxinSummary.debt + sifengSummary.debt,
      investment: wenxinSummary.investment + sifengSummary.investment,
      principal: wenxinSummary.principal + sifengSummary.principal,
      recordCount: wenxinSummary.recordCount + sifengSummary.recordCount,
    };
  }, [principalUser, selectedMonth, sifengSummary, wenxinSummary]);
  const principalDebt = useMemo(() => {
    if (principalUser === 'wenxin') {
      return wenxinDebt;
    }
    if (principalUser === 'sifeng') {
      return sifengDebt;
    }
    return wenxinDebt + sifengDebt;
  }, [principalUser, sifengDebt, wenxinDebt]);

  function handleSessionExpired() {
    clearStoredAuthSession();
    setAuthSession(null);
    setState(null);
    setLogs([]);
    setEditingRecord(null);
    setIsRecordModalOpen(false);
    setActiveTab('breakdown');
    setPrincipalUser('wenxin');
    setError('');
    setLoginError('登录已失效，请重新登录。');
  }

  async function handleLogin(userName: AuthUserName, password: string) {
    setLoginError('');
    try {
      const session = await login(userName, password);
      setAuthSession(session);
      setPrincipalUser(session.userName);
      setActiveTab('breakdown');
    } catch (nextError) {
      if (isUnauthorizedError(nextError)) {
        setLoginError('用户名或密码错误。');
        return;
      }
      setLoginError('登录失败，请稍后重试。');
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      clearStoredAuthSession();
      setAuthSession(null);
      setState(null);
      setLogs([]);
      setEditingRecord(null);
      setIsRecordModalOpen(false);
      setActiveTab('breakdown');
      setPrincipalUser('wenxin');
      setError('');
      setLoginError('');
    }
  }

  async function handleCreateRecord(record: FinanceRecordDraft) {
    try {
      const nextState = await createRecord(record);
      setState(nextState);
      setLogs(nextState.logs);
      setSelectedMonth(record.date.slice(0, 7));
    } catch (nextError) {
      if (isUnauthorizedError(nextError)) {
        handleSessionExpired();
        return;
      }
      throw nextError;
    }
  }

  async function handleSaveRecord(record: FinanceRecordDraft) {
    if (!editingRecord) {
      await handleCreateRecord(record);
      return;
    }

    try {
      const nextState = await updateRecord(editingRecord.id, record);
      setState(nextState);
      setLogs(nextState.logs);
      setSelectedMonth(record.date.slice(0, 7));
      setEditingRecord(null);
    } catch (nextError) {
      if (isUnauthorizedError(nextError)) {
        handleSessionExpired();
        return;
      }
      throw nextError;
    }
  }

  async function handleDeleteRecord(id: string) {
    try {
      const nextState = await deleteRecord(id);
      setState(nextState);
      setLogs(nextState.logs);
    } catch (nextError) {
      if (isUnauthorizedError(nextError)) {
        handleSessionExpired();
        return;
      }
      throw nextError;
    }
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

  function handleOpenRecordFromLog(log: OperationLog) {
    if (!log.recordId || !log.recordMonth || !state) {
      return;
    }

    const targetRecord = state.records.find((record) => record.id === log.recordId);
    if (!targetRecord) {
      return;
    }

    setSelectedMonth(targetRecord.month);
    setRecordView('list');
    setActiveTab('records');
    setHighlightedRecordId(targetRecord.id);
  }

  if (!authSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-mint-50 px-4 py-10 text-slate-900">
        <LoginForm error={loginError} onSubmit={handleLogin} />
      </main>
    );
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
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-soft">
              <span className="text-slate-400">当前用户</span>
              <div className="inline-flex rounded-full bg-slate-50 p-1">
                {(['wenxin', 'sifeng', 'both'] as const).map((user) => (
                  <button
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${principalUser === user ? 'bg-mint-500 text-white' : 'text-slate-500 hover:bg-white hover:text-mint-600'}`}
                    key={user}
                    onClick={() => setPrincipalUser(user)}
                    type="button"
                  >
                    {user === 'both' ? '两人' : user}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-soft">
              <span>月份</span>
              <select
                aria-label="月份"
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
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <TabBar activeTab={activeTab} onChange={(tabId) => setActiveTab(tabId as (typeof tabs)[number]['id'])} tabs={tabs} />
            <button className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-500 shadow-soft transition hover:bg-rose-50 hover:text-rose-600" onClick={handleLogout} type="button">
              退出登录
            </button>
          </div>
        </section>
        <PrincipalChart
          includePreIncome={includePreIncome}
          includeFutureDebtInPrincipal={includeFutureDebtInPrincipal}
          onToggleIncludePreIncome={() => setIncludePreIncome((current) => !current)}
          onToggleIncludeFutureDebtInPrincipal={() => setIncludeFutureDebtInPrincipal((current) => !current)}
          principalDebt={principalDebt}
          principalUser={principalUser}
          principalUserSummaries={{ wenxin: wenxinSummary, sifeng: sifengSummary }}
          summary={principalSummary}
        />
        <section className="space-y-4">
          {activeTab === 'logs' ? (
            <ActivityLogs logs={logs} onOpenRecordLog={handleOpenRecordFromLog} />
          ) : activeTab === 'breakdown' ? (
            <CategoryBreakdown includePreIncome={includePreIncome} summary={principalSummary} />
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
                <RecordsTable highlightedRecordId={highlightedRecordId} onDelete={handleDeleteRecord} onEdit={openEditModal} records={monthRecords} />
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

function isUnauthorizedError(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}

export default App;
