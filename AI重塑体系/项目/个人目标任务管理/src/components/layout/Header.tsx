export function Header() {
  return (
    <header className="rounded-3xl bg-slate-950 px-8 py-7 text-white shadow-soft">
      <p className="text-sm font-medium text-cyan-200">Personal Goal Task Manager</p>
      <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">个人目标任务管理</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            用 Todoist 风格的「目标 -&gt; 本月 -&gt; 本周 -&gt; 今日」闭环管理个人任务
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-200">
          今日只保留 3-5 个关键动作
        </div>
      </div>
    </header>
  );
}
