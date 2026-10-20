/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { ToastContainer } from './components/ToastContainer';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { FinancesView } from './components/finances/FinancesView';
import { ShoppingView } from './components/shopping/ShoppingView';
import { PantryView } from './components/pantry/PantryView';
import { BillsView } from './components/bills/BillsView';
import { TasksView } from './components/tasks/TasksView';
import { MealsView } from './components/meals/MealsView';
import { DebtsSavingsView } from './components/debts/DebtsSavingsView';
import { MaintenanceView } from './components/maintenance/MaintenanceView';
import { FamilyView } from './components/family/FamilyView';
import { ReportsView } from './components/reports/ReportsView';
import { DocsContactsView } from './components/docs/DocsContactsView';
import { FlutterArchitectureView } from './components/flutter/FlutterArchitectureView';
import { APKModal } from './components/pwa/APKModal';

import { TransactionType } from './types';
import { formatKz } from './utils/formatters';
import { X } from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showGlobalTxModal, setShowGlobalTxModal] = useState(false);
  const [showAPKModal, setShowAPKModal] = useState(false);

  const {
    wallets,
    categories,
    addTransaction,
    currentMember,
  } = useApp();

  // Global Quick Transaction Form State
  const [txType, setTxType] = useState<TransactionType>('expense');
  const [txAmount, setTxAmount] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txCategoryId, setTxCategoryId] = useState('');
  const [txWalletId, setTxWalletId] = useState(wallets[0]?.id || '');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);

  const handleGlobalTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(txAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    addTransaction({
      type: txType,
      amount: amountNum,
      description: txDescription || (txType === 'income' ? 'Receita doméstica' : 'Despesa doméstica'),
      categoryId: txCategoryId || (txType === 'income' ? categories.find(c => c.type === 'income')?.id || '' : categories.find(c => c.type === 'expense')?.id || ''),
      walletId: txWalletId,
      date: txDate,
      memberId: currentMember.id,
    });

    setTxAmount('');
    setTxDescription('');
    setShowGlobalTxModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Header */}
      <Header
        onOpenFlutterDocs={() => setActiveTab('flutter')}
        onNavigateTab={(tab) => setActiveTab(tab as TabType)}
        onOpenAPKModal={() => setShowAPKModal(true)}
      />

      {/* Navigation Bars (Desktop Subnav + Mobile Bottom Nav) */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5 pb-24 lg:pb-12">
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenNewTransaction={() => setShowGlobalTxModal(true)}
            onOpenAPKModal={() => setShowAPKModal(true)}
          />
        )}
        {activeTab === 'finances' && <FinancesView />}
        {activeTab === 'shopping' && <ShoppingView />}
        {activeTab === 'pantry' && <PantryView />}
        {activeTab === 'bills' && <BillsView />}
        {activeTab === 'tasks' && <TasksView />}
        {activeTab === 'meals' && <MealsView />}
        {activeTab === 'debts' && <DebtsSavingsView />}
        {activeTab === 'maintenance' && <MaintenanceView />}
        {activeTab === 'family' && <FamilyView />}
        {activeTab === 'reports' && <ReportsView />}
        {activeTab === 'docs' && <DocsContactsView />}
        {activeTab === 'flutter' && <FlutterArchitectureView />}
      </main>

      {/* Toast Feedback Notifications */}
      <ToastContainer />

      {/* APK Android Installation Modal */}
      <APKModal isOpen={showAPKModal} onClose={() => setShowAPKModal(false)} />

      {/* Global Quick Transaction Modal */}
      {showGlobalTxModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900">Registar Movimento Rápido</h3>
              <button
                onClick={() => setShowGlobalTxModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGlobalTxSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTxType('expense')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    txType === 'expense' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Despesa (-)
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('income')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    txType === 'income' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Receita (+)
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Valor em Kwanzas (Kz)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="ex: 15000"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-base font-bold focus:outline-emerald-600"
                  />
                  <span className="absolute right-3 top-3 text-xs font-bold text-slate-400 font-mono">Kz</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Compras na praça, pão da cantina..."
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Categoria</label>
                <select
                  value={txCategoryId}
                  onChange={(e) => setTxCategoryId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-emerald-600"
                >
                  <option value="">Selecione uma categoria...</option>
                  {categories
                    .filter((c) => c.type === txType)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Carteira</label>
                <select
                  value={txWalletId}
                  onChange={(e) => setTxWalletId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-emerald-600"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({formatKz(w.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGlobalTxModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-900 rounded-xl shadow-xs"
                >
                  Confirmar Movimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
