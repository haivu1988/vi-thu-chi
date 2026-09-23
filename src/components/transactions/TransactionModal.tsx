import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType } from '../../types/finance';
import { getTodayDateString, formatCurrency } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { X, Plus, Check, ArrowDownRight, ArrowUpRight, Calendar, CreditCard, FileText } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  editingTransaction,
}) => {
  const { categories, accounts, addTransaction, updateTransaction } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [account, setAccount] = useState<string>(accounts[0] || 'Tiền mặt');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Filter categories by selected type
  const availableCategories = categories.filter(c => c.type === type);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmountStr(editingTransaction.amount.toString());
      setCategoryId(editingTransaction.categoryId);
      setDate(editingTransaction.date);
      setAccount(editingTransaction.account || accounts[0]);
      setNote(editingTransaction.note || '');
    } else {
      // Default reset
      setAmountStr('');
      setDate(getTodayDateString());
      setNote('');
      setError('');
    }
  }, [editingTransaction, isOpen, accounts]);

  // Set default category when type changes
  useEffect(() => {
    if (!editingTransaction) {
      const firstCat = categories.find(c => c.type === type);
      if (firstCat) setCategoryId(firstCat.id);
    }
  }, [type, categories, editingTransaction]);

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setAmountStr(raw);
    setError('');
  };

  const addQuickAmount = (val: number) => {
    const current = parseInt(amountStr || '0', 10);
    setAmountStr((current + val).toString());
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(amountStr, 10);

    if (!amountNum || amountNum <= 0) {
      setError('Vui lòng nhập số tiền lớn hơn 0');
      return;
    }

    if (!categoryId) {
      setError('Vui lòng chọn danh mục thu chi');
      return;
    }

    if (!date) {
      setError('Vui lòng chọn ngày giao dịch');
      return;
    }

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, {
        type,
        amount: amountNum,
        categoryId,
        date,
        account,
        note: note.trim(),
      });
    } else {
      addTransaction({
        type,
        amount: amountNum,
        categoryId,
        date,
        account,
        note: note.trim(),
      });
    }

    onClose();
  };

  const numValue = parseInt(amountStr || '0', 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h3 className="text-base font-bold text-neutral-900">
            {editingTransaction ? 'Chỉnh Sửa Giao Dịch' : 'Thêm Giao Dịch Mới'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Transaction Type Segmented Toggle */}
          <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                const firstExp = categories.find(c => c.type === 'expense');
                if (firstExp) setCategoryId(firstExp.id);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
                type === 'expense'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Khoản Chi Tiêu</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                const firstInc = categories.find(c => c.type === 'income');
                if (firstInc) setCategoryId(firstInc.id);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
                type === 'income'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Khoản Thu Nhập</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Số tiền (VNĐ) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={amountStr ? new Intl.NumberFormat('vi-VN').format(Number(amountStr)) : ''}
                onChange={handleAmountChange}
                className="w-full text-2xl font-bold font-mono px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900 pr-12"
                autoFocus
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 font-semibold text-sm">
                ₫
              </span>
            </div>
            {numValue > 0 && (
              <p className="text-xs text-neutral-500 mt-1 font-mono">
                Số tiền: {formatCurrency(numValue)}
              </p>
            )}

            {/* Quick amount chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[50000, 100000, 200000, 500000, 1000000, 2000000, 5000000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => addQuickAmount(val)}
                  className="px-2.5 py-1 text-[11px] font-mono font-medium bg-neutral-100 text-neutral-700 rounded-md hover:bg-neutral-200 transition-colors"
                >
                  +{new Intl.NumberFormat('vi-VN').format(val / 1000)}k
                </button>
              ))}
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Danh mục <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1 border border-neutral-200 rounded-xl">
              {availableCategories.map(cat => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all ${
                      isSelected
                        ? 'bg-neutral-900 text-white shadow-xs font-semibold'
                        : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-white"
                      style={{ backgroundColor: isSelected ? '#FFFFFF20' : cat.color }}
                    >
                      <CategoryIcon iconName={cat.icon} className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Account row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                Ngày giao dịch <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-mono text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-neutral-500" />
                Tài khoản / Nguồn tiền
              </label>
              <select
                value={account}
                onChange={e => setAccount(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                {accounts.map(acc => (
                  <option key={acc} value={acc}>
                    {acc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-neutral-500" />
              Ghi chú / Diễn giải
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Cà phê sáng, Lương tháng 9, Siêu thị..."
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>{editingTransaction ? 'Cập Nhật' : 'Lưu Giao Dịch'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
