import { useEffect, useMemo, useState } from 'react';
import { DataList, OverlayCard, PageSection, Pill, ProgressRing, StatCard } from './components/ui';
import {
  calculateCompletionRate,
  createArchiveEntry,
  findInvalidTodayTasks,
  getActiveEntry,
  getPlanProgress,
  reorderTodayTasks,
  setActiveDate,
  sortEntriesByDate,
  sumTodayHours,
  toggleTomorrowCandidate,
  updateTodayTaskStatus,
  upsertTodayTask
} from './lib/plan-utils';
import { fetchPlan, persistPlan } from './services/plan-api';
import type { PlanData, PlanPriority, TaskFormValues, TaskStatus, TodayTask } from './types/plan';

type DashboardTab = 'overview' | 'tasks' | 'projects' | 'archive';
type ProjectTab = 'plans' | 'subtasks';
type TimerState = Record<string, { remainingSeconds: number }>;

const TIMER_DURATION_SECONDS = 60 * 60;
const taskStatuses: Array<Exclude<TaskStatus, '今日' | '待办'>> = ['未开始', '进行中', '已完成', '顺延', '取消', '阻塞'];
const tabs: Array<{ id: DashboardTab; label: string }> = [
  { id: 'overview', label: '总览' },
  { id: 'tasks', label: '任务' },
  { id: 'projects', label: '项目' },
  { id: 'archive', label: '归档' }
];
const projectTabs: Array<{ id: ProjectTab; label: string }> = [
  { id: 'plans', label: '近期计划' },
  { id: 'subtasks', label: '子任务池' }
];

const defaultTaskForm = (planId = 'MAINTAIN'): TaskFormValues => ({
  timebox: '1 小时',
  title: '',
  planId,
  deliverable: '',
  doneCriteria: '',
  status: '未开始'
});

function getToneByPriority(priority: PlanPriority) {
  if (priority === 'P0') return 'rose';
  if (priority === 'P1') return 'orange';
  return 'blue';
}

function getToneByStatus(status: string) {
  if (status === '已完成') return 'green';
  if (status === '进行中') return 'blue';
  if (status === '顺延') return 'orange';
  if (status === '取消') return 'zinc';
  if (status === '阻塞') return 'rose';
  if (status === '今日') return 'violet';
  if (status === '待办') return 'cyan';
  return 'default';
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(iso));
}

function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    weekday: 'short'
  }).format(new Date(`${date}T00:00:00`));
}

function formatRemainingTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
      <p className="text-sm font-medium text-slate-800">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function TodayTaskCard({
  task,
  index,
  onChange,
  onEdit,
  onDragStart,
  onDrop,
  onStartTimer,
  timerLabel,
  timerRunning
}: {
  task: TodayTask;
  index: number;
  onChange: (status: TodayTask['status']) => void;
  onEdit: () => void;
  onDragStart: (index: number) => void;
  onDrop: (index: number) => void;
  onStartTimer: () => void;
  timerLabel: string | null;
  timerRunning: boolean;
}) {
  return (
    <article
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => onDrop(index)}
      className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="zinc">#{index + 1}</Pill>
            <Pill tone={getToneByStatus(task.status)}>{task.status}</Pill>
            {timerRunning ? <Pill tone="blue">倒计时 {timerLabel}</Pill> : null}
          </div>
          <h3 className="mt-2 text-base font-semibold text-slate-900">{task.title}</h3>
          <p className="mt-1 text-xs text-slate-500">{task.planId} · {task.timebox}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onStartTimer}
            disabled={timerRunning || task.status === '已完成' || task.status === '取消'}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            {timerRunning ? timerLabel : '开始 1h'}
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 transition hover:bg-slate-50"
          >
            编辑
          </button>
          <select
            aria-label={`更新 ${task.title} 状态`}
            value={task.status}
            onChange={(event) => onChange(event.target.value as TodayTask['status'])}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-slate-400"
          >
            {taskStatuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <div className="rounded-xl bg-slate-50 px-3 py-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">交付物</p>
          <p className="mt-1 text-sm text-slate-700">{task.deliverable}</p>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">完成标准</p>
          <p className="mt-1 text-sm text-slate-700">{task.doneCriteria}</p>
        </div>
      </div>
    </article>
  );
}

function TaskModal({
  open,
  values,
  recentPlanIds,
  onChange,
  onClose,
  onSave,
  editing
}: {
  open: boolean;
  values: TaskFormValues;
  recentPlanIds: string[];
  onChange: (key: keyof TaskFormValues, value: string) => void;
  onClose: () => void;
  onSave: () => void;
  editing: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/10 p-4 backdrop-blur-sm">
      <OverlayCard>
        <div className="flex w-[min(640px,100%)] flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">任务工作台</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">{editing ? '编辑任务' : '新增任务弹窗'}</h2>
            </div>
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50">关闭</button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-600">
              <span>任务标题</span>
              <input aria-label="任务标题" value={values.title} onChange={(event) => onChange('title', event.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400" />
            </label>
            <label className="space-y-2 text-sm text-slate-600">
              <span>时间盒</span>
              <input aria-label="时间盒" value={values.timebox} onChange={(event) => onChange('timebox', event.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400" />
            </label>
            <label className="space-y-2 text-sm text-slate-600">
              <span>归属计划</span>
              <select aria-label="归属计划" value={values.planId} onChange={(event) => onChange('planId', event.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400">
                {[...recentPlanIds, 'MAINTAIN'].map((planId) => <option key={planId} value={planId}>{planId}</option>)}
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-600">
              <span>状态</span>
              <select aria-label="任务状态" value={values.status} onChange={(event) => onChange('status', event.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400">
                {taskStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
          </div>

          <label className="space-y-2 text-sm text-slate-600">
            <span>交付物</span>
            <input aria-label="交付物" value={values.deliverable} onChange={(event) => onChange('deliverable', event.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400" />
          </label>

          <label className="space-y-2 text-sm text-slate-600">
            <span>完成标准</span>
            <textarea aria-label="完成标准" value={values.doneCriteria} onChange={(event) => onChange('doneCriteria', event.target.value)} rows={4} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400" />
          </label>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50">取消</button>
            <button type="button" onClick={onSave} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700">保存任务</button>
          </div>
        </div>
      </OverlayCard>
    </div>
  );
}

function TimerExpiredModal({
  task,
  nextStatus,
  onChange,
  onConfirm
}: {
  task: TodayTask | null;
  nextStatus: Exclude<TaskStatus, '今日' | '待办'>;
  onChange: (status: Exclude<TaskStatus, '今日' | '待办'>) => void;
  onConfirm: () => void;
}) {
  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/10 p-4 backdrop-blur-sm">
      <OverlayCard>
        <div className="w-[min(460px,100%)] space-y-4">
          <div>
            <p className="text-sm text-slate-500">倒计时结束</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">{task.title}</h2>
            <p className="mt-2 text-sm text-slate-600">1 小时已到，请选择这个任务现在的状态。</p>
          </div>
          <label className="space-y-2 text-sm text-slate-600">
            <span>任务状态</span>
            <select
              aria-label="倒计时结束状态"
              value={nextStatus}
              onChange={(event) => onChange(event.target.value as Exclude<TaskStatus, '今日' | '待办'>)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
            >
              {taskStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onConfirm} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700">
              更新状态
            </button>
          </div>
        </div>
      </OverlayCard>
    </div>
  );
}

export default function App() {
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState<TaskFormValues>(defaultTaskForm());
  const [archiveDateInput, setArchiveDateInput] = useState('2026-05-22');
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [projectTab, setProjectTab] = useState<ProjectTab>('plans');
  const [projectQuery, setProjectQuery] = useState('');
  const [subTaskStatusFilter, setSubTaskStatusFilter] = useState<'全部' | '今日' | '待办' | '已完成' | '顺延' | '阻塞' | '取消'>('全部');
  const [timers, setTimers] = useState<TimerState>({});
  const [expiredTaskId, setExpiredTaskId] = useState<string | null>(null);
  const [expiredNextStatus, setExpiredNextStatus] = useState<Exclude<TaskStatus, '今日' | '待办'>>('已完成');

  useEffect(() => {
    fetchPlan()
      .then((data) => setPlan(data))
      .catch((nextError: Error) => setError(nextError.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (Object.keys(timers).length === 0) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setTimers((current) => {
        let nextTimers = current;
        let hasChanged = false;

        Object.entries(current).forEach(([taskId, timer]) => {
          if (timer.remainingSeconds <= 1) {
            nextTimers = { ...nextTimers };
            delete nextTimers[taskId];
            hasChanged = true;
            setExpiredTaskId((currentExpired) => currentExpired ?? taskId);
            return;
          }

          nextTimers = {
            ...nextTimers,
            [taskId]: {
              remainingSeconds: timer.remainingSeconds - 1
            }
          };
          hasChanged = true;
        });

        return hasChanged ? nextTimers : current;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [timers]);

  const activeEntry = useMemo(() => (plan ? getActiveEntry(plan) : null), [plan]);

  useEffect(() => {
    if (!activeEntry) {
      return;
    }

    if (expiredTaskId && !activeEntry.tasks.some((task) => task.id === expiredTaskId)) {
      setExpiredTaskId(null);
    }
  }, [activeEntry, expiredTaskId]);

  const expiredTask = useMemo(
    () => activeEntry?.tasks.find((task) => task.id === expiredTaskId) ?? null,
    [activeEntry, expiredTaskId]
  );

  const dashboard = useMemo(() => {
    if (!plan || !activeEntry) return null;

    const completedTodayCount = activeEntry.tasks.filter((task) => task.status === '已完成').length;
    const selectedTomorrowCount = activeEntry.tomorrowCandidates.filter((item) => item.selected).length;
    const todayLaneTasks = activeEntry.subTasks.filter((task) => task.status === '今日');
    const backlogTasks = activeEntry.subTasks.filter((task) => task.status === '待办');
    const activePlans = activeEntry.recentPlans.filter((item) => getPlanProgress(item, activeEntry.subTasks) < 100);
    const query = projectQuery.trim().toLowerCase();
    const filteredPlans = activeEntry.recentPlans.filter((item) => {
      if (!query) return true;
      return [item.id, item.title, item.target, item.nextTask].some((field) => field.toLowerCase().includes(query));
    });
    const filteredSubTasks = activeEntry.subTasks.filter((task) => {
      const matchesQuery = !query || [task.id, task.planId, task.title, task.output, task.dependency].some((field) => field.toLowerCase().includes(query));
      const matchesStatus = subTaskStatusFilter === '全部' || task.status === subTaskStatusFilter;
      return matchesQuery && matchesStatus;
    });

    return {
      totalHours: sumTodayHours(activeEntry.tasks),
      completionRate: calculateCompletionRate(activeEntry.tasks),
      invalidTaskCount: findInvalidTodayTasks(activeEntry).length,
      completedTodayCount,
      selectedTomorrowCount,
      todayLaneTasks,
      backlogTasks,
      activePlans,
      focusTask: activeEntry.tasks.find((task) => task.status !== '已完成' && task.status !== '取消') ?? activeEntry.tasks[0],
      entries: sortEntriesByDate(plan.entries),
      filteredPlans,
      filteredSubTasks
    };
  }, [plan, activeEntry, projectQuery, subTaskStatusFilter]);

  if (loading) return <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-900">正在加载计划系统...</main>;
  if (error) return <main className="min-h-screen bg-slate-100 px-6 py-10 text-red-600">加载失败：{error}</main>;
  if (!plan || !activeEntry || !dashboard) return <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-900">暂无计划数据</main>;

  const recentPlanIds = activeEntry.recentPlans.map((item) => item.id);

  const openCreateModal = () => {
    setTaskForm(defaultTaskForm(recentPlanIds[0] ?? 'MAINTAIN'));
    setModalOpen(true);
  };

  const openEditModal = (task: TodayTask) => {
    setTaskForm({
      id: task.id,
      timebox: task.timebox,
      title: task.title,
      planId: task.planId,
      deliverable: task.deliverable,
      doneCriteria: task.doneCriteria,
      status: task.status as Exclude<TaskStatus, '今日' | '待办'>
    });
    setModalOpen(true);
  };

  const handleStartTimer = (task: TodayTask) => {
    setTimers((current) => ({
      ...current,
      [task.id]: {
        remainingSeconds: TIMER_DURATION_SECONDS
      }
    }));
    if (task.status !== '进行中') {
      setPlan((current) => current ? updateTodayTaskStatus(current, task.id, '进行中') : current);
    }
    setSaveMessage('');
  };

  const savePlan = async () => {
    setSaving(true);
    setSaveMessage('');
    try {
      const saved = await persistPlan(plan);
      setPlan(saved);
      setSaveMessage('已保存到 data/plan.json');
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const saveTask = () => {
    if (!taskForm.title.trim()) return;
    setPlan((current) => current ? upsertTodayTask(current, taskForm) : current);
    setSaveMessage('');
    setModalOpen(false);
  };

  const confirmExpiredTaskStatus = () => {
    if (!expiredTaskId) {
      return;
    }
    setPlan((current) => current ? updateTodayTaskStatus(current, expiredTaskId, expiredNextStatus) : current);
    setExpiredTaskId(null);
    setExpiredNextStatus('已完成');
    setSaveMessage('');
  };

  const overviewPanel = (
    <div className="space-y-4">
      <PageSection title="今天的核心目标" description={activeEntry.date}>
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="blue">{activeEntry.date}</Pill>
              <Pill tone={dashboard.invalidTaskCount === 0 ? 'green' : 'rose'}>
                {dashboard.invalidTaskCount === 0 ? '计划约束通过' : '存在异常任务'}
              </Pill>
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{activeEntry.coreGoal}</h2>
          </div>
          <DataList items={[
            { label: '当前焦点', value: dashboard.focusTask?.title ?? '待新增任务' },
            { label: '最近更新', value: formatTime(plan.updatedAt) },
            { label: '明日已勾选', value: `${dashboard.selectedTomorrowCount} 个任务` }
          ]} />
        </div>
      </PageSection>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="今日投入" value={`${dashboard.totalHours} 小时`} hint={`目标 ${activeEntry.totalHours} 小时`} />
        <StatCard label="完成进度" value={`${dashboard.completionRate}%`} hint={`${dashboard.completedTodayCount}/${activeEntry.tasks.length} 个任务完成`} />
        <StatCard label="活跃项目" value={`${dashboard.activePlans.length}`} hint="当前归档日仍在推进" />
        <StatCard label="候选积压" value={`${dashboard.backlogTasks.length}`} hint="待办子任务数量" />
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <PageSection title="今日焦点">
          {dashboard.focusTask ? (
            <TodayTaskCard
              task={dashboard.focusTask}
              index={Math.max(activeEntry.tasks.findIndex((task) => task.id === dashboard.focusTask?.id), 0)}
              onEdit={() => openEditModal(dashboard.focusTask)}
              onChange={(status) => {
                setPlan((current) => current ? updateTodayTaskStatus(current, dashboard.focusTask!.id, status) : current);
                setSaveMessage('');
              }}
              onDragStart={() => undefined}
              onDrop={() => undefined}
              onStartTimer={() => handleStartTimer(dashboard.focusTask)}
              timerLabel={timers[dashboard.focusTask.id] ? formatRemainingTime(timers[dashboard.focusTask.id].remainingSeconds) : null}
              timerRunning={Boolean(timers[dashboard.focusTask.id])}
            />
          ) : (
            <EmptyState title="暂无今日任务" description="切到“任务”标签后添加第一条任务。" />
          )}
        </PageSection>

        <PageSection title="今日推进">
          <div className="space-y-3">
            <ProgressRing value={dashboard.completionRate} label="完成率" hint="按非取消任务计算" />
            <DataList items={[
              { label: '今日泳道', value: `${dashboard.todayLaneTasks.length} 个子任务` },
              { label: '异常任务', value: `${dashboard.invalidTaskCount} 个` }
            ]} />
          </div>
        </PageSection>
      </div>
    </div>
  );

  const tasksPanel = (
    <div className="space-y-4">
      <PageSection
        title="任务工作台"
        actions={
          <div className="flex items-center gap-2">
            <button type="button" onClick={openCreateModal} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">新增任务</button>
            <button type="button" onClick={savePlan} disabled={saving} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400">{saving ? '保存中...' : '保存到 JSON'}</button>
          </div>
        }
      >
        {saveMessage ? <p className="mb-3 text-sm text-emerald-600">{saveMessage}</p> : null}
        {activeEntry.tasks.length > 0 ? (
          <div className="grid gap-3 xl:grid-cols-2">
            {activeEntry.tasks.map((task, index) => (
              <TodayTaskCard
                key={task.id}
                task={task}
                index={index}
                onEdit={() => openEditModal(task)}
                onChange={(status) => {
                  setPlan((current) => current ? updateTodayTaskStatus(current, task.id, status) : current);
                  setSaveMessage('');
                }}
                onDragStart={(nextIndex) => setDragIndex(nextIndex)}
                onDrop={(targetIndex) => {
                  if (dragIndex === null) return;
                  setPlan((current) => current ? reorderTodayTasks(current, dragIndex, targetIndex) : current);
                  setDragIndex(null);
                  setSaveMessage('');
                }}
                onStartTimer={() => handleStartTimer(task)}
                timerLabel={timers[task.id] ? formatRemainingTime(timers[task.id].remainingSeconds) : null}
                timerRunning={Boolean(timers[task.id])}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="当前日期还没有今日任务" description="点击右上角新增任务，即可开始规划今天。" />
        )}
      </PageSection>

      <PageSection title="明日候选">
        <div className="space-y-2">
          {activeEntry.tomorrowCandidates.map((item) => (
            <label key={item.id} className="flex gap-3 rounded-[20px] border border-slate-200 bg-white p-4">
              <input
                type="checkbox"
                aria-label={`切换 ${item.title}`}
                className="mt-1 size-4 rounded border-slate-300 bg-white text-slate-900"
                checked={item.selected}
                onChange={() => {
                  setPlan((current) => current ? toggleTomorrowCandidate(current, item.id) : current);
                  setSaveMessage('');
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                  <Pill tone={item.selected ? 'green' : 'blue'}>{item.selected ? '已选中' : '待确认'}</Pill>
                </div>
                <p className="mt-1 text-sm text-slate-600">{item.reason}</p>
              </div>
            </label>
          ))}
        </div>
      </PageSection>
    </div>
  );

  const projectsPanel = (
    <div className="space-y-4">
      <PageSection
        title="项目工作台"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {projectTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setProjectTab(tab.id)}
                className={`rounded-full px-3 py-2 text-sm transition ${projectTab === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        }
      >
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px]">
          <input
            aria-label="项目搜索框"
            value={projectQuery}
            onChange={(event) => setProjectQuery(event.target.value)}
            placeholder="搜索项目、子任务、计划 ID"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
          />
          <select
            aria-label="子任务状态筛选"
            value={subTaskStatusFilter}
            onChange={(event) => setSubTaskStatusFilter(event.target.value as typeof subTaskStatusFilter)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
          >
            {['全部', '今日', '待办', '已完成', '顺延', '阻塞', '取消'].map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {projectTab === 'plans' ? (
          dashboard.filteredPlans.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {dashboard.filteredPlans.map((item) => {
                const progress = getPlanProgress(item, activeEntry.subTasks);
                return (
                  <article key={item.id} className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill tone={getToneByPriority(item.priority)}>{item.priority}</Pill>
                      <Pill tone="zinc">{item.id}</Pill>
                    </div>
                    <h3 className="mt-3 text-base font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{item.target}</p>
                    <p className="mt-2 text-sm text-slate-500">下一步：{item.nextTask}</p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-slate-900" style={{ width: `${progress}%` }} />
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState title="没有匹配的近期计划" description="换个关键词，或者切到子任务池查看更细的执行项。" />
          )
        ) : dashboard.filteredSubTasks.length > 0 ? (
          <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3">任务</th>
                  <th className="px-4 py-3">归属</th>
                  <th className="px-4 py-3">依赖</th>
                  <th className="px-4 py-3">状态</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.filteredSubTasks.map((task) => (
                  <tr key={task.id} className="border-t border-slate-200 bg-white">
                    <td className="px-4 py-3 text-slate-900">{task.title}</td>
                    <td className="px-4 py-3 text-slate-600">{task.planId}</td>
                    <td className="px-4 py-3 text-slate-600">{task.dependency}</td>
                    <td className="px-4 py-3"><Pill tone={getToneByStatus(task.status)}>{task.status}</Pill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="没有匹配的子任务" description="试试更宽泛的搜索词，或者将状态筛选切回“全部”。" />
        )}
      </PageSection>
    </div>
  );

  const archivePanel = (
    <div className="space-y-4">
      <PageSection title="日期归档">
        <div className="grid gap-3 md:grid-cols-2">
          {dashboard.entries.map((entry) => (
            <button
              key={entry.date}
              type="button"
              onClick={() => {
                setPlan((current) => current ? setActiveDate(current, entry.date) : current);
                setSaveMessage('');
              }}
              className={`rounded-2xl border px-4 py-4 text-left transition ${entry.date === plan.activeDate ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'}`}
            >
              <p className="text-sm font-medium">{formatDateLabel(entry.date)}</p>
              <p className={`mt-2 text-sm ${entry.date === plan.activeDate ? 'text-slate-300' : 'text-slate-500'}`}>{entry.coreGoal}</p>
            </button>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <input aria-label="新增归档日期" type="date" value={archiveDateInput} onChange={(event) => setArchiveDateInput(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400" />
          <button
            type="button"
            onClick={() => {
              setPlan((current) => current ? createArchiveEntry(current, archiveDateInput) : current);
              setSaveMessage('');
            }}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            新建日期
          </button>
        </div>
      </PageSection>

      <PageSection title="复盘摘要">
        <DataList items={[
          { label: '已完成事项', value: activeEntry.review.completed || '待填写' },
          { label: '未完成事项', value: activeEntry.review.unfinished || '待填写' },
          { label: '主要阻塞', value: activeEntry.review.blockers || '待填写' },
          { label: '明日重点', value: activeEntry.review.tomorrowFocus || '待填写' }
        ]} />
      </PageSection>
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-4 text-slate-900 md:px-6 md:py-6">
      <div className="mx-auto max-w-7xl space-y-4 pb-24">
        <header className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm md:px-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-slate-500">Productivity OS</p>
              <h1 className="mt-1 text-xl font-semibold text-slate-900">个人计划系统</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-full px-4 py-2 text-sm transition ${activeTab === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {activeTab === 'overview' ? overviewPanel : null}
        {activeTab === 'tasks' ? tasksPanel : null}
        {activeTab === 'projects' ? projectsPanel : null}
        {activeTab === 'archive' ? archivePanel : null}
      </div>

      <TaskModal
        open={modalOpen}
        values={taskForm}
        recentPlanIds={recentPlanIds}
        onChange={(key, value) => setTaskForm((current) => ({ ...current, [key]: value }))}
        onClose={() => setModalOpen(false)}
        onSave={saveTask}
        editing={Boolean(taskForm.id)}
      />

      <TimerExpiredModal
        task={expiredTask}
        nextStatus={expiredNextStatus}
        onChange={setExpiredNextStatus}
        onConfirm={confirmExpiredTaskStatus}
      />
    </main>
  );
}
