import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from './components/common/EmptyState';
import { Header } from './components/layout/Header';
import { SectionSidebar } from './components/sections/SectionSidebar';
import { SummaryCards } from './components/dashboard/SummaryCards';
import { TaskBoard } from './components/tasks/TaskBoard';
import { TaskModal } from './components/tasks/TaskModal';
import { createTask, deleteTask, fetchState, updateTask } from './services/api';
import type { AppState, Priority, Task, TaskDraft } from './types/task';
import { getTaskSectionId, priorityToSectionId } from './utils/taskSections';
import { getAncestorTasks, getDescendantTasks } from './utils/taskTree';

const nextPriorityMap: Partial<Record<Priority, Priority>> = {
  year: 'month',
  month: 'week',
  week: 'today',
};

function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState('all');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskDefaults, setTaskDefaults] = useState<Partial<TaskDraft> | undefined>(undefined);
  const [modalTitle, setModalTitle] = useState<string | undefined>(undefined);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchState()
      .then(setState)
      .catch(() => setError('无法连接 Koa 后端，请确认 npm run dev 已启动。'));
  }, []);

  const filteredTasks = useMemo(() => {
    if (!state) {
      return [];
    }
    if (selectedSectionId === 'all') {
      return state.tasks;
    }
    return state.tasks.filter((task) => getTaskSectionId(task) === selectedSectionId);
  }, [selectedSectionId, state]);

  function openCreateModal() {
    setEditingTask(null);
    setTaskDefaults(undefined);
    setModalTitle('新增任务');
    setIsTaskModalOpen(true);
  }

  function openEditModal(task: Task) {
    setEditingTask(task);
    setTaskDefaults(undefined);
    setModalTitle('编辑任务');
    setIsTaskModalOpen(true);
  }

  function openSubtaskModal(task: Task) {
    setEditingTask(null);
    setTaskDefaults({ projectId: getTaskSectionId(task), priority: task.priority, parentId: task.id });
    setModalTitle(`为“${task.title}”新增子任务`);
    setIsTaskModalOpen(true);
  }

  function closeTaskModal() {
    setEditingTask(null);
    setTaskDefaults(undefined);
    setModalTitle(undefined);
    setIsTaskModalOpen(false);
  }

  async function handleCreateTask(task: TaskDraft) {
    setState(await createTask(task));
  }

  async function handleSaveTask(task: TaskDraft) {
    if (!editingTask) {
      await handleCreateTask(task);
      return;
    }

    setState(await updateTask(editingTask.id, task));
  }

  async function applyTaskUpdates(taskUpdates: Array<{ id: string; updates: Partial<Task> }>) {
    let nextState = state;

    for (const taskUpdate of taskUpdates) {
      nextState = await updateTask(taskUpdate.id, taskUpdate.updates);
    }

    if (nextState) {
      setState(nextState);
    }
  }

  async function handleToggleTask(task: Task) {
    if (!state) {
      return;
    }

    const nextCompleted = !task.completed;

    if (nextCompleted) {
      const descendants = getDescendantTasks(state.tasks, task.id).filter((item) => !item.completed);
      await applyTaskUpdates([
        { id: task.id, updates: { completed: true } },
        ...descendants.map((item) => ({ id: item.id, updates: { completed: true } })),
      ]);
      return;
    }

    const ancestors = getAncestorTasks(state.tasks, task.id).filter((item) => item.completed);
    await applyTaskUpdates([
      { id: task.id, updates: { completed: false } },
      ...ancestors.map((item) => ({ id: item.id, updates: { completed: false } })),
    ]);
  }

  async function handleAdvanceTask(task: Task) {
    if (!task.priority) {
      return;
    }

    const nextPriority = nextPriorityMap[task.priority];
    if (!nextPriority) {
      return;
    }

    setState(await updateTask(task.id, {
      priority: nextPriority,
      projectId: priorityToSectionId[nextPriority],
      completed: false,
    }));
  }

  async function handleDeleteTask(task: Task) {
    setState(await deleteTask(task.id));
  }

  if (error) {
    return <main className="min-h-screen bg-slate-100 p-6 text-slate-900"><div className="rounded-3xl bg-white p-8 shadow-soft">{error}</div></main>;
  }

  if (!state) {
    return <main className="min-h-screen bg-slate-100 p-6 text-slate-900"><div className="rounded-3xl bg-white p-8 shadow-soft">加载中...</div></main>;
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <Header />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <SummaryCards tasks={state.tasks} />
          <button className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-cyan-600" onClick={openCreateModal} type="button">
            新增下一步动作
          </button>
        </div>
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <SectionSidebar
            onSelect={setSelectedSectionId}
            projects={state.projects}
            selectedSectionId={selectedSectionId}
            tasks={state.tasks}
          />
          {filteredTasks.some((task) => !task.parentId) ? (
            <TaskBoard
              onAddSubtask={openSubtaskModal}
              onAdvance={handleAdvanceTask}
              onDelete={handleDeleteTask}
              onEdit={openEditModal}
              onToggle={handleToggleTask}
              projects={state.projects}
              tasks={filteredTasks}
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
      <TaskModal
        initialValues={taskDefaults}
        onClose={closeTaskModal}
        onSubmit={handleSaveTask}
        open={isTaskModalOpen}
        projects={state.projects}
        task={editingTask}
        title={modalTitle}
      />
    </main>
  );
}

export default App;
