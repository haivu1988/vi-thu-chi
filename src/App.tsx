/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FinanceProvider } from './context/FinanceContext';
import { Navbar, ActiveTab } from './components/layout/Navbar';
import { OverviewTab } from './components/dashboard/OverviewTab';
import { AnalyticsTab } from './components/analytics/AnalyticsTab';
import { TransactionList } from './components/transactions/TransactionList';
import { BudgetManager } from './components/budgets/BudgetManager';
import { DataSettings } from './components/settings/DataSettings';
import { TransactionModal } from './components/transactions/TransactionModal';
import { AuthModal } from './components/auth/AuthModal';
import { Transaction } from './types/finance';

function MainApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const handleOpenAdd = () => {
    setEditingTx(null);
    setIsModalOpen(true);
  };

  const handleEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/70 text-neutral-900">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={handleOpenAdd}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewTab
            onOpenAddModal={handleOpenAdd}
            onEditTransaction={handleEditTx}
            onNavigateToTransactions={() => setActiveTab('transactions')}
            onNavigateToAnalytics={() => setActiveTab('analytics')}
          />
        )}

        {activeTab === 'analytics' && <AnalyticsTab />}

        {activeTab === 'transactions' && (
          <TransactionList
            onOpenAddModal={handleOpenAdd}
            onEditTransaction={handleEditTx}
          />
        )}

        {activeTab === 'budgets' && <BudgetManager />}

        {activeTab === 'settings' && <DataSettings />}
      </main>

      {/* Clean, Quiet Footer */}
      <footer className="border-t border-neutral-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <div>
            <span>Sổ Thu Chi Cá Nhân</span>
            <span className="mx-2">·</span>
            <span>Quản lý tài chính & Thống kê biểu đồ hàng tháng</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>Dữ liệu lưu trữ cục bộ</span>
            <span>·</span>
            <span>Hỗ trợ xuất Excel CSV & JSON</span>
          </div>
        </div>
      </footer>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTx(null);
        }}
        editingTransaction={editingTx}
      />

      {/* Cloud Sync & Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <MainApp />
    </FinanceProvider>
  );
}
