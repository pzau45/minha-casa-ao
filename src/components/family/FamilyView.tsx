import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Plus,
  ShieldCheck,
  UserCheck,
  User,
  Trash2,
  Home,
  MapPin,
  Sparkles,
  Lock,
  X
} from 'lucide-react';
import { HouseholdMember, MemberRole } from '../../types';

export const FamilyView: React.FC = () => {
  const {
    household,
    updateHousehold,
    members,
    currentMember,
    setCurrentMemberId,
    addMember,
    deleteMember,
    canEditHousehold,
  } = useApp();

  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showEditHouseModal, setShowEditHouseModal] = useState(false);

  // New Member Form
  const [name, setName] = useState('');
  const [role, setRole] = useState<MemberRole>('adult');
  const [avatar, setAvatar] = useState('👩🏾');
  const [relationship, setRelationship] = useState('Adulto da Família');
  const [phone, setPhone] = useState('');

  // House Form
  const [houseName, setHouseName] = useState(household.name);
  const [houseCity, setHouseCity] = useState(household.city);
  const [houseNeigh, setHouseNeigh] = useState(household.neighborhood);

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addMember({
      name: name.trim(),
      role,
      avatar,
      color: role === 'admin' ? '#0F4C3A' : role === 'adult' ? '#B45309' : '#2563EB',
      relationship: relationship.trim(),
      phone: phone.trim() || undefined,
    });

    setName('');
    setPhone('');
    setShowAddMemberModal(false);
  };

  const handleUpdateHousehold = (e: React.FormEvent) => {
    e.preventDefault();
    updateHousehold({
      name: houseName.trim(),
      city: houseCity.trim(),
      neighborhood: houseNeigh.trim(),
    });
    setShowEditHouseModal(false);
  };

  const getRoleBadge = (r: MemberRole) => {
    switch (r) {
      case 'admin':
        return <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Administrador (Total)</span>;
      case 'adult':
        return <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">Adulto (Finanças & Gestão)</span>;
      case 'limited':
        return <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">Acesso Limitado (Tarefas)</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Gestão Familiar & Perfis
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure o agregado familiar, permissões e alternar entre utilizadores da casa.
          </p>
        </div>

        {canEditHousehold() && (
          <button
            onClick={() => setShowAddMemberModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Membro</span>
          </button>
        )}
      </div>

      {/* Household Profile Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
            🏠
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900">{household.name}</h3>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Kwanza (AOA)
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{household.neighborhood}, {household.city} (Angola)</span>
            </p>
          </div>
        </div>

        {canEditHousehold() && (
          <button
            onClick={() => setShowEditHouseModal(true)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors self-start sm:self-auto"
          >
            Editar Dados da Residência
          </button>
        )}
      </div>

      {/* Switcher Banner */}
      <div className="bg-emerald-950 text-white p-5 rounded-3xl shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{currentMember.avatar}</span>
            <div>
              <p className="text-xs text-emerald-300 font-bold uppercase tracking-wider">
                Perfil Atualmente Ativo
              </p>
              <h4 className="text-base font-black">{currentMember.name}</h4>
              <p className="text-xs text-emerald-200/80">
                {currentMember.relationship} • {getRoleBadge(currentMember.role)}
              </p>
            </div>
          </div>
          <span className="text-xs text-emerald-300 bg-emerald-900 px-3 py-1 rounded-full border border-emerald-800">
            Sessão Ativa
          </span>
        </div>
      </div>

      {/* Members Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Membros do Agregado Familiar ({members.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => {
            const isActive = member.id === currentMember.id;
            return (
              <div
                key={member.id}
                className={`bg-white p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                  isActive ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-md' : 'border-slate-200 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{member.avatar}</span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{member.name}</h4>
                        <p className="text-xs text-slate-500">{member.relationship}</p>
                      </div>
                    </div>

                    {getRoleBadge(member.role)}
                  </div>

                  {member.phone && (
                    <p className="text-[11px] text-slate-400 font-mono mt-3">
                      Tel: {member.phone}
                    </p>
                  )}

                  <div className="mt-3 p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 leading-relaxed">
                    {member.role === 'admin'
                      ? 'Acesso total: Finanças, orçamentos, membros e cópias de segurança.'
                      : member.role === 'adult'
                      ? 'Acesso financeiro: Registar despesas, pagar contas e compras.'
                      : 'Acesso restrito: Concluir tarefas e consultar listas sem ver saldos.'}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentMemberId(member.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 font-extrabold cursor-default'
                        : 'bg-slate-100 text-slate-700 hover:bg-emerald-800 hover:text-white'
                    }`}
                  >
                    {isActive ? '✓ Perfil Atual' : 'Mudar para este Perfil'}
                  </button>

                  {canEditHousehold() && members.length > 1 && !isActive && (
                    <button
                      onClick={() => {
                        if (confirm(`Remover ${member.name} da casa?`)) {
                          deleteMember(member.id);
                        }
                      }}
                      className="p-1.5 text-slate-300 hover:text-rose-600 rounded transition-colors"
                      title="Remover membro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Adicionar Membro */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900">Novo Membro da Família</h3>
              <button onClick={() => setShowAddMemberModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Teresa Silva, Jelson..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Papel / Acesso</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as MemberRole)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-emerald-600"
                  >
                    <option value="admin">Administrador (Total)</option>
                    <option value="adult">Adulto (Finanças & Casa)</option>
                    <option value="limited">Membro (Limitado / Tarefas)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ícone / Avatar</label>
                  <select
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-emerald-600"
                  >
                    <option value="👨🏾‍💼">👨🏾‍💼 Pai / Homem</option>
                    <option value="👩🏾‍🏫">👩🏾‍🏫 Mãe / Mulher</option>
                    <option value="👦🏾">👦🏾 Menino / Jovem</option>
                    <option value="👧🏾">👧🏾 Menina / Jovem</option>
                    <option value="👵🏾">👵🏾 Avó / Anciã</option>
                    <option value="👴🏾">👴🏾 Avô / Ancião</option>
                    <option value="👶🏾">👶🏾 Bebé</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Grau de Parentesco</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Mãe, Filho, Sobrinho, Avó..."
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nº de Telefone (Opcional)</label>
                <input
                  type="text"
                  placeholder="ex: +244 923..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-900 rounded-xl shadow-xs"
                >
                  Guardar Membro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Residência */}
      {showEditHouseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900">Configurar Residência</h3>
              <button onClick={() => setShowEditHouseModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateHousehold} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome da Casa / Família</label>
                <input
                  type="text"
                  required
                  value={houseName}
                  onChange={(e) => setHouseName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cidade / Província</label>
                  <input
                    type="text"
                    required
                    value={houseCity}
                    onChange={(e) => setHouseCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bairro / Zona</label>
                  <input
                    type="text"
                    required
                    value={houseNeigh}
                    onChange={(e) => setHouseNeigh(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditHouseModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-900 rounded-xl shadow-xs"
                >
                  Guardar Dados
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
