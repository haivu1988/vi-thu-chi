import React, { useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatMonthLabel } from '../../utils/formatters';
import { Activity } from 'lucide-react';

export const DailyTrendChart: React.FC = () => {
  const { transactions, selectedMonth } = useFinance();

  // Extract all transactions for the selected month
  const monthTxs = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Aggregate by day of month (1 to 31)
  const dailyData = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();

    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const dayNum = i + 1;
      const dayStr = String(dayNum).padStart(2, '0');
      const dateKey = `${selectedMonth}-${dayStr}`;

      const txsOnDay = monthTxs.filter(t => t.date === dateKey);
      const income = txsOnDay.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = txsOnDay.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

      return {
        day: dayNum,
        dateKey,
        income,
        expense,
      };
    });

    return days;
  }, [monthTxs, selectedMonth]);

  // Max daily amount
  const maxDayAmount = useMemo(() => {
    let max = 100000;
    dailyData.forEach(d => {
      if (d.income > max) max = d.income;
      if (d.expense > max) max = d.expense;
    });
    return max * 1.1;
  }, [dailyData]);

  const height = 140;
  const paddingLeft = 30;
  const paddingRight = 10;
  const paddingTop = 15;
  const paddingBottom = 25;
  const innerHeight = height - paddingTop - paddingBottom;
  const innerWidth = 600 - paddingLeft - paddingRight;

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-neutral-600" />
          <h4 className="text-sm font-bold text-neutral-800">
            Biến Động Thu Chi Theo Ngày ({formatMonthLabel(selectedMonth)})
          </h4>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-neutral-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Thu nhập
          </span>
          <span className="flex items-center gap-1.5 text-neutral-600">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            Chi tiêu
          </span>
        </div>
      </div>

      {monthTxs.length === 0 ? (
        <div className="py-10 text-center text-xs text-neutral-400 flex flex-col items-center justify-center">
          <p>Chưa có giao dịch thu chi nào trong tháng này</p>
        </div>
      ) : (
        <div className="pt-3 w-full overflow-x-auto">
        <svg viewBox={`0 0 600 ${height}`} className="w-full h-auto min-w-[480px]">
          {/* Baseline */}
          <line
            x1={paddingLeft}
            y1={paddingTop + innerHeight}
            x2={600 - paddingRight}
            y2={paddingTop + innerHeight}
            stroke="#E5E7EB"
            strokeWidth="1"
          />

          {/* Daily Columns */}
          {dailyData.map((d, index) => {
            const stepX = innerWidth / dailyData.length;
            const x = paddingLeft + index * stepX + stepX / 2;
            const incH = (d.income / maxDayAmount) * innerHeight;
            const expH = (d.expense / maxDayAmount) * innerHeight;

            const hasTx = d.income > 0 || d.expense > 0;

            return (
              <g key={d.day} className="group cursor-pointer">
                {/* Day label on bottom (show every 5 days or if has transactions) */}
                {(d.day === 1 || d.day % 5 === 0 || d.day === dailyData.length) && (
                  <text
                    x={x}
                    y={height - 8}
                    textAnchor="middle"
                    className="text-[10px] fill-neutral-400 font-mono"
                  >
                    {d.day}
                  </text>
                )}

                {/* Income pin / bar */}
                {d.income > 0 && (
                  <rect
                    x={x - 2.5}
                    y={paddingTop + innerHeight - incH}
                    width="4"
                    height={Math.max(incH, 2)}
                    rx="1.5"
                    fill="#10B981"
                  />
                )}

                {/* Expense pin / bar */}
                {d.expense > 0 && (
                  <rect
                    x={x + 1}
                    y={paddingTop + innerHeight - expH}
                    width="4"
                    height={Math.max(expH, 2)}
                    rx="1.5"
                    fill="#F43F5E"
                  />
                )}

                {/* Tooltip hover highlight */}
                {hasTx && (
                  <title>
                    {`Ngày ${d.day}: Thu ${formatCurrency(d.income)} | Chi ${formatCurrency(d.expense)}`}
                  </title>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      )}
    </div>
  );
};
