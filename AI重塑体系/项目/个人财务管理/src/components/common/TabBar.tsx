interface TabItem {
  id: string;
  label: string;
}

interface TabBarProps {
  activeTab: string;
  tabs: readonly TabItem[];
  onChange: (tabId: string) => void;
  ariaLabel?: string;
  variant?: 'default' | 'capsule';
}

export function TabBar({ activeTab, tabs, onChange, ariaLabel = '财务内容切换', variant = 'default' }: TabBarProps) {
  const containerClass = variant === 'capsule'
    ? 'inline-flex rounded-full bg-mint-100/80 p-1 shadow-soft ring-1 ring-white/80'
    : 'inline-flex rounded-2xl bg-white p-1.5 shadow-soft';

  return (
    <div className={containerClass} role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        const buttonClass = variant === 'capsule'
          ? `rounded-full px-4 py-2 text-sm font-semibold transition ${active ? 'bg-white text-mint-700 shadow-sm' : 'text-slate-500 hover:text-mint-600'}`
          : `rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${active ? 'bg-mint-500 text-white' : 'text-slate-500 hover:bg-mint-50 hover:text-mint-600'}`;

        return (
          <button
            aria-selected={active}
            className={buttonClass}
            key={tab.id}
            onClick={() => onChange(tab.id)}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
