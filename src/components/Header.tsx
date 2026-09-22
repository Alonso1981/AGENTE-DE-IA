import React from 'react';
import {
  ShieldCheck,
  User,
  Users,
  Plus,
  Sparkles,
  Database,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { UserProfile, Family, SystemStatus } from '../types';
import { NavTab } from './Sidebar';

interface HeaderProps {
  currentTab: NavTab;
  profile: UserProfile | null;
  family: Family | null;
  systemStatus: SystemStatus | null;
  onNewChat: () => void;
  onNewMemory: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  profile,
  family,
  systemStatus,
  onNewChat,
  onNewMemory,
}) => {
  const tabTitles: Record<NavTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Painel Central',
      subtitle: 'Visão executiva do sistema, métricas da fundação e memórias ativas',
    },
    chat: {
      title: 'Chat com Orquestrador Central',
      subtitle: 'Diálogo contextual com extração de memórias e diretrizes de escrita humanizada',
    },
    agents: {
      title: 'Central de Agentes & Especialistas',
      subtitle: 'Interaja diretamente com cada agente especialista com personas e regras de negócios customizadas',
    },
    'video-agents': {
      title: 'Agentes de Produção de Vídeos',
      subtitle: 'Criação de roteiros para vídeos curtos (Reels/TikTok) e longos (YouTube) com prompts para Veo & Runway',
    },
    memories: {
      title: 'Sistema de Memória',
      subtitle: 'Memória persistente com ciclo de vida: Temporária, Candidata, Confirmada e Permanente',
    },
    history: {
      title: 'Histórico & Conversas',
      subtitle: 'Recuperação seletiva de diálogos passados com busca e auditoria temporal',
    },
    family: {
      title: 'Estrutura Familiar & Perfis',
      subtitle: 'Isolamento de privacidade, membros da família e preferências de interação',
    },
    audit: {
      title: 'Segurança & Auditoria',
      subtitle: 'Rastreabilidade de execuções, políticas RLS e infraestrutura Supabase PostgreSQL',
    },
    settings: {
      title: 'Configurações do Kernel',
      subtitle: 'Variáveis de ambiente, chaves de API, banco de dados e roadmap de fases',
    },
  };

  const current = tabTitles[currentTab] || { title: 'MINDOS', subtitle: 'AI Operating System' };
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between z-10 shrink-0">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold text-slate-100">{current.title}</h1>
          <span className="text-slate-600">/</span>
          <span className="text-xs text-slate-400 hidden sm:inline">{current.subtitle}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 mr-2">
          <button
            onClick={onNewMemory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Nova Memória</span>
          </button>
          <button
            onClick={onNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm shadow-cyan-950 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Novo Chat</span>
          </button>
          <button
            onClick={toggleFullscreen}
            title="Expandir para Tela Cheia"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-amber-400" /> : <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />}
            <span className="hidden md:inline">{isFullscreen ? 'Sair Tela Cheia' : 'Tela Cheia'}</span>
          </button>
        </div>

        {/* Family Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 text-xs">
          <Users className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-medium">{family?.name || 'Família'}</span>
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs">
          <div className="w-6 h-6 rounded-full bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-[11px]">
            {profile?.full_name ? profile.full_name.charAt(0) : 'U'}
          </div>
          <span className="font-medium hidden sm:inline max-w-[140px] truncate">
            {profile?.full_name || 'Usuário'}
          </span>
          <span title="RLS Ativo e Isolado" className="flex items-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </span>
        </div>
      </div>
    </header>
  );
};
