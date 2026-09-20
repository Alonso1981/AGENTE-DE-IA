import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FileCode,
  Copy,
  Check,
  Clock,
  Activity,
  Lock,
  Database,
  Search,
} from 'lucide-react';
import { AuditLog } from '../types';

interface AuditSecurityViewProps {
  auditLogs: AuditLog[];
}

export const AuditSecurityView: React.FC<AuditSecurityViewProps> = ({ auditLogs }) => {
  const [schemaSql, setSchemaSql] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'logs' | 'rls' | 'sql'>('logs');

  useEffect(() => {
    fetch('/api/database/schema-sql')
      .then((res) => res.text())
      .then((data) => setSchemaSql(data))
      .catch((err) => console.error('Error fetching schema sql:', err));
  }, []);

  const handleCopySql = () => {
    if (!schemaSql) return;
    navigator.clipboard.writeText(schemaSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const rlsPolicies = [
    {
      table: 'profiles',
      policy: 'Users view & update own profile',
      rule: 'auth.uid() = user_id',
      purpose: 'Garante que nenhum usuário veja ou modifique perfis alheios.',
    },
    {
      table: 'families',
      policy: 'Family members view family',
      rule: 'id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())',
      purpose: 'Apenas membros autenticados e associados à família têm acesso aos metadados.',
    },
    {
      table: 'memories',
      policy: 'Users view own or shared family memories',
      rule: 'user_id = auth.uid() OR (is_shared_family = TRUE AND family_id IN (...))',
      purpose: 'Memórias privadas são estritamente isoladas; memórias compartilhadas só são visíveis por membros da mesma família.',
    },
    {
      table: 'conversations & messages',
      policy: 'Users manage own conversations & messages',
      rule: 'user_id = auth.uid()',
      purpose: 'Histórico de chat e mensagens são restritos ao usuário que interagiu com o orquestrador.',
    },
    {
      table: 'audit_logs',
      policy: 'Users view own audit logs',
      rule: 'user_id = auth.uid()',
      purpose: 'Rastreabilidade e histórico transparente de todas as ações tomadas pelo orquestrador.',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100">Segurança, RLS & Auditoria Rastreável</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            O MINDOS foi concebido com segurança por design: todas as ações do orquestrador são registradas, e as tabelas
            do Supabase PostgreSQL são protegidas por Row Level Security (RLS) impedindo vazamento de dados.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 self-start md:self-auto shrink-0">
          <button
            onClick={() => setActiveSubTab('logs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeSubTab === 'logs' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Logs de Auditoria ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveSubTab('rls')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeSubTab === 'rls' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Políticas RLS
          </button>
          <button
            onClick={() => setActiveSubTab('sql')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeSubTab === 'sql' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Schema SQL (Supabase)
          </button>
        </div>
      </div>

      {/* Subtab 1: Audit Logs */}
      {activeSubTab === 'logs' && (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 border-b border-slate-800 font-mono uppercase text-[10px] text-slate-400">
                  <tr>
                    <th className="p-3">Data/Hora</th>
                    <th className="p-3">Agente / Ferramenta</th>
                    <th className="p-3">Ação</th>
                    <th className="p-3">Entrada / Descrição</th>
                    <th className="p-3">Duração</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-normal">
                  {auditLogs.map((log) => {
                    const dateStr = new Date(log.created_at).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    });

                    return (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          {dateStr}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-cyan-400">
                          {log.agent_id}
                          {log.tool && <span className="text-slate-400 block text-[10px]">({log.tool})</span>}
                        </td>
                        <td className="p-3 font-semibold text-slate-200">{log.action}</td>
                        <td className="p-3 max-w-md truncate text-slate-300" title={log.input}>
                          {log.input || '-'}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          {log.duration_ms ? `${log.duration_ms}ms` : '-'}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: RLS Policies */}
      {activeSubTab === 'rls' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rlsPolicies.map((p, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-100 font-mono">Tabela: {p.table}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> RLS ENABLED
                </span>
              </div>
              <h4 className="text-xs font-semibold text-cyan-400">{p.policy}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{p.purpose}</p>
              <div className="pt-2">
                <code className="text-[10px] font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800 text-slate-400 block truncate">
                  {p.rule}
                </code>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subtab 3: Schema SQL Viewer & Copy */}
      {activeSubTab === 'sql' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Script oficial em PostgreSQL compatível com o Supabase (tabelas, índices, pgvector e políticas RLS da Fase 1).
            </p>
            <button
              onClick={handleCopySql}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center gap-1.5 transition shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'SQL Copiado!' : 'Copiar Script SQL'}</span>
            </button>
          </div>

          <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-[11px] text-slate-300 max-h-[500px] overflow-y-auto leading-relaxed">
            <pre className="whitespace-pre-wrap">{schemaSql || '-- Carregando schema.sql...'}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
