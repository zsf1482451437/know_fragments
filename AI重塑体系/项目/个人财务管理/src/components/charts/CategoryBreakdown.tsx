import type { MonthSummary, RecordType } from '../../types/finance';
import { formatCurrency, recordTypeMeta } from '../../utils/finance';

interface CategoryBreakdownProps {
  summary: MonthSummary;
  includePreIncome: boolean;
}

const keys: RecordType[] = ['expense', 'investment', 'debt'];
const chartColors: Record<RecordType, string> = {
  preincome: '#8b5cf6',
  income: '#34d399',
  expense: '#fb7185',
  investment: '#38bdf8',
  debt: '#fbbf24',
};

export function CategoryBreakdown({ summary, includePreIncome }: CategoryBreakdownProps) {
  const size = 420;
  const stroke = 18;
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const denominator = Math.max(summary.income + (includePreIncome ? summary.preincome : 0), 1);
  const segments = keys.reduce<Array<{
    key: RecordType;
    value: number;
    rawRatio: number;
    displayRatio: number;
    startRatio: number;
  }>>((acc, key) => {
    const usedRatio = acc.length > 0 ? acc[acc.length - 1].startRatio + acc[acc.length - 1].displayRatio : 0;
    const rawRatio = summary.income > 0 ? summary[key] / denominator : 0;
    const startRatio = usedRatio;
    const endRatio = Math.min(usedRatio + rawRatio, 1);
    const displayRatio = Math.max(endRatio - startRatio, 0);

    if (summary[key] > 0 && displayRatio > 0) {
      acc.push({
        key,
        value: summary[key],
        rawRatio,
        displayRatio,
        startRatio,
      });
    }

    return acc;
  }, []);

  return (
    <section className="rounded-[1.5rem] bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-slate-900">分类占比</h2>
        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
          {includePreIncome ? '按收入 + 预收入计算' : '按收入计算'}
        </span>
      </div>
      <div className="mt-5 flex flex-col items-center gap-6">
        <svg aria-label="分类占比圆形图表" className="h-[32rem] w-full max-w-[42rem]" viewBox={`0 0 ${size} ${size}`} role="img">
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            <circle cx={size / 2} cy={size / 2} fill="none" r={radius} stroke="#e5e7eb" strokeWidth={stroke} />
            {segments.map((segment) => (
              <circle
                key={segment.key}
                cx={size / 2}
                cy={size / 2}
                fill="none"
                r={radius}
                stroke={chartColors[segment.key]}
                strokeDasharray={`${segment.displayRatio * circumference} ${circumference}`}
                strokeDashoffset={-segment.startRatio * circumference}
                strokeLinecap="round"
                strokeWidth={stroke}
              />
            ))}
          </g>
          {segments.map((segment) => {
            const meta = recordTypeMeta[segment.key];
            const ratioText = `${Math.round(segment.rawRatio * 100)}%`;
            const middleRatio = segment.startRatio + segment.displayRatio / 2;
            const angle = middleRatio * Math.PI * 2 - Math.PI / 2;
            const startX = size / 2 + Math.cos(angle) * (radius + stroke / 2);
            const startY = size / 2 + Math.sin(angle) * (radius + stroke / 2);
            const bendX = size / 2 + Math.cos(angle) * (radius + 34);
            const bendY = size / 2 + Math.sin(angle) * (radius + 34);
            const endX = bendX + (Math.cos(angle) >= 0 ? 52 : -52);
            const textX = endX + (Math.cos(angle) >= 0 ? 10 : -10);
            const textAnchor = Math.cos(angle) >= 0 ? 'start' : 'end';

            return (
              <g key={`${segment.key}-label`}>
                <path d={`M ${startX} ${startY} L ${bendX} ${bendY} L ${endX} ${bendY}`} fill="none" stroke={chartColors[segment.key]} strokeWidth="1.5" />
                <circle cx={startX} cy={startY} fill={chartColors[segment.key]} r="2.5" />
                <text fill="#0f172a" fontSize="12" fontWeight="700" textAnchor={textAnchor} x={textX} y={bendY - 4}>
                  {meta.label}
                </text>
                <text fill="#64748b" fontSize="11" fontWeight="600" textAnchor={textAnchor} x={textX} y={bendY + 12}>
                  {`${formatCurrency(segment.value)} / ${ratioText}`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
