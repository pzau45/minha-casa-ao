import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatKz, formatDate, getDaysRemaining } from '../../utils/formatters';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  PlusCircle,
  ShoppingBag,
  Home,
  CheckCircle2,
  Package,
  Calendar,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Zap,
  Smartphone
} from 'lucide-react';
import { TabType } from '../Navigation';

interface DashboardViewProps {
  onNavigateTab: (tab: TabType) => void;
  onOpenNewTransaction: () => void;
  onOpenAPKModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab, onOpenNewTransaction, onOpenAPKModal }) => {
  const {
    wallets,
    transactions,
    categories,
    bills,
    shoppingLists,
    pantryItems,
    tasks,
    currentMember,
    toggleTaskStatus,
    toggleItemPurchased,
    payBill,
    canAccessFinances,
  } = useApp();

  const [payingBillId, setPayingBillId] = useState<string | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string>(wallets[0]?.id || '');

  // Calculate totals
  const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);

  // Current month transactions (October 2026 or current)
  const currentDate = new Date();
  const currentMonthPrefix = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthTransactions = transactions.filter((t) => t.date.startsWith(currentMonthPrefix));

  const totalIncome = currentMonthTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = currentMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalMonthlyBudget = categories
    .filter((c) => c.type === 'expense')
    .reduce((acc, c) => acc + (c.budgetLimit || 0), 0);

  const remainingBudget = Math.max(0, totalMonthlyBudget - totalExpense);
  const budgetUsagePercent = totalMonthlyBudget > 0 ? Math.min(100, (totalExpense / totalMonthlyBudget) * 100) : 0;

  // Upcoming bills (unpaid)
  const pendingBills = bills
    .filter((b) => b.status !== 'pago')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  // Pending shopping items from the first list
  const activeShoppingList = shoppingLists[0];
  const pendingShoppingItems = activeShoppingList?.items.filter((i) => !i.isPurchased).slice(0, 4) || [];

  // Low stock pantry items
  const lowStockPantry = pantryItems.filter((p) => p.currentQty <= p.minQty);

  // Pending tasks
  const pendingTasks = tasks.filter((t) => t.status !== 'concluido').slice(0, 4);

  const handleQuickPay = (billId: string) => {
    const bill = bills.find((b) => b.id === billId);
    if (!bill) return;
    payBill(billId, selectedWalletId || wallets[0].id, bill.estimatedAmount);
    setPayingBillId(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-5 sm:p-7 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{currentMember.avatar}</span>
              <span className="text-xs font-semibold text-emerald-200">
                Olá, {currentMember.name} • {currentMember.role === 'admin' ? 'Chefe de Família' : currentMember.relationship}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Gestão Doméstica em Kwanzas
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl leading-relaxed">
              Controle o dinheiro da casa, as compras na praça, a luz pré-paga ENDE e o stock da despensa com segurança total no telemóvel.
            </p>
          </div>

          {/* Quick Transaction Action */}
          {canAccessFinances() && (
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={onOpenNewTransaction}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95"
              >
                <PlusCircle className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                <span>Registar Movimento</span>
              </button>
              <button
                onClick={() => onNavigateTab('shopping')}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm transition-all border border-white/20"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Lista de Compras</span>
              </button>
              <button
                onClick={onOpenAPKModal}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95"
              >
                <Smartphone className="w-4 h-4 text-slate-950" />
                <span>Instalar APK Android</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* APK & Mobile Installation Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-emerald-300/60 p-4 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-800 text-white rounded-2xl shadow-xs">
            <Smartphone className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-black text-slate-900">
                Instale a aplicação Minha Casa AO no seu Android
              </h4>
              <span className="text-[10px] bg-emerald-800 text-white font-bold px-2 py-0.5 rounded-full">
                APK / WebAPK
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Utilize offline sem gastar saldo de dados e com ícone oficial no ecrã inicial do telemóvel.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAPKModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 self-stretch sm:self-auto justify-center"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-300" />
          <span>Obter APK / Instalar</span>
        </button>
      </div>

      {/* Financial Summary Cards */}
      {canAccessFinances() ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Saldo Consolidado */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Saldo Doméstico
              </span>
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2 font-mono tracking-tight">
              {formatKz(totalBalance)}
            </p>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>{wallets.length} carteiras registadas</span>
            </div>
          </div>

          {/* Card 2: Receitas do Mês */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Receitas do Mês
              </span>
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-700 mt-2 font-mono tracking-tight">
              +{formatKz(totalIncome)}
            </p>
            <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
              Salários, biscates e negócios
            </p>
          </div>

          {/* Card 3: Despesas do Mês */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Despesas do Mês
              </span>
              <div className="p-2 bg-rose-100 text-rose-800 rounded-xl">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-rose-600 mt-2 font-mono tracking-tight">
              -{formatKz(totalExpense)}
            </p>
            <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
              Alimentação, contas e casa
            </p>
          </div>

          {/* Card 4: Orçamento Disponível */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Orçamento Disponível
              </span>
              <span className="text-xs font-bold text-slate-700 font-mono">
                {budgetUsagePercent.toFixed(0)}% gasto
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2 font-mono tracking-tight">
              {formatKz(remainingBudget)}
            </p>
            {/* Progress Bar */}
            <div className="mt-2.5 pt-2 border-t border-slate-100">
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all ${
                    budgetUsagePercent > 90
                      ? 'bg-rose-500'
                      : budgetUsagePercent > 75
                      ? 'bg-amber-500'
                      : 'bg-emerald-600'
                  }`}
                  style={{ width: `${budgetUsagePercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            Perfil com permissões limitadas. Os detalhes financeiros confidenciais estão reservados aos administradores e adultos da casa.
          </span>
        </div>
      )}

      {/* Urgent Warning Alerts (ENDE Luz / Stock Baixo / Contas) */}
      {(pendingBills.length > 0 || lowStockPantry.length > 0) && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl mt-0.5">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                Pontos de Atenção na Casa
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                {pendingBills.length > 0 && `${pendingBills.length} conta(s) a vencer`}
                {pendingBills.length > 0 && lowStockPantry.length > 0 && ' • '}
                {lowStockPantry.length > 0 && `${lowStockPantry.length} produto(s) com stock baixo na despensa`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {pendingBills.length > 0 && (
              <button
                onClick={() => onNavigateTab('bills')}
                className="text-xs font-bold px-3 py-1.5 bg-amber-200 text-amber-900 rounded-lg hover:bg-amber-300"
              >
                Ver Contas
              </button>
            )}
            {lowStockPantry.length > 0 && (
              <button
                onClick={() => onNavigateTab('pantry')}
                className="text-xs font-bold px-3 py-1.5 bg-amber-900 text-white rounded-lg hover:bg-amber-950"
              >
                Ver Despensa
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Interactive Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Contas a Vencer & Pagamento Rápido */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                <Home className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Contas Próximas de Vencimento</h3>
            </div>
            <button
              onClick={() => onNavigateTab('bills')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              Ver todas <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {pendingBills.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                🎉 Todas as contas estão em dia! Nenhuma pendência.
              </div>
            ) : (
              pendingBills.slice(0, 3).map((bill) => {
                const remaining = getDaysRemaining(bill.dueDate);
                return (
                  <div key={bill.id} className="py-3.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">{bill.title}</span>
                        {bill.meterNumber && (
                          <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            Nº {bill.meterNumber}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold text-slate-700 font-mono">
                          {formatKz(bill.estimatedAmount)}
                        </span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span
                          className={`text-[11px] font-medium ${
                            remaining.isOverdue
                              ? 'text-rose-600 font-bold'
                              : remaining.days <= 3
                              ? 'text-amber-600 font-bold'
                              : 'text-slate-500'
                          }`}
                        >
                          {remaining.label}
                        </span>
                      </div>
                    </div>

                    {canAccessFinances() && (
                      <button
                        onClick={() => setPayingBillId(bill.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shrink-0 transition-colors"
                      >
                        Pagar
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2: Tarefas Domésticas Urgentes */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Tarefas Domésticas Prioritárias</h3>
            </div>
            <button
              onClick={() => onNavigateTab('tasks')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              Ver todas <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {pendingTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                ✨ Casa em ordem! Nenhuma tarefa por fazer.
              </div>
            ) : (
              pendingTasks.map((t) => (
                <div key={t.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => toggleTaskStatus(t.id)}
                      className="w-5 h-5 rounded-md border border-slate-300 hover:border-emerald-600 flex items-center justify-center shrink-0 transition-colors"
                    >
                      {t.status === 'concluido' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </button>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{t.title}</p>
                      <p className="text-[10px] text-slate-500 capitalize">
                        Zona: {t.room} • Prazo: {formatDate(t.dueDate)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      t.priority === 'alta'
                        ? 'bg-rose-100 text-rose-700'
                        : t.priority === 'media'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {t.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Compras Pendentes e Stock da Despensa */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compras na Praça / Cantina */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Compras Pendentes</h3>
                <p className="text-[11px] text-slate-500">{activeShoppingList?.name || 'Lista de Compras'}</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('shopping')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              Abrir Lista <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {pendingShoppingItems.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Lista de compras em dia!
              </div>
            ) : (
              pendingShoppingItems.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => toggleItemPurchased(activeShoppingList.id, item.id)}
                      className="w-5 h-5 rounded-md border border-slate-300 hover:border-emerald-600 flex items-center justify-center shrink-0 transition-colors"
                    >
                      {item.isPurchased && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </button>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {item.quantity} {item.unit} • {item.storeType === 'praca' ? 'Praça' : item.storeType === 'cantina' ? 'Cantina' : 'Supermercado'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700 shrink-0">
                    {formatKz(item.estimatedPrice)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Resumo de Stock da Despensa */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Stock da Despensa & Alimentos</h3>
                <p className="text-[11px] text-slate-500">Controlo de fuba, arroz, óleo e peixe</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('pantry')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              Ver Despensa <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            {pantryItems.slice(0, 4).map((p) => {
              const isLow = p.currentQty <= p.minQty;
              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-2xl border text-left ${
                    isLow ? 'border-amber-300 bg-amber-50/50' : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 truncate">{p.name}</span>
                    {isLow && (
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                        Baixo
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-black text-slate-900 mt-1 font-mono">
                    {p.currentQty} <span className="text-xs font-normal text-slate-500">{p.unit}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Mínimo: {p.minQty} {p.unit}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Pay Modal */}
      {payingBillId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
            {(() => {
              const bill = bills.find((b) => b.id === payingBillId);
              if (!bill) return null;
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-base text-slate-900">Liquidar Conta Doméstica</h3>
                    <button
                      onClick={() => setPayingBillId(null)}
                      className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <p className="text-xs text-emerald-800 font-semibold">{bill.title}</p>
                    <p className="text-2xl font-black text-emerald-950 font-mono mt-1">
                      {formatKz(bill.estimatedAmount)}
                    </p>
                    {bill.meterNumber && (
                      <p className="text-[11px] text-emerald-700 mt-1">
                        Referência / Contador: <strong>{bill.meterNumber}</strong>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Debitar de qual carteira?
                    </label>
                    <select
                      value={selectedWalletId}
                      onChange={(e) => setSelectedWalletId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-emerald-600"
                    >
                      {wallets.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} (Saldo: {formatKz(w.balance)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => setPayingBillId(null)}
                      className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleQuickPay(bill.id)}
                      className="flex-1 py-2.5 text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-900 rounded-xl shadow-xs"
                    >
                      Confirmar Pagamento
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
