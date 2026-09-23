import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction } from '../../types/finance';
import { formatCurrency, formatDateVN } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { Search, Filter, Trash2, Edit3, ArrowDownRight, ArrowUpRight, Plus, Calendar } from 'lucide-react';

interface TransactionListProps {
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  onOpenAddModal,
  onEditTransaction,
}) => {
  const { transactions, categories, deleteTransaction, selectedMonth, setSelectedMonth, availableMonths } = useFinance();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>(selectedMonth);

  // Sync with global month if changed
  React.useEffect(() => {
    setMonthFilter(selectedMonth);
  }, [selectedMonth]);

  // Filter transactions
  const filtered = useMemo(() => {
    return transactions.filter(t => {
      // Month
      if (monthFilter !== 'all' && !t.date.startsWith(monthFilter)) return false;
      // Type
      if (filterType !== 'all' && t.type !== filterType) return false;
      // Category
      if (filterCategory !== 'all' && t.categoryId !== filterCategory) return false;
      // Search note or account
      if (search.trim()) {
        const q = search.toLowerCase();
        const noteMatch = (t.note || '').toLowerCase().includes(q);
        const accountMatch = (t.account || '').toLowerCase().includes(q);
        const cat = categories.find(c => c.id === t.categoryId);
        const catMatch = (cat?.name || '').toLowerCase().includes(q);
        if (!noteMatch && !accountMatch && !catMatch) return false;
      }
      return true;
    });
  }, [transactions, monthFilter, filterType, filterCategory, search, categories]);

  // Filter totals
  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    filtered.forEach(t => {
      if (t.type === 'income') income += t.amount;
      if (t.type === 'expense') expense += t.amount;
    });
    return { income, expense, net: income - expense };
  }, [filtered]);

  const handleDelete = (id: string, note: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa giao dịch "${note || 'này'}"?`)) {
      deleteTransaction(id);
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs space-y-5">
      {/* Top Bar with Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-neutral-900">Sổ Giao Dịch</h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Tìm kiếm, phân loại và quản lý lịch sử thu chi chi tiết
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Giao Dịch</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo ghi chú, tài khoản..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>

        {/* Month Selector */}
        <div className="relative">
          <select
            value={monthFilter}
            onChange={e => {
              setMonthFilter(e.target.value);
              if (e.target.value !== 'all') {
                setSelectedMonth(e.target.value);
              }
            }}
            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 font-medium"
          >
            <option value="all">Tất cả thời gian</option>
            {availableMonths.map(m => {
              const [y, mon] = m.split('-');
              return (
                <option key={m} value={m}>
                  Tháng {parseInt(mon, 10)}/{y}
                </option>
              );
            })}
          </select>
        </div>

        {/* Type Filter */}
        <div className="flex bg-neutral-100 p-1 rounded-lg">
          <button
            onClick={() => setFilterType('all')}
            className={`flex-1 py-1 text-xs font-semibold rounded-md transition-colors ${
              filterType === 'all'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`flex-1 py-1 text-xs font-semibold rounded-md transition-colors ${
              filterType === 'expense'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Chi tiêu
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`flex-1 py-1 text-xs font-semibold rounded-md transition-colors ${
              filterType === 'income'
                ? 'bg-white text-emerald-600 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Thu nhập
          </button>
        </div>

        {/* Category filter */}
        <div>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.type === 'income' ? '[Thu]' : '[Chi]'} {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filtered Summary Banner */}
      <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-neutral-500 font-medium">
          <span>Tìm thấy {filtered.length} giao dịch</span>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400">Thu:</span>
            <span className="font-mono font-bold text-emerald-600">
              {formatCurrency(totals.income)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400">Chi:</span>
            <span className="font-mono font-bold text-rose-600">
              {formatCurrency(totals.expense)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400">Dư:</span>
            <span
              className={`font-mono font-bold ${
                totals.net >= 0 ? 'text-indigo-600' : 'text-rose-600'
              }`}
            >
              {formatCurrency(totals.net, true)}
            </span>
          </div>
        </div>
      </div>

      {/* High Density Transaction Table */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-neutral-400 flex flex-col items-center">
          <Calendar className="w-10 h-10 mb-2 stroke-1 text-neutral-300" />
          <p className="text-sm font-medium text-neutral-600">Không tìm thấy giao dịch nào</p>
          <p className="text-xs text-neutral-400 mt-1">
            Thử thay đổi bộ lọc hoặc thêm một giao dịch mới
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-4 px-3 py-1.5 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            + Ghi nhận giao dịch
          </button>
        </div>
      ) : (
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 text-[11px] font-semibold text-neutral-500 border-b border-neutral-200">
                  <th className="py-2.5 px-4">Ngày</th>
                  <th className="py-2.5 px-4">Danh mục</th>
                  <th className="py-2.5 px-4">Ghi chú & Nguồn tiền</th>
                  <th className="py-2.5 px-4 text-right">Số tiền</th>
                  <th className="py-2.5 px-4 text-right w-20">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {filtered.map(tx => {
                  const cat = categories.find(c => c.id === tx.categoryId);
                  const isIncome = tx.type === 'income';

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-neutral-50/70 transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3 px-4 font-mono text-neutral-600 whitespace-nowrap">
                        {formatDateVN(tx.date)}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-white"
                            style={{ backgroundColor: cat?.color || '#94A3B8' }}
                          >
                            <CategoryIcon
                              iconName={cat?.icon || 'MoreHorizontal'}
                              className="w-3.5 h-3.5"
                            />
                          </div>
                          <span className="font-semibold text-neutral-900 truncate max-w-[150px]">
                            {cat?.name || 'Khác'}
                          </span>
                        </div>
                      </td>

                      {/* Note & Account */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-neutral-800 line-clamp-1">
                          {tx.note || '(Không có ghi chú)'}
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">
                          <span>{tx.account || 'Tiền mặt'}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                        <span className={isIncome ? 'text-emerald-600' : 'text-neutral-900'}>
                          {isIncome ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            title="Chỉnh sửa"
                            className="p-1 rounded-md text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id, tx.note)}
                            title="Xóa"
                            className="p-1 rounded-md text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
