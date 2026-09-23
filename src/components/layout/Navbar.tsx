import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Plus, Wallet, Calendar, Cloud, RefreshCw } from 'lucide-react';

export type ActiveTab = 'overview' | 'analytics' | 'transactions' | 'budgets' | 'settings';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenAuthModal,
}) => {
  const { selectedMonth, setSelectedMonth, availableMonths, user, isSyncing } = useFinance();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Single text element Brand Zone */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <a
              href="#overview"
              onClick={e => {
                e.preventDefault();
                setActiveTab('overview');
              }}
              className="text-lg font-bold tracking-tight text-neutral-900"
            >
              Sổ Thu Chi
            </a>
          </div>

          {/* Zone 2: 4-5 Clean Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-neutral-100/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Biểu đồ Thu Chi
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'transactions'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Sổ giao dịch
            </button>
            <button
              onClick={() => setActiveTab('budgets')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'budgets'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Ngân sách
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Dữ liệu
            </button>
          </nav>

          {/* Zone 3: Actions & Realtime Sync */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Realtime Cloud Sync Button */}
            <button
              onClick={onOpenAuthModal}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                user
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-2xs'
              }`}
              title={user ? 'Đang đồng bộ đám mây Realtime' : 'Nhấn để bật đồng bộ Realtime đa thiết bị'}
            >
              {isSyncing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              ) : user ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              ) : (
                <Cloud className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              )}
              <span className="hidden sm:inline">
                {user ? (user.displayName || user.email?.split('@')[0] || 'Realtime') : 'Đồng bộ'}
              </span>
            </button>

            {/* Quick Month Selector */}
            <div className="hidden sm:flex items-center bg-neutral-100 rounded-lg px-2 py-1">
              <Calendar className="w-3.5 h-3.5 text-neutral-500 mr-1.5" />
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="bg-transparent text-xs font-medium text-neutral-800 focus:outline-none cursor-pointer"
              >
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

            {/* + Add Transaction Button */}
            <button
              onClick={onOpenAddModal}
              className="px-3.5 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Ghi Chép</span>
            </button>
          </div>
        </div>

        {/* Mobile Subnav */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-neutral-100 text-xs font-medium text-neutral-600">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-1 ${activeTab === 'overview' ? 'font-bold text-neutral-900' : ''}`}
          >
            Tổng quan
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-1 ${activeTab === 'analytics' ? 'font-bold text-neutral-900' : ''}`}
          >
            Biểu đồ
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-1 ${activeTab === 'transactions' ? 'font-bold text-neutral-900' : ''}`}
          >
            Giao dịch
          </button>
          <button
            onClick={() => setActiveTab('budgets')}
            className={`py-1 ${activeTab === 'budgets' ? 'font-bold text-neutral-900' : ''}`}
          >
            Ngân sách
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-1 ${activeTab === 'settings' ? 'font-bold text-neutral-900' : ''}`}
          >
            Dữ liệu
          </button>
        </div>
      </div>
    </header>
  );
};
