import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatKz, formatDate } from '../../utils/formatters';
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  Download,
  Printer,
  PieChart,
  ShoppingBag,
  DollarSign,
  Users,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    transactions,
    categories,
    wallets,
    members,
    bills,
    savingsGoals,
    debts,
    exportTransactionsCSV,
    canAccessFinances,
  } = useApp();

  const [selectedPeriod, setSelectedPeriod] = useState<'thisMonth' | 'all'>('thisMonth');

  if (!canAccessFinances()) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center max-w-lg mx-auto my-12">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900">Acesso Restrito</h3>
        <p className="text-xs text-slate-500 mt-2">
          Os relatórios financeiros consolidados estão reservados aos administradores e adultos da família.
        </p>
      </div>
    );
  }

  const currentDate = new Date();
  const currentMonthPrefix = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

  const filteredTx = selectedPeriod === 'thisMonth'
    ? transactions.filter((t) => t.date.startsWith(currentMonthPrefix))
    : transactions;

  const totalIncome = filteredTx
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = filteredTx
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Expenses grouped by Category
  const expenseByCategory = categories
    .filter((c) => c.type === 'expense')
    .map((cat) => {
      const sum = filteredTx
        .filter((t) => t.type === 'expense' && t.categoryId === cat.id)
        .reduce((acc, t) => acc + t.amount, 0);
      const percent = totalExpense > 0 ? (sum / totalExpense) * 100 : 0;
      return { ...cat, total: sum, percent };
    })
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  // Expenses grouped by Member
  const expenseByMember = members.map((mem) => {
    const sum = filteredTx
      .filter((t) => t.type === 'expense' && t.memberId === mem.id)
      .reduce((acc, t) => acc + t.amount, 0);
    const percent = totalExpense > 0 ? (sum / totalExpense) * 100 : 0;
    return { ...mem, total: sum, percent };
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150 print:p-0">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Relatórios & Estatísticas Domésticas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Análise detalhada de gastos, despesas por categoria e evolução do orçamento familiar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
          >
            <option value="thisMonth">Este Mês (Outubro 2026)</option>
            <option value="all">Todo o Histórico</option>
          </select>

          <button
            onClick={exportTransactionsCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
            title="Exportar CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs"
            title="Imprimir ou Guardar em PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Heading for Reports */}
      <div className="hidden print:block border-b border-slate-300 pb-4 mb-4">
        <h1 className="text-2xl font-black text-slate-900">Minha Casa AO — Extrato Doméstico</h1>
        <p className="text-xs text-slate-600">
          Relatório gerado em {new Date().toLocaleDateString('pt-AO')} • Moeda: Kwanza (AOA / Kz)
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total de Receitas
          </span>
          <p className="text-2xl font-black text-emerald-700 font-mono mt-1">
            +{formatKz(totalIncome)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Entradas registadas</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total de Despesas
          </span>
          <p className="text-2xl font-black text-rose-600 font-mono mt-1">
            -{formatKz(totalExpense)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Saídas da casa</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Saldo Líquido do Período
          </span>
          <p
            className={`text-2xl font-black font-mono mt-1 ${
              netBalance >= 0 ? 'text-emerald-800' : 'text-rose-600'
            }`}
          >
            {formatKz(netBalance)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {netBalance >= 0 ? 'Superávit familiar positivo' : 'Défice no período'}
          </p>
        </div>
      </div>

      {/* Distribution by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">
              Despesas por Categoria (Maiores Gastos)
            </h3>
            <span className="text-xs text-slate-400 font-mono">{expenseByCategory.length} categorias</span>
          </div>

          <div className="space-y-3.5">
            {expenseByCategory.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Nenhuma despesa registada no período.</p>
            ) : (
              expenseByCategory.map((cat) => (
                <div key={cat.id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800">{cat.name}</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatKz(cat.total)} ({cat.percent.toFixed(1)}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-700 h-2 rounded-full"
                      style={{ width: `${cat.percent}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expenses by Household Member */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">
              Despesas por Membro da Família
            </h3>
            <span className="text-xs text-slate-400 font-mono">{members.length} membros</span>
          </div>

          <div className="space-y-4">
            {expenseByMember.map((m) => (
              <div key={m.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{m.avatar}</span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{m.name}</p>
                      <p className="text-[10px] text-slate-400">{m.relationship}</p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-black text-slate-900">
                    {formatKz(m.total)}
                  </span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-emerald-600 h-1.5 rounded-full"
                    style={{ width: `${m.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparative Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Contas Domésticas
          </h4>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600">Contas Pagas:</span>
              <strong className="text-emerald-700 font-mono">
                {bills.filter((b) => b.status === 'pago').length}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Contas Pendentes:</span>
              <strong className="text-amber-700 font-mono">
                {bills.filter((b) => b.status !== 'pago').length}
              </strong>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Dívidas & Créditos
          </h4>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600">A Receber:</span>
              <strong className="text-emerald-700 font-mono">
                {formatKz(debts.filter((d) => d.type === 'a_receber').reduce((a, b) => a + b.remainingAmount, 0))}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">A Pagar:</span>
              <strong className="text-rose-600 font-mono">
                {formatKz(debts.filter((d) => d.type === 'a_pagar').reduce((a, b) => a + b.remainingAmount, 0))}
              </strong>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Poupanças & Metas
          </h4>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600">Fundos Ativos:</span>
              <strong className="text-slate-900 font-mono">{savingsGoals.length}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Total Poupado:</span>
              <strong className="text-emerald-700 font-mono">
                {formatKz(savingsGoals.reduce((a, b) => a + b.currentAmount, 0))}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
