export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  date: string; // YYYY-MM-DD
  account: string; // Tiền mặt, Ngân hàng, Ví MoMo, Thẻ tín dụng
  note: string;
  createdAt: number;
}

export interface Budget {
  categoryId: string;
  month: string; // YYYY-MM
  limitAmount: number;
}

export interface MonthlyData {
  monthKey: string; // YYYY-MM
  displayMonth: string; // T1/2026 or Thg 1
  fullLabel: string; // Tháng 1, 2026
  income: number;
  expense: number;
  net: number;
  savingsRate: number; // percentage (0 - 100)
}

export interface CategoryBreakdown {
  category: Category;
  total: number;
  percentage: number;
  count: number;
}
