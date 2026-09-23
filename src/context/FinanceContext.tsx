import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Category, Transaction, Budget, MonthlyData, CategoryBreakdown } from '../types/finance';
import {
  DEFAULT_CATEGORIES,
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  DEFAULT_ACCOUNTS,
  SAMPLE_TRANSACTIONS,
  SAMPLE_BUDGETS,
} from '../data/initialData';
import { getCurrentMonthKey, formatMonthLabel, formatShortMonthLabel } from '../utils/formatters';
import {
  auth,
  db,
  onAuthStateChanged,
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  type User,
} from '../lib/firebase';

interface FinanceContextType {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  accounts: string[];
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  availableMonths: string[];
  
  // Realtime Cloud Sync
  user: User | null;
  isAuthLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, tx: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateBudget: (categoryId: string, month: string, limitAmount: number) => Promise<void>;
  resetToDefaultData: () => Promise<void>;
  loadSampleData: () => Promise<void>;
  clearAllData: () => Promise<void>;
  exportDataJSON: () => void;
  exportDataCSV: () => void;
  importDataJSON: (jsonString: string) => boolean;

  // Computed data
  monthlyDataList: MonthlyData[]; // all months
  selectedMonthSummary: {
    income: number;
    expense: number;
    net: number;
    savingsRate: number;
    prevIncome: number;
    prevExpense: number;
    incomeChangePercent: number;
    expenseChangePercent: number;
  };
  categoryBreakdownExpense: CategoryBreakdown[];
  categoryBreakdownIncome: CategoryBreakdown[];
  getCategoryById: (id: string) => Category | undefined;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TRANSACTIONS: 'so_thu_chi_transactions_v2',
  CATEGORIES: 'so_thu_chi_categories_v2',
  BUDGETS: 'so_thu_chi_budgets_v2',
  ACCOUNTS: 'so_thu_chi_accounts_v2',
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication & Sync state
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // Core data states
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      localStorage.removeItem('so_thu_chi_transactions_v1');
      localStorage.removeItem('so_thu_chi_budgets_v1');

      const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load transactions from localStorage', e);
    }
    return INITIAL_TRANSACTIONS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load categories from localStorage', e);
    }
    return DEFAULT_CATEGORIES;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load budgets from localStorage', e);
    }
    return INITIAL_BUDGETS;
  });

  const [accounts] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load accounts from localStorage', e);
    }
    return DEFAULT_ACCOUNTS;
  });

  const [selectedMonth, setSelectedMonth] = useState<string>(() => getCurrentMonthKey());

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Save to localStorage as offline cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions to localStorage', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories', e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    } catch (e) {
      console.error('Failed to save budgets', e);
    }
  }, [budgets]);

  // Firestore Realtime Synchronization when user is logged in
  useEffect(() => {
    if (!user) {
      setIsSyncing(false);
      return;
    }

    setIsSyncing(true);

    // 1. Transactions onSnapshot listener
    const txColRef = collection(db, 'users', user.uid, 'transactions');
    const unsubTx = onSnapshot(
      txColRef,
      snapshot => {
        const remoteTxs: Transaction[] = [];
        snapshot.forEach(docSnap => {
          const d = docSnap.data();
          remoteTxs.push({
            id: d.id || docSnap.id,
            type: d.type,
            amount: Number(d.amount) || 0,
            categoryId: d.categoryId,
            date: d.date,
            account: d.account || 'Tiền mặt',
            note: d.note || '',
            createdAt: d.createdAt || Date.now(),
          });
        });

        // Sort descending by date, then createdAt
        remoteTxs.sort((a, b) => {
          const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
          if (dateDiff !== 0) return dateDiff;
          return (b.createdAt || 0) - (a.createdAt || 0);
        });

        setTransactions(remoteTxs);
        setLastSyncedAt(new Date());
        setIsSyncing(false);
      },
      error => {
        console.error('Firestore transactions onSnapshot error:', error);
        setIsSyncing(false);
      }
    );

    // 2. Budgets onSnapshot listener
    const budgetColRef = collection(db, 'users', user.uid, 'budgets');
    const unsubBudgets = onSnapshot(
      budgetColRef,
      snapshot => {
        const remoteBudgets: Budget[] = [];
        snapshot.forEach(docSnap => {
          const d = docSnap.data();
          remoteBudgets.push({
            categoryId: d.categoryId,
            month: d.month,
            limitAmount: Number(d.limitAmount) || 0,
          });
        });
        setBudgets(remoteBudgets);
      },
      error => {
        console.error('Firestore budgets onSnapshot error:', error);
      }
    );

    return () => {
      unsubTx();
      unsubBudgets();
    };
  }, [user]);

  // Available months list derived from transactions + current month
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    monthSet.add(getCurrentMonthKey());
    transactions.forEach(t => {
      if (t.date && t.date.length >= 7) {
        monthSet.add(t.date.slice(0, 7));
      }
    });
    return Array.from(monthSet).sort().reverse();
  }, [transactions]);

  // Grouped monthly summary dataset for comparison charts
  const monthlyDataList = useMemo<MonthlyData[]>(() => {
    const monthSet = new Set<string>();
    transactions.forEach(t => {
      if (t.date && t.date.length >= 7) {
        monthSet.add(t.date.slice(0, 7));
      }
    });
    monthSet.add(getCurrentMonthKey());
    const sortedMonths = Array.from(monthSet).sort();

    return sortedMonths.map(monthKey => {
      const monthTxs = transactions.filter(t => t.date.startsWith(monthKey));
      const income = monthTxs
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = monthTxs
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      const net = income - expense;
      const savingsRate = income > 0 ? Math.max(0, Math.round((net / income) * 100)) : 0;

      return {
        monthKey,
        displayMonth: formatShortMonthLabel(monthKey),
        fullLabel: formatMonthLabel(monthKey),
        income,
        expense,
        net,
        savingsRate,
      };
    });
  }, [transactions]);

  // Current selected month summary metrics
  const selectedMonthSummary = useMemo(() => {
    const current = monthlyDataList.find(m => m.monthKey === selectedMonth) || {
      monthKey: selectedMonth,
      displayMonth: formatShortMonthLabel(selectedMonth),
      fullLabel: formatMonthLabel(selectedMonth),
      income: 0,
      expense: 0,
      net: 0,
      savingsRate: 0,
    };

    // Calculate previous month index
    const [year, month] = selectedMonth.split('-').map(Number);
    let prevYear = year;
    let prevMonth = month - 1;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }
    const prevMonthKey = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
    const previous = monthlyDataList.find(m => m.monthKey === prevMonthKey);

    const prevIncome = previous ? previous.income : 0;
    const prevExpense = previous ? previous.expense : 0;

    const incomeChangePercent =
      prevIncome > 0 ? Math.round(((current.income - prevIncome) / prevIncome) * 100) : 0;
    const expenseChangePercent =
      prevExpense > 0 ? Math.round(((current.expense - prevExpense) / prevExpense) * 100) : 0;

    return {
      income: current.income,
      expense: current.expense,
      net: current.net,
      savingsRate: current.savingsRate,
      prevIncome,
      prevExpense,
      incomeChangePercent,
      expenseChangePercent,
    };
  }, [monthlyDataList, selectedMonth]);

  // Category breakdown for selected month (Expense)
  const categoryBreakdownExpense = useMemo<CategoryBreakdown[]>(() => {
    const currentMonthTxs = transactions.filter(
      t => t.date.startsWith(selectedMonth) && t.type === 'expense'
    );
    const totalExpense = currentMonthTxs.reduce((sum, t) => sum + t.amount, 0);

    const map = new Map<string, { total: number; count: number }>();
    currentMonthTxs.forEach(t => {
      const existing = map.get(t.categoryId) || { total: 0, count: 0 };
      map.set(t.categoryId, {
        total: existing.total + t.amount,
        count: existing.count + 1,
      });
    });

    const result: CategoryBreakdown[] = [];
    map.forEach((value, catId) => {
      const cat = categories.find(c => c.id === catId) || {
        id: catId,
        name: 'Khác',
        type: 'expense',
        icon: 'MoreHorizontal',
        color: '#94A3B8',
      };
      result.push({
        category: cat,
        total: value.total,
        percentage: totalExpense > 0 ? Math.round((value.total / totalExpense) * 100) : 0,
        count: value.count,
      });
    });

    return result.sort((a, b) => b.total - a.total);
  }, [transactions, selectedMonth, categories]);

  // Category breakdown for selected month (Income)
  const categoryBreakdownIncome = useMemo<CategoryBreakdown[]>(() => {
    const currentMonthTxs = transactions.filter(
      t => t.date.startsWith(selectedMonth) && t.type === 'income'
    );
    const totalIncome = currentMonthTxs.reduce((sum, t) => sum + t.amount, 0);

    const map = new Map<string, { total: number; count: number }>();
    currentMonthTxs.forEach(t => {
      const existing = map.get(t.categoryId) || { total: 0, count: 0 };
      map.set(t.categoryId, {
        total: existing.total + t.amount,
        count: existing.count + 1,
      });
    });

    const result: CategoryBreakdown[] = [];
    map.forEach((value, catId) => {
      const cat = categories.find(c => c.id === catId) || {
        id: catId,
        name: 'Khác',
        type: 'income',
        icon: 'Coins',
        color: '#94A3B8',
      };
      result.push({
        category: cat,
        total: value.total,
        percentage: totalIncome > 0 ? Math.round((value.total / totalIncome) * 100) : 0,
        count: value.count,
      });
    });

    return result.sort((a, b) => b.total - a.total);
  }, [transactions, selectedMonth, categories]);

  const getCategoryById = (id: string) => {
    return categories.find(c => c.id === id);
  };

  // CRUD Actions with Realtime Cloud Sync
  const addTransaction = async (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
    };

    // Optimistic update
    setTransactions(prev => [newTx, ...prev]);

    if (user) {
      try {
        setIsSyncing(true);
        await setDoc(doc(db, 'users', user.uid, 'transactions', newTx.id), {
          ...newTx,
          userId: user.uid,
          updatedAt: Date.now(),
        });
        setLastSyncedAt(new Date());
      } catch (e) {
        console.error('Failed to sync new transaction to Firestore', e);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const updateTransaction = async (id: string, updated: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => (t.id === id ? { ...t, ...updated } : t)));

    if (user) {
      try {
        setIsSyncing(true);
        await setDoc(
          doc(db, 'users', user.uid, 'transactions', id),
          { ...updated, updatedAt: Date.now() },
          { merge: true }
        );
        setLastSyncedAt(new Date());
      } catch (e) {
        console.error('Failed to sync updated transaction to Firestore', e);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const deleteTransaction = async (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));

    if (user) {
      try {
        setIsSyncing(true);
        await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
        setLastSyncedAt(new Date());
      } catch (e) {
        console.error('Failed to sync deleted transaction to Firestore', e);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const updateBudget = async (categoryId: string, month: string, limitAmount: number) => {
    setBudgets(prev => {
      const filtered = prev.filter(b => !(b.categoryId === categoryId && b.month === month));
      if (limitAmount > 0) {
        return [...filtered, { categoryId, month, limitAmount }];
      }
      return filtered;
    });

    if (user) {
      try {
        const docId = `${month}_${categoryId}`;
        if (limitAmount > 0) {
          await setDoc(doc(db, 'users', user.uid, 'budgets', docId), {
            categoryId,
            month,
            limitAmount,
            userId: user.uid,
            updatedAt: Date.now(),
          });
        } else {
          await deleteDoc(doc(db, 'users', user.uid, 'budgets', docId));
        }
        setLastSyncedAt(new Date());
      } catch (e) {
        console.error('Failed to sync budget to Firestore', e);
      }
    }
  };

  const resetToDefaultData = async () => {
    setTransactions([]);
    setCategories(DEFAULT_CATEGORIES);
    setBudgets([]);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify([]));
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);

    if (user) {
      try {
        setIsSyncing(true);
        const txSnap = await getDocs(collection(db, 'users', user.uid, 'transactions'));
        const batch = writeBatch(db);
        txSnap.forEach(d => batch.delete(d.ref));

        const budgetSnap = await getDocs(collection(db, 'users', user.uid, 'budgets'));
        budgetSnap.forEach(d => batch.delete(d.ref));

        await batch.commit();
        setLastSyncedAt(new Date());
      } catch (e) {
        console.error('Failed to reset Firestore data', e);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const loadSampleData = async () => {
    setTransactions(SAMPLE_TRANSACTIONS);
    setCategories(DEFAULT_CATEGORIES);
    setBudgets(SAMPLE_BUDGETS);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(SAMPLE_TRANSACTIONS));
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(SAMPLE_BUDGETS));

    if (user) {
      try {
        setIsSyncing(true);
        const batch = writeBatch(db);
        SAMPLE_TRANSACTIONS.forEach(tx => {
          const docRef = doc(db, 'users', user.uid, 'transactions', tx.id);
          batch.set(docRef, { ...tx, userId: user.uid, updatedAt: Date.now() });
        });
        SAMPLE_BUDGETS.forEach(b => {
          const docId = `${b.month}_${b.categoryId}`;
          const docRef = doc(db, 'users', user.uid, 'budgets', docId);
          batch.set(docRef, { ...b, userId: user.uid, updatedAt: Date.now() });
        });
        await batch.commit();
        setLastSyncedAt(new Date());
      } catch (e) {
        console.error('Failed to upload sample data to Firestore', e);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const clearAllData = async () => {
    setTransactions([]);
    setBudgets([]);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify([]));

    if (user) {
      try {
        setIsSyncing(true);
        const txSnap = await getDocs(collection(db, 'users', user.uid, 'transactions'));
        const batch = writeBatch(db);
        txSnap.forEach(d => batch.delete(d.ref));

        const budgetSnap = await getDocs(collection(db, 'users', user.uid, 'budgets'));
        budgetSnap.forEach(d => batch.delete(d.ref));

        await batch.commit();
        setLastSyncedAt(new Date());
      } catch (e) {
        console.error('Failed to clear Firestore data', e);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const exportDataJSON = () => {
    const data = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      transactions,
      categories,
      budgets,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `so-thu-chi-backup-${getTodayDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportDataCSV = () => {
    const headers = ['Mã GD', 'Ngày', 'Loại', 'Số tiền (VND)', 'Danh mục', 'Tài khoản', 'Ghi chú'];
    const rows = transactions.map(t => {
      const cat = categories.find(c => c.id === t.categoryId);
      return [
        t.id,
        t.date,
        t.type === 'income' ? 'Thu nhập' : 'Chi tiêu',
        t.amount.toString(),
        `"${cat?.name || 'Khác'}"`,
        `"${t.account || ''}"`,
        `"${(t.note || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `so-thu-chi-giao-dich-${getTodayDateString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
      }
      if (Array.isArray(data.budgets)) {
        setBudgets(data.budgets);
      }
      if (Array.isArray(data.categories)) {
        setCategories(data.categories);
      }

      // If user is logged in, sync imported data to Firestore
      if (user && Array.isArray(data.transactions)) {
        const batch = writeBatch(db);
        data.transactions.forEach((tx: Transaction) => {
          const docRef = doc(db, 'users', user.uid, 'transactions', tx.id);
          batch.set(docRef, { ...tx, userId: user.uid, updatedAt: Date.now() }, { merge: true });
        });
        batch.commit().catch(e => console.error('Failed to sync imported data to Firestore', e));
      }

      return true;
    } catch (e) {
      console.error('Failed to import JSON', e);
      return false;
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        categories,
        budgets,
        accounts,
        selectedMonth,
        setSelectedMonth,
        availableMonths,
        user,
        isAuthLoading,
        isSyncing,
        lastSyncedAt,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        updateBudget,
        resetToDefaultData,
        loadSampleData,
        clearAllData,
        exportDataJSON,
        exportDataCSV,
        importDataJSON,
        monthlyDataList,
        selectedMonthSummary,
        categoryBreakdownExpense,
        categoryBreakdownIncome,
        getCategoryById,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
