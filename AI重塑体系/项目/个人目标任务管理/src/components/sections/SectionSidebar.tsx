import type { Project, Task } from '../../types/task';
import { getTaskSectionId } from '../../utils/taskSections';

interface SectionSidebarProps {
  projects: Project[];
  selectedSectionId: string;
  tasks: Task[];
  onSelect: (sectionId: string) => void;
}

export function SectionSidebar({ projects, selectedSectionId, tasks, onSelect }: SectionSidebarProps) {
  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
      <h2 className="text-lg font-semibold text-slate-950">阶段分区</h2>
      <p className="mt-1 text-sm text-slate-500">按年度、本月、本周、今日、工作阶段查看和管理任务。</p>
      <div className="mt-5 space-y-2">
        <button
          className={`w-full rounded-2xl px-4 py-3 text-left text-sm transition ${
            selectedSectionId === 'all' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
          }`}
          onClick={() => onSelect('all')}
          type="button"
        >
          全部任务
        </button>
        {projects.map((project) => {
          const count = tasks.filter((task) => getTaskSectionId(task) === project.id && !task.completed).length;
          return (
            <button
              className={`w-full rounded-2xl px-4 py-3 text-left text-sm transition ${
                selectedSectionId === project.id ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
              key={project.id}
              onClick={() => onSelect(project.id)}
              type="button"
            >
              <span className="flex items-center justify-between gap-3">
                <span className="font-medium">{project.name}</span>
                <span className="text-xs opacity-70">{count}</span>
              </span>
              <span className="mt-1 block text-xs opacity-70">{project.description}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
