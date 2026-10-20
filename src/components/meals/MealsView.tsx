import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatKz } from '../../utils/formatters';
import {
  UtensilsCrossed,
  Plus,
  Clock,
  Users,
  ChefHat,
  ShoppingCart,
  Calendar,
  BookOpen,
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react';
import { Recipe } from '../../types';

export const MealsView: React.FC = () => {
  const {
    recipes,
    addRecipe,
    mealPlan,
    updateMealPlanDay,
    shoppingLists,
    addShoppingItem,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'plan' | 'recipes'>('plan');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(recipes[0] || null);
  const [showAddRecipeModal, setShowAddRecipeModal] = useState(false);

  // Form State for new Recipe
  const [recName, setRecName] = useState('');
  const [recDesc, setRecDesc] = useState('');
  const [recTime, setRecTime] = useState('60');
  const [recServings, setRecServings] = useState('5');
  const [recIngredients, setRecIngredients] = useState('Fuba de milho (1 kg) - 1600 Kz\nPeixe seco (800 g) - 4500 Kz\nÓleo de palma (200 ml) - 1200 Kz');
  const [recInstructions, setRecInstructions] = useState('1. Preparar o refogado com cebola e alho.\n2. Juntar os ingredientes e deixar apurar em lume brando.\n3. Fazer o funge mexendo vigorosamente na panela.');

  const handleCreateRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recName.trim()) return;

    // Parse simple ingredients
    const ingLines = recIngredients.split('\n').filter((l) => l.trim().length > 0);
    const parsedIngs = ingLines.map((line) => {
      return {
        name: line.trim(),
        quantity: 1,
        unit: 'dose',
        estimatedCostKz: 1500,
      };
    });

    const parsedInst = recInstructions.split('\n').filter((l) => l.trim().length > 0);

    addRecipe({
      name: recName.trim(),
      description: recDesc.trim() || 'Prato tradicional preparado com carinho para a família.',
      category: 'almoco',
      prepTimeMinutes: parseInt(recTime, 10) || 60,
      servings: parseInt(recServings, 10) || 4,
      isTypicalAngolan: true,
      ingredients: parsedIngs,
      instructions: parsedInst,
    });

    setRecName('');
    setRecDesc('');
    setShowAddRecipeModal(false);
  };

  const handleSendRecipeToShoppingList = (recipe: Recipe) => {
    const list = shoppingLists[0];
    if (!list) {
      showToast('Crie primeiro uma lista de compras', 'error');
      return;
    }

    recipe.ingredients.forEach((ing) => {
      addShoppingItem(list.id, {
        name: ing.name,
        category: 'Alimentação',
        quantity: ing.quantity,
        unit: ing.unit,
        estimatedPrice: ing.estimatedCostKz,
        storeType: 'praca',
        isPurchased: false,
        priority: 'alta',
        notes: `Para a receita de ${recipe.name}`,
      });
    });

    showToast(`Ingredientes de "${recipe.name}" adicionados à lista de compras!`, 'success');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Refeições & Culinária Angolana
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cardápio semanal com funge, calulu, muamba, mufete da Ilha e cálculo estimado dos ingredientes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('plan')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'plan' ? 'bg-emerald-800 text-white' : 'bg-white border border-slate-200 text-slate-700'
            }`}
          >
            Plano Semanal
          </button>
          <button
            onClick={() => setActiveTab('recipes')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'recipes' ? 'bg-emerald-800 text-white' : 'bg-white border border-slate-200 text-slate-700'
            }`}
          >
            Livro de Receitas
          </button>
        </div>
      </div>

      {activeTab === 'plan' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-2xl flex items-center justify-between text-xs text-amber-950">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                <strong>Organização Semanal:</strong> Planear as refeições com antecedência reduz o desperdício alimentar e poupa no orçamento das compras da praça.
              </span>
            </div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mealPlan.map((day) => (
              <div
                key={day.date}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-sm font-bold text-slate-900">{day.dayOfWeek}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{day.date}</span>
                  </div>

                  <div className="space-y-3 mt-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                        Pequeno-Almoço
                      </span>
                      <input
                        type="text"
                        value={day.breakfast || ''}
                        onChange={(e) => updateMealPlanDay(day.date, 'breakfast', e.target.value)}
                        placeholder="ex: Pão com ovo e chá..."
                        className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-emerald-600"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                        Almoço (Prato Principal)
                      </span>
                      <input
                        type="text"
                        value={day.lunch || ''}
                        onChange={(e) => updateMealPlanDay(day.date, 'lunch', e.target.value)}
                        placeholder="ex: Funge com Calulu, Mufete..."
                        className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:outline-emerald-600 text-slate-900"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                        Jantar
                      </span>
                      <input
                        type="text"
                        value={day.dinner || ''}
                        onChange={(e) => updateMealPlanDay(day.date, 'dinner', e.target.value)}
                        placeholder="ex: Sopa leve, sobras do almoço..."
                        className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-emerald-600"
                      />
                    </div>
                  </div>
                </div>

                {day.notes && (
                  <p className="text-[10px] text-slate-400 italic mt-3 pt-2 border-t border-slate-100">
                    Nota: {day.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'recipes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recipes List Column */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Receitas da Nossa Terra
              </h3>
              <button
                onClick={() => setShowAddRecipeModal(true)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Nova Receita
              </button>
            </div>

            <div className="space-y-2">
              {recipes.map((recipe) => {
                const isSelected = selectedRecipe?.id === recipe.id;
                const totalCost = recipe.ingredients.reduce((acc, i) => acc + i.estimatedCostKz, 0);

                return (
                  <div
                    key={recipe.id}
                    onClick={() => setSelectedRecipe(recipe)}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-900 text-white border-emerald-900 shadow-md'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-bold truncate">{recipe.name}</h4>
                      {recipe.isTypicalAngolan && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            isSelected ? 'bg-amber-400 text-slate-900' : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          Típico
                        </span>
                      )}
                    </div>

                    <div className={`flex items-center gap-3 mt-2 text-[11px] ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {recipe.prepTimeMinutes} min
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {recipe.servings} pessoas
                      </span>
                      <span>•</span>
                      <span className="font-mono font-bold">~{formatKz(totalCost)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recipe Details Column */}
          <div className="lg:col-span-2">
            {selectedRecipe ? (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900">{selectedRecipe.name}</h3>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        {selectedRecipe.category.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {selectedRecipe.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleSendRecipeToShoppingList(selectedRecipe)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shrink-0 transition-colors shadow-xs"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-amber-300" />
                    <span>Adicionar à Lista de Compras</span>
                  </button>
                </div>

                {/* Key stats */}
                <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Tempo</span>
                    <span className="text-sm font-bold text-slate-800">{selectedRecipe.prepTimeMinutes} minutos</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Porções</span>
                    <span className="text-sm font-bold text-slate-800">{selectedRecipe.servings} pessoas</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Custo Estimado</span>
                    <span className="text-sm font-mono font-black text-emerald-800">
                      {formatKz(selectedRecipe.ingredients.reduce((acc, i) => acc + i.estimatedCostKz, 0))}
                    </span>
                  </div>
                </div>

                {/* Ingredients */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Ingredientes Necessários
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedRecipe.ingredients.map((ing, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-slate-800">{ing.name}</span>
                        <span className="text-slate-500 font-mono">{formatKz(ing.estimatedCostKz)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Modo de Preparação
                  </h4>
                  <ol className="space-y-2 list-decimal list-inside text-xs text-slate-700 leading-relaxed">
                    {selectedRecipe.instructions.map((step, idx) => (
                      <li key={idx} className="p-2 bg-slate-50 rounded-xl">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
                Selecione uma receita à esquerda para ver os ingredientes e modo de preparo.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Nova Receita */}
      {showAddRecipeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900">Nova Receita da Família</h3>
              <button onClick={() => setShowAddRecipeModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecipe} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Prato</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Mufete de Chicharro, Calulu, Feijoada..."
                  value={recName}
                  onChange={(e) => setRecName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tempo (Minutos)</label>
                  <input
                    type="number"
                    value={recTime}
                    onChange={(e) => setRecTime(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Porções (Pessoas)</label>
                  <input
                    type="number"
                    value={recServings}
                    onChange={(e) => setRecServings(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ingredientes (Um por linha)
                </label>
                <textarea
                  rows={3}
                  value={recIngredients}
                  onChange={(e) => setRecIngredients(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Modo de Preparação
                </label>
                <textarea
                  rows={3}
                  value={recInstructions}
                  onChange={(e) => setRecInstructions(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRecipeModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-900 rounded-xl shadow-xs"
                >
                  Guardar Receita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
