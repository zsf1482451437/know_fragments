import type { Project, Task, TaskDraft } from '../../types/task';
import { TaskForm } from './TaskForm';

interface TaskModalProps {
  open: boolean;
  projects: Project[];
  task?: Task | null;
  onClose: () => void;
  onSubmit: (task: TaskDraft) => Promise<void>;
}

export function TaskModal({ open, projects, task, onClose, onSubmit }: TaskModalProps) {
  if (!open) {
    return null;
  }

  async function handleSubmit(draft: TaskDraft) {
    await onSubmit(draft);
    onClose();
  }

  return (
    <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6" role="dialog">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-soft">
        <div className="mb-5 flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-600">Task editor</p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">{task ? '编辑' : '新增'}</h2>
          </div>
          <button aria-label="关闭弹窗" className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600" onClick={onClose} type="button">
            关闭
          </button>
        </div>
        <TaskForm
          initialTask={task}
          onCancel={onClose}
          onSubmit={handleSubmit}
          projects={projects}
          submitLabel={task ? '保存修改' : '添加任务'}
        />
      </div>
    </div>
  );
}
