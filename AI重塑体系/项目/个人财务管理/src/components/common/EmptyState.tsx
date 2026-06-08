export function EmptyState() {
  return (
    <section className="rounded-[1.5rem] bg-white p-8 text-center shadow-soft">
      <p className="text-lg font-bold text-slate-800">这个月份还没有财务记录</p>
      <p className="mt-2 text-sm text-slate-400">先记录收入、开销、投资或负债，本金会自动计算。</p>
    </section>
  );
}
