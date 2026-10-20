import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/formatters';
import {
  PhoneCall,
  FileText,
  Plus,
  Shield,
  Phone,
  ExternalLink,
  Trash2,
  Lock,
  Archive,
  X
} from 'lucide-react';
import { DocumentRecord, EmergencyContact } from '../../types';

export const DocsContactsView: React.FC = () => {
  const {
    emergencyContacts,
    addEmergencyContact,
    documents,
    addDocument,
    deleteDocument,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'contactos' | 'documentos'>('contactos');
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showAddDocModal, setShowAddDocModal] = useState(false);

  // Contact Form
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneAlt, setPhoneAlt] = useState('');
  const [contactCat, setContactCat] = useState<EmergencyContact['category']>('emergencia');
  const [contactNotes, setContactNotes] = useState('');

  // Doc Form
  const [docTitle, setDocTitle] = useState('');
  const [docCat, setDocCat] = useState<DocumentRecord['category']>('contrato');
  const [docRef, setDocRef] = useState('');
  const [docPlace, setDocPlace] = useState('');
  const [docNotes, setDocNotes] = useState('');

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    addEmergencyContact({
      name: name.trim(),
      role: role.trim() || 'Contacto Importante',
      phone: phone.trim(),
      phoneAlt: phoneAlt.trim() || undefined,
      category: contactCat,
      notes: contactNotes.trim() || undefined,
    });

    setName('');
    setRole('');
    setPhone('');
    setPhoneAlt('');
    setContactNotes('');
    setShowAddContactModal(false);
  };

  const handleCreateDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;

    addDocument({
      title: docTitle.trim(),
      category: docCat,
      referenceNumber: docRef.trim() || undefined,
      storagePlace: docPlace.trim() || undefined,
      notes: docNotes.trim() || undefined,
      issueDate: new Date().toISOString().split('T')[0],
    });

    setDocTitle('');
    setDocRef('');
    setDocPlace('');
    setDocNotes('');
    setShowAddDocModal(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Contactos Úteis & Documentos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Telefones de emergência de Angola (113, 115, 112, ENDE, EPAL) e arquivo de recibos de renda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('contactos')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'contactos'
                ? 'bg-emerald-800 text-white'
                : 'bg-white border border-slate-200 text-slate-700'
            }`}
          >
            Contactos ({emergencyContacts.length})
          </button>
          <button
            onClick={() => setActiveTab('documentos')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'documentos'
                ? 'bg-emerald-800 text-white'
                : 'bg-white border border-slate-200 text-slate-700'
            }`}
          >
            Documentos ({documents.length})
          </button>
        </div>
      </div>

      {activeTab === 'contactos' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddContactModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Contacto</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emergencyContacts.map((ct) => {
              const isUrgent = ct.category === 'emergencia' || ct.category === 'saude';
              return (
                <div
                  key={ct.id}
                  className={`bg-white p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                    isUrgent ? 'border-amber-300 shadow-sm' : 'border-slate-200 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{ct.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{ct.role}</p>
                      </div>

                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          ct.category === 'emergencia'
                            ? 'bg-rose-100 text-rose-800'
                            : ct.category === 'saude'
                            ? 'bg-red-100 text-red-800'
                            : ct.category === 'servico_publico'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {ct.category.replace('_', ' ')}
                      </span>
                    </div>

                    {ct.notes && (
                      <p className="text-xs text-slate-600 mt-2 italic leading-relaxed">
                        {ct.notes}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Telefone</span>
                      <span className="text-base font-black font-mono text-slate-900 tracking-wider">
                        {ct.phone}
                      </span>
                      {ct.phoneAlt && (
                        <span className="text-[10px] text-slate-400 block font-mono">
                          Alt: {ct.phoneAlt}
                        </span>
                      )}
                    </div>

                    <a
                      href={`tel:${ct.phone.replace(/\s+/g, '')}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Ligar</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'documentos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Registo organizado de onde estão guardados contratos de arrendamento, recibos e garantias da residência.
            </p>
            <button
              onClick={() => setShowAddDocModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Registar Documento</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-slate-100 text-slate-700 rounded-2xl shrink-0">
                        <FileText className="w-5 h-5 text-emerald-800" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{doc.title}</h4>
                        {doc.referenceNumber && (
                          <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                            Ref: <strong>{doc.referenceNumber}</strong>
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full capitalize">
                      {doc.category.replace('_', ' ')}
                    </span>
                  </div>

                  {doc.storagePlace && (
                    <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 flex items-center gap-2">
                      <Archive className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Local físico: <strong>{doc.storagePlace}</strong></span>
                    </div>
                  )}

                  {doc.notes && (
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">{doc.notes}</p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>{doc.issueDate ? `Data: ${formatDate(doc.issueDate)}` : ''}</span>
                  <button
                    onClick={() => deleteDocument(doc.id)}
                    className="p-1 text-slate-300 hover:text-rose-600 rounded transition-colors"
                    title="Remover documento"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Adicionar Contacto */}
      {showAddContactModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900">Novo Contacto de Emergência</h3>
              <button onClick={() => setShowAddContactModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome / Entidade</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Canalizador Sr. Mateus, Posto de Saúde..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Função / Serviço</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Fugas de água, Eletricista..."
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={contactCat}
                    onChange={(e) => setContactCat(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-emerald-600"
                  >
                    <option value="emergencia">Emergência Geral</option>
                    <option value="saude">Saúde / Hospital</option>
                    <option value="servico_publico">Serviço Público / Piquete</option>
                    <option value="tecnico">Técnico / Prestador</option>
                    <option value="vizinho">Vizinho de Confiança</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Telefone Principal</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: 923 111 222 ou 113"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Telefone Alternativo</label>
                  <input
                    type="text"
                    placeholder="Opcional"
                    value={phoneAlt}
                    onChange={(e) => setPhoneAlt(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Observações</label>
                <input
                  type="text"
                  placeholder="ex: Atende 24h por dia, vive perto da praça..."
                  value={contactNotes}
                  onChange={(e) => setContactNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddContactModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-900 rounded-xl shadow-xs"
                >
                  Guardar Contacto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Registar Documento */}
      {showAddDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900">Registar Documento Doméstico</h3>
              <button onClick={() => setShowAddDocModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDoc} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título do Documento</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Contrato de Renda 2026, Garantia do Gerador..."
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={docCat}
                    onChange={(e) => setDocCat(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-emerald-600"
                  >
                    <option value="contrato">Contrato de Arrendamento</option>
                    <option value="recibo_renda">Recibo de Renda</option>
                    <option value="garantia">Garantia de Equipamento</option>
                    <option value="fatura">Fatura de Compra</option>
                    <option value="identificacao">Identificação Familiar</option>
                    <option value="outro">Outro Documento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nº ou Referência</label>
                  <input
                    type="text"
                    placeholder="ex: REC-2026-99"
                    value={docRef}
                    onChange={(e) => setDocRef(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Onde está guardado? (Local Físico)</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Pasta azul na gaveta do quarto, armário da sala..."
                  value={docPlace}
                  onChange={(e) => setDocPlace(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notas Adicionais</label>
                <input
                  type="text"
                  placeholder="ex: Senhorio Sr. Batalha, renovação em Maio..."
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDocModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-900 rounded-xl shadow-xs"
                >
                  Guardar Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
