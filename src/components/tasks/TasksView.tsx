import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/formatters';
import {
  CalendarCheck2,
  Plus,
  CheckCircle2,
  Trash2,
  User,
  Clock,
  Sparkles,
  Check,
  X
} from 'lucide-react';
import { HouseholdTask } from '../../types';

export const TasksView: React.FC = () => {
  const {
    tasks,
    addTask,
    toggleTaskStatus,
    deleteTask,
    members,
    currentMember,
  } = useApp();

  const [filterRoom, setFilterRoom] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pendente' | 'concluido'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedMemberId, setAssignedMemberId] = useState(currentMember.id);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<HouseholdTask['priority']>('media');
  const [room, setRoom] = useState<HouseholdTask['room']>('quintal');
  const [recurrence, setRecurrence] = useState<HouseholdTask['recurrence']>('semanal');

  const filteredTasks = tasks.filter((t) => {
    const matchesRoom = filterRoom === 'all' || t.room === filterRoom;
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchesRoom && matchesStatus;
  });

  const pendingCount = tasks.filter((t) => t.status !== 'concluido').length;
  const completedCount = tasks.filter((t) => t.status === 'concluido').length;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      assignedMemberId,
      dueDate,
      priority,
      status: 'pendente',
      recurrence,
      room,
    });

    setTitle('');
    setDescription('');
    setShowAddModal(false);
  };

  const getRoomLabel = (r: HouseholdTask['room']) => {
    switch (r) {
      case 'quintal':
        return 'Quintal & Tanque';
      case 'cozinha':
        return 'Cozinha';
      case 'sala':
        return 'Sala';
      case 'quarto':
        return 'Quartos';
      case 'casa_banho':
        return 'Casa de Banho';
      case 'geral':
      default:
        return 'Toda a Casa';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Tarefas & Organização Doméstica
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Distribua as responsabilidades da casa: limpeza, gerador, tanque de água e fardas escolares.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Tarefa</span>
        </button>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tarefas Pendentes
            </span>
            <p className="text-2xl font-black text-slate-900 font-mono mt-1">{pendingCount}</p>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5">
              Por realizar na semana
            </p>
          </div>
          <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tarefas Concluídas
            </span>
            <p className="text-2xl font-black text-emerald-700 font-mono mt-1">{completedCount}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
              Excelente esforço familiar!
            </p>
          </div>
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
          >
            <option value="all">Todas as Tarefas</option>
            <option value="pendente">Apenas Pendentes</option>
            <option value="concluido">Apenas Concluídas</option>
          </select>

          <select
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
          >
            <option value="all">Todas as Divisões</option>
            <option value="quintal">Quintal & Tanque</option>
            <option value="cozinha">Cozinha</option>
            <option value="sala">Sala</option>
            <option value="quarto">Quartos</option>
            <option value="casa_banho">Casa de Banho</option>
            <option value="geral">Geral</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredTasks.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              Nenhuma tarefa encontrada com estes filtros.
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isDone = task.status === 'concluido';
              const assigned = members.find((m) => m.id === task.assignedMemberId);

              return (
                <div
                  key={task.id}
                  className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                    isDone ? 'bg-emerald-50/40' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        isDone
                          ? 'bg-emerald-700 border-emerald-700 text-white shadow-xs'
                          : 'border-slate-300 hover:border-emerald-600'
                      }`}
                      title={isDone ? 'Marcar como pendente' : 'Marcar como concluída'}
                    >
                      {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4
                          className={`text-xs sm:text-sm font-bold truncate ${
                            isDone ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </h4>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                          {getRoomLabel(task.room)}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            task.priority === 'alta'
                              ? 'bg-rose-100 text-rose-700'
                              : task.priority === 'media'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {task.priority.toUpperCase()}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{task.description}</p>
                      )}

                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                        {assigned && (
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <span>{assigned.avatar}</span>
                            <span>{assigned.name}</span>
                          </span>
                        )}
                        <span>•</span>
                        <span>Prazo: {formatDate(task.dueDate)}</span>
                        {task.recurrence !== 'nenhuma' && (
                          <>
                            <span>•</span>
                            <span className="capitalize">Repete: {task.recurrence}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-600 rounded transition-colors"
                    title="Eliminar tarefa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal: Nova Tarefa */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900">Nova Tarefa Doméstica</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título da Tarefa</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Lavar tanque de água, trocar óleo do gerador..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Instruções / Descrição</label>
                <textarea
                  rows={2}
                  placeholder="Detalhes ou passos para a execução..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Responsável</label>
                  <select
                    value={assignedMemberId}
                    onChange={(e) => setAssignedMemberId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-emerald-600"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.avatar} {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Área / Divisão</label>
                  <select
                    value={room}
                    onChange={(e) => setRoom(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-emerald-600"
                  >
                    <option value="quintal">Quintal & Tanque</option>
                    <option value="cozinha">Cozinha</option>
                    <option value="sala">Sala</option>
                    <option value="quarto">Quartos</option>
                    <option value="casa_banho">Casa de Banho</option>
                    <option value="geral">Toda a Casa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prioridade</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-emerald-600"
                  >
                    <option value="alta">Alta</option>
                    <option value="media">Média</option>
                    <option value="baixa">Baixa</option>
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Repetição</label>
                  <select
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-emerald-600"
                  >
                    <option value="nenhuma">Nenhuma</option>
                    <option value="diaria">Diária</option>
                    <option value="semanal">Semanal</option>
                    <option value="mensal">Mensal</option>
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prazo</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-1.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
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
                  Guardar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
