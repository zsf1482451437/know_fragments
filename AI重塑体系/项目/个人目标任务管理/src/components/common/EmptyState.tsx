export function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
      <p className="text-lg font-semibold text-slate-800">当前筛选下没有任务</p>
      <p className="mt-2 text-sm">可以新增一个下一步动作，或者切换到全部项目。</p>
    </div>
  );
}
