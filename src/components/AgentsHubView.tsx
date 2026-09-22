import React, { useState } from 'react';
import {
  Sparkles,
  Brain,
  Store,
  Film,
  FileText,
  Zap,
  Send,
  RefreshCw,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Clock,
  MessageSquare,
  BookmarkPlus,
  Flame,
} from 'lucide-react';
import { AgentId, AgentDefinition, ChatMessage, Memory } from '../types';
import { AVAILABLE_AGENTS } from '../data/agents';

interface AgentsHubViewProps {
  onNavigateToChat: (initialMessage?: string, agentId?: AgentId) => void;
  onSaveToMemories?: (title: string, content: string) => Promise<void>;
}

export const AgentsHubView: React.FC<AgentsHubViewProps> = ({
  onNavigateToChat,
  onSaveToMemories,
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<AgentId>('business');
  const [promptText, setPromptText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<Record<AgentId, ChatMessage[]>>({
    orchestrator: [],
    business: [],
    video: [],
    content: [],
    automation: [],
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const selectedAgent = AVAILABLE_AGENTS.find((a) => a.id === selectedAgentId) || AVAILABLE_AGENTS[0];

  const getAgentIcon = (id: AgentId, className = 'w-5 h-5') => {
    switch (id) {
      case 'business':
        return <Store className={className} />;
      case 'video':
        return <Film className={className} />;
      case 'content':
        return <FileText className={className} />;
      case 'automation':
        return <Zap className={className} />;
      case 'orchestrator':
      default:
        return <Brain className={className} />;
    }
  };

  const getAgentColorClasses = (id: AgentId) => {
    switch (id) {
      case 'business':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          text: 'text-emerald-400',
          accent: 'emerald',
          button: 'bg-emerald-600 hover:bg-emerald-500',
          activeTab: 'bg-emerald-500/20 border-emerald-500 text-emerald-300',
        };
      case 'video':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          text: 'text-amber-400',
          accent: 'amber',
          button: 'bg-amber-600 hover:bg-amber-500',
          activeTab: 'bg-amber-500/20 border-amber-500 text-amber-300',
        };
      case 'content':
        return {
          bg: 'bg-purple-500/10',
          border: 'border-purple-500/30',
          text: 'text-purple-400',
          accent: 'purple',
          button: 'bg-purple-600 hover:bg-purple-500',
          activeTab: 'bg-purple-500/20 border-purple-500 text-purple-300',
        };
      case 'automation':
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          text: 'text-blue-400',
          accent: 'blue',
          button: 'bg-blue-600 hover:bg-blue-500',
          activeTab: 'bg-blue-500/20 border-blue-500 text-blue-300',
        };
      case 'orchestrator':
      default:
        return {
          bg: 'bg-cyan-500/10',
          border: 'border-cyan-500/30',
          text: 'text-cyan-400',
          accent: 'cyan',
          button: 'bg-cyan-600 hover:bg-cyan-500',
          activeTab: 'bg-cyan-500/20 border-cyan-500 text-cyan-300',
        };
    }
  };

  const handleSendPrompt = async (textToSend?: string) => {
    const text = (textToSend || promptText).trim();
    if (!text || isLoading) return;

    setPromptText('');
    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      conversation_id: `agent-session-${selectedAgentId}`,
      role: 'user',
      agent_id: selectedAgentId,
      content: text,
      created_at: new Date().toISOString(),
    };

    setHistory((prev) => ({
      ...prev,
      [selectedAgentId]: [...(prev[selectedAgentId] || []), userMessage],
    }));

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: `agent-hub-${selectedAgentId}`,
          message: text,
          agentId: selectedAgentId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP ${res.status}`);
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = data.responseMessage || {
        id: `asst-${Date.now()}`,
        conversation_id: `agent-session-${selectedAgentId}`,
        role: 'assistant',
        agent_id: selectedAgentId,
        content: 'Resposta processada com sucesso.',
        created_at: new Date().toISOString(),
      };

      setHistory((prev) => ({
        ...prev,
        [selectedAgentId]: [...(prev[selectedAgentId] || []), assistantMessage],
      }));
    } catch (err: any) {
      console.error('Error invoking agent:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        conversation_id: `agent-session-${selectedAgentId}`,
        role: 'assistant',
        agent_id: selectedAgentId,
        content: `⚠️ Erro ao acionar o agente: ${err.message || 'Falha de comunicação'}. Por favor, tente novamente.`,
        created_at: new Date().toISOString(),
      };
      setHistory((prev) => ({
        ...prev,
        [selectedAgentId]: [...(prev[selectedAgentId] || []), errorMessage],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveMemory = async (msg: ChatMessage) => {
    if (!onSaveToMemories) return;
    try {
      await onSaveToMemories(
        `Diretriz do Agente ${selectedAgent.name}`,
        msg.content.slice(0, 300) + '...'
      );
      setSavedId(msg.id);
      setTimeout(() => setSavedId(null), 2000);
    } catch (err) {
      console.error('Error saving to memories:', err);
    }
  };

  const agentMessages = history[selectedAgentId] || [];
  const currentColors = getAgentColorClasses(selectedAgentId);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
              ● Agentes Especialistas Ativos
            </span>
            <span className="text-xs text-slate-400">Gemini 2.5 Flash Lite • Resposta Instantânea</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Central de Agentes & Especialistas
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Selecione qualquer agente abaixo para enviar seu prompt diretamente. Cada especialista opera com persona
            customizada, regras estritas de escrita humanizada e rastreabilidade total.
          </p>
        </div>

        <button
          onClick={() => onNavigateToChat()}
          className="self-start lg:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
        >
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <span>Abrir Orquestrador Geral</span>
        </button>
      </div>

      {/* Agents Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {AVAILABLE_AGENTS.map((agent) => {
          const isSelected = agent.id === selectedAgentId;
          const colors = getAgentColorClasses(agent.id);
          const msgCount = (history[agent.id] || []).filter((m) => m.role === 'assistant').length;

          return (
            <button
              key={agent.id}
              onClick={() => setSelectedAgentId(agent.id)}
              className={`text-left p-3.5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? `${colors.bg} ${colors.border} shadow-lg ring-1 ring-${colors.accent}-500/40`
                  : 'bg-slate-900/70 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl ${colors.bg} ${colors.border} border ${colors.text}`}>
                    {getAgentIcon(agent.id, 'w-4 h-4')}
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                    {agent.badge}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-xs text-white line-clamp-1">{agent.name}</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                    {agent.role}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1 text-emerald-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Pronto
                </span>
                {msgCount > 0 && (
                  <span className="text-slate-400 font-mono">{msgCount} respostas</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Interaction Console */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        {/* Active Agent Banner */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${currentColors.bg} border ${currentColors.border} ${currentColors.text}`}>
              {getAgentIcon(selectedAgent.id, 'w-5 h-5')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white">{selectedAgent.name}</h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${currentColors.bg} ${currentColors.text} border ${currentColors.border}`}>
                  {selectedAgent.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{selectedAgent.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Escrita Humanizada & Sem Clichês
            </span>
          </div>
        </div>

        {/* Suggested Prompts Bar */}
        <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/80">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
              <Flame className="w-3 h-3 text-amber-400" />
              Prompts Rápidos:
            </span>
            {selectedAgent.suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPromptText(p);
                  handleSendPrompt(p);
                }}
                disabled={isLoading}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] border border-slate-700/60 transition disabled:opacity-50"
              >
                "{p}"
              </button>
            ))}
          </div>
        </div>

        {/* Conversation / Output Feed */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[500px] overflow-y-auto">
          {agentMessages.length === 0 ? (
            <div className="py-12 text-center space-y-3 max-w-md mx-auto">
              <div className={`w-12 h-12 rounded-2xl ${currentColors.bg} border ${currentColors.border} ${currentColors.text} mx-auto flex items-center justify-center`}>
                {getAgentIcon(selectedAgent.id, 'w-6 h-6')}
              </div>
              <h3 className="text-sm font-semibold text-white">Canal Aberto com {selectedAgent.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Digite sua pergunta, instrução ou demanda de negócio abaixo. O agente responderá instantaneamente com fundamentação prática.
              </p>
            </div>
          ) : (
            agentMessages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
                >
                  {!isUser && (
                    <div className={`w-8 h-8 rounded-xl ${currentColors.bg} border ${currentColors.border} flex items-center justify-center ${currentColors.text} shrink-0 mt-1`}>
                      {getAgentIcon(selectedAgent.id, 'w-4 h-4')}
                    </div>
                  )}

                  <div className={`space-y-1.5 max-w-2xl ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-cyan-600 text-white rounded-br-none shadow-md'
                          : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>

                      {!isUser && (
                        <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            {msg.duration_ms ? `${msg.duration_ms}ms` : 'Processado'} • {selectedAgent.name}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopy(msg.id, msg.content)}
                              className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span>Copiado</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copiar</span>
                                </>
                              )}
                            </button>

                            {onSaveToMemories && (
                              <button
                                onClick={() => handleSaveMemory(msg)}
                                className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                              >
                                {savedId === msg.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span>Salvo</span>
                                  </>
                                ) : (
                                  <>
                                    <BookmarkPlus className="w-3 h-3 text-purple-400" />
                                    <span>Salvar Memória</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {isLoading && (
            <div className="flex gap-3 max-w-3xl mr-auto">
              <div className={`w-8 h-8 rounded-xl ${currentColors.bg} border ${currentColors.border} flex items-center justify-center ${currentColors.text} shrink-0`}>
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 rounded-bl-none flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                {selectedAgent.name} analisando contexto e formulando resposta...
              </div>
            </div>
          )}
        </div>

        {/* Input Box */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt();
            }}
            className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2 max-w-5xl mx-auto"
          >
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-cyan-500/60 transition">
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendPrompt();
                  }
                }}
                placeholder={`Digite seu prompt para ${selectedAgent.name}... (Pressione Enter para enviar, Shift+Enter para quebra de linha)`}
                disabled={isLoading}
                rows={Math.min(5, Math.max(2, promptText.split('\n').length))}
                className="w-full bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={!promptText.trim() || isLoading}
              className={`px-5 py-3 rounded-xl ${currentColors.button} text-white font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 shrink-0 h-11`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Gerando...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Enviar Prompt</span>
                </>
              )}
            </button>
          </form>

          <p className="text-[11px] text-center text-slate-400 mt-2">
            💡 Dica: Você pode alternar entre os agentes no topo a qualquer momento para explorar diferentes especialidades.
          </p>
        </div>
      </div>
    </div>
  );
};
