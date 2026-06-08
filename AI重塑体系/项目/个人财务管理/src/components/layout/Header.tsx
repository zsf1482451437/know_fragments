export function Header() {
  return (
    <header className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-mint-500 via-emerald-400 to-teal-500 p-6 text-white shadow-soft md:p-8">
      <p className="mb-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">月度财务驾驶舱</p>
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">个人财务管理</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85">按月份记录收入、开销、负债和投资，用更轻的页面结构聚焦本金变化和分类明细。</p>
    </header>
  );
}
