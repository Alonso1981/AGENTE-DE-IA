import React, { useState } from 'react';
import {
  History,
  MessageSquare,
  Search,
  Calendar,
  ArrowRight,
  Trash2,
  Plus,
  Clock,
  FolderKanban,
  FileText,
} from 'lucide-react';
import { Conversation, Project } from '../types';

interface HistoryViewProps {
  conversations: Conversation[];
  projects: Project[];
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  conversations,
  projects,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      (c.summary && c.summary.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-slate-100">Histórico de Diálogos & Sessões</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Recuperação seletiva de conversas passadas. No MINDOS, o histórico completo não sobrecarrega todas as requisições:
            ele é consultado e retomado sob demanda do usuário.
          </p>
        </div>
        <button
          onClick={onNewConversation}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 transition shadow-md shadow-cyan-950 shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nova Sessão
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Pesquisar por assunto ou palavras-chave das conversas passadas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/60"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono hidden sm:block">
          Total: {conversations.length} conversas
        </div>
      </div>

      {/* Conversations List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Nenhuma conversa encontrada no histórico.
          </div>
        ) : (
          filtered.map((conv) => {
            const project = projects.find((p) => p.id === conv.project_id);
            const formattedDate = new Date(conv.updated_at).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={conv.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-slate-100 truncate group-hover:text-cyan-300 transition">
                      {conv.title}
                    </h3>
                    {project && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {project.name}
                      </span>
                    )}
                  </div>
                  {conv.summary ? (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {conv.summary}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Conversa em andamento</p>
                  )}
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {formattedDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => onSelectConversation(conv.id)}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-xs font-medium flex items-center gap-1.5 transition border border-cyan-500/30"
                  >
                    <span>Retomar</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => onDeleteConversation(conv.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                    title="Excluir conversa do histórico"
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
  );
};
