import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatKz } from '../../utils/formatters';
import {
  ShoppingBag,
  Plus,
  CheckCircle2,
  Trash2,
  PackagePlus,
  Store,
  Filter,
  ArrowRight,
  TrendingUp,
  Tag,
  Check,
  X
} from 'lucide-react';
import { ShoppingItem, StoreType } from '../../types';

export const ShoppingView: React.FC = () => {
  const {
    shoppingLists,
    addShoppingList,
    deleteShoppingList,
    addShoppingItem,
    toggleItemPurchased,
    deleteShoppingItem,
    transferPurchasedToPantry,
  } = useApp();

  const [selectedListId, setSelectedListId] = useState<string>(shoppingLists[0]?.id || '');
  const [filterStore, setFilterStore] = useState<string>('all');
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [showNewListModal, setShowNewListModal] = useState(false);

  // New List State
  const [newListName, setNewListName] = useState('');
  const [newListStoreType, setNewListStoreType] = useState<StoreType>('praca');

  // New Item State
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('Alimentação');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [itemUnit, setItemUnit] = useState('kg');
  const [itemEstimatedPrice, setItemEstimatedPrice] = useState('');
  const [itemStoreType, setItemStoreType] = useState<StoreType>('praca');
  const [itemStoreName, setItemStoreName] = useState('');
  const [itemPriority, setItemPriority] = useState<'alta' | 'media' | 'baixa'>('alta');

  const activeList = shoppingLists.find((l) => l.id === selectedListId) || shoppingLists[0];

  // Price calculations
  const totalEstimated = activeList?.items.reduce((acc, i) => acc + (i.estimatedPrice || 0), 0) || 0;
  const totalActual = activeList?.items
    .filter((i) => i.isPurchased)
    .reduce((acc, i) => acc + (i.actualPrice !== undefined ? i.actualPrice : i.estimatedPrice), 0) || 0;

  const purchasedCount = activeList?.items.filter((i) => i.isPurchased).length || 0;
  const totalItemsCount = activeList?.items.length || 0;

  // Filter items by store
  const itemsToDisplay = activeList?.items.filter((i) => {
    if (filterStore === 'all') return true;
    return i.storeType === filterStore;
  }) || [];

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !activeList) return;

    const qty = parseFloat(itemQuantity) || 1;
    const estPrice = parseFloat(itemEstimatedPrice) || 0;

    addShoppingItem(activeList.id, {
      name: itemName.trim(),
      category: itemCategory,
      quantity: qty,
      unit: itemUnit,
      estimatedPrice: estPrice,
      storeType: itemStoreType,
      storeName: itemStoreName || undefined,
      isPurchased: false,
      priority: itemPriority,
    });

    setItemName('');
    setItemQuantity('1');
    setItemEstimatedPrice('');
    setItemStoreName('');
    setShowNewItemModal(false);
  };

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    addShoppingList(newListName.trim(), newListStoreType);
    setNewListName('');
    setShowNewListModal(false);
  };

  const getStoreBadge = (store: StoreType) => {
    switch (store) {
      case 'praca':
        return <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md">Praça / Mercado</span>;
      case 'cantina':
        return <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-md">Cantina</span>;
      case 'supermercado':
        return <span className="text-[10px] bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded-md">Supermercado</span>;
      default:
        return <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md">Outro</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Gestão de Compras Inteligente
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize listas separadas por praça informal, cantina do bairro ou supermercado.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeList && (
            <button
              onClick={() => transferPurchasedToPantry(activeList.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-all shadow-xs"
              title="Converter comprados em entradas na Despensa"
            >
              <PackagePlus className="w-4 h-4 text-amber-300" />
              <span>Enviar Comprados para Despensa</span>
            </button>
          )}

          <button
            onClick={() => setShowNewItemModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Produto</span>
          </button>
        </div>
      </div>

      {/* Lists Tabs & New List button */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 overflow-x-auto gap-2">
        <div className="flex items-center gap-2">
          {shoppingLists.map((list) => {
            const isSelected = list.id === activeList?.id;
            return (
              <button
                key={list.id}
                onClick={() => setSelectedListId(list.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{list.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-amber-400 text-slate-900' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {list.items.filter((i) => !i.isPurchased).length}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowNewListModal(true)}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 shrink-0 px-2 py-1"
        >
          <Plus className="w-3.5 h-3.5" /> Nova Lista
        </button>
      </div>

      {activeList ? (
        <>
          {/* List Summary Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Orçamento Previsto (Estimado)
              </span>
              <p className="text-xl font-black text-slate-900 font-mono mt-1">
                {formatKz(totalEstimated)}
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Efetivamente Gasto (Comprados)
              </span>
              <p className="text-xl font-black text-emerald-800 font-mono mt-1">
                {formatKz(totalActual)}
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Progresso das Compras
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-base font-bold text-slate-800">
                  {purchasedCount} de {totalItemsCount} produtos
                </span>
                <span className="text-xs font-bold text-emerald-700 font-mono">
                  {totalItemsCount > 0 ? Math.round((purchasedCount / totalItemsCount) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                <div
                  className="bg-emerald-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${totalItemsCount > 0 ? (purchasedCount / totalItemsCount) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Filter by store */}
          <div className="flex items-center justify-between gap-3 bg-slate-100 p-1.5 rounded-2xl">
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setFilterStore('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                  filterStore === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos ({activeList.items.length})
              </button>
              <button
                onClick={() => setFilterStore('praca')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                  filterStore === 'praca' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Praça / Mercado
              </button>
              <button
                onClick={() => setFilterStore('cantina')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                  filterStore === 'cantina' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cantina
              </button>
              <button
                onClick={() => setFilterStore('supermercado')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                  filterStore === 'supermercado' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Supermercado
              </button>
            </div>

            {shoppingLists.length > 1 && (
              <button
                onClick={() => {
                  if (confirm(`Eliminar a lista "${activeList.name}"?`)) {
                    deleteShoppingList(activeList.id);
                  }
                }}
                className="text-[11px] font-semibold text-rose-600 hover:underline px-2"
              >
                Eliminar Lista
              </button>
            )}
          </div>

          {/* Items List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="divide-y divide-slate-100">
              {itemsToDisplay.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Nenhum produto nesta categoria. Clique em &quot;Adicionar Produto&quot; acima.
                </div>
              ) : (
                itemsToDisplay.map((item) => {
                  return (
                    <div
                      key={item.id}
                      className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                        item.isPurchased ? 'bg-emerald-50/40' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Checkbox */}
                        <button
                          onClick={() => {
                            if (!item.isPurchased) {
                              const realPrice = prompt(
                                `Preço real pago por ${item.name} em Kwanzas (Kz):`,
                                String(item.estimatedPrice)
                              );
                              const parsed = realPrice !== null ? parseFloat(realPrice) : item.estimatedPrice;
                              toggleItemPurchased(activeList.id, item.id, isNaN(parsed) ? item.estimatedPrice : parsed);
                            } else {
                              toggleItemPurchased(activeList.id, item.id);
                            }
                          }}
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                            item.isPurchased
                              ? 'bg-emerald-700 border-emerald-700 text-white shadow-xs'
                              : 'border-slate-300 hover:border-emerald-600'
                          }`}
                        >
                          {item.isPurchased && <Check className="w-4 h-4 stroke-[3]" />}
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs sm:text-sm font-bold truncate ${
                                item.isPurchased ? 'line-through text-slate-400' : 'text-slate-900'
                              }`}
                            >
                              {item.name}
                            </span>
                            {getStoreBadge(item.storeType)}
                            {item.addedToPantry && (
                              <span className="text-[9px] bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded font-semibold">
                                Na Despensa
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                            <span className="font-semibold text-slate-700 font-mono">
                              {item.quantity} {item.unit}
                            </span>
                            {item.storeName && (
                              <>
                                <span>•</span>
                                <span>{item.storeName}</span>
                              </>
                            )}
                            {item.notes && (
                              <>
                                <span>•</span>
                                <span className="italic text-slate-400">{item.notes}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-xs sm:text-sm font-black font-mono text-slate-900">
                            {formatKz(item.isPurchased && item.actualPrice !== undefined ? item.actualPrice : item.estimatedPrice)}
                          </p>
                          {item.isPurchased && item.actualPrice !== undefined && item.actualPrice !== item.estimatedPrice && (
                            <p className="text-[10px] text-slate-400 font-mono">
                              Est: {formatKz(item.estimatedPrice)}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => deleteShoppingItem(activeList.id, item.id)}
                          className="p-1 text-slate-300 hover:text-rose-600 rounded transition-colors"
                          title="Remover produto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      ) : null}

      {/* Modal: Adicionar Produto à Lista */}
      {showNewItemModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900">Adicionar à Lista de Compras</h3>
              <button onClick={() => setShowNewItemModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Produto</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Fuba de Bombó, Chicharro, Óleo, Arroz..."
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantidade</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unidade</label>
                  <select
                    value={itemUnit}
                    onChange={(e) => setItemUnit(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-emerald-600"
                  >
                    <option value="kg">kg (Quilograma)</option>
                    <option value="g">gramas</option>
                    <option value="litros">Litros</option>
                    <option value="unidades">Unidades</option>
                    <option value="saco">Saco (25kg / 50kg)</option>
                    <option value="pacote">Pacote / Fardo</option>
                    <option value="lata">Lata</option>
                    <option value="caixa">Caixa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Preço Estimado em Kwanzas (Kz)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="ex: 4500"
                  value={itemEstimatedPrice}
                  onChange={(e) => setItemEstimatedPrice(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-sm focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Local de Compra</label>
                  <select
                    value={itemStoreType}
                    onChange={(e) => setItemStoreType(e.target.value as StoreType)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-emerald-600"
                  >
                    <option value="praca">Praça / Mercado</option>
                    <option value="cantina">Cantina do Bairro</option>
                    <option value="supermercado">Supermercado</option>
                    <option value="loja_bairro">Loja do Bairro</option>
                    <option value="outro">Outro Local</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prioridade</label>
                  <select
                    value={itemPriority}
                    onChange={(e) => setItemPriority(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-emerald-600"
                  >
                    <option value="alta">Alta (Essencial)</option>
                    <option value="media">Média</option>
                    <option value="baixa">Baixa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome da Praça ou Loja (Opcional)</label>
                <input
                  type="text"
                  placeholder="ex: Praça dos Congolenses, Kero, Mamadou..."
                  value={itemStoreName}
                  onChange={(e) => setItemStoreName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewItemModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-900 rounded-xl shadow-xs"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nova Lista de Compras */}
      {showNewListModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900">Nova Lista de Compras</h3>
              <button onClick={() => setShowNewListModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateList} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome da Lista</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Compras do Mês, Feira de Sábado, Cantina..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Destino Principal</label>
                <select
                  value={newListStoreType}
                  onChange={(e) => setNewListStoreType(e.target.value as StoreType)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-emerald-600"
                >
                  <option value="praca">Praça Informal / Mercado</option>
                  <option value="cantina">Cantina do Bairro</option>
                  <option value="supermercado">Supermercado</option>
                  <option value="outro">Diversos</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewListModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-900 rounded-xl shadow-xs"
                >
                  Criar Lista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
