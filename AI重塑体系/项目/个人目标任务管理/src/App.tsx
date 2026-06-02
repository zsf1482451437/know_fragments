import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from './components/common/EmptyState';
import { Header } from './components/layout/Header';
import { ProjectSidebar } from './components/projects/ProjectSidebar';
import { SummaryCards } from './components/dashboard/SummaryCards';
import { TaskBoard } from './components/tasks/TaskBoard';
import { TaskModal } from './components/tasks/TaskModal';
import { createTask, deleteTask, fetchState, updateTask } from './services/api';
import type { AppState, Task, TaskDraft } from './types/task';

function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
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
    if (selectedProjectId === 'all') {
      return state.tasks;
    }
    return state.tasks.filter((task) => task.projectId === selectedProjectId);
  }, [selectedProjectId, state]);

  function openCreateModal() {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  }

  function openEditModal(task: Task) {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  }

  function closeTaskModal() {
    setEditingTask(null);
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

  async function handleToggleTask(task: Task) {
    setState(await updateTask(task.id, { completed: !task.completed }));
  }

  async function handlePromoteToday(task: Task) {
    setState(await updateTask(task.id, { priority: 'today', completed: false }));
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
          <ProjectSidebar
            onSelect={setSelectedProjectId}
            projects={state.projects}
            selectedProjectId={selectedProjectId}
            tasks={state.tasks}
          />
          {filteredTasks.length > 0 ? (
            <TaskBoard
              onDelete={handleDeleteTask}
              onEdit={openEditModal}
              onPromoteToday={handlePromoteToday}
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
        onClose={closeTaskModal}
        onSubmit={handleSaveTask}
        open={isTaskModalOpen}
        projects={state.projects}
        task={editingTask}
      />
    </main>
  );
}

export default App;
