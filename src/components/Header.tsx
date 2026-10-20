import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  Home,
  ShieldCheck,
  Download,
  Upload,
  RotateCcw,
  User,
  X,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

import { Smartphone } from 'lucide-react';

interface HeaderProps {
  onOpenFlutterDocs: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenAPKModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenFlutterDocs, onNavigateTab, onOpenAPKModal }) => {
  const {
    household,
    members,
    currentMember,
    setCurrentMemberId,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    exportBackupJSON,
    importBackupJSON,
    resetAllDataToDefault,
  } = useApp();

  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          importBackupJSON(content);
          setShowSettingsModal(false);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Logo & House Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <Home className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                  Minha Casa <span className="text-emerald-700">AO</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Offline 100%
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[160px] sm:max-w-xs">
                {household.name} • {household.city}
              </p>
            </div>
          </div>

          {/* Right actions: Member Switcher, Notifications, Settings, Flutter Dossier */}
          <div className="flex items-center gap-2">
            {/* Obter / Instalar APK Android */}
            <button
              onClick={onOpenAPKModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-colors shadow-xs"
              title="Instalar ou Obter APK Android"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Instalar APK</span>
            </button>

            {/* Quick Flutter / Mobile Architecture button */}
            <button
              onClick={onOpenFlutterDocs}
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
              title="Ver Arquitetura Flutter, Drift e APK Android"
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span>Arquitetura Flutter</span>
            </button>

            {/* Member Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors text-left"
              >
                <span className="text-base sm:text-lg">{currentMember.avatar}</span>
                <span className="hidden sm:inline-block text-xs font-semibold text-slate-800 max-w-[90px] truncate">
                  {currentMember.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Mudar Perfil da Família
                    </p>
                  </div>
                  {members.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setCurrentMemberId(m.id);
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 transition-colors ${
                        m.id === currentMember.id ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{m.avatar}</span>
                        <div>
                          <p className="text-xs font-medium">{m.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {m.role === 'admin' ? 'Administrador' : m.role === 'adult' ? 'Adulto' : 'Membro'}
                          </p>
                        </div>
                      </div>
                      {m.id === currentMember.id && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      )}
                    </button>
                  ))}
                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigateTab('family');
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                    >
                      Gerir Família e Permissões →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifModal(true)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Notificações e Avisos da Casa"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-rose-600 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Settings & Backup */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Definições e Cópia de Segurança"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Notifications Modal */}
      {showNotifModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">Avisos e Lembretes da Casa</h3>
              </div>
              <button
                onClick={() => setShowNotifModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <p className="text-center py-8 text-sm text-slate-400">Não há avisos pendentes.</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markNotificationRead(n.id);
                      if (n.linkTab) {
                        onNavigateTab(n.linkTab);
                        setShowNotifModal(false);
                      }
                    }}
                    className={`py-3 px-2 flex items-start gap-3 cursor-pointer hover:bg-slate-50 transition-colors rounded-lg ${
                      !n.read ? 'bg-amber-50/60' : ''
                    }`}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                        n.type === 'urgente'
                          ? 'bg-rose-500'
                          : n.type === 'aviso'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                        {!n.read && (
                          <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 rounded">
                            Novo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={markAllNotificationsRead}
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                Marcar todas como lidas
              </button>
              <button
                onClick={() => setShowNotifModal(false)}
                className="text-xs font-semibold px-3 py-1.5 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings / Backup Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-emerald-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">Cópia de Segurança e Dados</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 leading-relaxed">
                <strong>Privacidade e Armazenamento Local:</strong> Todos os seus dados financeiros, contas e listas ficam guardados com segurança no seu telemóvel/computador. Nenhum dado bancário é pedido.
              </div>

              <div className="space-y-3 pt-2">
                {/* Export JSON */}
                <button
                  onClick={exportBackupJSON}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                      <Download className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-900">Descarregar Cópia de Segurança (JSON)</p>
                      <p className="text-[11px] text-slate-500">Guarde todas as transações, listas e receitas</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700">Exportar</span>
                </button>

                {/* Import JSON */}
                <label className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-800 rounded-lg">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-900">Restaurar Cópia de Segurança</p>
                      <p className="text-[11px] text-slate-500">Recupere dados a partir de um ficheiro anterior</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-blue-700">Importar</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Reset to defaults */}
                <button
                  onClick={() => {
                    if (confirm('Tem a certeza que deseja repor os dados de exemplo padrão de Angola? Os dados atuais serão substituídos.')) {
                      resetAllDataToDefault();
                      setShowSettingsModal(false);
                    }
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/50 transition-colors text-rose-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-100 text-rose-800 rounded-lg">
                      <RotateCcw className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold">Repor Dados Iniciais de Angola</p>
                      <p className="text-[11px] text-rose-600">Restaurar exemplos da Família Kapassa Silva</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold">Repor</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl hover:bg-slate-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
