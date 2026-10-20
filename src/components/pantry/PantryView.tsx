import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatKz, formatDate } from '../../utils/formatters';
import {
  Package,
  Plus,
  Minus,
  AlertTriangle,
  ShoppingCart,
  Trash2,
  Calendar,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  X
} from 'lucide-react';
import { PantryItem } from '../../types';

export const PantryView: React.FC = () => {
  const {
    pantryItems,
    addPantryItem,
    updatePantryQty,
    deletePantryItem,
    sendPantryItemToShoppingList,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'normal'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Cereais & Grãos');
  const [currentQty, setCurrentQty] = useState('2');
  const [minQty, setMinQty] = useState('2');
  const [unit, setUnit] = useState('kg');
  const [storageLocation, setStorageLocation] = useState<PantryItem['storageLocation']>('despensa');
  const [expiryDate, setExpiryDate] = useState('');
  const [lastRestockedPrice, setLastRestockedPrice] = useState('');

  const filteredItems = pantryItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLoc = filterLocation === 'all' || item.storageLocation === filterLocation;
    const isLow = item.currentQty <= item.minQty;
    const matchesStatus =
      filterStatus === 'all' ? true : filterStatus === 'low' ? isLow : !isLow;

    return matchesSearch && matchesLoc && matchesStatus;
  });

  const lowStockCount = pantryItems.filter((i) => i.currentQty <= i.minQty).length;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const curr = parseFloat(currentQty) || 0;
    const min = parseFloat(minQty) || 1;
    const price = lastRestockedPrice ? parseFloat(lastRestockedPrice) : undefined;

    addPantryItem({
      name: name.trim(),
      category,
      currentQty: curr,
      minQty: min,
      unit,
      storageLocation,
      expiryDate: expiryDate || undefined,
      purchaseDate: new Date().toISOString().split('T')[0],
      lastRestockedPrice: price,
    });

    setName('');
    setCurrentQty('2');
    setMinQty('2');
    setExpiryDate('');
    setLastRestockedPrice('');
    setShowAddModal(false);
  };

  const getLocationBadge = (loc: PantryItem['storageLocation']) => {
    switch (loc) {
      case 'despensa':
        return <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-md">Despensa</span>;
      case 'geleira':
        return <span className="text-[10px] bg-cyan-100 text-cyan-800 font-semibold px-2 py-0.5 rounded-md">Geleira</span>;
      case 'congelador':
        return <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-md">Congelador</span>;
      case 'quintal':
        return <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-md">Quintal</span>;
      case 'lavandaria':
        return <span className="text-[10px] bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-md">Lavandaria</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Despensa & Stock Doméstico
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Acompanhe o stock de fuba, arroz, peixe congelado, botija de gás e carvão.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Item no Stock</span>
        </button>
      </div>

      {/* Warning Alert if Low Stock */}
      {lowStockCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-950">
                Atenção: {lowStockCount} produto(s) abaixo do nível mínimo de stock!
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Clique no botão de carrinho do item para adicionar automaticamente à lista de compras da praça.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFilterStatus(filterStatus === 'low' ? 'all' : 'low')}
            className="text-xs font-bold px-3 py-1.5 bg-amber-200 text-amber-900 rounded-lg hover:bg-amber-300 shrink-0"
          >
            {filterStatus === 'low' ? 'Ver Todos' : 'Filtrar Baixos'}
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Pesquisar na despensa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-white"
          >
            <option value="all">Todos os Locais</option>
            <option value="despensa">Despensa</option>
            <option value="geleira">Geleira</option>
            <option value="congelador">Congelador</option>
            <option value="quintal">Quintal</option>
            <option value="lavandaria">Lavandaria</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-white"
          >
            <option value="all">Todo o Stock</option>
            <option value="low">Apenas Stock Baixo</option>
            <option value="normal">Stock Normal</option>
          </select>
        </div>
      </div>

      {/* Grid of Pantry Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
            Nenhum produto encontrado. Adicione novos mantimentos com o botão acima.
          </div>
        ) : (
          filteredItems.map((item) => {
            const isLow = item.currentQty <= item.minQty;
            return (
              <div
                key={item.id}
                className={`bg-white p-4 rounded-3xl border transition-all ${
                  isLow ? 'border-amber-300 shadow-sm' : 'border-slate-200 shadow-xs hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{item.name}</h4>
                      {getLocationBadge(item.storageLocation)}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.category}</p>
                  </div>

                  {isLow && (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                      Stock Baixo
                    </span>
                  )}
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Disponível
                    </span>
                    <p className="text-xl font-black text-slate-900 font-mono">
                      {item.currentQty} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
                    </p>
                    <p className="text-[10px] text-slate-400">Mínimo ideal: {item.minQty} {item.unit}</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updatePantryQty(item.id, -1)}
                      className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition-all shadow-2xs font-bold"
                      title="Consumir 1 unidade"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => updatePantryQty(item.id, 1)}
                      className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center hover:bg-emerald-900 active:scale-95 transition-all shadow-2xs font-bold"
                      title="Repor 1 unidade"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bottom details and quick actions */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <div className="text-slate-400">
                    {item.expiryDate ? (
                      <span>Val: {formatDate(item.expiryDate)}</span>
                    ) : (
                      <span>Sem validade</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Add to shopping list */}
                    <button
                      onClick={() => sendPantryItemToShoppingList(item)}
                      className="p-1.5 text-emerald-800 hover:bg-emerald-50 rounded-lg flex items-center gap-1 font-bold text-xs"
                      title="Adicionar à lista de compras da praça"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Comprar</span>
                    </button>

                    <button
                      onClick={() => deletePantryItem(item.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg"
                      title="Remover produto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Adicionar Item à Despensa */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900">Novo Produto na Despensa</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Produto</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Fuba de Milho, Arroz, Sal, Óleo..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-emerald-600"
                  >
                    <option value="Cereais & Grãos">Cereais & Grãos</option>
                    <option value="Farinhas & Fubas">Farinhas & Fubas</option>
                    <option value="Peixe">Peixe Fresco / Seco</option>
                    <option value="Carne & Aves">Carne & Frango</option>
                    <option value="Gorduras & Óleos">Gorduras & Óleos</option>
                    <option value="Combustível">Carvão & Gás</option>
                    <option value="Limpeza">Produtos de Limpeza</option>
                    <option value="Higiene">Higiene Pessoal</option>
                    <option value="Mercearia">Mercearia Diversa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Local na Casa</label>
                  <select
                    value={storageLocation}
                    onChange={(e) => setStorageLocation(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-emerald-600"
                  >
                    <option value="despensa">Despensa</option>
                    <option value="geleira">Geleira</option>
                    <option value="congelador">Congelador</option>
                    <option value="quintal">Quintal</option>
                    <option value="lavandaria">Lavandaria</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Qtd Atual</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={currentQty}
                    onChange={(e) => setCurrentQty(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Qtd Mínima</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={minQty}
                    onChange={(e) => setMinQty(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unidade</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-emerald-600"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="litros">Litros</option>
                    <option value="unidades">Unidades</option>
                    <option value="saco">Saco</option>
                    <option value="pacote">Pacote</option>
                    <option value="lata">Lata</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Validade (Opcional)</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Preço de Reposição (Kz)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="ex: 4500"
                    value={lastRestockedPrice}
                    onChange={(e) => setLastRestockedPrice(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-emerald-600"
                  />
                </div>
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
                  Guardar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
