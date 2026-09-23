import React, { useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatMonthLabel } from '../../utils/formatters';
import { MonthlyComparisonChart } from '../charts/MonthlyComparisonChart';
import { CategoryIcon } from '../common/CategoryIcon';
import {
  TrendingUp,
  TrendingDown,
  BarChart,
  Percent,
  Compass,
  CreditCard,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

export const AnalyticsTab: React.FC = () => {
  const { monthlyDataList, transactions, categories, selectedMonth, setSelectedMonth } = useFinance();

  // Top spending categories overall
  const topExpenseCategories = useMemo(() => {
    const expenseTxs = transactions.filter(t => t.type === 'expense');
    const totalExp = expenseTxs.reduce((s, t) => s + t.amount, 0);

    const map = new Map<string, number>();
    expenseTxs.forEach(t => {
      map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount);
    });

    const list: { categoryId: string; total: number; percentage: number }[] = [];
    map.forEach((total, categoryId) => {
      list.push({
        categoryId,
        total,
        percentage: totalExp > 0 ? Math.round((total / totalExp) * 100) : 0,
      });
    });

    return list.sort((a, b) => b.total - a.total).slice(0, 5);
  }, [transactions]);

  // Account spending distribution
  const accountBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    transactions.forEach(t => {
      const acc = t.account || 'Tiền mặt';
      map.set(acc, (map.get(acc) || 0) + (t.type === 'expense' ? t.amount : 0));
    });

    const total = Array.from(map.values()).reduce((s, v) => s + v, 0);
    return Array.from(map.entries()).map(([account, amount]) => ({
      account,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    })).sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  // 50/30/20 Rule Analysis for Selected Month
  const rule503020 = useMemo(() => {
    const currentMonthTxs = transactions.filter(t => t.date.startsWith(selectedMonth));
    const totalIncome = currentMonthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = currentMonthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const savings = Math.max(0, totalIncome - totalExpense);

    // Needs (Ăn uống, Nhà cửa, Điện nước, Xăng xe, Sức khỏe)
    const needsCatIds = ['cat-food', 'cat-housing', 'cat-transport', 'cat-health'];
    const needs = currentMonthTxs
      .filter(t => t.type === 'expense' && needsCatIds.includes(t.categoryId))
      .reduce((s, t) => s + t.amount, 0);

    // Wants (Mua sắm, Giải trí, Quà cáp, Khác)
    const wants = Math.max(0, totalExpense - needs);

    const needsPct = totalIncome > 0 ? Math.round((needs / totalIncome) * 100) : 0;
    const wantsPct = totalIncome > 0 ? Math.round((wants / totalIncome) * 100) : 0;
    const savingsPct = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;

    return {
      needs,
      wants,
      savings,
      needsPct,
      wantsPct,
      savingsPct,
      totalIncome,
    };
  }, [transactions, selectedMonth]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h3 className="text-xl font-bold text-neutral-900">
          Thống Kê Chi Tiết & Biểu Đồ Thu Chi Hàng Tháng
        </h3>
        <p className="text-xs text-neutral-500 mt-1">
          Báo cáo đa chiều về thu nhập, chi phí và cấu trúc dòng tiền qua các thời kỳ
        </p>
      </div>

      {/* Primary Chart */}
      <MonthlyComparisonChart />

      {/* Monthly Summary Table */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h4 className="text-sm font-bold text-neutral-900">
              Bảng Tổng Hợp Thu Chi Từng Tháng
            </h4>
            <p className="text-xs text-neutral-500 mt-0.5">
              So sánh chi tiết thu nhập, chi tiêu, mức thặng dư và tỷ lệ tiết kiệm
            </p>
          </div>
        </div>

        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 text-[11px] font-semibold text-neutral-500 border-b border-neutral-200">
                <th className="py-2.5 px-4">Tháng</th>
                <th className="py-2.5 px-4 text-right">Tổng Thu Nhập</th>
                <th className="py-2.5 px-4 text-right">Tổng Chi Tiêu</th>
                <th className="py-2.5 px-4 text-right">Thặng Dư / Thâm Hụt</th>
                <th className="py-2.5 px-4 text-right">Tỷ Lệ Tiết Kiệm</th>
                <th className="py-2.5 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {[...monthlyDataList].reverse().map(m => {
                const isSelected = selectedMonth === m.monthKey;
                return (
                  <tr
                    key={m.monthKey}
                    className={`transition-colors ${
                      isSelected ? 'bg-indigo-50/50 font-medium' : 'hover:bg-neutral-50'
                    }`}
                  >
                    <td className="py-3 px-4 font-semibold text-neutral-900">
                      {m.fullLabel}
                      {isSelected && (
                        <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-sm">
                          Đang chọn
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                      {formatCurrency(m.income)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                      {formatCurrency(m.expense)}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono font-bold ${
                        m.net >= 0 ? 'text-indigo-600' : 'text-rose-600'
                      }`}
                    >
                      {formatCurrency(m.net, true)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold">
                      <span className="text-neutral-700">{m.savingsRate}%</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedMonth(m.monthKey)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
                      >
                        Xem tháng này
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytical Breakdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 50/30/20 Budgeting Rule Analysis */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <Compass className="w-4 h-4 text-indigo-600" />
            <h4 className="text-sm font-bold text-neutral-900">
              Quy Tắc Quản Lý Tài Chính 50/30/20
            </h4>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Áp dụng cho {formatMonthLabel(selectedMonth)} (Thu: {formatCurrency(rule503020.totalIncome)})
          </p>

          <div className="space-y-3 pt-1">
            {/* Needs 50% */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-700 font-medium">Thiết yếu (Tiêu chuẩn 50%)</span>
                <span className="font-mono font-bold">{rule503020.needsPct}% ({formatCurrency(rule503020.needs)})</span>
              </div>
              <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    rule503020.needsPct <= 50 ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(rule503020.needsPct, 100)}%` }}
                />
              </div>
            </div>

            {/* Wants 30% */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-700 font-medium">Mong muốn (Tiêu chuẩn 30%)</span>
                <span className="font-mono font-bold">{rule503020.wantsPct}% ({formatCurrency(rule503020.wants)})</span>
              </div>
              <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    rule503020.wantsPct <= 30 ? 'bg-indigo-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(rule503020.wantsPct, 100)}%` }}
                />
              </div>
            </div>

            {/* Savings 20% */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-700 font-medium">Tiết kiệm (Tiêu chuẩn 20%)</span>
                <span className="font-mono font-bold text-emerald-600">
                  {rule503020.savingsPct}% ({formatCurrency(rule503020.savings)})
                </span>
              </div>
              <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${Math.min(rule503020.savingsPct, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-neutral-50 rounded-lg text-[11px] text-neutral-600 leading-relaxed">
            {rule503020.totalIncome === 0 ? (
              <span className="text-neutral-500">
                Chưa có dữ liệu thu nhập trong {formatMonthLabel(selectedMonth)} để phân tích tỷ lệ 50/30/20.
              </span>
            ) : rule503020.savingsPct >= 20 ? (
              <span className="text-emerald-700 font-medium">
                ✓ Chúc mừng! Tỷ lệ tiết kiệm tháng này đạt {rule503020.savingsPct}%, vượt tiêu chuẩn khuyến nghị.
              </span>
            ) : (
              <span className="text-amber-700 font-medium">
                ! Tỷ lệ tích lũy tháng này đang ở mức {rule503020.savingsPct}%. Hãy xem xét cắt giảm bớt các khoản chi mong muốn.
              </span>
            )}
          </div>
        </div>

        {/* Top 5 Spending Categories */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <TrendingDown className="w-4 h-4 text-rose-600" />
            <h4 className="text-sm font-bold text-neutral-900">
              Top 5 Khoản Chi Tiêu Lớn Nhất
            </h4>
          </div>
          <p className="text-xs text-neutral-500">
            Tổng hợp trên toàn bộ thời gian ghi nhận
          </p>

          {topExpenseCategories.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400">
              Chưa có khoản chi tiêu nào được ghi nhận
            </div>
          ) : (
            <div className="space-y-3">
              {topExpenseCategories.map(({ categoryId, total, percentage }) => {
                const cat = categories.find(c => c.id === categoryId);
                return (
                  <div key={categoryId} className="space-y-1.5 p-2 rounded-lg hover:bg-neutral-50 transition-colors">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center text-white shrink-0"
                          style={{ backgroundColor: cat?.color || '#94A3B8' }}
                        >
                          <CategoryIcon
                            iconName={cat?.icon || 'MoreHorizontal'}
                            className="w-3.5 h-3.5"
                          />
                        </div>
                        <span className="font-semibold text-neutral-800 truncate">
                          {cat?.name || 'Khác'}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-neutral-900">
                          {formatCurrency(total)}
                        </span>
                        <span className="font-mono text-neutral-400 text-[11px] ml-1.5 font-medium">
                          ({percentage}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: cat?.color || '#94A3B8',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment Account Distribution */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <CreditCard className="w-4 h-4 text-neutral-700" />
            <h4 className="text-sm font-bold text-neutral-900">
              Chi Tiêu Theo Phương Thức
            </h4>
          </div>
          <p className="text-xs text-neutral-500">
            Phân bố dòng tiền chi tiêu qua các tài khoản & ví điện tử
          </p>

          {accountBreakdown.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400">
              Chưa có chi tiêu qua tài khoản hoặc ví
            </div>
          ) : (
            <div className="space-y-3">
              {accountBreakdown.map(({ account, amount, percentage }) => (
                <div key={account} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-neutral-800 truncate max-w-[150px]">
                      {account}
                    </span>
                    <span className="font-mono font-bold text-neutral-900">
                      {formatCurrency(amount)} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-neutral-800"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
