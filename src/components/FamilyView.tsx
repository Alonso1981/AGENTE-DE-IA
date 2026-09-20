import React, { useState } from 'react';
import {
  Users,
  User,
  Shield,
  Plus,
  CheckCircle2,
  Lock,
  Baby,
  Sparkles,
  Sliders,
  Save,
} from 'lucide-react';
import { Family, FamilyMember, UserProfile, UserPreferences } from '../types';

interface FamilyViewProps {
  family: Family | null;
  familyMembers: FamilyMember[];
  profile: UserProfile | null;
  preferences: UserPreferences | null;
  onAddFamilyMember: (memberData: Omit<FamilyMember, 'id' | 'family_id' | 'joined_at'>) => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
}

export const FamilyView: React.FC<FamilyViewProps> = ({
  family,
  familyMembers,
  profile,
  preferences,
  onAddFamilyMember,
  onUpdateProfile,
  onUpdatePreferences,
}) => {
  // Member modal state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'member' | 'child'>('member');
  const [newIsChild, setNewIsChild] = useState(false);

  // Profile edit state
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [techLevel, setTechLevel] = useState(profile?.technical_level || 'avancado');
  const [commStyle, setCommStyle] = useState(profile?.communication_style || 'direto');
  const [interestsStr, setInterestsStr] = useState((profile?.interests || []).join(', '));
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(false);

  // Preferences edit state
  const [preferredTone, setPreferredTone] = useState(preferences?.preferred_tone || '');
  const [avoidJargon, setAvoidJargon] = useState(preferences?.avoid_jargon ?? true);
  const [rulesStr, setRulesStr] = useState((preferences?.rules || []).join('\n'));
  const [prefSuccessMsg, setPrefSuccessMsg] = useState(false);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNickname.trim()) return;

    onAddFamilyMember({
      user_id: `user-${Date.now()}`,
      nickname: newNickname.trim(),
      role: newRole,
      is_child: newIsChild,
    });

    setNewNickname('');
    setNewIsChild(false);
    setIsAddMemberOpen(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      full_name: fullName,
      technical_level: techLevel as any,
      communication_style: commStyle as any,
      interests: interestsStr.split(',').map((i) => i.trim()).filter(Boolean),
    });
    setProfileSuccessMsg(true);
    setTimeout(() => setProfileSuccessMsg(false), 3000);
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePreferences({
      preferred_tone: preferredTone,
      avoid_jargon: avoidJargon,
      rules: rulesStr.split('\n').map((r) => r.trim()).filter(Boolean),
    });
    setPrefSuccessMsg(true);
    setTimeout(() => setPrefSuccessMsg(false), 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Family Hierarchy Header */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">{family?.name || 'Família'}</h2>
              <p className="text-xs text-slate-400">
                Isolamento estrito entre perfis com suporte a memórias privadas e compartilhadas
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddMemberOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center gap-1.5 transition shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Adicionar Membro
          </button>
        </div>
      </div>

      {/* Members Grid */}
      <div>
        <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-400 mb-3 flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-blue-400" />
          Membros Registrados ({familyMembers.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {familyMembers.map((member) => (
            <div
              key={member.id}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-200 text-xs shrink-0">
                  {member.nickname.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-100">{member.nickname}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 uppercase">
                      {member.role}
                    </span>
                    {member.is_child && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
                        <Baby className="w-2.5 h-2.5" /> Infantil
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1" title="Isolamento RLS Ativo">
                <Lock className="w-3 h-3 text-emerald-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Profile & Personal Preferences Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-800/80">
        {/* Profile Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              Perfil do Usuário Ativo
            </h3>
            {profileSuccessMsg && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 animate-fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" /> Salvo com sucesso!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Nome Completo</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-cyan-500/60"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Nível Técnico</label>
                <select
                  value={techLevel}
                  onChange={(e) => setTechLevel(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-cyan-500/60"
                >
                  <option value="iniciante">Iniciante</option>
                  <option value="intermediario">Intermediário</option>
                  <option value="avancado">Avançado</option>
                  <option value="especialista">Especialista</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Estilo de Comunicação</label>
                <select
                  value={commStyle}
                  onChange={(e) => setCommStyle(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-cyan-500/60"
                >
                  <option value="direto">Direto e Prático</option>
                  <option value="didatico">Didático e Explicativo</option>
                  <option value="detalhado">Detalhado e Profundo</option>
                  <option value="conciso">Ultra Conciso</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Interesses (separados por vírgula)</label>
              <input
                type="text"
                value={interestsStr}
                onChange={(e) => setInterestsStr(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-cyan-500/60"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium flex items-center gap-1.5 transition"
              >
                <Save className="w-3.5 h-3.5" />
                Atualizar Perfil
              </button>
            </div>
          </form>
        </div>

        {/* Preferences & Personality Rules Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              Preferências & Regras de Resposta
            </h3>
            {prefSuccessMsg && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 animate-fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" /> Preferências salvas!
              </span>
            )}
          </div>

          <form onSubmit={handleSavePreferences} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Tom de Resposta Preferido</label>
              <input
                type="text"
                value={preferredTone}
                onChange={(e) => setPreferredTone(e.target.value)}
                placeholder="Ex: Prático, sem introduções vazias, foco em implementação"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-purple-500/60"
              />
            </div>

            <div className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                id="avoidJargon"
                checked={avoidJargon}
                onChange={(e) => setAvoidJargon(e.target.checked)}
                className="rounded border-slate-800 bg-slate-950 text-purple-600 focus:ring-0"
              />
              <label htmlFor="avoidJargon" className="text-slate-300">
                Evitar clichês de IA corporativos e chavões sem substância (Seção 17)
              </label>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">
                Regras de Comportamento do Orquestrador (1 por linha)
              </label>
              <textarea
                rows={3}
                value={rulesStr}
                onChange={(e) => setRulesStr(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-purple-500/60"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium flex items-center gap-1.5 transition"
              >
                <Save className="w-3.5 h-3.5" />
                Salvar Preferências
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Add Member Modal */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                Adicionar Membro à Família
              </h3>
              <button onClick={() => setIsAddMemberOpen(false)} className="text-slate-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nome / Apelido *</label>
                <input
                  type="text"
                  required
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  placeholder="Ex: Carlos Albuquerque"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-blue-500/60"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Papel</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-blue-500/60"
                >
                  <option value="member">Membro Padrão</option>
                  <option value="admin">Administrador Familiar</option>
                  <option value="child">Perfil Infantil (Controle Parental)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isChildCheckbox"
                  checked={newIsChild}
                  onChange={(e) => setNewIsChild(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-0"
                />
                <label htmlFor="isChildCheckbox" className="text-slate-300">
                  Marcar como perfil com restrições e controle parental
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition"
                >
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
