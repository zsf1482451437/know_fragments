import type { CSSProperties, PropsWithChildren, ReactNode } from 'react';

export function PageSection({
  title,
  description,
  actions,
  children,
  className = ''
}: PropsWithChildren<{ title: string; description?: string; actions?: ReactNode; className?: string }>) {
  return (
    <section className={`rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6 ${className}`}>
      <header className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 md:text-2xl">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-3 text-sm text-slate-500">{hint}</p>
    </article>
  );
}

export function Pill({
  tone = 'default',
  children
}: PropsWithChildren<{ tone?: 'default' | 'blue' | 'green' | 'orange' | 'rose' | 'violet' | 'zinc' | 'cyan' }>) {
  const classMap = {
    default: 'bg-slate-100 text-slate-700 ring-slate-200',
    blue: 'bg-blue-50 text-blue-700 ring-blue-100',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    orange: 'bg-orange-50 text-orange-700 ring-orange-100',
    rose: 'bg-rose-50 text-rose-700 ring-rose-100',
    violet: 'bg-violet-50 text-violet-700 ring-violet-100',
    zinc: 'bg-zinc-100 text-zinc-700 ring-zinc-200',
    cyan: 'bg-cyan-50 text-cyan-700 ring-cyan-100'
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${classMap[tone]}`}>
      {children}
    </span>
  );
}

export function SideNavItem({ label, helper, active = false }: { label: string; helper: string; active?: boolean }) {
  return (
    <div className={`rounded-2xl border px-4 py-3 ${active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50'}`}>
      <p className={`text-sm font-medium ${active ? 'text-white' : 'text-slate-900'}`}>{label}</p>
      <p className={`mt-1 text-xs ${active ? 'text-slate-300' : 'text-slate-500'}`}>{helper}</p>
    </div>
  );
}

export function ProgressRing({ value, label, hint }: { value: number; label: string; hint: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  const style = {
    background: `conic-gradient(rgb(15 23 42) ${clamped * 3.6}deg, rgba(226,232,240,1) 0deg)`
  } satisfies CSSProperties;

  return (
    <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid size-20 place-items-center rounded-full p-[6px]" style={style}>
        <div className="grid size-full place-items-center rounded-full bg-white text-center">
          <span className="text-lg font-semibold text-slate-900">{clamped}%</span>
        </div>
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-base font-semibold text-slate-900">{hint}</p>
      </div>
    </div>
  );
}

export function DataList({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <dl className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</dt>
          <dd className="mt-2 text-sm text-slate-700">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function OverlayCard({ children }: PropsWithChildren) {
  return <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl">{children}</div>;
}
