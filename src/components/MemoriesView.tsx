import React, { useState } from 'react';
import {
  Brain,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Shield,
  Trash2,
  Edit2,
  Tag,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import { Memory, MemoryStatus, MemoryCategory } from '../types';

interface MemoriesViewProps {
  memories: Memory[];
  onCreateMemory: (memory: Partial<Memory>) => void;
  onUpdateMemory: (id: string, updates: Partial<Memory>) => void;
  onDeleteMemory: (id: string) => void;
}

export const MemoriesView: React.FC<MemoriesViewProps> = ({
  memories,
  onCreateMemory,
  onUpdateMemory,
  onDeleteMemory,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State for new memory
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryCategory>('general');
  const [newType, setNewType] = useState<MemoryStatus>('CONFIRMED');
  const [newSubject, setNewSubject] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newIsShared, setNewIsShared] = useState(false);

  // Filter memories
  const filteredMemories = memories.filter((m) => {
    if (selectedStatus !== 'ALL' && m.type !== selectedStatus) return false;
    if (selectedCategory !== 'ALL' && m.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchContent = m.content.toLowerCase().includes(q);
      const matchSubject = m.subject?.toLowerCase().includes(q);
      const matchTags = m.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchContent && !matchSubject && !matchTags) return false;
    }
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    onCreateMemory({
      content: newContent.trim(),
      category: newCategory,
      type: newType,
      subject: newSubject.trim() || undefined,
      tags: newTags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      is_shared_family: newIsShared,
      source: 'manual_input',
      confidence_score: 1.0,
    });

    setNewContent('');
    setNewSubject('');
    setNewTags('');
    setIsCreateModalOpen(false);
  };

  const statusColors: Record<MemoryStatus, { bg: string; text: string; border: string }> = {
    PERMANENT: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    CONFIRMED: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    CANDIDATE: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    TEMPORARY: { bg: 'bg-slate-800', text: 'text-slate-400', border: 'border-slate-700' },
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner and Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100">Memória Persistente & Curadoria</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            No MINDOS, frases casuais não viram regras permanentes sem validação. Cada registro possui
            estágio claro, nível de confiança, categoria e pode ser compartilhado com a família ou mantido estritamente privado.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 transition shadow-md shadow-cyan-950 shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Adicionar Memória
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar memórias, tags ou assuntos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <span className="text-[11px] text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Estado:
          </span>
          {['ALL', 'CONFIRMED', 'PERMANENT', 'CANDIDATE', 'TEMPORARY'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                selectedStatus === st
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'ALL' ? 'Todas' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMemories.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 space-y-2">
            <Info className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-xs">Nenhuma memória encontrada com os filtros selecionados.</p>
          </div>
        ) : (
          filteredMemories.map((mem) => {
            const sc = statusColors[mem.type] || statusColors.TEMPORARY;
            return (
              <div
                key={mem.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800/90 hover:border-slate-700 transition flex flex-col justify-between space-y-3 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${sc.bg} ${sc.text} ${sc.border}`}>
                      {mem.type}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      {mem.is_shared_family ? (
                        <span className="flex items-center gap-1 text-blue-400" title="Compartilhado com a família">
                          <Users className="w-3 h-3" /> Família
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-400" title="Memória estritamente privada">
                          <Shield className="w-3 h-3" /> Privada
                        </span>
                      )}
                    </div>
                  </div>

                  {mem.subject && (
                    <h4 className="text-xs font-semibold text-cyan-400 mb-1">
                      {mem.subject}
                    </h4>
                  )}

                  <p className="text-xs text-slate-200 leading-relaxed font-normal">
                    {mem.content}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 uppercase">
                      {mem.category}
                    </span>
                    {mem.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  {/* Actions (Promote / Demote / Delete) */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Confiança: {Math.round(mem.confidence_score * 100)}%
                    </span>

                    <div className="flex items-center gap-1.5">
                      {mem.type === 'CANDIDATE' && (
                        <button
                          onClick={() => onUpdateMemory(mem.id, { type: 'CONFIRMED' })}
                          className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition"
                          title="Confirmar como memória verificada"
                        >
                          Confirmar
                        </button>
                      )}

                      {mem.type === 'CONFIRMED' && (
                        <button
                          onClick={() => onUpdateMemory(mem.id, { type: 'PERMANENT' })}
                          className="px-2 py-0.5 rounded text-[11px] bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition"
                          title="Tornar permanente"
                        >
                          Permanente
                        </button>
                      )}

                      <button
                        onClick={() => onDeleteMemory(mem.id)}
                        className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800 transition"
                        title="Excluir memória"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Memory Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Brain className="w-4 h-4 text-cyan-400" />
                Cadastrar Nova Memória
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Conteúdo da Memória *</label>
                <textarea
                  required
                  rows={3}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Ex: Usuário prefere análises técnicas detalhadas e sempre em TypeScript..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Categoria</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as MemoryCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-cyan-500/60"
                  >
                    <option value="preference">Preferência</option>
                    <option value="correction">Correção</option>
                    <option value="fact">Fato</option>
                    <option value="project">Projeto</option>
                    <option value="general">Geral</option>
                    <option value="family">Família</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Estado Inicial</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as MemoryStatus)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-cyan-500/60"
                  >
                    <option value="CONFIRMED">CONFIRMED (Confirmada)</option>
                    <option value="PERMANENT">PERMANENT (Permanente)</option>
                    <option value="CANDIDATE">CANDIDATE (Candidata)</option>
                    <option value="TEMPORARY">TEMPORARY (Temporária)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Assunto (Opcional)</label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Ex: Engenharia de Software"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tags (separadas por vírgula)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="typescript, arquitetura, estilo"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="sharedFamily"
                  checked={newIsShared}
                  onChange={(e) => setNewIsShared(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-cyan-600 focus:ring-0"
                />
                <label htmlFor="sharedFamily" className="text-slate-300">
                  Compartilhar memória com membros da família
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition"
                >
                  Salvar Memória
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
