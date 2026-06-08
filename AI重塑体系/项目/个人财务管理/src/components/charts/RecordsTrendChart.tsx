import { useMemo, useState } from 'react';
import type { FinanceRecord } from '../../types/finance';
import { formatCurrency } from '../../utils/finance';

interface RecordsTrendChartProps {
  records: FinanceRecord[];
}

export function RecordsTrendChart({ records }: RecordsTrendChartProps) {
  const width = 640;
  const height = 300;
  const paddingLeft = 64;
  const paddingRight = 28;
  const paddingTop = 28;
  const paddingBottom = 42;
  const tickStep = 2000;
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const dailySeries = useMemo(() => Array.from(
    records.reduce<Map<string, { income: number; expense: number }>>((acc, record) => {
      const current = acc.get(record.date) ?? { income: 0, expense: 0 };
      if (record.type === 'income' || record.type === 'preincome') {
        current.income += record.amount;
      } else {
        current.expense += record.amount;
      }
      acc.set(record.date, current);
      return acc;
    }, new Map()).entries(),
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({ date, ...values })), [records]);

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const maxValue = Math.max(...dailySeries.flatMap((item) => [item.income, item.expense]), tickStep);
  const yMax = Math.max(tickStep, Math.ceil(maxValue / tickStep) * tickStep);
  const ticks = Array.from({ length: Math.floor(yMax / tickStep) + 1 }, (_, index) => index * tickStep);
  const incomeColor = '#20ad80';
  const expenseColor = '#f43f5e';

  const points = dailySeries.map((item, index) => {
    const x = dailySeries.length === 1 ? (paddingLeft + width - paddingRight) / 2 : paddingLeft + (index / (dailySeries.length - 1)) * chartWidth;
    const incomeY = paddingTop + chartHeight - (item.income / yMax) * chartHeight;
    const expenseY = paddingTop + chartHeight - (item.expense / yMax) * chartHeight;
    return { ...item, x, incomeY, expenseY };
  });

  const incomePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.incomeY}`).join(' ');
  const expensePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.expenseY}`).join(' ');
  const hoveredPoint = points.find((point) => point.date === hoveredDate) ?? null;

  return (
    <section className="rounded-[1.5rem] bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900">流水</h2>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
            <i className="h-2 w-2 rounded-full bg-emerald-500" />
            收入线
          </span>
          <span className="flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-rose-700">
            <i className="h-2 w-2 rounded-full bg-rose-500" />
            支出线
          </span>
        </div>
      </div>
      <svg aria-label="流水折线图" className="h-72 w-full" role="img" viewBox={`0 0 ${width} ${height}`}>
        {ticks.map((tick) => {
          const y = paddingTop + chartHeight - (tick / yMax) * chartHeight;
          return (
            <g key={tick}>
              <line stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="1" x1={paddingLeft} x2={width - paddingRight} y1={y} y2={y} />
              <text fill="#94a3b8" fontSize="11" fontWeight="600" textAnchor="end" x={paddingLeft - 10} y={y + 4}>
                {tick}
              </text>
            </g>
          );
        })}
        <line stroke="#cbd5e1" strokeWidth="1.5" x1={paddingLeft} x2={paddingLeft} y1={paddingTop} y2={paddingTop + chartHeight} />
        <line stroke="#cbd5e1" strokeWidth="1.5" x1={paddingLeft} x2={width - paddingRight} y1={paddingTop + chartHeight} y2={paddingTop + chartHeight} />
        {points.length > 0 ? <path d={incomePath} fill="none" stroke={incomeColor} strokeLinecap="round" strokeWidth="3" /> : null}
        {points.length > 0 ? <path d={expensePath} fill="none" stroke={expenseColor} strokeLinecap="round" strokeWidth="3" /> : null}
        {points.map((point) => (
          <g key={point.date}>
            <circle
              cx={point.x}
              cy={point.incomeY}
              fill={incomeColor}
              opacity={hoveredPoint && hoveredPoint.date !== point.date ? 0.45 : 1}
              r={hoveredPoint?.date === point.date ? '6' : '4'}
            />
            <circle
              cx={point.x}
              cy={point.expenseY}
              fill={expenseColor}
              opacity={hoveredPoint && hoveredPoint.date !== point.date ? 0.45 : 1}
              r={hoveredPoint?.date === point.date ? '6' : '4'}
            />
            <circle
              cx={point.x}
              cy={(point.incomeY + point.expenseY) / 2}
              fill="transparent"
              onBlur={() => setHoveredDate(null)}
              onFocus={() => setHoveredDate(point.date)}
              onMouseEnter={() => setHoveredDate(point.date)}
              onMouseLeave={() => setHoveredDate(null)}
              r="14"
              tabIndex={0}
            />
            <text fill="#64748b" fontSize="11" fontWeight="600" textAnchor="middle" x={point.x} y={height - 10}>
              {point.date.slice(5)}
            </text>
          </g>
        ))}
        {hoveredPoint ? (
          <g pointerEvents="none">
            <line stroke="#64748b" strokeDasharray="3 4" strokeWidth="1.5" x1={hoveredPoint.x} x2={hoveredPoint.x} y1={paddingTop} y2={paddingTop + chartHeight} />
            <circle cx={hoveredPoint.x} cy={hoveredPoint.incomeY} fill="#ffffff" r="10" stroke={incomeColor} strokeWidth="3" />
            <circle cx={hoveredPoint.x} cy={hoveredPoint.expenseY} fill="#ffffff" r="10" stroke={expenseColor} strokeWidth="3" />
            <rect
              fill="#0f172a"
              height="56"
              rx="12"
              width="112"
              x={Math.max(16, Math.min(width - 128, hoveredPoint.x - 56))}
              y={Math.max(8, Math.min(height - 64, Math.min(hoveredPoint.incomeY, hoveredPoint.expenseY) - 72))}
            />
            <text
              fill="#ffffff"
              fontSize="11"
              fontWeight="600"
              textAnchor="middle"
              x={Math.max(72, Math.min(width - 72, hoveredPoint.x))}
              y={Math.max(24, Math.min(height - 40, Math.min(hoveredPoint.incomeY, hoveredPoint.expenseY) - 54))}
            >
              {hoveredPoint.date}
            </text>
            <text
              fill="#bbf7d0"
              fontSize="11"
              fontWeight="700"
              textAnchor="middle"
              x={Math.max(72, Math.min(width - 72, hoveredPoint.x))}
              y={Math.max(40, Math.min(height - 24, Math.min(hoveredPoint.incomeY, hoveredPoint.expenseY) - 38))}
            >
              {`收入 ${formatCurrency(hoveredPoint.income)}`}
            </text>
            <text
              fill="#fecdd3"
              fontSize="11"
              fontWeight="700"
              textAnchor="middle"
              x={Math.max(72, Math.min(width - 72, hoveredPoint.x))}
              y={Math.max(56, Math.min(height - 12, Math.min(hoveredPoint.incomeY, hoveredPoint.expenseY) - 22))}
            >
              {`支出 ${formatCurrency(hoveredPoint.expense)}`}
            </text>
          </g>
        ) : null}
      </svg>
    </section>
  );
}
