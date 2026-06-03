import { useEffect, useMemo, useState } from 'react';
import type { Priority, Project, Task, TaskDraft } from '../../types/task';
import { priorityLabels } from '../../utils/taskFilters';
import { getTaskSectionId, priorityToSectionId, sectionIdToPriority } from '../../utils/taskSections';

interface TaskFormProps {
  projects: Project[];
  initialTask?: Task | null;
  initialValues?: Partial<TaskDraft>;
  submitLabel?: string;
  onCancel?: () => void;
  onSubmit: (task: TaskDraft) => Promise<void>;
}

const priorities: Priority[] = ['today', 'week', 'month', 'year'];

function normalizeDraft(draft: TaskDraft): TaskDraft {
  if (draft.projectId === 'work') {
    return { ...draft, priority: null };
  }

  const normalizedPriority = draft.priority ?? sectionIdToPriority[draft.projectId] ?? 'today';
  return {
    ...draft,
    priority: normalizedPriority,
    projectId: priorityToSectionId[normalizedPriority],
  };
}

function createDraft(projects: Project[], initialTask?: Task | null, initialValues?: Partial<TaskDraft>): TaskDraft {
  if (initialTask) {
    return normalizeDraft({
      title: initialTask.title,
      projectId: getTaskSectionId(initialTask),
      priority: initialTask.priority ?? null,
      notes: initialTask.notes,
      parentId: initialTask.parentId ?? null,
    });
  }

  return normalizeDraft({
    title: initialValues?.title ?? '',
    projectId: initialValues?.projectId ?? projects[0]?.id ?? 'goals',
    priority: initialValues?.priority ?? null,
    notes: initialValues?.notes ?? '',
    parentId: initialValues?.parentId ?? null,
  });
}

export function TaskForm({ projects, initialTask, initialValues, submitLabel, onCancel, onSubmit }: TaskFormProps) {
  const initialDraft = useMemo(() => createDraft(projects, initialTask, initialValues), [initialTask, initialValues, projects]);
  const [draft, setDraft] = useState<TaskDraft>(initialDraft);
  const [submitting, setSubmitting] = useState(false);
  const isWorkProject = draft.projectId === 'work';

  useEffect(() => {
    setDraft(initialDraft);
  }, [initialDraft]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title.trim()) {
      return;
    }

    setSubmitting(true);
    await onSubmit(normalizeDraft({ ...draft, title: draft.title.trim() }));
    setSubmitting(false);

    if (!initialTask) {
      setDraft(createDraft(projects, undefined, initialValues));
    }
  }

  function handleProjectChange(projectId: string) {
    if (projectId === 'work') {
      setDraft((current) => ({ ...current, projectId, priority: null }));
      return;
    }

    const priority = sectionIdToPriority[projectId];
    setDraft((current) => ({ ...current, projectId, priority }));
  }

  function handlePriorityChange(priority: Priority) {
    setDraft((current) => ({ ...current, priority, projectId: priorityToSectionId[priority] }));
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <h2 className="text-lg font-semibold text-slate-950">{initialTask ? '编辑任务' : '新增下一步动作'}</h2>
        <p className="mt-1 text-sm text-slate-500">工作任务走独立分区，不参与年/月/周/日优先级。</p>
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
          阶段分区
          <select className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm" onChange={(event) => handleProjectChange(event.target.value)} value={draft.projectId}>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </label>
        {!isWorkProject && (
          <label className="block text-sm font-medium text-slate-700">
            优先级
            <select className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm" onChange={(event) => handlePriorityChange(event.target.value as Priority)} value={draft.priority ?? 'today'}>
              {priorities.map((priority) => (
                <option key={priority} value={priority}>{priorityLabels[priority]}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      {isWorkProject && <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">工作分区不设置优先级，会显示在独立的工作看板中。</p>}

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
