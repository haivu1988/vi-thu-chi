import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatMonthLabel } from '../../utils/formatters';
import { MonthlyComparisonChart } from '../charts/MonthlyComparisonChart';
import { CategoryBreakdownChart } from '../charts/CategoryBreakdownChart';
import { DailyTrendChart } from '../charts/DailyTrendChart';
import { CategoryIcon } from '../common/CategoryIcon';
import { Transaction } from '../../types/finance';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface OverviewTabProps {
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onNavigateToTransactions: () => void;
  onNavigateToAnalytics: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  onOpenAddModal,
  onEditTransaction,
  onNavigateToTransactions,
  onNavigateToAnalytics,
}) => {
  const {
    selectedMonthSummary,
    selectedMonth,
    transactions,
    categories,
    budgets,
  } = useFinance();

  // Recent 5 transactions for selected month
  const recentTransactions = transactions
    .filter(t => t.date.startsWith(selectedMonth))
    .slice(0, 5);

  // Total budget for this month
  const monthBudgets = budgets.filter(b => b.month === selectedMonth);
  const totalBudgetAmount = monthBudgets.reduce((s, b) => s + b.limitAmount, 0);
  const budgetSpent = selectedMonthSummary.expense;
  const budgetProgress = totalBudgetAmount > 0 ? Math.round((budgetSpent / totalBudgetAmount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Welcome & Month Highlight Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white p-6 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-400">
              Báo cáo tài chính cá nhân
            </span>
            <span className="text-neutral-500">·</span>
            <span className="text-xs text-neutral-300">{formatMonthLabel(selectedMonth)}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Tổng Quan Thu Chi & Quản Lý Dòng Tiền
          </h2>
          <p className="text-xs text-neutral-300 max-w-xl">
            Theo dõi chi tiết các khoản thu nhập, dòng tiền chi tiêu định kỳ và các chỉ số tích lũy cá nhân
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Thu/Chi Ngay</span>
          </button>
        </div>
      </div>

      {/* Blank State Welcome Card if no transactions */}
      {transactions.length === 0 && (
        <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-900">
                Sổ Thu Chi Đang Ở Trạng Thái Trắng
              </h4>
              <p className="text-xs text-neutral-600 mt-0.5 max-w-xl">
                Sổ trắng sẵn sàng để bạn ghi nhận chi tiêu thực tế. Nhấn nút <strong>Ghi Giao Dịch Đầu Tiên</strong> để bắt đầu quản lý tài chính cá nhân của bạn!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ghi Giao Dịch Đầu Tiên</span>
            </button>
          </div>
        </div>
      )}

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Thu Nhập */}
        <div className="p-5 bg-white border border-neutral-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs mb-2">
            <span className="font-semibold text-neutral-700">Tổng Thu Nhập</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600">
            {formatCurrency(selectedMonthSummary.income)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-2">
            {selectedMonthSummary.incomeChangePercent !== 0 ? (
              <span
                className={`flex items-center font-semibold ${
                  selectedMonthSummary.incomeChangePercent > 0
                    ? 'text-emerald-600'
                    : 'text-rose-600'
                }`}
              >
                {selectedMonthSummary.incomeChangePercent > 0 ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                {Math.abs(selectedMonthSummary.incomeChangePercent)}%
              </span>
            ) : (
              <span>0%</span>
            )}
            <span className="text-neutral-400">so với tháng trước</span>
          </div>
        </div>

        {/* Chi Tiêu */}
        <div className="p-5 bg-white border border-neutral-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs mb-2">
            <span className="font-semibold text-neutral-700">Tổng Chi Tiêu</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600">
            {formatCurrency(selectedMonthSummary.expense)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-2">
            {selectedMonthSummary.expenseChangePercent !== 0 ? (
              <span
                className={`flex items-center font-semibold ${
                  selectedMonthSummary.expenseChangePercent < 0
                    ? 'text-emerald-600'
                    : 'text-rose-600'
                }`}
              >
                {selectedMonthSummary.expenseChangePercent > 0 ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                {Math.abs(selectedMonthSummary.expenseChangePercent)}%
              </span>
            ) : (
              <span>0%</span>
            )}
            <span className="text-neutral-400">so với tháng trước</span>
          </div>
        </div>

        {/* Số Dư Ròng */}
        <div className="p-5 bg-white border border-neutral-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs mb-2">
            <span className="font-semibold text-neutral-700">Số Dư Tích Lũy</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-2xl font-bold font-mono ${
              selectedMonthSummary.net >= 0 ? 'text-indigo-600' : 'text-rose-600'
            }`}
          >
            {formatCurrency(selectedMonthSummary.net, true)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-2">
            <span className="font-semibold text-indigo-600">
              {selectedMonthSummary.savingsRate}%
            </span>
            <span className="text-neutral-400">tỷ lệ tiết kiệm trên thu nhập</span>
          </div>
        </div>

        {/* Ngân Sách */}
        <div className="p-5 bg-white border border-neutral-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs mb-2">
            <span className="font-semibold text-neutral-700">Hạn Mức Ngân Sách</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900">
            {totalBudgetAmount > 0 ? formatCurrency(totalBudgetAmount) : 'Chưa đặt'}
          </div>
          <div className="flex items-center gap-2 text-[11px] mt-2">
            {totalBudgetAmount > 0 ? (
              <>
                <div className="flex-1 bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      budgetProgress > 100
                        ? 'bg-rose-500'
                        : budgetProgress > 80
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                  />
                </div>
                <span className="font-mono text-neutral-600 font-semibold">{budgetProgress}%</span>
              </>
            ) : (
              <span className="text-neutral-400">Vào mục Ngân sách để thiết lập</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Monthly Comparison Chart */}
      <MonthlyComparisonChart />

      {/* Two Columns: Category Breakdown & Daily Trend / Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown Donut */}
        <div className="lg:col-span-7">
          <CategoryBreakdownChart />
        </div>

        {/* Daily Cashflow & Recent Transactions */}
        <div className="lg:col-span-5 space-y-6">
          <DailyTrendChart />

          {/* Recent Transactions List */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-3">
              <h4 className="text-sm font-bold text-neutral-900">Giao Dịch Gần Đây</h4>
              <button
                onClick={onNavigateToTransactions}
                className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                Chưa có giao dịch trong tháng này
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {recentTransactions.map(tx => {
                  const cat = categories.find(c => c.id === tx.categoryId);
                  const isInc = tx.type === 'income';

                  return (
                    <div
                      key={tx.id}
                      onClick={() => onEditTransaction(tx)}
                      className="py-2.5 flex items-center justify-between hover:bg-neutral-50 px-2 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-7 h-7 rounded-md flex items-center justify-center text-white shrink-0"
                          style={{ backgroundColor: cat?.color || '#94A3B8' }}
                        >
                          <CategoryIcon
                            iconName={cat?.icon || 'MoreHorizontal'}
                            className="w-3.5 h-3.5"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-neutral-900 truncate">
                            {tx.note || cat?.name || 'Giao dịch'}
                          </p>
                          <p className="text-[11px] text-neutral-400">
                            {cat?.name} · {tx.date}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p
                          className={`text-xs font-bold font-mono ${
                            isInc ? 'text-emerald-600' : 'text-neutral-900'
                          }`}
                        >
                          {isInc ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </p>
                        <p className="text-[10px] text-neutral-400">{tx.account}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
