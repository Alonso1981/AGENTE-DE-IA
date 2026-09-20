import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Brain,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Tag,
  User,
  Info,
} from 'lucide-react';
import {
  ChatMessage,
  Conversation,
  UserProfile,
  UserPreferences,
  Memory,
  MemoryCandidate,
} from '../types';

interface ChatViewProps {
  currentConversation: Conversation | null;
  messages: ChatMessage[];
  profile: UserProfile | null;
  preferences: UserPreferences | null;
  memories: Memory[];
  isLoading: boolean;
  onSendMessage: (messageText: string) => void;
  onPromoteCandidateToConfirmed: (candidate: MemoryCandidate) => void;
  onNewChat: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  currentConversation,
  messages,
  profile,
  preferences,
  memories,
  isLoading,
  onSendMessage,
  onPromoteCandidateToConfirmed,
  onNewChat,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const confirmedMemoriesCount = memories.filter(
    (m) => m.type === 'CONFIRMED' || m.type === 'PERMANENT'
  ).length;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText;
    setInputText('');
    onSendMessage(text);
  };

  const samplePrompts = [
    'Qual é a diretriz fundamental de desenvolvimento por fases do MINDOS?',
    'Prefiro que sempre responda de forma concisa e com código TypeScript limpo.',
    'Como o MINDOS garante isolamento entre perfis da mesma família?',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950">
      {/* Active Context Banner */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-cyan-400 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Orquestrador Central</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 text-slate-300">
            <User className="w-3 h-3 text-slate-400" />
            <span>{profile?.full_name || 'Usuário'}</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 text-slate-300">
            <Brain className="w-3 h-3 text-purple-400" />
            <span>{confirmedMemoriesCount} memórias no contexto ativo</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Escrita Humanizada Ativa
          </span>
          <button
            onClick={onNewChat}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
          >
            <Plus className="w-3 h-3" />
            Nova Conversa
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center py-12 space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center">
              <Brain className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-100">
                Orquestrador Central do MINDOS
              </h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Converse naturalmente. O orquestrador recupera seu perfil e memórias confirmadas,
                aplica as regras de escrita humanizada e extrai automaticamente candidatos a memória
                para sua validação.
              </p>
            </div>

            <div className="pt-2">
              <p className="text-xs font-semibold text-slate-400 mb-3">Sugestões de teste da Fase 1:</p>
              <div className="flex flex-col gap-2 max-w-lg mx-auto text-left">
                {samplePrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputText(prompt);
                    }}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-white transition"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-1">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div className={`space-y-2 max-w-2xl ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-cyan-600 text-white rounded-br-none shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {msg.duration_ms && !isUser && (
                      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>Processado em {msg.duration_ms}ms pelo Orquestrador</span>
                      </div>
                    )}
                  </div>

                  {/* Candidate Memories Notification Pill */}
                  {!isUser && msg.extracted_memories && msg.extracted_memories.length > 0 && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
                      <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                        <Brain className="w-3.5 h-3.5" />
                        <span>Candidato a Memória Extraído pelo Orquestrador:</span>
                      </div>
                      {msg.extracted_memories.map((cand, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                                {cand.category}
                              </span>
                              <span className="text-[11px] font-medium text-slate-300">
                                {cand.content}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Confiança: {Math.round(cand.confidence_score * 100)}% • Status: CANDIDATE
                            </span>
                          </div>
                          <button
                            onClick={() => onPromoteCandidateToConfirmed(cand)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium transition shrink-0 self-start sm:self-auto"
                          >
                            Confirmar Memória
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1 font-bold text-xs">
                    {profile?.full_name ? profile.full_name.charAt(0) : 'U'}
                  </div>
                )}
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex gap-3 max-w-3xl mr-auto">
            <div className="w-8 h-8 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 rounded-bl-none flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Orquestrador processando contexto e gerando resposta humanizada...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/90 shrink-0">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escreva sua mensagem para o Orquestrador Central do MINDOS..."
            disabled={isLoading}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-white font-medium transition flex items-center gap-2 text-xs sm:text-sm shadow-md shadow-cyan-950 shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </form>
        <p className="text-[11px] text-center text-slate-400 mt-2">
          O MINDOS armazena memórias no Supabase e preserva a rastreabilidade em cada interação.
        </p>
      </div>
    </div>
  );
};
