import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatKz, formatDate } from '../../utils/formatters';
import {
  PiggyBank,
  Plus,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Calendar,
  AlertCircle,
  TrendingUp,
  X
} from 'lucide-react';
import { Debt, SavingsGoal } from '../../types';

export const DebtsSavingsView: React.FC = () => {
  const {
    debts,
    addDebt,
    recordDebtPayment,
    savingsGoals,
    addSavingsGoal,
    contributeToSavings,
    wallets,
    canAccessFinances,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'poupancas' | 'dividas'>('poupancas');
  const [showAddDebtModal, setShowAddDebtModal] = useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string>(savingsGoals[0]?.id || '');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositWalletId, setDepositWalletId] = useState(wallets[0]?.id || '');

  // Debt Payment State
  const [payingDebtId, setPayingDebtId] = useState<string | null>(null);
  const [debtPayAmount, setDebtPayAmount] = useState('');

  // Form State for Debt
  const [debtType, setDebtType] = useState<Debt['type']>('a_receber');
  const [personName, setPersonName] = useState('');
  const [phone, setPhone] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [debtNotes, setDebtNotes] = useState('');

  // Form State for Goal
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalMonthly, setGoalMonthly] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [goalCategory, setGoalCategory] = useState<SavingsGoal['category']>('emergencia');

  if (!canAccessFinances()) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center max-w-lg mx-auto my-12">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900">Acesso Restrito</h3>
        <p className="text-xs text-slate-500 mt-2">
          As metas de poupança e dívidas da casa estão reservadas aos membros adultos e administradores.
        </p>
      </div>
    );
  }

  const totalSaved = savingsGoals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalToReceive = debts
    .filter((d) => d.type === 'a_receber' && d.status === 'ativo')
    .reduce((acc, d) => acc + d.remainingAmount, 0);
  const totalToPay = debts
    .filter((d) => d.type === 'a_pagar' && d.status === 'ativo')
    .reduce((acc, d) => acc + d.remainingAmount, 0);

  const handleCreateDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(totalAmount);
    if (!personName.trim() || isNaN(amount) || amount <= 0) return;

    addDebt({
      type: debtType,
      personName: personName.trim(),
      phone: phone.trim() || undefined,
      totalAmount: amount,
      dueDate: dueDate || undefined,
      notes: debtNotes.trim() || undefined,
    });

    setPersonName('');
    setPhone('');
    setTotalAmount('');
    setDebtNotes('');
    setShowAddDebtModal(false);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(goalTarget);
    if (!goalTitle.trim() || isNaN(target) || target <= 0) return;

    const monthly = goalMonthly ? parseFloat(goalMonthly) : undefined;

    let color = '#0F4C3A';
    if (goalCategory === 'kixikila') color = '#D97706';
    if (goalCategory === 'renda') color = '#4338CA';
    if (goalCategory === 'propinas') color = '#7C3AED';

    addSavingsGoal({
      title: goalTitle.trim(),
      targetAmount: target,
      deadline: goalDeadline || undefined,
      category: goalCategory,
      monthlyTargetKz: monthly,
      color,
    });

    setGoalTitle('');
    setGoalTarget('');
    setGoalMonthly('');
    setShowAddGoalModal(false);
  };

  const handleDepositToGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0 || !selectedGoalId) return;

    contributeToSavings(selectedGoalId, amount, depositWalletId);
    setDepositAmount('');
    setShowDepositModal(false);
  };

  const handlePayDebtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingDebtId) return;
    const amount = parseFloat(debtPayAmount);
    if (isNaN(amount) || amount <= 0) return;

    recordDebtPayment(payingDebtId, amount);
    setPayingDebtId(null);
    setDebtPayAmount('');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Poupanças, Kixikila & Dívidas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Defina metas familiares (fundo de emergência, renda, kixikila) e controle empréstimos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('poupancas')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'poupancas'
                ? 'bg-emerald-800 text-white'
                : 'bg-white border border-slate-200 text-slate-700'
            }`}
          >
            Metas & Kixikila
          </button>
          <button
            onClick={() => setActiveTab('dividas')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'dividas'
                ? 'bg-emerald-800 text-white'
                : 'bg-white border border-slate-200 text-slate-700'
            }`}
          >
            Dívidas & Empréstimos
          </button>
        </div>
      </div>

      {activeTab === 'poupancas' && (
        <div className="space-y-6">
          {/* Top Banner KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Total Acumulado em Poupanças
                </span>
                <p className="text-2xl font-black text-emerald-800 font-mono mt-1">
                  {formatKz(totalSaved)}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {savingsGoals.length} fundos e mealheiros ativos
                </p>
              </div>
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
                <PiggyBank className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Ação Rápida
                </span>
                <p className="text-sm font-bold text-slate-800 mt-1">Alimentar Poupança ou Criar Meta</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => setShowDepositModal(true)}
                    className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Depositar Valor
                  </button>
                  <button
                    onClick={() => setShowAddGoalModal(true)}
                    className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    Nova Meta
                  </button>
                </div>
              </div>
              <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl">
                <Coins className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Goals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savingsGoals.map((goal) => {
              const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
              const monthsToGoal = goal.monthlyTargetKz && goal.monthlyTargetKz > 0
                ? Math.ceil(remainingAmount / goal.monthlyTargetKz)
                : null;

              return (
                <div
                  key={goal.id}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{goal.title}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
                        {goal.category}
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xl font-black font-mono text-slate-900">
                          {formatKz(goal.currentAmount)}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          Meta: {formatKz(goal.targetAmount)}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-2 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                        <span>{percent}% alcançado</span>
                        <span>Falta: {formatKz(remainingAmount)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <div className="text-slate-400">
                      {monthsToGoal ? (
                        <span>~{monthsToGoal} meses restantes</span>
                      ) : goal.deadline ? (
                        <span>Prazo: {formatDate(goal.deadline)}</span>
                      ) : (
                        <span>Sem prazo</span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedGoalId(goal.id);
                        setShowDepositModal(true);
                      }}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg font-bold text-xs"
                    >
                      + Depositar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'dividas' && (
        <div className="space-y-6">
          {/* Top Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Valores a Receber (Emprestado a Terceiros)
                </span>
                <p className="text-2xl font-black text-emerald-700 font-mono mt-1">
                  {formatKz(totalToReceive)}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Dinheiro a entrar na casa</p>
              </div>
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
                <ArrowDownLeft className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Valores a Pagar (Compromissos Pendentes)
                </span>
                <p className="text-2xl font-black text-rose-600 font-mono mt-1">
                  {formatKz(totalToPay)}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Fiado na cantina ou armazém</p>
              </div>
              <div className="p-3 bg-rose-100 text-rose-800 rounded-2xl">
                <ArrowUpRight className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setShowAddDebtModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Registar Empréstimo / Dívida</span>
            </button>
          </div>

          {/* Debts List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {debts.map((debt) => {
              const isSettled = debt.status === 'liquidado';
              return (
                <div
                  key={debt.id}
                  className={`bg-white p-5 rounded-3xl border transition-all ${
                    isSettled ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{debt.personName}</h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            debt.type === 'a_receber'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {debt.type === 'a_receber' ? 'A Receber' : 'A Pagar'}
                        </span>
                      </div>
                      {debt.phone && (
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{debt.phone}</p>
                      )}
                      {debt.notes && (
                        <p className="text-xs text-slate-600 mt-1">{debt.notes}</p>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSettled ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isSettled ? 'Liquidado' : 'Ativo'}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Restante por Liquidar</span>
                      <span className="text-lg font-black font-mono text-slate-900">
                        {formatKz(debt.remainingAmount)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Original: {formatKz(debt.totalAmount)}
                      </span>
                    </div>

                    {!isSettled && (
                      <button
                        onClick={() => {
                          setPayingDebtId(debt.id);
                          setDebtPayAmount(String(debt.remainingAmount));
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                      >
                        Amortizar
                      </button>
                    )}
                  </div>

                  {/* Payment History */}
                  {debt.payments.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-500 space-y-1">
                      <p className="font-semibold text-slate-700">Amortizações efetuadas:</p>
                      {debt.payments.map((p) => (
                        <div key={p.id} className="flex justify-between">
                          <span>
                            {formatDate(p.date)} - {p.note || 'Pagamento'}
                          </span>
                          <span className="font-mono font-bold text-emerald-700">
                            {formatKz(p.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Depositar em Meta */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900">Depositar na Poupança</h3>
              <button onClick={() => setShowDepositModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDepositToGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Qual objetivo?</label>
                <select
                  value={selectedGoalId}
                  onChange={(e) => setSelectedGoalId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-emerald-600"
                >
                  {savingsGoals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title} (Atual: {formatKz(g.currentAmount)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Valor a Depositar (Kz)</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="ex: 20000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-base font-bold focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Debitar de qual carteira?</label>
                <select
                  value={depositWalletId}
                  onChange={(e) => setDepositWalletId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-emerald-600"
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
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-900 rounded-xl shadow-xs"
                >
                  Confirmar Depósito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Amortizar Dívida */}
      {payingDebtId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900">Registar Pagamento / Amortização</h3>
              <button onClick={() => setPayingDebtId(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePayDebtSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Valor Amortizado (Kz)</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={debtPayAmount}
                  onChange={(e) => setDebtPayAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-base font-bold focus:outline-emerald-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayingDebtId(null)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-900 rounded-xl shadow-xs"
                >
                  Guardar Pagamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nova Meta de Poupança */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900">Novo Fundo / Meta de Poupança</h3>
              <button onClick={() => setShowAddGoalModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título do Objetivo</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Kixikila Familiar, Reserva da Renda, Obras..."
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={goalCategory}
                    onChange={(e) => setGoalCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-emerald-600"
                  >
                    <option value="emergencia">Emergência & Saúde</option>
                    <option value="kixikila">Kixikila Familiar</option>
                    <option value="renda">Reserva de Renda</option>
                    <option value="propinas">Propinas Escolares</option>
                    <option value="obras">Obras na Casa</option>
                    <option value="outro">Outro Objetivo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Valor Alvo (Kz)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="ex: 300000"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Aporte Mensal (Kz)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="ex: 35000"
                    value={goalMonthly}
                    onChange={(e) => setGoalMonthly(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prazo Estimado</label>
                  <input
                    type="date"
                    value={goalDeadline}
                    onChange={(e) => setGoalDeadline(e.target.value)}
                    className="w-full p-1.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddGoalModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-900 rounded-xl shadow-xs"
                >
                  Criar Objetivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nova Dívida */}
      {showAddDebtModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900">Novo Empréstimo / Dívida</h3>
              <button onClick={() => setShowAddDebtModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDebt} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setDebtType('a_receber')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    debtType === 'a_receber' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  A Receber (+)
                </button>
                <button
                  type="button"
                  onClick={() => setDebtType('a_pagar')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    debtType === 'a_pagar' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  A Pagar (-)
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome da Pessoa ou Loja</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Primo Wilson, Armazém do Sr. Manuel..."
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Valor Total (Kz)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="ex: 50000"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-sm focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Telefone (Opcional)</label>
                  <input
                    type="text"
                    placeholder="ex: +244 923..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Motivo / Notas</label>
                <input
                  type="text"
                  placeholder="ex: Empréstimo para reparação do táxi..."
                  value={debtNotes}
                  onChange={(e) => setDebtNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDebtModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-900 rounded-xl shadow-xs"
                >
                  Registar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
