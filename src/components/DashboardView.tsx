import React from 'react';
import {
  Brain,
  MessageSquare,
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Database,
  Cpu,
  Layers,
  FileCheck,
  Film,
  Bot,
} from 'lucide-react';
import { Memory, Conversation, FamilyMember, AuditLog, SystemStatus } from '../types';
import { NavTab } from './Sidebar';

interface DashboardViewProps {
  memories: Memory[];
  conversations: Conversation[];
  familyMembers: FamilyMember[];
  auditLogs: AuditLog[];
  systemStatus: SystemStatus | null;
  onNavigate: (tab: NavTab) => void;
  onSelectConversation: (id: string) => void;
  onOpenNewMemoryModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  memories,
  conversations,
  familyMembers,
  auditLogs,
  systemStatus,
  onNavigate,
  onSelectConversation,
  onOpenNewMemoryModal,
}) => {
  const confirmedCount = memories.filter((m) => m.type === 'CONFIRMED').length;
  const permanentCount = memories.filter((m) => m.type === 'PERMANENT').length;
  const candidateCount = memories.filter((m) => m.type === 'CANDIDATE').length;
  const temporaryCount = memories.filter((m) => m.type === 'TEMPORARY').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Foundation Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              SISTEMA OPERACIONAL PESSOAL DE IA • FASE 1: FUNDAÇÃO
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              MINDOS Kernel Ativo
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Fundação com orquestrador central, memória persistente por estágios, diretrizes estritas de escrita humanizada, isolamento familiar e infraestrutura Supabase PostgreSQL com Row Level Security.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('agents')}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-lg shadow-emerald-950/40"
            >
              <Bot className="w-4 h-4" />
              Central de Agentes
            </button>
            <button
              onClick={() => onNavigate('video-agents')}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-lg shadow-purple-950/40"
            >
              <Film className="w-4 h-4" />
              Agentes de Vídeo
            </button>
            <button
              onClick={() => onNavigate('chat')}
              className="px-3.5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition flex items-center gap-1.5 shadow-lg shadow-cyan-950"
            >
              <MessageSquare className="w-4 h-4" />
              Abrir Chat
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Memories */}
        <div
          onClick={() => onNavigate('memories')}
          className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Total de Memórias</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 transition">
              <Brain className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100">{memories.length}</div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
            <span className="text-emerald-400 font-medium">{confirmedCount + permanentCount} confirmadas</span>
            <span>•</span>
            <span className="text-amber-400 font-medium">{candidateCount} candidatas</span>
          </div>
        </div>

        {/* Conversations */}
        <div
          onClick={() => onNavigate('history')}
          className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Conversas Gravadas</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100">{conversations.length}</div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
            <span>Histórico recuperável seletivo</span>
          </div>
        </div>

        {/* Family Members */}
        <div
          onClick={() => onNavigate('family')}
          className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Membros da Família</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100">{familyMembers.length}</div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Isolamento e RLS ativo</span>
          </div>
        </div>

        {/* Audit Logs */}
        <div
          onClick={() => onNavigate('audit')}
          className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Ações Auditadas</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100">{auditLogs.length}</div>
          <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% rastreabilidade</span>
          </div>
        </div>
      </div>

      {/* Memory Status Breakdown Pill Bar */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200">Ciclo de Vida da Memória:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
            CONFIRMED: {confirmedCount}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium">
            PERMANENT: {permanentCount}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium">
            CANDIDATE: {candidateCount}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 font-medium">
            TEMPORARY: {temporaryCount}
          </span>
          <button
            onClick={onOpenNewMemoryModal}
            className="ml-2 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition"
          >
            + Adicionar Manual
          </button>
        </div>
      </div>

      {/* Two columns: Recent Memories & Orchestrator Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Memories & Candidates needing review */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Brain className="w-4 h-4 text-cyan-400" />
              Memórias Recentes do Kernel
            </h3>
            <button
              onClick={() => onNavigate('memories')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
            >
              Ver todas ({memories.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {memories.slice(0, 4).map((memory) => {
              const statusColors: Record<string, string> = {
                CONFIRMED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                PERMANENT: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                CANDIDATE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                TEMPORARY: 'bg-slate-800 text-slate-400 border-slate-700',
              };

              return (
                <div
                  key={memory.id}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition"
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                          statusColors[memory.type] || statusColors.TEMPORARY
                        }`}
                      >
                        {memory.type}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                        {memory.category}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Confiança: {Math.round(memory.confidence_score * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-normal">{memory.content}</p>
                  {memory.tags && memory.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {memory.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Orchestration Architecture Status & Recent Conversations */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            Kernel da Fase 1: Arquitetura
          </h3>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                Banco de Dados:
              </span>
              <span className="font-mono text-[11px] text-emerald-400">
                {systemStatus?.database.provider === 'supabase' ? 'Supabase Cloud' : 'Supabase Local Ready'}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                Orquestrador IA:
              </span>
              <span className="font-mono text-[11px] text-cyan-400">Gemini 3.8 Flash</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Segurança:
              </span>
              <span className="font-mono text-[11px] text-emerald-400">Row Level Security</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Escrita Humanizada:
              </span>
              <span className="font-mono text-[11px] text-slate-300">Regras 13-18 Ativas</span>
            </div>
          </div>

          {/* Quick Conversations */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">Conversas Recentes</span>
              <button
                onClick={() => onNavigate('history')}
                className="text-[11px] text-cyan-400 hover:underline"
              >
                Histórico
              </button>
            </div>
            <div className="space-y-2">
              {conversations.slice(0, 3).map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    onNavigate('chat');
                  }}
                  className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer transition"
                >
                  <p className="text-xs font-medium text-slate-200 truncate">{conv.title}</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{conv.summary || 'Sem resumo'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
