import React, { useState } from 'react';
import {
  LayoutDashboard,
  Wallet,
  ShoppingBag,
  Home,
  Users,
  Package,
  CalendarCheck2,
  UtensilsCrossed,
  PiggyBank,
  Wrench,
  FileText,
  BarChart3,
  PhoneCall,
  Code2,
  MoreHorizontal,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export type TabType =
  | 'dashboard'
  | 'finances'
  | 'shopping'
  | 'pantry'
  | 'bills'
  | 'tasks'
  | 'meals'
  | 'debts'
  | 'maintenance'
  | 'family'
  | 'reports'
  | 'docs'
  | 'flutter';

interface NavigationProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onSelectTab }) => {
  const { bills, pantryItems, tasks } = useApp();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Warning badges
  const pendingBillsCount = bills.filter((b) => b.status === 'pendente' || b.status === 'atrasado').length;
  const lowPantryCount = pantryItems.filter((p) => p.currentQty <= p.minQty).length;
  const pendingTasksCount = tasks.filter((t) => t.status !== 'concluido').length;

  const mainTabs = [
    { id: 'dashboard' as TabType, label: 'Início', icon: LayoutDashboard },
    { id: 'finances' as TabType, label: 'Finanças', icon: Wallet },
    { id: 'shopping' as TabType, label: 'Compras', icon: ShoppingBag },
    { id: 'bills' as TabType, label: 'Contas', icon: Home, badge: pendingBillsCount },
    { id: 'pantry' as TabType, label: 'Despensa', icon: Package, badge: lowPantryCount },
  ];

  const secondaryModules = [
    { id: 'tasks' as TabType, label: 'Tarefas Domésticas', icon: CalendarCheck2, desc: 'Limpeza, fardas e quintal', badge: pendingTasksCount },
    { id: 'meals' as TabType, label: 'Refeições & Pratos Típicos', icon: UtensilsCrossed, desc: 'Funge, Mufete, Calulu e planeador' },
    { id: 'debts' as TabType, label: 'Dívidas & Poupanças (Kixikila)', icon: PiggyBank, desc: 'Mealheiro, metas e empréstimos' },
    { id: 'maintenance' as TabType, label: 'Manutenção & Bens', icon: Wrench, desc: 'Gerador, tanque, bomba e técnicos' },
    { id: 'family' as TabType, label: 'Família & Membros', icon: Users, desc: 'Perfis e permissões' },
    { id: 'reports' as TabType, label: 'Relatórios & Extratos', icon: BarChart3, desc: 'Gráficos e exportação CSV' },
    { id: 'docs' as TabType, label: 'Documentos & Contactos Úteis', icon: PhoneCall, desc: 'Polícia 113, ENDE, EPAL e recibos' },
    { id: 'flutter' as TabType, label: 'Arquitetura Flutter & APK', icon: Code2, desc: 'Código Dart, Drift e guia Android' },
  ];

  return (
    <>
      {/* Desktop / Tablet Sub-Header Navigation */}
      <nav className="hidden lg:block bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between overflow-x-auto py-2">
          <div className="flex items-center gap-1">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-amber-400 text-slate-900' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="h-4 w-px bg-slate-200 mx-2" />

            {/* Secondary tabs in desktop */}
            {secondaryModules.slice(0, 4).map((mod) => {
              const Icon = mod.icon;
              const isActive = activeTab === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => onSelectTab(mod.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-800 text-white font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{mod.label.split('&')[0]}</span>
                  {mod.badge !== undefined && mod.badge > 0 && (
                    <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1 rounded-full">
                      {mod.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowMoreMenu(true)}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-800 hover:bg-emerald-50 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
              <span>Todos os Módulos</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg pb-safe">
        <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
          {mainTabs.slice(0, 4).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`relative flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-all ${
                  isActive ? 'text-emerald-800 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] scale-110 text-emerald-800' : ''}`} />
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] text-center">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-1 w-6 h-1 rounded-full bg-emerald-800"></span>
                )}
              </button>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setShowMoreMenu(true)}
            className={`flex flex-col items-center justify-center gap-1 text-[11px] font-semibold ${
              secondaryModules.some((m) => m.id === activeTab)
                ? 'text-emerald-800 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <MoreHorizontal className="w-5 h-5" />
              {(lowPantryCount > 0 || pendingTasksCount > 0) && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500"></span>
              )}
            </div>
            <span>Menu</span>
          </button>
        </div>
      </nav>

      {/* Full Modules Modal / Sheet */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom duration-200">
            <div className="p-4 bg-emerald-950 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Todos os Módulos da Casa</h3>
                <p className="text-xs text-emerald-300">Gestão integrada adaptada à realidade de Angola</p>
              </div>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-emerald-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {/* Main 5 modules */}
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 pt-1">
                Principais
              </p>
              <div className="grid grid-cols-2 gap-2">
                {mainTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        onSelectTab(tab.id);
                        setShowMoreMenu(false);
                      }}
                      className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                        isActive
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className={`p-2 rounded-xl ${isActive ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-700'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs block truncate">{tab.label}</span>
                        {tab.badge !== undefined && tab.badge > 0 && (
                          <span className="text-[10px] text-rose-600 font-bold">{tab.badge} pendente</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Secondary modules */}
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 pt-4">
                Gestão Familiar, Alimentação e Manutenção
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {secondaryModules.map((mod) => {
                  const Icon = mod.icon;
                  const isActive = activeTab === mod.id;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => {
                        onSelectTab(mod.id);
                        setShowMoreMenu(false);
                      }}
                      className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                        isActive
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${isActive ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-700'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold truncate">{mod.label}</p>
                          {mod.badge !== undefined && mod.badge > 0 && (
                            <span className="text-[9px] bg-rose-100 text-rose-700 font-bold px-1.5 rounded-full">
                              {mod.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">{mod.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowMoreMenu(false)}
                className="w-full py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700"
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
