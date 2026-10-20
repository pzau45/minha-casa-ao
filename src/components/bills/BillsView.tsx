import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatKz, formatDate, getDaysRemaining } from '../../utils/formatters';
import {
  Home,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  Droplets,
  Flame,
  GraduationCap,
  Wifi,
  Trash2,
  Calendar,
  CreditCard,
  X
} from 'lucide-react';
import { Bill, BillCategory } from '../../types';

export const BillsView: React.FC = () => {
  const {
    bills,
    addBill,
    payBill,
    deleteBill,
    wallets,
    canAccessFinances,
  } = useApp();

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [payingBillId, setPayingBillId] = useState<string | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string>(wallets[0]?.id || '');

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<BillCategory>('ende_luz');
  const [estimatedAmount, setEstimatedAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [frequency, setFrequency] = useState<Bill['frequency']>('mensal');
  const [meterNumber, setMeterNumber] = useState('');
  const [notes, setNotes] = useState('');

  const filteredBills = bills.filter((b) => {
    const matchesCat = filterCategory === 'all' || b.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchesCat && matchesStatus;
  });

  const pendingBills = bills.filter((b) => b.status !== 'pago');
  const totalPendingAmount = pendingBills.reduce((acc, b) => acc + b.estimatedAmount, 0);

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !estimatedAmount) return;

    const amount = parseFloat(estimatedAmount);
    if (isNaN(amount) || amount <= 0) return;

    addBill({
      title: title.trim(),
      category,
      estimatedAmount: amount,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      frequency,
      status: 'pendente',
      meterNumber: meterNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setTitle('');
    setEstimatedAmount('');
    setMeterNumber('');
    setNotes('');
    setShowAddModal(false);
  };

  const handlePayConfirm = (billId: string) => {
    const bill = bills.find((b) => b.id === billId);
    if (!bill) return;
    payBill(billId, selectedWalletId || wallets[0].id, bill.estimatedAmount);
    setPayingBillId(null);
  };

  const getCategoryIcon = (cat: BillCategory) => {
    switch (cat) {
      case 'ende_luz':
        return <Zap className="w-4 h-4 text-amber-600" />;
      case 'epal_agua':
        return <Droplets className="w-4 h-4 text-blue-600" />;
      case 'gas_carvao':
        return <Flame className="w-4 h-4 text-orange-600" />;
      case 'escola_propinas':
        return <GraduationCap className="w-4 h-4 text-purple-600" />;
      case 'telecom':
        return <Wifi className="w-4 h-4 text-pink-600" />;
      case 'renda':
      case 'condominio':
      default:
        return <Home className="w-4 h-4 text-emerald-700" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Contas & Pagamentos Domésticos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Acompanhe a recarga ENDE, cisterna de água, propinas escolares e renda sem atrasos.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registar Conta</span>
        </button>
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total a Liquidar (Pendentes)
          </span>
          <p className="text-2xl font-black text-slate-900 font-mono mt-1">
            {formatKz(totalPendingAmount)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {pendingBills.length} contas por pagar este mês
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Contas Próximas (Até 5 Dias)
          </span>
          <p className="text-2xl font-black text-amber-700 font-mono mt-1">
            {pendingBills.filter((b) => getDaysRemaining(b.dueDate).days <= 5).length}
          </p>
          <p className="text-[11px] text-amber-600 mt-1">Prioridade de pagamento</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Contas Liquidadas
          </span>
          <p className="text-2xl font-black text-emerald-700 font-mono mt-1">
            {bills.filter((b) => b.status === 'pago').length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Comprovativos arquivados</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
          >
            <option value="all">Todos os Estados</option>
            <option value="pendente">Pendentes</option>
            <option value="pago">Pagas</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
          >
            <option value="all">Todas as Contas</option>
            <option value="ende_luz">ENDE Luz Pré-Pago</option>
            <option value="epal_agua">EPAL / Cisterna de Água</option>
            <option value="gas_carvao">Gás & Carvão</option>
            <option value="renda">Renda da Casa</option>
            <option value="escola_propinas">Propinas Escolares</option>
            <option value="telecom">Internet & Televisão</option>
          </select>
        </div>
      </div>

      {/* Bills Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBills.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
            Nenhuma conta encontrada com estes filtros.
          </div>
        ) : (
          filteredBills.map((bill) => {
            const remaining = getDaysRemaining(bill.dueDate);
            const isPaid = bill.status === 'pago';

            return (
              <div
                key={bill.id}
                className={`bg-white p-5 rounded-3xl border transition-all ${
                  isPaid
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : remaining.isOverdue
                    ? 'border-rose-300'
                    : remaining.days <= 3
                    ? 'border-amber-300'
                    : 'border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-2xl bg-slate-100 shrink-0">
                      {getCategoryIcon(bill.category)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{bill.title}</h4>
                      {bill.meterNumber && (
                        <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                          Contador / Ref: <strong className="text-slate-800">{bill.meterNumber}</strong>
                        </p>
                      )}
                      {bill.notes && (
                        <p className="text-[11px] text-slate-500 mt-0.5 italic">{bill.notes}</p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      isPaid
                        ? 'bg-emerald-100 text-emerald-800'
                        : remaining.isOverdue
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isPaid ? 'Pago' : remaining.label}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block">
                      {isPaid ? 'Valor Liquidado' : 'Valor Previsto'}
                    </span>
                    <span className="text-lg font-black font-mono text-slate-900">
                      {formatKz(bill.paidAmount || bill.estimatedAmount)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isPaid && canAccessFinances() && (
                      <button
                        onClick={() => setPayingBillId(bill.id)}
                        className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                      >
                        Liquidar Conta
                      </button>
                    )}

                    <button
                      onClick={() => deleteBill(bill.id)}
                      className="p-2 text-slate-300 hover:text-rose-600 rounded-lg transition-colors"
                      title="Remover registo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Vencimento: {formatDate(bill.dueDate)}</span>
                  <span className="capitalize">Freq: {bill.frequency}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Registar Nova Conta */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900">Registar Conta Doméstica</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBill} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título da Conta</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Recarga ENDE Luz, Cisterna de Água, Propina..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as BillCategory)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-emerald-600"
                  >
                    <option value="ende_luz">ENDE Luz Pré-Pago</option>
                    <option value="epal_agua">EPAL / Cisterna de Água</option>
                    <option value="gas_carvao">Gás Sonagas & Carvão</option>
                    <option value="renda">Renda da Residência</option>
                    <option value="condominio">Condomínio</option>
                    <option value="escola_propinas">Propinas Escolares</option>
                    <option value="telecom">Internet ZAP / Unitel</option>
                    <option value="servicos">Serviços Domésticos</option>
                    <option value="outro">Outro Encargo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Frequência</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-emerald-600"
                  >
                    <option value="mensal">Mensal</option>
                    <option value="quinzenal">Quinzenal</option>
                    <option value="semanal">Semanal</option>
                    <option value="pontual">Pontual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Valor Previsto (Kz)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="ex: 15000"
                    value={estimatedAmount}
                    onChange={(e) => setEstimatedAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-sm focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Data de Vencimento</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nº do Contador ou Referência de Pagamento
                </label>
                <input
                  type="text"
                  placeholder="ex: 4410-8293-192 (ENDE) ou Matrícula Escolar"
                  value={meterNumber}
                  onChange={(e) => setMeterNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Observações (Opcional)</label>
                <input
                  type="text"
                  placeholder="ex: Comprar pelo Multicaixa Express ou ligar para o fornecedor"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-900 rounded-xl shadow-xs"
                >
                  Guardar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Liquidação de Conta */}
      {payingBillId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
            {(() => {
              const bill = bills.find((b) => b.id === payingBillId);
              if (!bill) return null;
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-base text-slate-900">Liquidação de Conta</h3>
                    <button onClick={() => setPayingBillId(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <p className="text-xs text-emerald-800 font-semibold">{bill.title}</p>
                    <p className="text-2xl font-black text-emerald-950 font-mono mt-1">
                      {formatKz(bill.estimatedAmount)}
                    </p>
                    {bill.meterNumber && (
                      <p className="text-[11px] text-emerald-700 mt-1 font-mono">
                        Contador / Ref: <strong>{bill.meterNumber}</strong>
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
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-emerald-600"
                    >
                      {wallets.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} (Saldo: {formatKz(w.balance)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <p className="text-[11px] text-slate-500 italic">
                    Ao confirmar, uma despesa correspondente será registada automaticamente no extrato financeiro.
                  </p>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setPayingBillId(null)}
                      className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePayConfirm(bill.id)}
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
