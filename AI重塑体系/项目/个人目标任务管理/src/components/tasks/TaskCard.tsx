import type { Project, Task } from '../../types/task';
import { priorityLabels, priorityStyles } from '../../utils/taskFilters';

interface TaskCardProps {
  task: Task;
  project?: Project;
  onToggle: (task: Task) => void;
  onPromoteToday: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskCard({ task, project, onToggle, onPromoteToday, onEdit, onDelete }: TaskCardProps) {
  return (
    <article className={`rounded-3xl border bg-white p-5 shadow-soft transition ${task.completed ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <button
          aria-label="切换完成状态"
          className={`mt-1 h-5 w-5 rounded-full border ${task.completed ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}
          onClick={() => onToggle(task)}
          type="button"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-slate-500">{project?.name ?? '未分区'}</p>
            <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityStyles[task.priority]}`}>
              {priorityLabels[task.priority]}
            </span>
          </div>
          <h3 className={`mt-3 text-base font-semibold text-slate-950 ${task.completed ? 'line-through' : ''}`}>{task.title}</h3>
          {task.notes && <p className="mt-2 text-sm leading-6 text-slate-500">{task.notes}</p>}
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <button className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-medium text-white" onClick={() => onPromoteToday(task)} type="button">
          放到今日
        </button>
        <button className="rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-medium text-cyan-700" onClick={() => onEdit(task)} type="button">
          编辑
        </button>
        <button className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600" onClick={() => onDelete(task)} type="button">
          删除
        </button>
      </div>
    </article>
  );
}
