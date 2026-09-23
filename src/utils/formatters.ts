/**
 * Format currency to Vietnamese Dong (₫)
 */
export function formatCurrency(amount: number, showSign: boolean = false): string {
  const formatted = new Intl.NumberFormat('vi-VN').format(Math.abs(amount)) + ' ₫';
  if (showSign) {
    if (amount > 0) return `+${formatted}`;
    if (amount < 0) return `-${formatted}`;
  }
  return formatted;
}

/**
 * Format compact currency for charts (e.g. 1.5tr, 500k)
 */
export function formatCompactCurrency(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000_000) {
    return (amount / 1_000_000_000).toFixed(1).replace('.0', '') + ' tỷ';
  }
  if (abs >= 1_000_000) {
    return (amount / 1_000_000).toFixed(1).replace('.0', '') + ' tr';
  }
  if (abs >= 1_000) {
    return (amount / 1_000).toFixed(0) + ' k';
  }
  return amount.toString();
}

/**
 * Format date from YYYY-MM-DD to DD/MM/YYYY
 */
export function formatDateVN(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

/**
 * Get readable month name (e.g. "Tháng 09, 2026")
 */
export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  return `Tháng ${parseInt(month, 10)}/${year}`;
}

/**
 * Get short month label (e.g. "T9/26")
 */
export function formatShortMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  return `T${parseInt(month, 10)}/${year.slice(2)}`;
}

/**
 * Get today date in YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get current month key in YYYY-MM
 */
export function getCurrentMonthKey(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}
