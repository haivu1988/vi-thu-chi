import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatMonthLabel } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import {
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  List,
  Layers,
  X,
  Info,
} from 'lucide-react';

type MobileViewMode = 'all' | 'chart' | 'list';

export const CategoryBreakdownChart: React.FC = () => {
  const {
    categoryBreakdownExpense,
    categoryBreakdownIncome,
    selectedMonth,
    selectedMonthSummary,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [hoveredCatId, setHoveredCatId] = useState<string | null>(null);
  const [mobileMode, setMobileMode] = useState<MobileViewMode>('all');

  const breakdownData = activeTab === 'expense' ? categoryBreakdownExpense : categoryBreakdownIncome;
  const totalAmount = activeTab === 'expense' ? selectedMonthSummary.expense : selectedMonthSummary.income;
  const totalTransactionsCount = breakdownData.reduce((acc, item) => acc + item.count, 0);

  // Active category is either tapped or hovered
  const activeCatId = selectedCatId || hoveredCatId;
  const activeCategory = activeCatId
    ? breakdownData.find(b => b.category.id === activeCatId)
    : null;

  // Donut geometry in 240x240 internal coordinate space
  const size = 240;
  const strokeWidth = 30;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Compute SVG stroke-dasharray and dashoffset for each slice
  let accumulatedAngle = 0;
  const slices = breakdownData.map(item => {
    const fraction = totalAmount > 0 ? item.total / totalAmount : 0;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedAngle * circumference;
    accumulatedAngle += fraction;
    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const handleToggleCategory = (catId: string) => {
    setSelectedCatId(prev => (prev === catId ? null : catId));
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-neutral-900">
                  Cơ Cấu {activeTab === 'expense' ? 'Chi Tiêu' : 'Thu Nhập'}
                </h3>
                <p className="text-[11px] sm:text-xs text-neutral-500">
                  {formatMonthLabel(selectedMonth)} · {breakdownData.length} danh mục
                </p>
              </div>
            </div>
          </div>

          {/* Controls row on mobile: Type toggle & Mobile view toggle */}
          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            {/* Mobile View Mode Switcher (Only visible on small screens when data exists) */}
            {breakdownData.length > 0 && (
              <div className="flex sm:hidden items-center bg-neutral-100 p-0.5 rounded-lg text-[11px]">
                <button
                  onClick={() => setMobileMode('all')}
                  className={`px-2 py-1 font-medium rounded-md transition-colors ${
                    mobileMode === 'all'
                      ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                      : 'text-neutral-500'
                  }`}
                  title="Hiển thị cả biểu đồ và danh sách"
                >
                  <Layers className="w-3.5 h-3.5 inline mr-1" />
                  Cả hai
                </button>
                <button
                  onClick={() => setMobileMode('chart')}
                  className={`px-2 py-1 font-medium rounded-md transition-colors ${
                    mobileMode === 'chart'
                      ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                      : 'text-neutral-500'
                  }`}
                  title="Chỉ biểu đồ tròn"
                >
                  <PieChart className="w-3.5 h-3.5 inline mr-1" />
                  Tròn
                </button>
                <button
                  onClick={() => setMobileMode('list')}
                  className={`px-2 py-1 font-medium rounded-md transition-colors ${
                    mobileMode === 'list'
                      ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                      : 'text-neutral-500'
                  }`}
                  title="Chỉ danh sách chi tiết"
                >
                  <List className="w-3.5 h-3.5 inline mr-1" />
                  Chi tiết
                </button>
              </div>
            )}

            {/* Income / Expense Toggle */}
            <div className="flex items-center bg-neutral-100 p-1 rounded-xl">
              <button
                onClick={() => {
                  setActiveTab('expense');
                  setSelectedCatId(null);
                  setHoveredCatId(null);
                }}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'expense'
                    ? 'bg-white text-rose-600 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>Chi tiêu</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('income');
                  setSelectedCatId(null);
                  setHoveredCatId(null);
                }}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'income'
                    ? 'bg-white text-emerald-600 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Thu nhập</span>
              </button>
            </div>
          </div>
        </div>

        {/* Selected Category Sticky Banner on Mobile */}
        {activeCategory && (
          <div className="mt-3 p-2.5 bg-indigo-50/80 border border-indigo-200/90 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: activeCategory.category.color }}
              />
              <span className="font-bold text-indigo-950 truncate">
                {activeCategory.category.name}
              </span>
              <span className="font-mono text-indigo-800 font-bold shrink-0">
                {formatCurrency(activeCategory.total)} ({activeCategory.percentage}%)
              </span>
            </div>
            <button
              onClick={() => setSelectedCatId(null)}
              className="px-2 py-0.5 bg-white text-neutral-600 hover:text-neutral-900 rounded-md font-semibold text-[11px] shadow-2xs flex items-center gap-0.5 shrink-0 ml-2"
            >
              <X className="w-3 h-3" />
              <span>Bỏ lọc</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        {breakdownData.length === 0 ? (
          <div className="py-14 sm:py-16 flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
              <PieChart className="w-6 h-6 stroke-1" />
            </div>
            <p className="text-sm font-semibold text-neutral-700">
              Chưa có dữ liệu {activeTab === 'expense' ? 'chi tiêu' : 'thu nhập'}
            </p>
            <p className="text-xs text-neutral-400 mt-1 max-w-xs">
              Chưa có giao dịch {activeTab === 'expense' ? 'chi tiêu' : 'thu nhập'} nào trong {formatMonthLabel(selectedMonth)}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6 items-center pt-5 sm:pt-6">
            {/* Donut Chart Visual */}
            {(mobileMode === 'all' || mobileMode === 'chart') && (
              <div className="md:col-span-5 flex flex-col items-center justify-center relative py-2">
                <div className="relative flex items-center justify-center">
                  <svg
                    viewBox={`0 0 ${size} ${size}`}
                    className="w-44 h-44 sm:w-52 sm:h-52 md:w-56 md:h-56 transform -rotate-90 cursor-pointer drop-shadow-2xs select-none"
                  >
                    {/* Background Ring */}
                    <circle
                      cx={center}
                      cy={center}
                      r={radius}
                      fill="transparent"
                      stroke="#F3F4F6"
                      strokeWidth={strokeWidth}
                    />

                    {/* Slices */}
                    {slices.map(slice => {
                      const isCatActive = activeCatId === slice.category.id;
                      const isAnyActive = !!activeCatId;
                      const currentStrokeWidth = isCatActive ? strokeWidth + 6 : strokeWidth;
                      const opacity = isAnyActive && !isCatActive ? 0.35 : 1;

                      return (
                        <circle
                          key={slice.category.id}
                          cx={center}
                          cy={center}
                          r={radius}
                          fill="transparent"
                          stroke={slice.category.color}
                          strokeWidth={currentStrokeWidth}
                          strokeDasharray={slice.strokeDasharray}
                          strokeDashoffset={slice.strokeDashoffset}
                          opacity={opacity}
                          className="transition-all duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleCategory(slice.category.id);
                          }}
                          onMouseEnter={() => setHoveredCatId(slice.category.id)}
                          onMouseLeave={() => setHoveredCatId(null)}
                        />
                      );
                    })}
                  </svg>

                  {/* Center Info in Donut */}
                  <div
                    onClick={() => setSelectedCatId(null)}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 cursor-pointer select-none"
                  >
                    {activeCategory ? (
                      <div className="space-y-0.5 animate-in fade-in zoom-in duration-150">
                        <span className="text-[10px] sm:text-[11px] font-semibold text-neutral-500 truncate max-w-[110px] sm:max-w-[130px] block mx-auto">
                          {activeCategory.category.name}
                        </span>
                        <span className="text-xs sm:text-sm md:text-base font-bold font-mono text-neutral-900 block leading-tight">
                          {formatCurrency(activeCategory.total)}
                        </span>
                        <span className="inline-block text-[10px] sm:text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                          {activeCategory.percentage}%
                        </span>
                        <span className="text-[9px] text-neutral-400 block pt-0.5">
                          {activeCategory.count} GD · Chạm để bỏ
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <span className="text-[10px] sm:text-[11px] font-medium text-neutral-400 block">
                          Tổng {activeTab === 'expense' ? 'chi' : 'thu'}
                        </span>
                        <span className="text-xs sm:text-sm md:text-base font-bold font-mono text-neutral-900 block leading-tight">
                          {formatCurrency(totalAmount)}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-medium block">
                          {breakdownData.length} danh mục
                        </span>
                        <span className="text-[9px] text-neutral-400 block">
                          {totalTransactionsCount} GD
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Helpful touch caption for mobile */}
                <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-2 text-center sm:hidden">
                  Chạm vào lát cắt để xem chi tiết danh mục
                </p>
              </div>
            )}

            {/* Category Progress List (Mobile & Desktop) */}
            {(mobileMode === 'all' || mobileMode === 'list') && (
              <div className="md:col-span-7 space-y-2.5 max-h-[340px] sm:max-h-[300px] overflow-y-auto pr-1">
                {breakdownData.map(item => {
                  const isActive = activeCatId === item.category.id;
                  const isAnyActive = !!activeCatId;
                  const opacityClass = isAnyActive && !isActive ? 'opacity-40' : 'opacity-100';

                  return (
                    <div
                      key={item.category.id}
                      onClick={() => handleToggleCategory(item.category.id)}
                      onMouseEnter={() => setHoveredCatId(item.category.id)}
                      onMouseLeave={() => setHoveredCatId(null)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer select-none active:scale-[0.99] ${opacityClass} ${
                        isActive
                          ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'bg-white border-neutral-150 hover:border-neutral-300 hover:bg-neutral-50/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-xs mb-2">
                        {/* Left: Icon & Name */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 text-white shadow-2xs"
                            style={{ backgroundColor: item.category.color }}
                          >
                            <CategoryIcon iconName={item.category.icon} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-neutral-800 text-xs sm:text-sm truncate block leading-tight">
                              {item.category.name}
                            </span>
                            <span className="text-[10px] sm:text-[11px] text-neutral-400 block mt-0.5">
                              {item.count} giao dịch
                            </span>
                          </div>
                        </div>

                        {/* Right: Amount & Percent Pill */}
                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold text-xs sm:text-sm text-neutral-900 block leading-tight">
                            {formatCurrency(item.total)}
                          </span>
                          <span
                            className="inline-block text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-md mt-0.5 font-mono"
                            style={{
                              backgroundColor: `${item.category.color}18`,
                              color: item.category.color,
                            }}
                          >
                            {item.percentage}%
                          </span>
                        </div>
                      </div>

                      {/* Clean Progress Bar */}
                      <div className="w-full bg-neutral-100 h-1.5 sm:h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: item.category.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Note footer */}
      {breakdownData.length > 0 && (
        <div className="pt-3.5 mt-3.5 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] text-neutral-400">
          <div className="flex items-center gap-1">
            <Info className="w-3 h-3 text-neutral-400 shrink-0" />
            <span>Chạm hoặc di chuột vào danh mục để xem tỷ trọng chi tiết</span>
          </div>
          <span className="text-neutral-500 font-medium">
            {breakdownData.length} khoản mục · Tổng {formatCurrency(totalAmount)}
          </span>
        </div>
      )}
    </div>
  );
};
