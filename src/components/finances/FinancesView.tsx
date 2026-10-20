import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatKz, formatDate } from '../../utils/formatters';
import {
  Wallet as WalletIcon,
  Plus,
  ArrowRightLeft,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  Download,
  Trash2,
  AlertCircle,
  CreditCard,
  Banknote,
  Smartphone,
  Landmark,
  X
} from 'lucide-react';
import { TransactionType, WalletType } from '../../types';

export const FinancesView: React.FC = () => {
  const {
    wallets,
    addWallet,
    categories,
    transactions,
    addTransaction,
    deleteTransaction,
    updateCategoryBudget,
    exportTransactionsCSV,
    members,
    currentMember,
    canAccessFinances,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'transacoes' | 'carteiras' | 'orcamentos'>('transacoes');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterWallet, setFilterWallet] = useState<string>('all');

  // Modal states
  const [showNewTxModal, setShowNewTxModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showNewWalletModal, setShowNewWalletModal] = useState(false);

  // New Transaction Form State
  const [txType, setTxType] = useState<TransactionType>('expense');
  const [txAmount, setTxAmount] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txCategoryId, setTxCategoryId] = useState('');
  const [txWalletId, setTxWalletId] = useState(wallets[0]?.id || '');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txPaymentMethod, setTxPaymentMethod] = useState('Multicaixa Express');

  // Transfer Form State
  const [transferAmount, setTransferAmount] = useState('');
  const [fromWalletId, setFromWalletId] = useState(wallets[0]?.id || '');
  const [toWalletId, setToWalletId] = useState(wallets[1]?.id || wallets[0]?.id || '');
  const [transferDesc, setTransferDesc] = useState('Transferência interna entre carteiras');

  // New Wallet Form State
  const [walletName, setWalletName] = useState('');
  const [walletType, setWalletType] = useState<WalletType>('cash');
  const [walletBalance, setWalletBalance] = useState('');
  const [walletAccount, setWalletAccount] = useState('');

  if (!canAccessFinances()) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center max-w-lg mx-auto my-12">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900">Acesso Restrito</h3>
        <p className="text-xs text-slate-500 mt-2">
          O seu perfil de membro não tem permissões para visualizar ou gerir as contas financeiras da família. Peça ao administrador para atualizar as suas permissões.
        </p>
      </div>
    );
  }

  // Filtered transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesWallet = filterWallet === 'all' || t.walletId === filterWallet || t.toWalletId === filterWallet;
    return matchesSearch && matchesType && matchesWallet;
  });

  const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);

  // Category expense calculations
  const categoryExpenses = categories
    .filter((c) => c.type === 'expense')
    .map((cat) => {
      const spent = transactions
        .filter((t) => t.type === 'expense' && t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);
      const limit = cat.budgetLimit || 0;
      const percent = limit > 0 ? (spent / limit) * 100 : 0;
      return { ...cat, spent, percent };
    });

  const handleCreateTransaction = (e: React.FormEvent) => {
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
      paymentMethod: txPaymentMethod,
    });

    setTxAmount('');
    setTxDescription('');
    setShowNewTxModal(false);
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(transferAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;
    if (fromWalletId === toWalletId) return;

    addTransaction({
      type: 'transfer',
      amount: amountNum,
      description: transferDesc,
      categoryId: '',
      walletId: fromWalletId,
      toWalletId: toWalletId,
      date: new Date().toISOString().split('T')[0],
      memberId: currentMember.id,
    });

    setTransferAmount('');
    setShowTransferModal(false);
  };

  const handleCreateWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletName.trim()) return;
    const balanceNum = parseFloat(walletBalance) || 0;

    let color = '#0F4C3A';
    if (walletType === 'cash') color = '#15803D';
    if (walletType === 'unitel_money') color = '#DC2626';
    if (walletType === 'afrimoney') color = '#7C3AED';
    if (walletType === 'bank') color = '#2563EB';

    addWallet({
      name: walletName,
      type: walletType,
      balance: balanceNum,
      accountNumber: walletAccount,
      color,
    });

    setWalletName('');
    setWalletBalance('');
    setWalletAccount('');
    setShowNewWalletModal(false);
  };

  const getWalletIcon = (type: WalletType) => {
    switch (type) {
      case 'cash':
        return <Banknote className="w-4 h-4 text-emerald-600" />;
      case 'multicaixa':
        return <CreditCard className="w-4 h-4 text-emerald-800" />;
      case 'unitel_money':
      case 'afrimoney':
        return <Smartphone className="w-4 h-4 text-red-600" />;
      case 'bank':
      default:
        return <Landmark className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Gestão Financeira Doméstica
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registo manual e transparente em Kwanzas (Kz), sem necessidade de integração bancária.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowTransferModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Transferir entre Carteiras</span>
          </button>
          <button
            onClick={() => {
              setTxType('expense');
              setShowNewTxModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Transação</span>
          </button>
        </div>
      </div>

      {/* Wallets Overview Carousel / Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Carteiras & Dinheiro da Família
            </h3>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-mono">
              Total: {formatKz(totalBalance)}
            </span>
          </div>
          <button
            onClick={() => setShowNewWalletModal(true)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Carteira
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {wallets.map((w) => (
            <div
              key={w.id}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-slate-100 rounded-lg">{getWalletIcon(w.type)}</div>
                  <span className="text-xs font-bold text-slate-800 truncate">{w.name}</span>
                </div>
                {w.isDefault && (
                  <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold">
                    Padrão
                  </span>
                )}
              </div>
              <p className="text-xl font-black text-slate-900 font-mono mt-2">{formatKz(w.balance)}</p>
              {w.accountNumber && (
                <p className="text-[10px] text-slate-400 font-mono mt-1 truncate">{w.accountNumber}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sub Tabs: Transações, Orçamentos, Detalhes */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('transacoes')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            activeSubTab === 'transacoes'
              ? 'bg-emerald-800 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Extrato & Movimentos
        </button>
        <button
          onClick={() => setActiveSubTab('orcamentos')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            activeSubTab === 'orcamentos'
              ? 'bg-emerald-800 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Limites & Orçamentos
        </button>
      </div>

      {activeSubTab === 'transacoes' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Pesquisar por descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-white"
              >
                <option value="all">Todos os Tipos</option>
                <option value="income">Receitas (+)</option>
                <option value="expense">Despesas (-)</option>
                <option value="transfer">Transferências</option>
              </select>

              <select
                value={filterWallet}
                onChange={(e) => setFilterWallet(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-white"
              >
                <option value="all">Todas Carteiras</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>

              <button
                onClick={exportTransactionsCSV}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                title="Exportar para folha de cálculo (CSV)"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Nenhuma transação encontrada com estes filtros.
                </div>
              ) : (
                filteredTransactions.map((tx) => {
                  const wallet = wallets.find((w) => w.id === tx.walletId);
                  const toWallet = tx.toWalletId ? wallets.find((w) => w.id === tx.toWalletId) : null;
                  const category = categories.find((c) => c.id === tx.categoryId);

                  return (
                    <div
                      key={tx.id}
                      className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                            tx.type === 'income'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tx.type === 'expense'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {tx.type === 'income' ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : tx.type === 'expense' ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowRightLeft className="w-4 h-4" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{tx.description}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                            <span>{formatDate(tx.date)}</span>
                            <span>•</span>
                            <span className="font-medium text-slate-600">
                              {tx.type === 'transfer'
                                ? `${wallet?.name} → ${toWallet?.name}`
                                : wallet?.name}
                            </span>
                            {category && (
                              <>
                                <span>•</span>
                                <span className="text-slate-500">{category.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`text-xs sm:text-sm font-black font-mono tracking-tight ${
                            tx.type === 'income'
                              ? 'text-emerald-700'
                              : tx.type === 'expense'
                              ? 'text-slate-900'
                              : 'text-blue-700'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                          {formatKz(tx.amount)}
                        </span>

                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          className="p-1 text-slate-300 hover:text-rose-600 rounded transition-colors"
                          title="Eliminar transação"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'orcamentos' && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs text-emerald-900 leading-relaxed">
            <strong>Orçamentos Domésticos:</strong> Defina limites para as categorias mais pesadas (alimentação, luz, água e propinas) para evitar que os gastos ultrapassem os rendimentos da família.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categoryExpenses.map((cat) => {
              const isOver = cat.budgetLimit && cat.spent > cat.budgetLimit;
              return (
                <div key={cat.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{cat.name}</span>
                    <span className="text-xs font-bold text-slate-700 font-mono">
                      {formatKz(cat.spent)} / {formatKz(cat.budgetLimit || 0)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2.5">
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isOver
                            ? 'bg-rose-500'
                            : cat.percent > 80
                            ? 'bg-amber-500'
                            : 'bg-emerald-600'
                        }`}
                        style={{ width: `${Math.min(100, cat.percent)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
                    <span className={isOver ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                      {isOver ? `Ultrapassou em ${formatKz(cat.spent - (cat.budgetLimit || 0))}` : `${(100 - cat.percent).toFixed(0)}% restante`}
                    </span>
                    <button
                      onClick={() => {
                        const newLimit = prompt(
                          `Definir novo limite para ${cat.name} em Kwanzas:`,
                          String(cat.budgetLimit || 0)
                        );
                        if (newLimit !== null) {
                          const val = parseFloat(newLimit);
                          if (!isNaN(val) && val >= 0) {
                            updateCategoryBudget(cat.id, val);
                          }
                        }
                      }}
                      className="text-emerald-700 font-semibold hover:underline"
                    >
                      Editar Limite
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Nova Transação */}
      {showNewTxModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900">Registar Transação Doméstica</h3>
              <button onClick={() => setShowNewTxModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-4">
              {/* Type Switcher */}
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

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Valor em Kwanzas (Kz)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="ex: 25000"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-base font-bold focus:outline-emerald-600"
                  />
                  <span className="absolute right-3 top-3 text-xs font-bold text-slate-400 font-mono">Kz</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Compras na praça, recarga de luz, etc."
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              {/* Category */}
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

              {/* Wallet */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Carteira / Meio</label>
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

              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Data</label>
                <input
                  type="date"
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTxModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-900 rounded-xl shadow-xs"
                >
                  Guardar Registo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Transferência Entre Carteiras */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900">Transferência entre Carteiras</h3>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Mova dinheiro entre o Multicaixa, Unitel Money e Dinheiro Vivo sem alterar o total do património familiar.
            </p>

            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">De (Origem)</label>
                <select
                  value={fromWalletId}
                  onChange={(e) => setFromWalletId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-emerald-600"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} (Disponível: {formatKz(w.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Para (Destino)</label>
                <select
                  value={toWalletId}
                  onChange={(e) => setToWalletId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-emerald-600"
                >
                  {wallets
                    .filter((w) => w.id !== fromWalletId)
                    .map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({formatKz(w.balance)})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Valor a Transferir (Kz)</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="ex: 15000"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-base font-bold focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Motivo / Descrição</label>
                <input
                  type="text"
                  value={transferDesc}
                  onChange={(e) => setTransferDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-900 rounded-xl shadow-xs"
                >
                  Executar Transferência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Adicionar Nova Carteira */}
      {showNewWalletModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900">Nova Carteira ou Conta</h3>
              <button onClick={() => setShowNewWalletModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWallet} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome da Carteira</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Afrimoney, Multicaixa BFA, Gaveta da Casa"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Carteira</label>
                <select
                  value={walletType}
                  onChange={(e) => setWalletType(e.target.value as WalletType)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-emerald-600"
                >
                  <option value="cash">Dinheiro Físico / Numerário</option>
                  <option value="multicaixa">Multicaixa Express</option>
                  <option value="unitel_money">Unitel Money</option>
                  <option value="afrimoney">Afrimoney</option>
                  <option value="bank">Conta Bancária (BFA, BAI, BIC...)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Saldo Inicial (Kz)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="ex: 50000"
                  value={walletBalance}
                  onChange={(e) => setWalletBalance(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-sm focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nº Telefone / Conta (Opcional)</label>
                <input
                  type="text"
                  placeholder="ex: 923 ... ou IBAN parcial"
                  value={walletAccount}
                  onChange={(e) => setWalletAccount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewWalletModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-900 rounded-xl shadow-xs"
                >
                  Criar Carteira
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
