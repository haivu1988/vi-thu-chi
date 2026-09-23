import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatters';
import { TrendingUp, TrendingDown, BarChart3, LineChart, DollarSign, Calendar } from 'lucide-react';

type ChartMode = 'bars' | 'net' | 'rate';
type TimeRange = '6m' | '12m' | 'all';

export const MonthlyComparisonChart: React.FC = () => {
  const { monthlyDataList, selectedMonth, setSelectedMonth } = useFinance();
  const [mode, setMode] = useState<ChartMode>('bars');
  const [range, setRange] = useState<TimeRange>('6m');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Filtered dataset according to range
  const filteredData = useMemo(() => {
    if (range === '6m') return monthlyDataList.slice(-6);
    if (range === '12m') return monthlyDataList.slice(-12);
    return monthlyDataList;
  }, [monthlyDataList, range]);

  // Statistics calculation for the current range
  const stats = useMemo(() => {
    if (filteredData.length === 0) {
      return { avgIncome: 0, avgExpense: 0, avgNet: 0, highestIncomeMonth: null, highestExpenseMonth: null };
    }
    const totalInc = filteredData.reduce((s, d) => s + d.income, 0);
    const totalExp = filteredData.reduce((s, d) => s + d.expense, 0);
    const avgIncome = Math.round(totalInc / filteredData.length);
    const avgExpense = Math.round(totalExp / filteredData.length);
    const avgNet = avgIncome - avgExpense;

    const highestIncomeMonth = [...filteredData].sort((a, b) => b.income - a.income)[0];
    const highestExpenseMonth = [...filteredData].sort((a, b) => b.expense - a.expense)[0];

    return { avgIncome, avgExpense, avgNet, highestIncomeMonth, highestExpenseMonth };
  }, [filteredData]);

  // Max value calculation for chart scaling
  const maxVal = useMemo(() => {
    let max = 1;
    filteredData.forEach(d => {
      if (d.income > max) max = d.income;
      if (d.expense > max) max = d.expense;
      if (Math.abs(d.net) > max) max = Math.abs(d.net);
    });
    // Add 15% headroom
    return Math.ceil(max * 1.15);
  }, [filteredData]);

  // SVG Chart Dimensions
  const chartHeight = 280;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 45;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  // Grid steps (4 horizontal gridlines)
  const gridSteps = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-neutral-900">
              Biểu Đồ So Sánh Thu Nhập & Chi Tiêu Hàng Tháng
            </h3>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Theo dõi dòng tiền vào - ra và đánh giá hiệu quả tiết kiệm qua các tháng
          </p>
        </div>

        {/* View Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-neutral-100 p-1 rounded-lg">
            <button
              onClick={() => setMode('bars')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                mode === 'bars'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Cột Thu - Chi
            </button>
            <button
              onClick={() => setMode('net')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                mode === 'net'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Chênh lệch Ròng
            </button>
            <button
              onClick={() => setMode('rate')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                mode === 'rate'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Tỷ lệ Tiết kiệm (%)
            </button>
          </div>

          {/* Time range switcher */}
          <div className="flex items-center bg-neutral-100 p-1 rounded-lg">
            <button
              onClick={() => setRange('6m')}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                range === '6m'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              6 tháng
            </button>
            <button
              onClick={() => setRange('12m')}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                range === '12m'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              12 tháng
            </button>
            <button
              onClick={() => setRange('all')}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                range === 'all'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Tất cả
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-3 text-xs text-neutral-600">
        <div className="flex items-center gap-5">
          {mode === 'bars' && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500" />
                <span className="font-medium text-neutral-700">Thu nhập</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-rose-500" />
                <span className="font-medium text-neutral-700">Chi tiêu</span>
              </div>
            </>
          )}
          {mode === 'net' && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500" />
                <span className="font-medium text-neutral-700">Thặng dư (Thu &gt; Chi)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-rose-500" />
                <span className="font-medium text-neutral-700">Thâm hụt (Chi &gt; Thu)</span>
              </div>
            </>
          )}
          {mode === 'rate' && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-indigo-500" />
              <span className="font-medium text-neutral-700">Tỷ lệ tiết kiệm trên thu nhập (%)</span>
            </div>
          )}
        </div>

        <div className="text-neutral-400 hidden sm:block">
          Nhấp hoặc di chuột vào từng tháng để xem chi tiết
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative w-full overflow-x-auto select-none pt-2 pb-1">
        {filteredData.length === 0 || filteredData.every(d => d.income === 0 && d.expense === 0) ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-neutral-400">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
              <BarChart3 className="w-6 h-6 stroke-1" />
            </div>
            <p className="text-sm font-semibold text-neutral-700">Sổ thu chi đang để trắng</p>
            <p className="text-xs text-neutral-400 max-w-sm mt-1">
              Chưa có dữ liệu giao dịch thu chi. Hãy bắt đầu ghi chép các khoản thu nhập hoặc chi tiêu đầu tiên để xem thống kê biểu đồ.
            </p>
          </div>
        ) : (
          <div className="min-w-[500px]">
            <svg
              viewBox={`0 0 800 ${chartHeight}`}
              className="w-full h-auto overflow-visible"
              style={{ minHeight: '260px' }}
            >
              {/* Horizontal Gridlines */}
              {gridSteps.map((step, idx) => {
                const y = paddingTop + innerHeight * (1 - step);
                const val = maxVal * step;
                return (
                  <g key={idx}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={800 - paddingRight}
                      y2={y}
                      stroke="#E5E7EB"
                      strokeDasharray={idx === 0 ? 'none' : '3 3'}
                      strokeWidth="1"
                    />
                    <text
                      x={paddingLeft - 8}
                      y={y + 4}
                      textAnchor="end"
                      className="text-[11px] fill-neutral-400 font-mono"
                    >
                      {mode === 'rate' ? `${Math.round(step * 100)}%` : formatCompactCurrency(val)}
                    </text>
                  </g>
                );
              })}

              {/* Data Items */}
              {(() => {
                const totalItems = filteredData.length;
                const availableWidth = 800 - paddingLeft - paddingRight;
                const slotWidth = availableWidth / totalItems;

                return filteredData.map((d, index) => {
                  const xCenter = paddingLeft + slotWidth * index + slotWidth / 2;
                  const isHovered = hoveredIndex === index;
                  const isSelected = selectedMonth === d.monthKey;

                  // Bar calculations
                  if (mode === 'bars') {
                    const barWidth = Math.min(28, slotWidth * 0.35);
                    const incH = maxVal > 0 ? (d.income / maxVal) * innerHeight : 0;
                    const expH = maxVal > 0 ? (d.expense / maxVal) * innerHeight : 0;
                    const incY = paddingTop + innerHeight - incH;
                    const expY = paddingTop + innerHeight - expH;

                    return (
                      <g
                        key={d.monthKey}
                        className="cursor-pointer transition-opacity"
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onClick={() => setSelectedMonth(d.monthKey)}
                      >
                        {/* Hover/Selection Background highlight */}
                        {(isHovered || isSelected) && (
                          <rect
                            x={xCenter - slotWidth * 0.45}
                            y={paddingTop - 10}
                            width={slotWidth * 0.9}
                            height={innerHeight + 15}
                            fill={isSelected ? '#EEF2FF' : '#F9FAFB'}
                            rx="6"
                          />
                        )}

                        {/* Income Bar (Emerald) */}
                        <rect
                          x={xCenter - barWidth - 2}
                          y={incY}
                          width={barWidth}
                          height={Math.max(incH, 2)}
                          rx="3"
                          fill={isHovered ? '#059669' : '#10B981'}
                          className="transition-all duration-200"
                        />

                        {/* Expense Bar (Rose) */}
                        <rect
                          x={xCenter + 2}
                          y={expY}
                          width={barWidth}
                          height={Math.max(expH, 2)}
                          rx="3"
                          fill={isHovered ? '#E11D48' : '#F43F5E'}
                          className="transition-all duration-200"
                        />

                        {/* Month Label */}
                        <text
                          x={xCenter}
                          y={chartHeight - 12}
                          textAnchor="middle"
                          className={`text-[12px] font-medium transition-colors ${
                            isSelected
                              ? 'fill-indigo-700 font-bold'
                              : isHovered
                              ? 'fill-neutral-900 font-semibold'
                              : 'fill-neutral-500'
                          }`}
                        >
                          {d.displayMonth}
                        </text>
                        {isSelected && (
                          <circle cx={xCenter} cy={chartHeight - 3} r="2" fill="#4F46E5" />
                        )}
                      </g>
                    );
                  }

                  if (mode === 'net') {
                    const barWidth = Math.min(36, slotWidth * 0.5);
                    const netVal = d.net;
                    const h = maxVal > 0 ? (Math.abs(netVal) / maxVal) * innerHeight : 0;
                    const y = paddingTop + innerHeight - h;
                    const isPositive = netVal >= 0;

                    return (
                      <g
                        key={d.monthKey}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onClick={() => setSelectedMonth(d.monthKey)}
                      >
                        {(isHovered || isSelected) && (
                          <rect
                            x={xCenter - slotWidth * 0.45}
                            y={paddingTop - 10}
                            width={slotWidth * 0.9}
                            height={innerHeight + 15}
                            fill={isSelected ? '#EEF2FF' : '#F9FAFB'}
                            rx="6"
                          />
                        )}

                        <rect
                          x={xCenter - barWidth / 2}
                          y={y}
                          width={barWidth}
                          height={Math.max(h, 3)}
                          rx="4"
                          fill={isPositive ? '#10B981' : '#F43F5E'}
                        />

                        {/* Top value badge on bar */}
                        <text
                          x={xCenter}
                          y={y - 6}
                          textAnchor="middle"
                          className="text-[10px] font-mono font-semibold fill-neutral-600"
                        >
                          {formatCompactCurrency(netVal)}
                        </text>

                        {/* Month Label */}
                        <text
                          x={xCenter}
                          y={chartHeight - 12}
                          textAnchor="middle"
                          className={`text-[12px] font-medium ${
                            isSelected
                              ? 'fill-indigo-700 font-bold'
                              : isHovered
                              ? 'fill-neutral-900 font-semibold'
                              : 'fill-neutral-500'
                          }`}
                        >
                          {d.displayMonth}
                        </text>
                      </g>
                    );
                  }

                  // Mode rate: percentage bars
                  const barWidth = Math.min(32, slotWidth * 0.45);
                  const rateH = (d.savingsRate / 100) * innerHeight;
                  const rateY = paddingTop + innerHeight - rateH;

                  return (
                    <g
                      key={d.monthKey}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onClick={() => setSelectedMonth(d.monthKey)}
                    >
                      {(isHovered || isSelected) && (
                        <rect
                          x={xCenter - slotWidth * 0.45}
                          y={paddingTop - 10}
                          width={slotWidth * 0.9}
                          height={innerHeight + 15}
                          fill={isSelected ? '#EEF2FF' : '#F9FAFB'}
                          rx="6"
                        />
                      )}

                      <rect
                        x={xCenter - barWidth / 2}
                        y={rateY}
                        width={barWidth}
                        height={Math.max(rateH, 3)}
                        rx="4"
                        fill="#6366F1"
                      />

                      <text
                        x={xCenter}
                        y={rateY - 6}
                        textAnchor="middle"
                        className="text-[11px] font-mono font-bold fill-indigo-700"
                      >
                        {d.savingsRate}%
                      </text>

                      {/* Month Label */}
                      <text
                        x={xCenter}
                        y={chartHeight - 12}
                        textAnchor="middle"
                        className={`text-[12px] font-medium ${
                          isSelected
                            ? 'fill-indigo-700 font-bold'
                            : isHovered
                            ? 'fill-neutral-900 font-semibold'
                            : 'fill-neutral-500'
                        }`}
                      >
                        {d.displayMonth}
                      </text>
                    </g>
                  );
                });
              })()}
            </svg>
          </div>
        )}

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && filteredData[hoveredIndex] && (
          <div className="absolute top-3 right-4 bg-neutral-900 text-white rounded-lg p-3 text-xs shadow-xl z-20 pointer-events-none min-w-[210px] border border-neutral-800 animate-in fade-in duration-150">
            <div className="font-semibold pb-1.5 border-b border-neutral-800 text-neutral-200 flex items-center justify-between">
              <span>{filteredData[hoveredIndex].fullLabel}</span>
              <span className="text-[10px] text-neutral-400 font-normal">Nhấp để chọn tháng</span>
            </div>
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Thu nhập:
                </span>
                <span className="font-mono font-medium text-emerald-400">
                  {formatCurrency(filteredData[hoveredIndex].income)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  Chi tiêu:
                </span>
                <span className="font-mono font-medium text-rose-400">
                  {formatCurrency(filteredData[hoveredIndex].expense)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1.5 border-t border-neutral-800">
                <span className="text-neutral-400">Chênh lệch ròng:</span>
                <span
                  className={`font-mono font-bold ${
                    filteredData[hoveredIndex].net >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatCurrency(filteredData[hoveredIndex].net, true)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Tỷ lệ tiết kiệm:</span>
                <span className="font-mono font-semibold text-indigo-300">
                  {filteredData[hoveredIndex].savingsRate}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Metric Cards Underneath */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 mt-4 border-t border-neutral-100">
        <div className="p-3 bg-neutral-50 rounded-lg">
          <div className="flex items-center justify-between text-neutral-500 text-xs mb-1">
            <span>Thu nhập TB/tháng</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-base font-bold font-mono text-neutral-900">
            {formatCurrency(stats.avgIncome)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">
            Tính trên {filteredData.length} tháng gần đây
          </div>
        </div>

        <div className="p-3 bg-neutral-50 rounded-lg">
          <div className="flex items-center justify-between text-neutral-500 text-xs mb-1">
            <span>Chi tiêu TB/tháng</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-base font-bold font-mono text-neutral-900">
            {formatCurrency(stats.avgExpense)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">
            Mức chi trung bình hàng tháng
          </div>
        </div>

        <div className="p-3 bg-neutral-50 rounded-lg">
          <div className="flex items-center justify-between text-neutral-500 text-xs mb-1">
            <span>Thặng dư TB/tháng</span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <div
            className={`text-base font-bold font-mono ${
              stats.avgNet >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatCurrency(stats.avgNet, true)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">
            Khoản tích lũy trung bình
          </div>
        </div>

        <div className="p-3 bg-neutral-50 rounded-lg">
          <div className="flex items-center justify-between text-neutral-500 text-xs mb-1">
            <span>Tháng thu cao nhất</span>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-sm font-bold text-neutral-900 truncate">
            {stats.highestIncomeMonth && stats.highestIncomeMonth.income > 0 ? stats.highestIncomeMonth.fullLabel : 'Chưa có'}
          </div>
          <div className="text-[11px] font-mono text-emerald-600 font-semibold mt-0.5">
            {stats.highestIncomeMonth && stats.highestIncomeMonth.income > 0 ? formatCurrency(stats.highestIncomeMonth.income) : '-'}
          </div>
        </div>
      </div>
    </div>
  );
};
