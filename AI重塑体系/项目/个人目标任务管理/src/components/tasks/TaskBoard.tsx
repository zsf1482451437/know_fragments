import type { Priority, Project, Task } from '../../types/task';
import { priorityLabels } from '../../utils/taskFilters';
import { TaskCard } from './TaskCard';

interface TaskBoardProps {
  tasks: Task[];
  projects: Project[];
  onToggle: (task: Task) => void;
  onAdvance: (task: Task) => void;
  onEdit: (task: Task) => void;
  onAddSubtask: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const priorities: Priority[] = ['year', 'month', 'week', 'today'];

export function TaskBoard({ tasks, projects, onToggle, onAdvance, onEdit, onAddSubtask, onDelete }: TaskBoardProps) {
  const rootTasks = tasks.filter((task) => !task.parentId);
  const workTasks = rootTasks.filter((task) => task.projectId === 'work');
  const timeTasks = rootTasks.filter((task) => task.projectId !== 'work');

  return (
    <section className="space-y-5">
      {priorities.map((priority) => {
        const groupedTasks = timeTasks.filter((task) => task.priority === priority);
        if (groupedTasks.length === 0) {
          return null;
        }

        return (
          <div className="rounded-3xl border border-slate-200 bg-slate-50/60 p-4" key={priority}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-950">{priorityLabels[priority]}</h2>
              <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-500">{groupedTasks.length} 个任务</span>
            </div>
            <div className="grid items-start gap-4 xl:grid-cols-2">
              {groupedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  onAddSubtask={onAddSubtask}
                  onAdvance={onAdvance}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onToggle={onToggle}
                  projects={projects}
                  tasks={tasks}
                  task={task}
                />
              ))}
            </div>
          </div>
        );
      })}
      {workTasks.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-950">工作</h2>
            <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-500">{workTasks.length} 个任务</span>
          </div>
          <div className="grid items-start gap-4 xl:grid-cols-2">
            {workTasks.map((task) => (
              <TaskCard
                key={task.id}
                onAddSubtask={onAddSubtask}
                onAdvance={onAdvance}
                onDelete={onDelete}
                onEdit={onEdit}
                onToggle={onToggle}
                projects={projects}
                tasks={tasks}
                task={task}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
