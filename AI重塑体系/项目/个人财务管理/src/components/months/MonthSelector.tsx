interface MonthSelectorProps {
  months: string[];
  selectedMonth: string;
  onSelect: (month: string) => void;
}

export function MonthSelector({ months, selectedMonth, onSelect }: MonthSelectorProps) {
  return (
    <section className="rounded-[1.5rem] bg-white p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900">月份</h2>
        <span className="text-xs text-slate-400">按月归档</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
        {months.map((month) => {
          const active = month === selectedMonth;
          return (
            <button
              className={`whitespace-nowrap rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${active ? 'bg-mint-500 text-white shadow-soft' : 'bg-slate-50 text-slate-600 hover:bg-mint-50 hover:text-mint-600'}`}
              key={month}
              onClick={() => onSelect(month)}
              type="button"
            >
              {month}
            </button>
          );
        })}
      </div>
    </section>
  );
}
