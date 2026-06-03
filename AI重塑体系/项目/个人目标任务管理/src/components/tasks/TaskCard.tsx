import { useMemo, useState } from 'react';
import type { Priority, Project, Task } from '../../types/task';
import { priorityLabels, priorityStyles } from '../../utils/taskFilters';
import { getTaskSection } from '../../utils/taskSections';
import { getDirectSubtasks, getTaskProgress } from '../../utils/taskTree';

interface TaskCardProps {
  task: Task;
  tasks: Task[];
  projects: Project[];
  depth?: number;
  onToggle: (task: Task) => void;
  onAdvance: (task: Task) => void;
  onEdit: (task: Task) => void;
  onAddSubtask: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const nextPriorityMap: Partial<Record<Priority, Priority>> = {
  year: 'month',
  month: 'week',
  week: 'today',
};

function getAdvanceLabel(task: Task) {
  if (!task.priority) {
    return null;
  }

  const nextPriority = nextPriorityMap[task.priority];
  if (!nextPriority) {
    return null;
  }

  return `推进到${priorityLabels[nextPriority]}`;
}

export function TaskCard({ task, tasks, projects, depth = 0, onToggle, onAdvance, onEdit, onAddSubtask, onDelete }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const section = useMemo(() => getTaskSection(task, projects), [projects, task]);
  const directSubtasks = useMemo(() => getDirectSubtasks(tasks, task.id), [task.id, tasks]);
  const progress = useMemo(() => getTaskProgress(tasks, task.id), [task.id, tasks]);
  const isWorkTask = task.projectId === 'work';
  const advanceLabel = getAdvanceLabel(task);

  return (
    <article className={`self-start rounded-3xl border bg-white p-5 shadow-soft transition ${task.completed ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <button
          aria-label="切换完成状态"
          className={`mt-1 h-5 w-5 rounded-full border ${task.completed ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}
          onClick={() => onToggle(task)}
          type="button"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-slate-500">{section?.name ?? '未归类阶段'}</p>
            {!isWorkTask && task.priority && (
              <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityStyles[task.priority]}`}>
                {priorityLabels[task.priority]}
              </span>
            )}
          </div>
          <h3 className={`mt-3 text-base font-semibold text-slate-950 ${task.completed ? 'line-through' : ''}`}>{task.title}</h3>
          {task.notes && <p className="mt-2 text-sm leading-6 text-slate-500">{task.notes}</p>}
          {progress.totalCount > 0 && (
            <div className="mt-4 rounded-2xl bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                <span>子任务进度 {progress.completedCount}/{progress.totalCount}</span>
                <span>{progress.percentage}%</span>
              </div>
              <div aria-label="子任务完成度" aria-valuemax={100} aria-valuemin={0} aria-valuenow={progress.percentage} className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200" role="progressbar">
                <div className="h-full rounded-full bg-cyan-500 transition-all" style={{ width: `${progress.percentage}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        {!isWorkTask && advanceLabel && (
          <button className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-medium text-white" onClick={() => onAdvance(task)} type="button">
            {advanceLabel}
          </button>
        )}
        <button className="rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-medium text-cyan-700" onClick={() => onEdit(task)} type="button">
          编辑
        </button>
        <button className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700" onClick={() => onAddSubtask(task)} type="button">
          新增子任务
        </button>
        {directSubtasks.length > 0 && (
          <button className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700" onClick={() => setExpanded((value) => !value)} type="button">
            {expanded ? `收起子任务 (${directSubtasks.length})` : `展开子任务 (${directSubtasks.length})`}
          </button>
        )}
        <button className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600" onClick={() => onDelete(task)} type="button">
          删除
        </button>
      </div>
      {expanded && directSubtasks.length > 0 && (
        <div className="mt-4 space-y-3 border-l border-slate-200 pl-4">
          {directSubtasks.map((subtask) => (
            <TaskCard
              key={subtask.id}
              depth={depth + 1}
              onAddSubtask={onAddSubtask}
              onAdvance={onAdvance}
              onDelete={onDelete}
              onEdit={onEdit}
              onToggle={onToggle}
              projects={projects}
              tasks={tasks}
              task={subtask}
            />
          ))}
        </div>
      )}
    </article>
  );
}
