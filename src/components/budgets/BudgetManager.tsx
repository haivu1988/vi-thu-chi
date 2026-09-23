import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatMonthLabel } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { Target, AlertTriangle, CheckCircle2, AlertCircle, Edit2, Plus, X } from 'lucide-react';

export const BudgetManager: React.FC = () => {
  const { categories, budgets, updateBudget, selectedMonth, transactions } = useFinance();
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editLimitStr, setEditLimitStr] = useState<string>('');

  const expenseCategories = categories.filter(c => c.type === 'expense');

  // Compute spent for each category in selectedMonth
  const categoryStats = expenseCategories.map(cat => {
    const spent = transactions
      .filter(t => t.categoryId === cat.id && t.date.startsWith(selectedMonth))
      .reduce((sum, t) => sum + t.amount, 0);

    const budget = budgets.find(b => b.categoryId === cat.id && b.month === selectedMonth);
    const limit = budget ? budget.limitAmount : 0;
    const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;
    const remaining = limit > 0 ? limit - spent : 0;

    let status: 'safe' | 'warning' | 'danger' | 'none' = 'none';
    if (limit > 0) {
      if (spent > limit) status = 'danger';
      else if (spent >= limit * 0.8) status = 'warning';
      else status = 'safe';
    }

    return {
      cat,
      spent,
      limit,
      percent,
      remaining,
      status,
    };
  });

  const totalBudget = categoryStats.reduce((s, c) => s + c.limit, 0);
  const totalSpentOnBudgeted = categoryStats.reduce((s, c) => s + (c.limit > 0 ? c.spent : 0), 0);
  const overallPercent = totalBudget > 0 ? Math.round((totalSpentOnBudgeted / totalBudget) * 100) : 0;

  const handleStartEdit = (catId: string, currentLimit: number) => {
    setEditingCatId(catId);
    setEditLimitStr(currentLimit > 0 ? currentLimit.toString() : '');
  };

  const handleSaveBudget = (catId: string) => {
    const num = parseInt(editLimitStr.replace(/\D/g, '') || '0', 10);
    updateBudget(catId, selectedMonth, num);
    setEditingCatId(null);
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-neutral-900">
              Quản Lý Hạn Mức Ngân Sách ({formatMonthLabel(selectedMonth)})
            </h3>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Thiết lập hạn mức chi tiêu cho từng danh mục để kiểm soát tài chính cá nhân
          </p>
        </div>

        {/* Global budget meter */}
        <div className="bg-neutral-50 border border-neutral-200 p-3 rounded-lg flex items-center gap-4 text-xs">
          <div>
            <div className="text-neutral-500 text-[11px]">Tổng ngân sách đã đặt</div>
            <div className="font-mono font-bold text-neutral-900 mt-0.5">
              {formatCurrency(totalBudget)}
            </div>
          </div>
          <div className="h-6 w-px bg-neutral-200" />
          <div>
            <div className="text-neutral-500 text-[11px]">Đã chi tiêu ({overallPercent}%)</div>
            <div
              className={`font-mono font-bold mt-0.5 ${
                overallPercent > 100 ? 'text-rose-600' : 'text-neutral-900'
              }`}
            >
              {formatCurrency(totalSpentOnBudgeted)}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of category budgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryStats.map(({ cat, spent, limit, percent, remaining, status }) => {
          const isEditing = editingCatId === cat.id;

          return (
            <div
              key={cat.id}
              className={`p-4 rounded-xl border transition-all ${
                status === 'danger'
                  ? 'border-rose-200 bg-rose-50/20'
                  : status === 'warning'
                  ? 'border-amber-200 bg-amber-50/20'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              {/* Category Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: cat.color }}
                  >
                    <CategoryIcon iconName={cat.icon} className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900">{cat.name}</h4>
                    <span className="text-[11px] text-neutral-400">
                      Đã chi: {formatCurrency(spent)}
                    </span>
                  </div>
                </div>

                {/* Edit Button */}
                {!isEditing && (
                  <button
                    onClick={() => handleStartEdit(cat.id, limit)}
                    className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                    title="Chỉnh sửa hạn mức"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Edit Mode Inline */}
              {isEditing ? (
                <div className="space-y-2 pt-2 border-t border-neutral-100">
                  <label className="text-[11px] font-medium text-neutral-600 block">
                    Nhập hạn mức tháng (₫):
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={editLimitStr ? new Intl.NumberFormat('vi-VN').format(Number(editLimitStr)) : ''}
                      onChange={e => setEditLimitStr(e.target.value.replace(/\D/g, ''))}
                      placeholder="0"
                      className="flex-1 px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-neutral-900"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveBudget(cat.id)}
                      className="px-2.5 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => setEditingCatId(null)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {limit > 0 ? (
                    <div className="space-y-2">
                      {/* Limit numbers */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-500 text-[11px]">Hạn mức:</span>
                        <span className="font-mono font-semibold text-neutral-800">
                          {formatCurrency(limit)}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            status === 'danger'
                              ? 'bg-rose-500'
                              : status === 'warning'
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>

                      {/* Status row */}
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span
                          className={`font-semibold ${
                            status === 'danger'
                              ? 'text-rose-600'
                              : status === 'warning'
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {status === 'danger' && `Vượt mức ${Math.abs(remaining).toLocaleString('vi-VN')} ₫ (${percent}%)`}
                          {status === 'warning' && `Gần chạm mức (${percent}%)`}
                          {status === 'safe' && `Còn lại ${remaining.toLocaleString('vi-VN')} ₫ (${percent}%)`}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 flex items-center justify-between">
                      <span className="text-xs text-neutral-400">Chưa đặt hạn mức</span>
                      <button
                        onClick={() => handleStartEdit(cat.id, 0)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thiết lập</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
