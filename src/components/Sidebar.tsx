import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Brain,
  History,
  Users,
  ShieldCheck,
  Settings,
  BookOpen,
  UserCheck,
  GraduationCap,
  Mic,
  Zap,
  Wrench,
  FileText,
  BarChart3,
  Layers,
  Film,
  Bot,
} from 'lucide-react';
import { SystemStatus } from '../types';

export type NavTab =
  | 'dashboard'
  | 'chat'
  | 'agents'
  | 'video-agents'
  | 'memories'
  | 'history'
  | 'family'
  | 'audit'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  systemStatus: SystemStatus | null;
  onOpenFuturePhase: (phaseNum: number, title: string, desc: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  systemStatus,
  onOpenFuturePhase,
}) => {
  const activeItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'Chat & Orquestrador', icon: MessageSquare },
    { id: 'agents', label: 'Central de Agentes', icon: Bot },
    { id: 'video-agents', label: 'Agentes de Vídeo', icon: Film },
    { id: 'memories', label: 'Memórias', icon: Brain },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'family', label: 'Família & Perfis', icon: Users },
    { id: 'audit', label: 'Segurança & Auditoria', icon: ShieldCheck },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const futureModules = [
    {
      phase: 3,
      label: 'Conhecimento & Docs',
      icon: BookOpen,
      desc: 'Pipeline completo de upload, chunking, embeddings semânticos e busca vetorial RAG com preservação rigorosa de fontes.',
    },
    {
      phase: 4,
      label: 'Especialistas',
      icon: UserCheck,
      desc: 'Criação de Specialist Agents com base documental específica, instruções customizadas e isolamento de contexto.',
    },
    {
      phase: 5,
      label: 'Tutor & Concursos',
      icon: GraduationCap,
      desc: 'Módulo de tutoria adaptativa, ciclos de explicação, testagem, detecção de erros recorrentes e planos de estudo.',
    },
    {
      phase: 6,
      label: 'Voz & VAD',
      icon: Mic,
      desc: 'Processamento de áudio em tempo real com detecção de atividade de voz (VAD), modo OK e síntese vocal com baixa latência.',
    },
    {
      phase: 7,
      label: 'Automações',
      icon: Zap,
      desc: 'Workflows autônomos orientados a eventos, recorrências (cron), condições lógicas IF/THEN/ELSE e execução confiável.',
    },
    {
      phase: 8,
      label: 'Ferramentas & APIs',
      icon: Wrench,
      desc: 'Tool Registry seguro para chamadas de função autorizadas, integrações de APIs externas e controle estrito de permissões.',
    },
    {
      phase: 9,
      label: 'Agente de Conteúdo',
      icon: FileText,
      desc: 'Estratégia editorial completa com subagentes de pesquisa, escrita humanizada, SEO, imagens e publicação multicanal.',
    },
    {
      phase: 11,
      label: 'Analytics',
      icon: BarChart3,
      desc: 'Métricas de desempenho de conteúdo, conversões, engajamento e auditoria de aprendizado sem correlação falsa.',
    },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col h-screen select-none shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-900/30">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-white text-base">MINDOS</span>
              <span className="px-1.5 py-0.2 text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded">
                v0.1
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">AI Operating System</p>
          </div>
        </div>
      </div>

      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Phase 1 Active Navigation */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-cyan-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              Fase 1: Fundação
            </span>
          </div>
          <nav className="space-y-1">
            {activeItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.id === 'video-agents' && (
                    <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      NOVO
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Future Modules Section (Transparently marked as Planned) */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-400" />
              Módulos Futuros
            </span>
          </div>
          <div className="space-y-1">
            {futureModules.map((fm) => {
              const Icon = fm.icon;
              return (
                <button
                  key={fm.phase}
                  onClick={() => onOpenFuturePhase(fm.phase, fm.label, fm.desc)}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition group text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-300" />
                    <span className="truncate">{fm.label}</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-slate-300 group-hover:border-slate-700">
                    Fase {fm.phase}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* System Status Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/80">
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Banco:</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {systemStatus?.database.provider === 'supabase' ? 'Supabase Cloud' : 'Supabase Ready (Local)'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Modelo IA:</span>
            <span className="font-mono text-[10px] text-cyan-400">Gemini 3.8 Flash</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
            <span>Kernel:</span>
            <span className="text-slate-400 font-mono">Fase 1 Ativa</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
