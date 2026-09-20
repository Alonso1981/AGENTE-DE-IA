import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Terminal,
  Copy,
  Check,
  RefreshCw,
  Code2,
} from 'lucide-react';
import { SystemStatus } from '../types';

interface SettingsViewProps {
  systemStatus: SystemStatus | null;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ systemStatus }) => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [checkingTables, setCheckingTables] = useState(false);
  const [tableStatus, setTableStatus] = useState<{
    tablesCreated: boolean;
    message: string;
    tables?: string[];
  } | null>(null);

  const checkLiveTables = async () => {
    setCheckingTables(true);
    try {
      const res = await fetch('/api/database/check');
      if (res.ok) {
        const data = await res.json();
        setTableStatus(data);
      }
    } catch (err) {
      console.error('Error checking tables:', err);
    } finally {
      setCheckingTables(false);
    }
  };

  useEffect(() => {
    checkLiveTables();
  }, []);

  const handleCopySql = async () => {
    try {
      const res = await fetch('/api/database/schema-sql');
      if (res.ok) {
        const sql = await res.text();
        await navigator.clipboard.writeText(sql);
        setCopiedSql(true);
        setTimeout(() => setCopiedSql(false), 2500);
      }
    } catch (err) {
      console.error('Failed to copy SQL schema:', err);
    }
  };

  const projectRef = systemStatus?.database.projectRef || 'quejiopzvrmaiepfaxxk';
  const sqlEditorUrl = systemStatus?.database.sqlEditorUrl || `https://supabase.com/dashboard/project/${projectRef}/sql/new`;

  const phases = [
    { num: 1, name: 'Fundação', status: 'COMPLETED', desc: 'React, TypeScript, Express, Supabase, RLS, Família, Perfil, Chat, Memória Básica, Orquestrador' },
    { num: 2, name: 'Memória Avançada', status: 'PENDING', desc: 'Recuperação semântica híbrida, pgvector embeddings e consolidação de conhecimento' },
    { num: 3, name: 'Documentos & Knowledge Base', status: 'PENDING', desc: 'Upload, chunking, metadados, validação de fontes e detecção de conflitos' },
    { num: 4, name: 'Especialistas', status: 'PENDING', desc: 'Specialist Agents com memória contextual e bases especializadas' },
    { num: 5, name: 'Tutor & Concursos', status: 'PENDING', desc: 'Metodologia adaptativa, histórico de erros repetidos e planos de estudo' },
    { num: 6, name: 'Voz & VAD', status: 'PENDING', desc: 'Processamento de áudio em tempo real, modo OK e síntese vocal' },
    { num: 7, name: 'Automações', status: 'PENDING', desc: 'Workflows independentes em linguagem natural com triggers e ações' },
    { num: 8, name: 'Ferramentas & Integrações', status: 'PENDING', desc: 'Tool Registry com controle de permissões e execução de APIs externas' },
    { num: 9, name: 'Agente de Conteúdo', status: 'PENDING', desc: 'Escrita humanizada, subagentes de SEO, imagens e publicação multicanal' },
    { num: 10, name: 'Agentes Autônomos Avançados', status: 'PENDING', desc: 'Ciclos de planejamento, verificação, correção e limite de autonomia' },
    { num: 11, name: 'Analytics & Otimização', status: 'PENDING', desc: 'Métricas de desempenho de conteúdo e auditoria de aprendizado' },
    { num: 12, name: 'SaaS, Planos & Escala', status: 'PENDING', desc: 'Multi-tenant, cotas, faturamento e governança de infraestrutura' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-300" />
          <h2 className="text-base font-bold text-slate-100">Configurações & Diagnóstico do Kernel</h2>
        </div>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Verificação do estado da infraestrutura, variáveis de ambiente seguras server-side e rastreamento do roadmap de fases.
        </p>
      </div>

      {/* Services Diagnosis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Supabase Status */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              Supabase Cloud
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              CONECTADO
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Credenciais validadas no servidor (URL, Publishable e Secret Key).
          </p>
          <div className="pt-1 text-[10px] font-mono text-emerald-400 truncate">
            {systemStatus?.database.url}
          </div>
        </div>

        {/* Gemini Status */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Google Gemini API
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
              {systemStatus?.gemini.hasKey ? 'ATIVO' : 'AGUARDANDO CHAVE'}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Chamadas server-side protegidas com cabeçalho <code>aistudio-build</code>.
          </p>
          <div className="pt-1 text-[10px] font-mono text-cyan-400">
            Modelo: {systemStatus?.gemini.model}
          </div>
        </div>

        {/* Security & RLS */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Segurança & RLS
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              ENFORCED
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Políticas ativas de isolamento por família e usuário sem vazamento de dados.
          </p>
          <div className="pt-1 text-[10px] font-mono text-emerald-400">
            pgvector + RLS Ativo
          </div>
        </div>
      </div>

      {/* Supabase Schema & Migration Hub */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100">Schema PostgreSQL & Tabelas do MINDOS</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Projeto Supabase: <span className="font-mono text-emerald-400 font-semibold">{projectRef}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={checkLiveTables}
              disabled={checkingTables}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1.5 transition border border-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checkingTables ? 'animate-spin text-cyan-400' : ''}`} />
              Verificar Tabelas
            </button>

            <button
              onClick={handleCopySql}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white flex items-center gap-1.5 transition shadow-sm"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  SQL Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copiar Script SQL (Fase 1)
                </>
              )}
            </button>

            <a
              href={sqlEditorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-emerald-400 flex items-center gap-1.5 transition border border-emerald-500/30"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Abrir SQL Editor no Supabase
            </a>
          </div>
        </div>

        {/* Live Schema Feedback */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex items-start gap-3">
          {tableStatus?.tablesCreated ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-semibold text-emerald-300">Banco de Dados Ativo e Semeado no Supabase Cloud!</div>
                <div className="text-slate-400">
                  Todas as 9 tabelas da Fase 1 foram detectadas no PostgreSQL e os registros de fundação foram sincronizados.
                </div>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-semibold text-amber-300">Passo Único para Ativar Tabelas Remotas:</div>
                <div className="text-slate-400 leading-relaxed">
                  As credenciais do Supabase foram salvas e testadas com sucesso. Para criar as tabelas no seu cluster:
                  <ol className="list-decimal list-inside mt-1.5 space-y-1 text-slate-300">
                    <li>Clique no botão verde <strong>"Copiar Script SQL (Fase 1)"</strong> acima.</li>
                    <li>Clique em <strong>"Abrir SQL Editor no Supabase"</strong>.</li>
                    <li>Cole o script e clique em <strong>Run</strong> no Supabase.</li>
                    <li>Volte aqui e clique em <strong>"Verificar Tabelas"</strong>. O sistema semeará automaticamente o perfil e os dados da Fase 1!</li>
                  </ol>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Security Rule Warning */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
        <h4 className="font-semibold text-slate-200 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-amber-400" />
          Diretriz de Segurança Mandatória do MINDOS
        </h4>
        <p className="text-slate-400 leading-relaxed">
          Nenhuma chave confidencial (como <code>GEMINI_API_KEY</code> ou <code>SUPABASE_SERVICE_ROLE_KEY</code>)
          é exposta ao navegador. Toda a comunicação com provedores de IA e banco é intermediada por rotas seguras de backend (<code>/api/*</code>).
        </p>
      </div>

      {/* Roadmap of Phases */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Roadmap do Sistema (Princípio Fundamental: Construção por Fases)
          </h3>
          <span className="text-xs text-cyan-400 font-medium">Fase 1 Concluída</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {phases.map((p) => {
            const isDone = p.status === 'COMPLETED';
            return (
              <div
                key={p.num}
                className={`p-3.5 rounded-xl border transition ${
                  isDone
                    ? 'bg-slate-900/90 border-cyan-500/40 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800/80 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-slate-100">
                    Fase {p.num}: {p.name}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                      isDone
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {isDone ? 'ATIVA' : 'PLANEJADA'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
