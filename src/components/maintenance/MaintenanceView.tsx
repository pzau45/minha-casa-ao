import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatKz, formatDate } from '../../utils/formatters';
import {
  Wrench,
  Plus,
  ShieldCheck,
  AlertTriangle,
  Phone,
  Trash2,
  Cpu,
  Calendar,
  DollarSign,
  X
} from 'lucide-react';
import { Asset, MaintenanceRecord } from '../../types';

export const MaintenanceView: React.FC = () => {
  const {
    assets,
    addAsset,
    deleteAsset,
    maintenanceRecords,
    addMaintenanceRecord,
    wallets,
    canAccessFinances,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'bens' | 'historico'>('bens');
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);

  // Asset Form State
  const [assetName, setAssetName] = useState('');
  const [assetCategory, setAssetCategory] = useState<Asset['category']>('gerador');
  const [assetBrand, setAssetBrand] = useState('');
  const [assetModel, setAssetModel] = useState('');
  const [assetSerial, setAssetSerial] = useState('');
  const [assetRoom, setAssetRoom] = useState('Quintal');
  const [assetStatus, setAssetStatus] = useState<Asset['status']>('bom');
  const [assetNotes, setAssetNotes] = useState('');

  // Maintenance Record Form State
  const [recordAssetId, setRecordAssetId] = useState<string>(assets[0]?.id || '');
  const [recordTitle, setRecordTitle] = useState('');
  const [recordCost, setRecordCost] = useState('');
  const [recordTechName, setRecordTechName] = useState('');
  const [recordTechPhone, setRecordTechPhone] = useState('');
  const [recordServiceType, setRecordServiceType] = useState<MaintenanceRecord['serviceType']>('preventiva');
  const [recordDesc, setRecordDesc] = useState('');
  const [recordWalletId, setRecordWalletId] = useState(wallets[0]?.id || '');

  const totalMaintenanceCost = maintenanceRecords.reduce((acc, r) => acc + r.cost, 0);

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim()) return;

    addAsset({
      name: assetName.trim(),
      category: assetCategory,
      brand: assetBrand.trim() || undefined,
      model: assetModel.trim() || undefined,
      serialNumber: assetSerial.trim() || undefined,
      room: assetRoom,
      status: assetStatus,
      notes: assetNotes.trim() || undefined,
    });

    setAssetName('');
    setAssetBrand('');
    setAssetModel('');
    setAssetSerial('');
    setAssetNotes('');
    setShowAddAssetModal(false);
  };

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const costNum = parseFloat(recordCost) || 0;
    if (!recordTitle.trim()) return;

    addMaintenanceRecord(
      {
        assetId: recordAssetId || undefined,
        title: recordTitle.trim(),
        cost: costNum,
        date: new Date().toISOString().split('T')[0],
        technicianName: recordTechName.trim() || undefined,
        technicianPhone: recordTechPhone.trim() || undefined,
        serviceType: recordServiceType,
        description: recordDesc.trim() || 'Serviço de manutenção concluído.',
      },
      recordWalletId
    );

    setRecordTitle('');
    setRecordCost('');
    setRecordTechName('');
    setRecordTechPhone('');
    setRecordDesc('');
    setShowAddRecordModal(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Manutenção da Casa & Equipamentos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerador elétrico, bomba de água do tanque, ar condicionado e contactos de técnicos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('bens')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'bens' ? 'bg-emerald-800 text-white' : 'bg-white border border-slate-200 text-slate-700'
            }`}
          >
            Equipamentos ({assets.length})
          </button>
          <button
            onClick={() => setActiveTab('historico')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'historico' ? 'bg-emerald-800 text-white' : 'bg-white border border-slate-200 text-slate-700'
            }`}
          >
            Histórico & Gastos
          </button>
        </div>
      </div>

      {activeTab === 'bens' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddAssetModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Registar Equipamento</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assets.map((ast) => (
              <div
                key={ast.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{ast.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {ast.brand} {ast.model ? `• ${ast.model}` : ''}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ast.status === 'bom'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ast.status === 'precisa_manutencao'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {ast.status === 'bom' ? 'Operacional' : ast.status === 'precisa_manutencao' ? 'Revisão' : 'Avariado'}
                    </span>
                  </div>

                  <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Localização:</span>
                      <strong className="text-slate-800">{ast.room}</strong>
                    </div>
                    {ast.serialNumber && (
                      <div className="flex justify-between text-slate-500 font-mono text-[10px]">
                        <span>Nº Série:</span>
                        <span>{ast.serialNumber}</span>
                      </div>
                    )}
                    {ast.notes && (
                      <p className="text-[11px] text-slate-600 italic pt-1 border-t border-slate-200/60">
                        {ast.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      setRecordAssetId(ast.id);
                      setRecordTitle(`Manutenção em ${ast.name}`);
                      setShowAddRecordModal(true);
                    }}
                    className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <Wrench className="w-3.5 h-3.5" /> Registar Revisão
                  </button>

                  <button
                    onClick={() => deleteAsset(ast.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-600 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'historico' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Gasto em Reparações Domésticas
              </span>
              <p className="text-2xl font-black text-slate-900 font-mono mt-1">
                {formatKz(totalMaintenanceCost)}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {maintenanceRecords.length} intervenções registadas
              </p>
            </div>
            <button
              onClick={() => setShowAddRecordModal(true)}
              className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors"
            >
              + Registar Reparação
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="divide-y divide-slate-100">
              {maintenanceRecords.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400">
                  Nenhuma intervenção registada ainda.
                </div>
              ) : (
                maintenanceRecords.map((rec) => {
                  const asset = assets.find((a) => a.id === rec.assetId);
                  return (
                    <div key={rec.id} className="p-4 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {rec.title}
                          </h4>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full capitalize">
                            {rec.serviceType}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 mt-0.5">{rec.description}</p>

                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                          <span>{formatDate(rec.date)}</span>
                          {asset && (
                            <>
                              <span>•</span>
                              <span className="text-slate-700 font-medium">{asset.name}</span>
                            </>
                          )}
                          {rec.technicianName && (
                            <>
                              <span>•</span>
                              <span className="text-slate-700 font-medium">
                                Técnico: {rec.technicianName} {rec.technicianPhone ? `(${rec.technicianPhone})` : ''}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <span className="text-xs sm:text-sm font-black font-mono text-slate-900 shrink-0">
                        {formatKz(rec.cost)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Registar Equipamento */}
      {showAddAssetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900">Novo Equipamento Doméstico</h3>
              <button onClick={() => setShowAddAssetModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Equipamento</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Gerador Kipor 5kVA, Bomba Pedrollo, Ar Condicionado..."
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={assetCategory}
                    onChange={(e) => setAssetCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-emerald-600"
                  >
                    <option value="gerador">Gerador Elétrico</option>
                    <option value="bomba_agua">Bomba de Água</option>
                    <option value="climatizacao">Ar Condicionado</option>
                    <option value="eletrodomestico">Geleira / Congelador</option>
                    <option value="mobiliario">Mobiliário</option>
                    <option value="outro">Outro Bem</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estado Atual</label>
                  <select
                    value={assetStatus}
                    onChange={(e) => setAssetStatus(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-emerald-600"
                  >
                    <option value="bom">Bom / Operacional</option>
                    <option value="precisa_manutencao">Precisa de Manutenção</option>
                    <option value="avariado">Avariado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Marca</label>
                  <input
                    type="text"
                    placeholder="ex: Kipor, Gree, Beko..."
                    value={assetBrand}
                    onChange={(e) => setAssetBrand(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Divisão / Local</label>
                  <input
                    type="text"
                    placeholder="ex: Quintal, Cozinha..."
                    value={assetRoom}
                    onChange={(e) => setAssetRoom(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notas / Intervalo de Revisão</label>
                <input
                  type="text"
                  placeholder="ex: Troca de óleo a cada 50h de funcionamento"
                  value={assetNotes}
                  onChange={(e) => setAssetNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAssetModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-900 rounded-xl shadow-xs"
                >
                  Guardar Equipamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Registar Reparação */}
      {showAddRecordModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900">Registar Reparação / Manutenção</h3>
              <button onClick={() => setShowAddRecordModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Equipamento</label>
                <select
                  value={recordAssetId}
                  onChange={(e) => setRecordAssetId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-emerald-600"
                >
                  <option value="">Manutenção Geral da Casa</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.room})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título do Serviço</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Troca de óleo do gerador, reparação de fuga na canalização..."
                  value={recordTitle}
                  onChange={(e) => setRecordTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Custo Total (Kz)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="ex: 14000"
                    value={recordCost}
                    onChange={(e) => setRecordCost(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-sm focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Serviço</label>
                  <select
                    value={recordServiceType}
                    onChange={(e) => setRecordServiceType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-emerald-600"
                  >
                    <option value="preventiva">Preventiva</option>
                    <option value="corretiva">Reparação / Corretiva</option>
                    <option value="limpeza">Limpeza Técnica</option>
                    <option value="instalacao">Nova Instalação</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Técnico</label>
                  <input
                    type="text"
                    placeholder="ex: Mestre Paulino"
                    value={recordTechName}
                    onChange={(e) => setRecordTechName(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Telefone do Técnico</label>
                  <input
                    type="text"
                    placeholder="ex: 923..."
                    value={recordTechPhone}
                    onChange={(e) => setRecordTechPhone(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Debitar da Carteira</label>
                <select
                  value={recordWalletId}
                  onChange={(e) => setRecordWalletId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-emerald-600"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({formatKz(w.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRecordModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-900 rounded-xl shadow-xs"
                >
                  Guardar Manutenção
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
