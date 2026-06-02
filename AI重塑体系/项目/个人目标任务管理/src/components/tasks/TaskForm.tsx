import { useEffect, useMemo, useState } from 'react';
import type { Priority, Project, Task, TaskDraft } from '../../types/task';
import { priorityLabels } from '../../utils/taskFilters';

interface TaskFormProps {
  projects: Project[];
  initialTask?: Task | null;
  submitLabel?: string;
  onCancel?: () => void;
  onSubmit: (task: TaskDraft) => Promise<void>;
}

const priorities: Priority[] = ['today', 'week', 'month', 'year'];

function createDraft(projects: Project[], initialTask?: Task | null): TaskDraft {
  if (initialTask) {
    return {
      title: initialTask.title,
      projectId: initialTask.projectId,
      priority: initialTask.priority,
      notes: initialTask.notes,
    };
  }

  return {
    title: '',
    projectId: projects[0]?.id ?? 'goals',
    priority: 'today',
    notes: '',
  };
}

export function TaskForm({ projects, initialTask, submitLabel, onCancel, onSubmit }: TaskFormProps) {
  const initialDraft = useMemo(() => createDraft(projects, initialTask), [initialTask, projects]);
  const [draft, setDraft] = useState<TaskDraft>(initialDraft);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setDraft(initialDraft);
  }, [initialDraft]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title.trim()) {
      return;
    }

    setSubmitting(true);
    await onSubmit({ ...draft, title: draft.title.trim() });
    setSubmitting(false);

    if (!initialTask) {
      setDraft(createDraft(projects));
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <h2 className="text-lg font-semibold text-slate-950">{initialTask ? '编辑任务' : '新增下一步动作'}</h2>
        <p className="mt-1 text-sm text-slate-500">只保留项目分区和时间优先级，避免层级重复。</p>
      </div>

      <label className="block text-sm font-medium text-slate-700">
        任务标题
        <input
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
          onChange={(event) => setDraft({ ...draft, title: event.target.value })}
          placeholder="例如：完成 Web3D 01-basic-scene 实验"
          value={draft.title}
        />
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          项目分区
          <select className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm" onChange={(event) => setDraft({ ...draft, projectId: event.target.value })} value={draft.projectId}>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          优先级
          <select className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm" onChange={(event) => setDraft({ ...draft, priority: event.target.value as Priority })} value={draft.priority}>
            {priorities.map((priority) => (
              <option key={priority} value={priority}>{priorityLabels[priority]}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm font-medium text-slate-700">
        备注
        <textarea
          className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
          onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
          placeholder="写清完成标准或上下文链接。"
          value={draft.notes}
        />
      </label>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        {onCancel && (
          <button className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200" onClick={onCancel} type="button">
            取消
          </button>
        )}
        <button className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600" disabled={submitting} type="submit">
          {submitting ? '保存中...' : submitLabel ?? '添加任务'}
        </button>
      </div>
    </form>
  );
}
