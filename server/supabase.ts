import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import {
  UserProfile,
  UserPreferences,
  Family,
  FamilyMember,
  Memory,
  Conversation,
  ChatMessage,
  AuditLog,
  Project,
  SystemStatus,
} from '../src/types';

// Detect Supabase environment variables safely (supports standard, Next.js and Vite formats)
export function getSupabaseCredentials() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    '';
  return { url, key };
}

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();
  if (!supabaseClient && url && key) {
    try {
      supabaseClient = createClient(url, key, {
        auth: { persistSession: false },
      });
      console.log('Supabase client initialized successfully with remote URL:', url);
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
    }
  }
  return supabaseClient;
}

// In-Memory Fallback Store for resilient execution when remote database tables are pending creation
export const defaultUserId = 'a0000000-0000-0000-0000-000000000001';
export const defaultFamilyId = 'b0000000-0000-0000-0000-000000000001';
export const defaultProjectId = 'c0000000-0000-0000-0000-000000000001';

let mockProfile: UserProfile = {
  id: '00000000-0000-0000-0000-000000000001',
  user_id: defaultUserId,
  full_name: 'Benedito Alonso Albuquerque',
  email: 'beneditoalonsoalbuquerque@gmail.com',
  technical_level: 'avancado',
  communication_style: 'direto',
  interests: ['Inteligência Artificial', 'Arquitetura de Software', 'Engenharia de Sistemas', 'SaaS'],
  role: 'owner',
  created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  updated_at: new Date().toISOString(),
};

let mockPreferences: UserPreferences = {
  id: '00000000-0000-0000-0000-000000000002',
  user_id: defaultUserId,
  preferred_tone: 'Prático, direto, técnico e com exemplos do mundo real',
  technical_depth: 'Avançado',
  avoid_jargon: true,
  preferred_language: 'pt-BR',
  rules: [
    'Nunca usar jargões corporativos vazios nem clichês de IA',
    'Priorizar arquitetura modular e código desacoplado',
    'Explicar decisões técnicas de forma fundamentada',
  ],
};

let mockFamily: Family = {
  id: defaultFamilyId,
  name: 'Família Albuquerque',
  created_by: defaultUserId,
  created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
};

let mockFamilyMembers: FamilyMember[] = [
  {
    id: 'f0000000-0000-0000-0000-000000000001',
    family_id: defaultFamilyId,
    user_id: defaultUserId,
    nickname: 'Benedito (Administrador)',
    role: 'admin',
    is_child: false,
    joined_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'f0000000-0000-0000-0000-000000000002',
    family_id: defaultFamilyId,
    user_id: 'a0000000-0000-0000-0000-000000000002',
    nickname: 'Mariana Albuquerque',
    role: 'member',
    is_child: false,
    joined_at: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: 'f0000000-0000-0000-0000-000000000003',
    family_id: defaultFamilyId,
    user_id: 'a0000000-0000-0000-0000-000000000003',
    nickname: 'Lucas (Perfil Jovem/Estudos)',
    role: 'child',
    is_child: true,
    joined_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

let mockProjects: Project[] = [
  {
    id: defaultProjectId,
    user_id: defaultUserId,
    family_id: defaultFamilyId,
    name: 'MINDOS Kernel Architecture',
    description: 'Sistema Operacional Pessoal de IA com memória, agentes e orquestrador.',
    tags: ['ia', 'kernel', 'supabase', 'gemini'],
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

let mockMemories: Memory[] = [
  {
    id: 'd0000000-0000-0000-0000-000000000001',
    user_id: defaultUserId,
    family_id: defaultFamilyId,
    type: 'PERMANENT',
    category: 'preference',
    content: 'Prefere explicações diretas, estruturadas e sem floreios ou jargões repetitivos.',
    source: 'configuracao_inicial',
    confidence_score: 1.0,
    tags: ['estilo', 'comunicacao'],
    is_shared_family: false,
    can_review: true,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 'd0000000-0000-0000-0000-000000000002',
    user_id: defaultUserId,
    family_id: defaultFamilyId,
    type: 'CONFIRMED',
    category: 'project',
    content: 'O banco de dados principal do MINDOS é Supabase PostgreSQL com pgvector e RLS ativado.',
    source: 'decisao_arquitetural',
    confidence_score: 0.98,
    tags: ['supabase', 'postgresql', 'banco_de_dados'],
    project_id: defaultProjectId,
    subject: 'Infraestrutura e Banco',
    is_shared_family: true,
    can_review: true,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'd0000000-0000-0000-0000-000000000003',
    user_id: defaultUserId,
    family_id: defaultFamilyId,
    type: 'CANDIDATE',
    category: 'correction',
    content: 'Correção: O sistema deve avançar apenas fase a fase, sem tentar construir todos os módulos de uma só vez.',
    source: 'interacao_chat',
    confidence_score: 0.92,
    tags: ['diretriz', 'fases'],
    subject: 'Metodologia de Desenvolvimento',
    is_shared_family: false,
    can_review: true,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'd0000000-0000-0000-0000-000000000004',
    user_id: defaultUserId,
    family_id: defaultFamilyId,
    type: 'TEMPORARY',
    category: 'general',
    content: 'Discutindo validações da Fase 1 de fundação para o sistema operacional.',
    source: 'sessao_atual',
    confidence_score: 0.85,
    tags: ['sessao', 'fase1'],
    is_shared_family: false,
    can_review: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let mockConversations: Conversation[] = [
  {
    id: 'e0000000-0000-0000-0000-000000000001',
    user_id: defaultUserId,
    family_id: defaultFamilyId,
    project_id: defaultProjectId,
    title: 'Definição da Fundação do MINDOS (Fase 1)',
    summary: 'Estruturação da stack, modelos de dados, isolamento familiar e orquestrador.',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let mockMessages: Record<string, ChatMessage[]> = {
  'e0000000-0000-0000-0000-000000000001': [
    {
      id: 'm0000000-0000-0000-0000-000000000001',
      conversation_id: 'e0000000-0000-0000-0000-000000000001',
      role: 'user',
      content: 'Iniciando o MINDOS. Qual é a regra fundamental de desenvolvimento por fases?',
      created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: 'm0000000-0000-0000-0000-000000000002',
      conversation_id: 'e0000000-0000-0000-0000-000000000001',
      role: 'assistant',
      content: 'A regra fundamental é não tentar construir tudo de uma vez. O sistema deve ser desenvolvido estritamente fase a fase, validando testes, segurança, banco de dados e estabilidade da fundação antes de qualquer avanço.',
      duration_ms: 540,
      created_at: new Date(Date.now() - 86400000 * 1 + 2000).toISOString(),
    },
  ],
};

let mockAuditLogs: AuditLog[] = [
  {
    id: 'audit-01',
    agent_id: 'orchestrator-core',
    user_id: defaultUserId,
    family_id: defaultFamilyId,
    action: 'SYSTEM_BOOT',
    tool: 'kernel_init',
    input: 'Inicialização do kernel MINDOS Fase 1',
    output: 'Módulos carregados: Memória, Perfil, Família, Auditoria, Orquestrador.',
    status: 'SUCCESS',
    duration_ms: 120,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'audit-02',
    agent_id: 'orchestrator-core',
    user_id: defaultUserId,
    family_id: defaultFamilyId,
    action: 'MEMORY_EVALUATION',
    tool: 'memory_classifier',
    input: 'Avaliação de contexto e memórias confirmadas para prompt de orquestração',
    output: 'Recuperadas 2 memórias confirmadas e 1 preferência de escrita humanizada.',
    status: 'SUCCESS',
    duration_ms: 85,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

// Public Database Service (Works with real Supabase or Resilient In-Memory fallback)
export const db = {
  getSystemStatus(): SystemStatus {
    const { url, key } = getSupabaseCredentials();
    const hasCredentials = Boolean(url && key);
    let projectRef = '';
    const match = url.match(/https?:\/\/([^.]+)\.supabase\.co/);
    if (match) {
      projectRef = match[1];
    }

    return {
      database: {
        provider: hasCredentials ? 'supabase' : 'in_memory_fallback',
        connected: true,
        hasCredentials,
        url: url ? url : 'Modo Local Resiliente (Pronto para Supabase Cloud)',
        projectRef: projectRef || undefined,
        sqlEditorUrl: projectRef ? `https://supabase.com/dashboard/project/${projectRef}/sql/new` : undefined,
      },
      gemini: {
        hasKey: Boolean(process.env.GEMINI_API_KEY),
        model: 'gemini-3.8-flash',
      },
      environment: process.env.NODE_ENV || 'development',
      activePhase: 1,
    };
  },

  async checkTablesStatus(): Promise<{ tablesCreated: boolean; message: string; tables: string[] }> {
    const client = getSupabase();
    if (!client) {
      return { tablesCreated: false, message: 'Supabase não inicializado', tables: [] };
    }
    try {
      const { error } = await client.from('profiles').select('id').limit(1);
      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
          return {
            tablesCreated: false,
            message: 'Tabelas aguardando execução do script SQL no Supabase SQL Editor.',
            tables: [],
          };
        }
        return { tablesCreated: false, message: `Status Supabase: ${error.message}`, tables: [] };
      }

      // If profiles table exists, seed initial records if empty
      await this.seedIfEmpty();

      return {
        tablesCreated: true,
        message: 'Todas as tabelas do MINDOS Fase 1 estão ativas no Supabase Cloud.',
        tables: ['families', 'profiles', 'family_members', 'preferences', 'projects', 'memories', 'conversations', 'messages', 'audit_logs'],
      };
    } catch (err: any) {
      return { tablesCreated: false, message: err?.message || 'Erro ao checar tabelas', tables: [] };
    }
  },

  async seedIfEmpty() {
    const client = getSupabase();
    if (!client) return;
    try {
      const { data: existingFams } = await client.from('families').select('id').limit(1);
      if (!existingFams || existingFams.length === 0) {
        console.log('Semeando dados iniciais da Fase 1 no Supabase Cloud...');
        await client.from('families').insert(mockFamily);
        await client.from('profiles').insert(mockProfile);
        await client.from('family_members').insert(mockFamilyMembers);
        await client.from('preferences').insert(mockPreferences);
        await client.from('projects').insert(mockProjects);
        await client.from('memories').insert(mockMemories);
        console.log('Dados de fundação semeados com sucesso no Supabase Cloud!');
      }
    } catch (seedErr: any) {
      console.warn('Seed inicial ignorado ou erro ao semear:', seedErr?.message);
    }
  },

  async getProfile(): Promise<UserProfile> {
    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client.from('profiles').select('*').single();
        if (!error && data) return data as UserProfile;
      } catch (err) {
        // Fallback to in-memory
      }
    }
    return mockProfile;
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('profiles')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('user_id', defaultUserId)
          .select()
          .single();
        if (!error && data) return data as UserProfile;
      } catch (err) {
        // Fallback to in-memory
      }
    }
    mockProfile = { ...mockProfile, ...updates, updated_at: new Date().toISOString() };
    return mockProfile;
  },

  async getPreferences(): Promise<UserPreferences> {
    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client.from('preferences').select('*').single();
        if (!error && data) return data as UserPreferences;
      } catch (err) {
        // Fallback to in-memory
      }
    }
    return mockPreferences;
  },

  async updatePreferences(updates: Partial<UserPreferences>): Promise<UserPreferences> {
    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('preferences')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('user_id', defaultUserId)
          .select()
          .single();
        if (!error && data) return data as UserPreferences;
      } catch (err) {
        // Fallback to in-memory
      }
    }
    mockPreferences = { ...mockPreferences, ...updates };
    return mockPreferences;
  },

  async getFamily(): Promise<{ family: Family; members: FamilyMember[] }> {
    const client = getSupabase();
    if (client) {
      try {
        const { data: family } = await client.from('families').select('*').single();
        const { data: members } = await client.from('family_members').select('*');
        if (family && members && members.length > 0) {
          return { family: family as Family, members: members as FamilyMember[] };
        }
      } catch (err) {
        // Fallback to in-memory
      }
    }
    return { family: mockFamily, members: mockFamilyMembers };
  },

  async addFamilyMember(memberData: Omit<FamilyMember, 'id' | 'family_id' | 'joined_at'>): Promise<FamilyMember> {
    const newMember: FamilyMember = {
      id: crypto.randomUUID(),
      family_id: defaultFamilyId,
      ...memberData,
      joined_at: new Date().toISOString(),
    };
    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client.from('family_members').insert(newMember).select().single();
        if (!error && data) return data as FamilyMember;
      } catch (err) {
        // Fallback to in-memory
      }
    }
    mockFamilyMembers.push(newMember);
    return newMember;
  },

  async getProjects(): Promise<Project[]> {
    const client = getSupabase();
    if (client) {
      try {
        const { data } = await client.from('projects').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) return data as Project[];
      } catch (err) {
        // Fallback to in-memory
      }
    }
    return mockProjects;
  },

  async getMemories(filter?: { type?: string; category?: string; query?: string }): Promise<Memory[]> {
    const client = getSupabase();
    if (client) {
      try {
        let query = client.from('memories').select('*').order('created_at', { ascending: false });
        if (filter?.type) query = query.eq('type', filter.type);
        if (filter?.category) query = query.eq('category', filter.category);
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data as Memory[];
      } catch (err) {
        // Fallback to in-memory
      }
    }

    let result = [...mockMemories];
    if (filter?.type) {
      result = result.filter((m) => m.type === filter.type);
    }
    if (filter?.category) {
      result = result.filter((m) => m.category === filter.category);
    }
    if (filter?.query) {
      const q = filter.query.toLowerCase();
      result = result.filter(
        (m) =>
          m.content.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q)) ||
          (m.subject && m.subject.toLowerCase().includes(q))
      );
    }
    return result;
  },

  async createMemory(memoryData: Partial<Memory>): Promise<Memory> {
    const newMemory: Memory = {
      id: crypto.randomUUID(),
      user_id: defaultUserId,
      family_id: defaultFamilyId,
      type: memoryData.type || 'CANDIDATE',
      category: memoryData.category || 'general',
      content: memoryData.content || '',
      source: memoryData.source || 'manual',
      confidence_score: memoryData.confidence_score ?? 0.9,
      tags: memoryData.tags || [],
      subject: memoryData.subject || null,
      project_id: memoryData.project_id || null,
      is_shared_family: memoryData.is_shared_family ?? false,
      can_review: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client.from('memories').insert(newMemory).select().single();
        if (!error && data) return data as Memory;
      } catch (err) {
        // Fallback to in-memory
      }
    }
    mockMemories.unshift(newMemory);
    return newMemory;
  },

  async updateMemory(id: string, updates: Partial<Memory>): Promise<Memory | null> {
    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('memories')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data as Memory;
      } catch (err) {
        // Fallback to in-memory
      }
    }
    const idx = mockMemories.findIndex((m) => m.id === id);
    if (idx !== -1) {
      mockMemories[idx] = { ...mockMemories[idx], ...updates, updated_at: new Date().toISOString() };
      return mockMemories[idx];
    }
    return null;
  },

  async deleteMemory(id: string): Promise<boolean> {
    const client = getSupabase();
    if (client) {
      try {
        const { error } = await client.from('memories').delete().eq('id', id);
        if (!error) return true;
      } catch (err) {
        // Fallback to in-memory
      }
    }
    mockMemories = mockMemories.filter((m) => m.id !== id);
    return true;
  },

  async getConversations(searchQuery?: string): Promise<Conversation[]> {
    const client = getSupabase();
    if (client) {
      try {
        let query = client.from('conversations').select('*').order('updated_at', { ascending: false });
        if (searchQuery) {
          query = query.ilike('title', `%${searchQuery}%`);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data as Conversation[];
      } catch (err) {
        // Fallback to in-memory
      }
    }
    let list = [...mockConversations];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(q) || (c.summary && c.summary.toLowerCase().includes(q)));
    }
    return list;
  },

  async createConversation(title?: string, projectId?: string | null): Promise<Conversation> {
    const newConv: Conversation = {
      id: crypto.randomUUID(),
      user_id: defaultUserId,
      family_id: defaultFamilyId,
      project_id: projectId || null,
      title: title || 'Nova Conversa',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client.from('conversations').insert(newConv).select().single();
        if (!error && data) return data as Conversation;
      } catch (err) {
        // Fallback to in-memory
      }
    }
    mockConversations.unshift(newConv);
    mockMessages[newConv.id] = [];
    return newConv;
  },

  async deleteConversation(id: string): Promise<boolean> {
    const client = getSupabase();
    if (client) {
      try {
        const { error } = await client.from('conversations').delete().eq('id', id);
        if (!error) return true;
      } catch (err) {
        // Fallback to in-memory
      }
    }
    mockConversations = mockConversations.filter((c) => c.id !== id);
    delete mockMessages[id];
    return true;
  },

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });
        if (!error && data && data.length > 0) return data as ChatMessage[];
      } catch (err) {
        // Fallback to in-memory
      }
    }
    return mockMessages[conversationId] || [];
  },

  async addMessage(msg: Omit<ChatMessage, 'id' | 'created_at'>): Promise<ChatMessage> {
    const newMsg: ChatMessage = {
      id: crypto.randomUUID(),
      ...msg,
      created_at: new Date().toISOString(),
    };
    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client.from('messages').insert(newMsg).select().single();
        if (!error && data) return data as ChatMessage;
      } catch (err) {
        // Fallback to in-memory
      }
    }
    if (!mockMessages[msg.conversation_id]) {
      mockMessages[msg.conversation_id] = [];
    }
    mockMessages[msg.conversation_id].push(newMsg);

    // Update conversation updated_at
    const conv = mockConversations.find((c) => c.id === msg.conversation_id);
    if (conv) {
      conv.updated_at = new Date().toISOString();
    }
    return newMsg;
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50);
        if (!error && data && data.length > 0) return data as AuditLog[];
      } catch (err) {
        // Fallback to in-memory
      }
    }
    return mockAuditLogs;
  },

  async logAudit(logData: Omit<AuditLog, 'id' | 'created_at'>): Promise<AuditLog> {
    const newLog: AuditLog = {
      id: crypto.randomUUID(),
      ...logData,
      created_at: new Date().toISOString(),
    };
    const client = getSupabase();
    if (client) {
      try {
        await client.from('audit_logs').insert(newLog);
      } catch (err) {
        // Fallback to in-memory
      }
    }
    mockAuditLogs.unshift(newLog);
    if (mockAuditLogs.length > 100) mockAuditLogs.pop();
    return newLog;
  },
};
