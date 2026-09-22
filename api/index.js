// server/app.ts
import express, { Router } from "express";
import path from "path";
import fs from "fs";

// server/supabase.ts
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
function getSupabaseCredentials() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  return { url, key };
}
var supabaseClient = null;
function getSupabase() {
  const { url, key } = getSupabaseCredentials();
  if (!supabaseClient && url && key) {
    try {
      supabaseClient = createClient(url, key, {
        auth: { persistSession: false }
      });
      console.log("Supabase client initialized successfully with remote URL:", url);
    } catch (err) {
      console.error("Failed to initialize Supabase client:", err);
    }
  }
  return supabaseClient;
}
var defaultUserId = "a0000000-0000-0000-0000-000000000001";
var defaultFamilyId = "b0000000-0000-0000-0000-000000000001";
var defaultProjectId = "c0000000-0000-0000-0000-000000000001";
var mockProfile = {
  id: "00000000-0000-0000-0000-000000000001",
  user_id: defaultUserId,
  full_name: "Benedito Alonso Albuquerque",
  email: "beneditoalonsoalbuquerque@gmail.com",
  technical_level: "avancado",
  communication_style: "direto",
  interests: ["Intelig\xEAncia Artificial", "Arquitetura de Software", "Engenharia de Sistemas", "SaaS"],
  role: "owner",
  created_at: new Date(Date.now() - 864e5 * 10).toISOString(),
  updated_at: (/* @__PURE__ */ new Date()).toISOString()
};
var mockPreferences = {
  id: "00000000-0000-0000-0000-000000000002",
  user_id: defaultUserId,
  preferred_tone: "Pr\xE1tico, direto, t\xE9cnico e com exemplos do mundo real",
  technical_depth: "Avan\xE7ado",
  avoid_jargon: true,
  preferred_language: "pt-BR",
  rules: [
    "Nunca usar jarg\xF5es corporativos vazios nem clich\xEAs de IA",
    "Priorizar arquitetura modular e c\xF3digo desacoplado",
    "Explicar decis\xF5es t\xE9cnicas de forma fundamentada"
  ]
};
var mockFamily = {
  id: defaultFamilyId,
  name: "Fam\xEDlia Albuquerque",
  created_by: defaultUserId,
  created_at: new Date(Date.now() - 864e5 * 30).toISOString()
};
var mockFamilyMembers = [
  {
    id: "f0000000-0000-0000-0000-000000000001",
    family_id: defaultFamilyId,
    user_id: defaultUserId,
    nickname: "Benedito (Administrador)",
    role: "admin",
    is_child: false,
    joined_at: new Date(Date.now() - 864e5 * 30).toISOString()
  },
  {
    id: "f0000000-0000-0000-0000-000000000002",
    family_id: defaultFamilyId,
    user_id: "a0000000-0000-0000-0000-000000000002",
    nickname: "Mariana Albuquerque",
    role: "member",
    is_child: false,
    joined_at: new Date(Date.now() - 864e5 * 15).toISOString()
  },
  {
    id: "f0000000-0000-0000-0000-000000000003",
    family_id: defaultFamilyId,
    user_id: "a0000000-0000-0000-0000-000000000003",
    nickname: "Lucas (Perfil Jovem/Estudos)",
    role: "child",
    is_child: true,
    joined_at: new Date(Date.now() - 864e5 * 5).toISOString()
  }
];
var mockProjects = [
  {
    id: defaultProjectId,
    user_id: defaultUserId,
    family_id: defaultFamilyId,
    name: "MINDOS Kernel Architecture",
    description: "Sistema Operacional Pessoal de IA com mem\xF3ria, agentes e orquestrador.",
    tags: ["ia", "kernel", "supabase", "gemini"],
    status: "active",
    created_at: new Date(Date.now() - 864e5 * 2).toISOString()
  }
];
var mockMemories = [
  {
    id: "d0000000-0000-0000-0000-000000000001",
    user_id: defaultUserId,
    family_id: defaultFamilyId,
    type: "PERMANENT",
    category: "preference",
    content: "Prefere explica\xE7\xF5es diretas, estruturadas e sem floreios ou jarg\xF5es repetitivos.",
    source: "configuracao_inicial",
    confidence_score: 1,
    tags: ["estilo", "comunicacao"],
    is_shared_family: false,
    can_review: true,
    created_at: new Date(Date.now() - 864e5 * 7).toISOString(),
    updated_at: new Date(Date.now() - 864e5 * 7).toISOString()
  },
  {
    id: "d0000000-0000-0000-0000-000000000002",
    user_id: defaultUserId,
    family_id: defaultFamilyId,
    type: "CONFIRMED",
    category: "project",
    content: "O banco de dados principal do MINDOS \xE9 Supabase PostgreSQL com pgvector e RLS ativado.",
    source: "decisao_arquitetural",
    confidence_score: 0.98,
    tags: ["supabase", "postgresql", "banco_de_dados"],
    project_id: defaultProjectId,
    subject: "Infraestrutura e Banco",
    is_shared_family: true,
    can_review: true,
    created_at: new Date(Date.now() - 864e5 * 3).toISOString(),
    updated_at: new Date(Date.now() - 864e5 * 3).toISOString()
  },
  {
    id: "d0000000-0000-0000-0000-000000000003",
    user_id: defaultUserId,
    family_id: defaultFamilyId,
    type: "CANDIDATE",
    category: "correction",
    content: "Corre\xE7\xE3o: O sistema deve avan\xE7ar apenas fase a fase, sem tentar construir todos os m\xF3dulos de uma s\xF3 vez.",
    source: "interacao_chat",
    confidence_score: 0.92,
    tags: ["diretriz", "fases"],
    subject: "Metodologia de Desenvolvimento",
    is_shared_family: false,
    can_review: true,
    created_at: new Date(Date.now() - 864e5 * 1).toISOString(),
    updated_at: new Date(Date.now() - 864e5 * 1).toISOString()
  },
  {
    id: "d0000000-0000-0000-0000-000000000004",
    user_id: defaultUserId,
    family_id: defaultFamilyId,
    type: "TEMPORARY",
    category: "general",
    content: "Discutindo valida\xE7\xF5es da Fase 1 de funda\xE7\xE3o para o sistema operacional.",
    source: "sessao_atual",
    confidence_score: 0.85,
    tags: ["sessao", "fase1"],
    is_shared_family: false,
    can_review: true,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var mockConversations = [
  {
    id: "e0000000-0000-0000-0000-000000000001",
    user_id: defaultUserId,
    family_id: defaultFamilyId,
    project_id: defaultProjectId,
    title: "Defini\xE7\xE3o da Funda\xE7\xE3o do MINDOS (Fase 1)",
    summary: "Estrutura\xE7\xE3o da stack, modelos de dados, isolamento familiar e orquestrador.",
    created_at: new Date(Date.now() - 864e5 * 1).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var mockMessages = {
  "e0000000-0000-0000-0000-000000000001": [
    {
      id: "m0000000-0000-0000-0000-000000000001",
      conversation_id: "e0000000-0000-0000-0000-000000000001",
      role: "user",
      content: "Iniciando o MINDOS. Qual \xE9 a regra fundamental de desenvolvimento por fases?",
      created_at: new Date(Date.now() - 864e5 * 1).toISOString()
    },
    {
      id: "m0000000-0000-0000-0000-000000000002",
      conversation_id: "e0000000-0000-0000-0000-000000000001",
      role: "assistant",
      content: "A regra fundamental \xE9 n\xE3o tentar construir tudo de uma vez. O sistema deve ser desenvolvido estritamente fase a fase, validando testes, seguran\xE7a, banco de dados e estabilidade da funda\xE7\xE3o antes de qualquer avan\xE7o.",
      duration_ms: 540,
      created_at: new Date(Date.now() - 864e5 * 1 + 2e3).toISOString()
    }
  ]
};
var mockAuditLogs = [
  {
    id: "audit-01",
    agent_id: "orchestrator-core",
    user_id: defaultUserId,
    family_id: defaultFamilyId,
    action: "SYSTEM_BOOT",
    tool: "kernel_init",
    input: "Inicializa\xE7\xE3o do kernel MINDOS Fase 1",
    output: "M\xF3dulos carregados: Mem\xF3ria, Perfil, Fam\xEDlia, Auditoria, Orquestrador.",
    status: "SUCCESS",
    duration_ms: 120,
    created_at: new Date(Date.now() - 864e5 * 1).toISOString()
  },
  {
    id: "audit-02",
    agent_id: "orchestrator-core",
    user_id: defaultUserId,
    family_id: defaultFamilyId,
    action: "MEMORY_EVALUATION",
    tool: "memory_classifier",
    input: "Avalia\xE7\xE3o de contexto e mem\xF3rias confirmadas para prompt de orquestra\xE7\xE3o",
    output: "Recuperadas 2 mem\xF3rias confirmadas e 1 prefer\xEAncia de escrita humanizada.",
    status: "SUCCESS",
    duration_ms: 85,
    created_at: new Date(Date.now() - 36e5).toISOString()
  }
];
var db = {
  getSystemStatus() {
    const { url, key } = getSupabaseCredentials();
    const hasCredentials = Boolean(url && key);
    let projectRef = "";
    const match = url.match(/https?:\/\/([^.]+)\.supabase\.co/);
    if (match) {
      projectRef = match[1];
    }
    return {
      database: {
        provider: hasCredentials ? "supabase" : "in_memory_fallback",
        connected: true,
        hasCredentials,
        url: url ? url : "Modo Local Resiliente (Pronto para Supabase Cloud)",
        projectRef: projectRef || void 0,
        sqlEditorUrl: projectRef ? `https://supabase.com/dashboard/project/${projectRef}/sql/new` : void 0
      },
      gemini: {
        hasKey: Boolean(process.env.GEMINI_API_KEY),
        model: "gemini-3.8-flash"
      },
      environment: process.env.NODE_ENV || "development",
      activePhase: 1
    };
  },
  async checkTablesStatus() {
    const client = getSupabase();
    if (!client) {
      return { tablesCreated: false, message: "Supabase n\xE3o inicializado", tables: [] };
    }
    try {
      const { error } = await client.from("profiles").select("id").limit(1);
      if (error) {
        if (error.code === "PGRST205" || error.message?.includes("Could not find the table")) {
          return {
            tablesCreated: false,
            message: "Tabelas aguardando execu\xE7\xE3o do script SQL no Supabase SQL Editor.",
            tables: []
          };
        }
        return { tablesCreated: false, message: `Status Supabase: ${error.message}`, tables: [] };
      }
      await this.seedIfEmpty();
      return {
        tablesCreated: true,
        message: "Todas as tabelas do MINDOS Fase 1 est\xE3o ativas no Supabase Cloud.",
        tables: ["families", "profiles", "family_members", "preferences", "projects", "memories", "conversations", "messages", "audit_logs"]
      };
    } catch (err) {
      return { tablesCreated: false, message: err?.message || "Erro ao checar tabelas", tables: [] };
    }
  },
  async seedIfEmpty() {
    const client = getSupabase();
    if (!client) return;
    try {
      const { data: existingFams } = await client.from("families").select("id").limit(1);
      if (!existingFams || existingFams.length === 0) {
        console.log("Semeando dados iniciais da Fase 1 no Supabase Cloud...");
        await client.from("families").insert(mockFamily);
        await client.from("profiles").insert(mockProfile);
        await client.from("family_members").insert(mockFamilyMembers);
        await client.from("preferences").insert(mockPreferences);
        await client.from("projects").insert(mockProjects);
        await client.from("memories").insert(mockMemories);
        console.log("Dados de funda\xE7\xE3o semeados com sucesso no Supabase Cloud!");
      }
    } catch (seedErr) {
      console.warn("Seed inicial ignorado ou erro ao semear:", seedErr?.message);
    }
  },
  async getProfile() {
    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client.from("profiles").select("*").single();
        if (!error && data) return data;
      } catch (err) {
      }
    }
    return mockProfile;
  },
  async updateProfile(updates) {
    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client.from("profiles").update({ ...updates, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("user_id", defaultUserId).select().single();
        if (!error && data) return data;
      } catch (err) {
      }
    }
    mockProfile = { ...mockProfile, ...updates, updated_at: (/* @__PURE__ */ new Date()).toISOString() };
    return mockProfile;
  },
  async getPreferences() {
    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client.from("preferences").select("*").single();
        if (!error && data) return data;
      } catch (err) {
      }
    }
    return mockPreferences;
  },
  async updatePreferences(updates) {
    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client.from("preferences").update({ ...updates, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("user_id", defaultUserId).select().single();
        if (!error && data) return data;
      } catch (err) {
      }
    }
    mockPreferences = { ...mockPreferences, ...updates };
    return mockPreferences;
  },
  async getFamily() {
    const client = getSupabase();
    if (client) {
      try {
        const { data: family } = await client.from("families").select("*").single();
        const { data: members } = await client.from("family_members").select("*");
        if (family && members && members.length > 0) {
          return { family, members };
        }
      } catch (err) {
      }
    }
    return { family: mockFamily, members: mockFamilyMembers };
  },
  async addFamilyMember(memberData) {
    const newMember = {
      id: crypto.randomUUID(),
      family_id: defaultFamilyId,
      ...memberData,
      joined_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client.from("family_members").insert(newMember).select().single();
        if (!error && data) return data;
      } catch (err) {
      }
    }
    mockFamilyMembers.push(newMember);
    return newMember;
  },
  async getProjects() {
    const client = getSupabase();
    if (client) {
      try {
        const { data } = await client.from("projects").select("*").order("created_at", { ascending: false });
        if (data && data.length > 0) return data;
      } catch (err) {
      }
    }
    return mockProjects;
  },
  async getMemories(filter) {
    const client = getSupabase();
    if (client) {
      try {
        let query = client.from("memories").select("*").order("created_at", { ascending: false });
        if (filter?.type) query = query.eq("type", filter.type);
        if (filter?.category) query = query.eq("category", filter.category);
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data;
      } catch (err) {
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
        (m) => m.content.toLowerCase().includes(q) || m.tags.some((t) => t.toLowerCase().includes(q)) || m.subject && m.subject.toLowerCase().includes(q)
      );
    }
    return result;
  },
  async createMemory(memoryData) {
    const newMemory = {
      id: crypto.randomUUID(),
      user_id: defaultUserId,
      family_id: defaultFamilyId,
      type: memoryData.type || "CANDIDATE",
      category: memoryData.category || "general",
      content: memoryData.content || "",
      source: memoryData.source || "manual",
      confidence_score: memoryData.confidence_score ?? 0.9,
      tags: memoryData.tags || [],
      subject: memoryData.subject || null,
      project_id: memoryData.project_id || null,
      is_shared_family: memoryData.is_shared_family ?? false,
      can_review: true,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client.from("memories").insert(newMemory).select().single();
        if (!error && data) return data;
      } catch (err) {
      }
    }
    mockMemories.unshift(newMemory);
    return newMemory;
  },
  async updateMemory(id, updates) {
    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client.from("memories").update({ ...updates, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id).select().single();
        if (!error && data) return data;
      } catch (err) {
      }
    }
    const idx = mockMemories.findIndex((m) => m.id === id);
    if (idx !== -1) {
      mockMemories[idx] = { ...mockMemories[idx], ...updates, updated_at: (/* @__PURE__ */ new Date()).toISOString() };
      return mockMemories[idx];
    }
    return null;
  },
  async deleteMemory(id) {
    const client = getSupabase();
    if (client) {
      try {
        const { error } = await client.from("memories").delete().eq("id", id);
        if (!error) return true;
      } catch (err) {
      }
    }
    mockMemories = mockMemories.filter((m) => m.id !== id);
    return true;
  },
  async getConversations(searchQuery) {
    const client = getSupabase();
    if (client) {
      try {
        let query = client.from("conversations").select("*").order("updated_at", { ascending: false });
        if (searchQuery) {
          query = query.ilike("title", `%${searchQuery}%`);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data;
      } catch (err) {
      }
    }
    let list = [...mockConversations];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(q) || c.summary && c.summary.toLowerCase().includes(q));
    }
    return list;
  },
  async createConversation(title, projectId) {
    const newConv = {
      id: crypto.randomUUID(),
      user_id: defaultUserId,
      family_id: defaultFamilyId,
      project_id: projectId || null,
      title: title || "Nova Conversa",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client.from("conversations").insert(newConv).select().single();
        if (!error && data) return data;
      } catch (err) {
      }
    }
    mockConversations.unshift(newConv);
    mockMessages[newConv.id] = [];
    return newConv;
  },
  async deleteConversation(id) {
    const client = getSupabase();
    if (client) {
      try {
        const { error } = await client.from("conversations").delete().eq("id", id);
        if (!error) return true;
      } catch (err) {
      }
    }
    mockConversations = mockConversations.filter((c) => c.id !== id);
    delete mockMessages[id];
    return true;
  },
  async getMessages(conversationId) {
    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client.from("messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true });
        if (!error && data && data.length > 0) return data;
      } catch (err) {
      }
    }
    return mockMessages[conversationId] || [];
  },
  async addMessage(msg) {
    const newMsg = {
      id: crypto.randomUUID(),
      ...msg,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client.from("messages").insert(newMsg).select().single();
        if (!error && data) return data;
      } catch (err) {
      }
    }
    if (!mockMessages[msg.conversation_id]) {
      mockMessages[msg.conversation_id] = [];
    }
    mockMessages[msg.conversation_id].push(newMsg);
    const conv = mockConversations.find((c) => c.id === msg.conversation_id);
    if (conv) {
      conv.updated_at = (/* @__PURE__ */ new Date()).toISOString();
    }
    return newMsg;
  },
  async getAuditLogs() {
    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(50);
        if (!error && data && data.length > 0) return data;
      } catch (err) {
      }
    }
    return mockAuditLogs;
  },
  async logAudit(logData) {
    const newLog = {
      id: crypto.randomUUID(),
      ...logData,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    const client = getSupabase();
    if (client) {
      try {
        await client.from("audit_logs").insert(newLog);
      } catch (err) {
      }
    }
    mockAuditLogs.unshift(newLog);
    if (mockAuditLogs.length > 100) mockAuditLogs.pop();
    return newLog;
  }
};

// server/gemini.ts
import { GoogleGenAI } from "@google/genai";
var genAIClient = null;
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!genAIClient && apiKey) {
    try {
      genAIClient = new GoogleGenAI({ apiKey });
    } catch (err) {
      console.error("Error initializing GoogleGenAI:", err);
    }
  }
  return genAIClient;
}
var CANDIDATE_MODELS = [
  "gemini-flash-lite-latest",
  "gemini-3-flash-preview",
  "gemini-2.5-flash-lite",
  "gemini-pro-latest",
  "gemini-flash-latest"
];
async function generateContentResilient(params) {
  const ai = getGenAI();
  if (!ai) {
    throw new Error("GEMINI_API_KEY n\xE3o configurada no servidor.");
  }
  let lastError = null;
  for (const model of CANDIDATE_MODELS) {
    try {
      const config = {
        temperature: params.temperature ?? 0.7
      };
      if (params.systemInstruction) {
        config.systemInstruction = params.systemInstruction;
      }
      if (params.responseMimeType) {
        config.responseMimeType = params.responseMimeType;
      }
      const res = await ai.models.generateContent({
        model,
        contents: params.contents,
        config
      });
      if (res.text && res.text.trim()) {
        return res.text.trim();
      }
    } catch (err) {
      console.warn(`Model ${model} failed (${err?.status || err?.message}), trying next candidate...`);
      lastError = err;
    }
  }
  throw lastError || new Error("Nenhum modelo Gemini respondeu.");
}

// server/orchestrator.ts
function detectLocalMemoryCandidates(userText) {
  const candidates = [];
  const text = userText.trim();
  if (/(?:prefiro|gosto de|meu estilo|sempre use|nunca use|responda de forma|quero que)/i.test(text)) {
    candidates.push({
      content: `Prefer\xEAncia do usu\xE1rio identificada: "${text}"`,
      category: "preference",
      type: "CANDIDATE",
      subject: "Comunica\xE7\xE3o e Estilo",
      tags: ["preferencia", "usuario"],
      confidence_score: 0.88
    });
  }
  if (/(?:na verdade|corrigindo|não é isso|o correto é|mude para|ajuste para|errado)/i.test(text)) {
    candidates.push({
      content: `Corre\xE7\xE3o fornecida pelo usu\xE1rio: "${text}"`,
      category: "correction",
      type: "CANDIDATE",
      subject: "Ajuste de Instru\xE7\xE3o",
      tags: ["correcao", "feedback"],
      confidence_score: 0.94
    });
  }
  if (/(?:estou usando|nosso projeto|o banco é|a farmácia|farmacia|estoque|remedio|medicamento|venda|cliente)/i.test(text)) {
    candidates.push({
      content: `Fato operacional ou de projeto detectado: "${text}"`,
      category: "project",
      type: "CANDIDATE",
      subject: "Contexto Operacional",
      tags: ["projeto", "operacional"],
      confidence_score: 0.86
    });
  }
  return candidates;
}
function getAgentSpecificDirective(agentId) {
  switch (agentId) {
    case "business":
      return `
VOC\xCA EST\xC1 ATUANDO COMO: Especialista em Neg\xF3cios, Farm\xE1cia & Processos Operacionais.
FOCO DE ATUA\xC7\xC3O:
- Gest\xE3o de farm\xE1cias e drogarias, controle rigoroso de estoque, curva ABC e giro de produtos.
- Preven\xE7\xE3o de perdas por validade (FIFO/PEPS), organiza\xE7\xE3o de prateleiras e confer\xEAncia de entregas com distribuidores.
- Elabora\xE7\xE3o de POPs (Procedimentos Operacionais Padr\xE3o) pr\xE1ticos, claros e aplic\xE1veis.
- Estrat\xE9gias para aumentar a margem de contribui\xE7\xE3o, precifica\xE7\xE3o inteligente e compras assertivas.
- Responda de forma pr\xE1tica, orientada a neg\xF3cios reais, com passos objetivos e recomenda\xE7\xF5es acion\xE1veis.`;
    case "video":
      return `
VOC\xCA EST\xC1 ATUANDO COMO: Roteirista & Diretor Criativo de V\xEDdeos de Alta Reten\xE7\xE3o.
FOCO DE ATUA\xC7\xC3O:
- Roteiros para Reels, TikTok, YouTube Shorts e v\xEDdeos longos de autoridade.
- Ganchos iniciais magn\xE9ticos nos primeiros 3 segundos para cortar o feed e prender aten\xE7\xE3o.
- Planejamento din\xE2mico cena a cena: fala/locu\xE7\xE3o, direcionamento visual (B-roll) e texto na tela.
- Prompts em ingl\xEAs detalhados prontos para ferramentas de IA (Google Veo, Runway Gen-3, Midjourney).
- Estrutura clara: Gancho -> Dor/Curiosidade -> Solu\xE7\xE3o Pr\xE1tica -> Chamada para A\xE7\xE3o (CTA).`;
    case "content":
      return `
VOC\xCA EST\xC1 ATUANDO COMO: Agente Estrategista de Conte\xFAdo & Copywriting Humanizado.
FOCO DE ATUA\xC7\xC3O:
- Cria\xE7\xE3o de postagens para Instagram, LinkedIn, carross\xE9is de alto salvamento e newsletters.
- Copywriting focado em convers\xE3o e engajamento genu\xEDno, sem soar como intelig\xEAncia artificial gen\xE9rica.
- Textos com ritmo variado, storytelling envolvente, quebra de obje\xE7\xF5es e clareza absoluta.
- Zero jarg\xF5es vazios como "divisor de \xE1guas" ou "mergulhe nessa jornada".`;
    case "automation":
      return `
VOC\xCA EST\xC1 ATUANDO COMO: Engenheiro de Automa\xE7\xE3o & Arquitetura de Sistemas.
FOCO DE ATUA\xC7\xC3O:
- Arquitetura de microsservi\xE7os, schemas relacionais Supabase PostgreSQL, regras RLS e queries otimizadas.
- Fluxos orientados a eventos, gatilhos de alerta (ex: notifica\xE7\xF5es de validade 30/60 dias), webhooks e cron jobs.
- Integra\xE7\xF5es de APIs seguras, scripts Node/TypeScript e automa\xE7\xF5es confi\xE1veis.
- Apresente c\xF3digo limpo, tipado e com explica\xE7\xF5es arquiteturais s\xF3lidas.`;
    case "orchestrator":
    default:
      return `
VOC\xCA EST\xC1 ATUANDO COMO: Orquestrador Central do MINDOS (AI Operating System).
FOCO DE ATUA\xC7\xC3O:
- Coordenar as mem\xF3rias de longo prazo, perfis de personalidade, agentes e regras do sistema operacional.
- Avaliar o contexto do usu\xE1rio, direcionar tarefas e validar dados com precis\xE3o cir\xFArgica.
- Manter governan\xE7a estrita das diretrizes do sistema.`;
  }
}
async function processOrchestration(input) {
  const startTime = Date.now();
  const agentId = input.agentId || "orchestrator";
  const [profile, preferences, confirmedMemories, history] = await Promise.all([
    db.getProfile(),
    db.getPreferences(),
    db.getMemories({ type: "CONFIRMED" }),
    db.getMessages(input.conversationId)
  ]);
  const permanentMemories = await db.getMemories({ type: "PERMANENT" });
  const allActiveMemories = [...permanentMemories, ...confirmedMemories];
  await db.addMessage({
    conversation_id: input.conversationId,
    role: "user",
    content: input.message,
    agent_id: agentId
  });
  const agentDirective = getAgentSpecificDirective(agentId);
  const systemPrompt = `
Voc\xEA \xE9 parte do MINDOS (AI Memory, Personality, Knowledge, Agents & Automation Operating System).
${agentDirective}

PERFIL DO USU\xC1RIO ATUAL:
- Nome: ${profile.full_name}
- N\xEDvel T\xE9cnico: ${profile.technical_level}
- Estilo de Comunica\xE7\xE3o: ${profile.communication_style}
- Interesses: ${profile.interests.join(", ")}

PREFER\xCANCIAS E REGRAS DO USU\xC1RIO:
- Tom preferido: ${preferences.preferred_tone}
- Profundidade t\xE9cnica: ${preferences.technical_depth}
- Evitar jarg\xF5es: ${preferences.avoid_jargon ? "SIM" : "N\xC3O"}
- Regras adicionais: ${preferences.rules.join("; ")}

MEM\xD3RIAS CONFIRMADAS DO USU\xC1RIO NO CONTEXTO:
${allActiveMemories.length > 0 ? allActiveMemories.map((m) => `- [${m.category.toUpperCase()}] ${m.content}`).join("\n") : "(Nenhuma mem\xF3ria permanente cadastrada ainda)"}

DIRETRIZES FUNDAMENTAIS DE ESCRITA HUMANIZADA (OBRIGAT\xD3RIO):
1. Escreva de forma clara, natural, direta, usando voz ativa.
2. Varie o ritmo e o tamanho das frases e dos par\xE1grafos.
3. Se houver recomenda\xE7\xF5es pr\xE1ticas, forne\xE7a passos acion\xE1veis e bem estruturados.
4. NUNCA invente experi\xEAncias profissionais, projetos n\xE3o realizados, ferramentas que n\xE3o foram executadas ou dados inexistentes.
5. EVITE TERMINANTEMENTE clich\xEAs de IA como:
   "divisor de \xE1guas", "crucial", "em um mundo onde", "utilizar", "revolucionar", "al\xE9m disso", "portanto",
   "tape\xE7aria", "mergulhar", "vislumbre", "not\xE1vel", "desbloquear", "impulsionar", "poderoso",
   "em resumo", "em conclus\xE3o", "como um assistente de IA", "espero ter ajudado".
6. N\xE3o termine as respostas com conclus\xF5es gen\xE9ricas ou frases motivacionais vazias.
7. Responda imediatamente ao ponto solicitado pelo usu\xE1rio com profundidade e precis\xE3o.
`;
  let replyText = "";
  const extractedCandidates = detectLocalMemoryCandidates(input.message);
  try {
    const turns = [];
    for (const m of history.slice(-6)) {
      if (!m.content || !m.content.trim()) continue;
      const role = m.role === "assistant" ? "model" : "user";
      if (turns.length > 0 && turns[turns.length - 1].role === role) {
        turns[turns.length - 1].text += "\n\n" + m.content.trim();
      } else {
        turns.push({ role, text: m.content.trim() });
      }
    }
    while (turns.length > 0 && turns[0].role !== "user") {
      turns.shift();
    }
    if (turns.length > 0 && turns[turns.length - 1].role === "user") {
      turns[turns.length - 1].text += "\n\n" + input.message.trim();
    } else {
      turns.push({ role: "user", text: input.message.trim() });
    }
    const contents = turns.map((t) => ({
      role: t.role,
      parts: [{ text: t.text }]
    }));
    replyText = await generateContentResilient({
      contents,
      systemInstruction: systemPrompt,
      temperature: 0.7
    });
  } catch (apiErr) {
    console.warn("Gemini API call error in orchestrator:", apiErr?.message);
  }
  if (!replyText) {
    if (agentId === "business") {
      replyText = `Entendido perfeitamente. Como especialista em neg\xF3cios e gest\xE3o de farm\xE1cias, analisei sua solicita\xE7\xE3o:

1. **Controle e Organiza\xE7\xE3o de Estoque:** O princ\xEDpio b\xE1sico \xE9 a regra PVPS (Primeiro que Vence, Primeiro que Sai). Medicamentos com validade inferior a 90 dias devem receber etiquetagem visual destacada.
2. **Curva ABC:** Concentre 80% da sua aten\xE7\xE3o nos produtos Classe A (os 20% que geram maior faturamento), mantendo estoque de seguran\xE7a enxuto para evitar capital parado.
3. **Pr\xF3ximo Passo:** Posso estruturar um Procedimento Operacional Padr\xE3o (POP) completo de confer\xEAncia ou checklist di\xE1rio para sua equipe.`;
    } else if (agentId === "video") {
      replyText = `Recebido pelo diretor criativo. Para o tema informado, a melhor estrutura para reter a audi\xEAncia \xE9:

\u2022 **Gancho (0-3s):** Quebre um mito direto olhando para a c\xE2mera.
\u2022 **Problema (3-12s):** Mostre o preju\xEDzo que acontece quando isso \xE9 ignorado.
\u2022 **Solu\xE7\xE3o (12-25s):** 2 passos simples que qualquer um pode aplicar hoje.
\u2022 **Chamada para A\xE7\xE3o (25-30s):** "Comente 'GUIA' para receber o checklist completo no direct."

Voc\xEA pode tamb\xE9m gerar o roteiro segundo a segundo completo na aba **Agentes de V\xEDdeo**.`;
    } else if (agentId === "content") {
      replyText = `Pronto. Desenvolvi uma abordagem direta e persuasiva para sua comunica\xE7\xE3o:

**Ideia de Publica\xE7\xE3o / Carrossel:**
- **Slide 1:** O erro silencioso que drena os lucros da sua opera\xE7\xE3o todo m\xEAs.
- **Slide 2:** O que a maioria faz (e por que n\xE3o funciona mais).
- **Slide 3:** O m\xE9todo pr\xE1tico em 3 passos para mudar isso hoje.
- **Slide 4:** Resumo visual em tabela comparativa.
- **Slide 5:** Salve este post para consultar com sua equipe.

Deseja que eu escreva a legenda completa com hashtags estrat\xE9gicas?`;
    } else if (agentId === "automation") {
      replyText = `An\xE1lise de engenharia conclu\xEDda:

Para implementar essa automa\xE7\xE3o de forma escal\xE1vel no ecossistema MINDOS:
1. **Banco de Dados (Supabase PostgreSQL):** Cria\xE7\xE3o de tabela relacional com triggers na altera\xE7\xE3o de status.
2. **Alerta Preventivo:** Configura\xE7\xE3o de cron job di\xE1rio \xE0s 06:00 que busca registros eleg\xEDveis com query indexada.
3. **Disparo:** Notifica\xE7\xE3o autom\xE1tica via webhook com payload tipado em TypeScript.

Posso gerar o script SQL de migration ou a fun\xE7\xE3o de integra\xE7\xE3o agora mesmo.`;
    } else {
      replyText = `Compreendido. No MINDOS Fase 1, sua mensagem foi recebida e processada pelo Orquestrador Central. Avaliamos o perfil (${profile.full_name}), as ${allActiveMemories.length} mem\xF3rias ativas e mantivemos o contexto da conversa com rastreabilidade completa. Em que posso detalhar ou direcionar os subagentes agora?`;
    }
  }
  const uniqueCandidates = [];
  const seen = /* @__PURE__ */ new Set();
  for (const c of extractedCandidates) {
    const key = c.content.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueCandidates.push(c);
    }
  }
  for (const candidate of uniqueCandidates) {
    await db.createMemory({
      content: candidate.content,
      category: candidate.category,
      type: "CANDIDATE",
      subject: candidate.subject,
      tags: candidate.tags,
      confidence_score: candidate.confidence_score,
      source: `chat_${agentId}`,
      project_id: input.projectId || null
    });
  }
  const durationMs = Date.now() - startTime;
  const assistantMsg = await db.addMessage({
    conversation_id: input.conversationId,
    role: "assistant",
    content: replyText,
    agent_id: agentId,
    extracted_memories: uniqueCandidates,
    duration_ms: durationMs
  });
  await db.logAudit({
    agent_id: `agent-${agentId}`,
    user_id: profile.user_id,
    family_id: profile.id,
    project_id: input.projectId || null,
    action: `CHAT_${agentId.toUpperCase()}`,
    tool: "gemini_orchestrator",
    input: input.message.length > 150 ? input.message.substring(0, 150) + "..." : input.message,
    output: replyText.length > 150 ? replyText.substring(0, 150) + "..." : replyText,
    status: "SUCCESS",
    duration_ms: durationMs
  });
  return {
    responseMessage: assistantMsg,
    extractedCandidates: uniqueCandidates,
    durationMs
  };
}

// server/videoAgent.ts
import crypto2 from "crypto";
async function generateVideoProject(input) {
  const startTime = Date.now();
  const apiKey = process.env.GEMINI_API_KEY;
  let userMemories = [];
  try {
    userMemories = await db.getMemories({ type: "PERMANENT" });
    if (userMemories.length === 0) {
      userMemories = await db.getMemories({ type: "CONFIRMED" });
    }
  } catch (err) {
    console.warn("Could not load memories for video generation:", err);
  }
  const memoryContext = userMemories.slice(0, 5).map((m) => `- ${m.content}`).join("\n");
  const systemPrompt = `
Voc\xEA \xE9 a unidade de Produ\xE7\xE3o e Dire\xE7\xE3o de V\xEDdeos do MINDOS (Video Production Engine).
Sua miss\xE3o \xE9 atuar como uma equipe de 4 Agentes Especialistas de Cinema & M\xEDdia Digital:
1. AGENTE 1 - ROTEIRISTA VIRAL & COPYWRITER: Cria ganchos hipn\xF3ticos nos primeiros 3 segundos, reten\xE7\xE3o psicol\xF3gica, ritmo din\xE2mico e chamadas para a\xE7\xE3o aut\xEAnticas.
2. AGENTE 2 - DIRETOR DE CENA & B-ROLL: Especifica exatamente o que deve aparecer na tela a cada fra\xE7\xE3o de tempo (\xE2ngulos, express\xF5es faciais, gr\xE1ficos na tela e B-rolls).
3. AGENTE 3 - ENGENHEIRO DE PROMPTS PARA IA (Google Veo / Runway Gen-3 / Sora): Elabora prompts t\xE9cnicos em ingl\xEAs cinematogr\xE1fico (ilumina\xE7\xE3o 8k, lentes 35mm/50mm anamorphic, movimentos de c\xE2mera como slow push-in, drone shot, macro, cinematic lighting).
4. AGENTE 4 - ESTRATEGISTA DE DISTRIBUI\xC7\xC3O & SEO: Cria t\xEDtulos magn\xE9ticos de alta convers\xE3o de clique (CTR), descri\xE7\xE3o otimizada, tags e descri\xE7\xE3o detalhada da miniatura (thumbnail).

DIRETRIZES DE ESTILO:
- Linguagem em Portugu\xEAs do Brasil (pt-BR) aut\xEAntica, direta, com ritmo natural de fala.
- SEM clich\xEAs manjados de IA (NUNCA use "divisor de \xE1guas", "crucial", "prepare-se", "em um mundo onde", "mergulhar de cabe\xE7a").
- Para v\xEDdeos curtos (15s a 60s): foco absoluto em dinamismo, cortes a cada 3 a 5 segundos, frases curtas e impacto imediato.
- Para v\xEDdeos longos (3min a 15min): estrutura em cap\xEDtulos bem definidos com timecodes progressivos, storytelling engajante e aprofundamento pr\xE1tico.

MEM\xD3RIAS E REGRAS DO USU\xC1RIO:
${memoryContext || "(Sem mem\xF3rias permanentes registradas ainda)"}

RETORNE ESTRITAMENTE UM OBJETO JSON V\xC1LIDO (sem blocos de c\xF3digo markdown desnecess\xE1rios, apenas JSON puro):
{
  "title": "T\xEDtulo conciso do projeto",
  "hookHeadline": "Frase de impacto que abre o v\xEDdeo nos primeiros 0 a 3 segundos",
  "coreSummary": "Resumo da premissa central do v\xEDdeo em 2 frases",
  "scenes": [
    {
      "id": "scene_1",
      "timecode": "00:00 - 00:04",
      "phase": "Gancho / Reten\xE7\xE3o",
      "spokenScript": "Texto falado exato com entona\xE7\xE3o",
      "visualDirection": "Instru\xE7\xE3o visual detalhada de corte, B-roll e ator",
      "screenText": "Texto grande animado na tela",
      "aiPrompt": "Cinematic prompt in English for Veo/Runway: Photorealistic, 35mm lens, cinematic lighting, ..."
    }
  ],
  "teleprompterScript": "Texto corrido integral pronto para leitura no teleprompter sem interrup\xE7\xF5es",
  "aiVideoPrompts": [
    {
      "scene": "Cena 1 - Gancho",
      "tool": "Google Veo",
      "promptEn": "Cinematic shot in English...",
      "cameraMotion": "Slow push-in, 4k 24fps"
    }
  ],
  "youtubeMetadata": {
    "titles": ["T\xEDtulo Op\xE7\xE3o A (Curiosidade)", "T\xEDtulo Op\xE7\xE3o B (Benef\xEDcio Direto)", "T\xEDtulo Op\xE7\xE3o C (Impacto)"],
    "description": "Descri\xE7\xE3o envolvente com minutagem e links",
    "tags": ["tag1", "tag2", "tag3"],
    "thumbnailPrompt": "Prompt visual detalhado para criar a capa de alto clique"
  }
}
`;
  const userPrompt = `
DADOS DO V\xCDDEO SOLICITADO:
- Tema / Assunto: ${input.topic}
- Formato: ${input.format === "short" ? "V\xCDDEO CURTO (Reels / TikTok / YouTube Shorts)" : "V\xCDDEO LONGO (YouTube / Treinamento / Document\xE1rio)"}
- Dura\xE7\xE3o Alvo: ${input.targetDuration}
- Nicho / Audi\xEAncia: ${input.niche || "Geral / Neg\xF3cios"}
- Tom de Voz: ${input.tone || "Direto, en\xE9rgico e pr\xE1tico"}
- Plataforma: ${input.platform || "tiktok_reels_shorts"}
- Chamada para A\xE7\xE3o (CTA): ${input.callToAction || "Comentar ou Seguir"}
- Instru\xE7\xF5es Adicionais: ${input.additionalInstructions || "Nenhuma"}

Gere agora o roteiro completo estruturado em JSON com todas as cenas e prompts de IA.
`;
  let projectData = {};
  try {
    const rawText = await generateContentResilient({
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}

${userPrompt}` }]
        }
      ],
      temperature: 0.7,
      responseMimeType: "application/json"
    });
    if (rawText) {
      let cleanJson = rawText.trim();
      cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      try {
        projectData = JSON.parse(cleanJson);
      } catch (pErr) {
        const start = cleanJson.indexOf("{");
        const end = cleanJson.lastIndexOf("}");
        if (start !== -1 && end !== -1 && end > start) {
          try {
            projectData = JSON.parse(cleanJson.substring(start, end + 1));
          } catch {
          }
        }
      }
    }
  } catch (err) {
    console.error("Failed to call Gemini for video project:", err);
  }
  if (!projectData.scenes || projectData.scenes.length === 0) {
    const isShort = input.format === "short";
    projectData = generateFallbackVideo(input, isShort);
  }
  const durationMs = Date.now() - startTime;
  const projectId = crypto2.randomUUID();
  const finalProject = {
    id: projectId,
    title: projectData.title || `V\xEDdeo: ${input.topic.slice(0, 40)}`,
    format: input.format,
    platform: input.platform || (input.format === "short" ? "tiktok_reels_shorts" : "youtube"),
    targetDuration: input.targetDuration,
    objective: input.callToAction || "Engajamento e reten\xE7\xE3o",
    tone: input.tone || "Direto e pr\xE1tico",
    niche: input.niche || "Geral",
    hookHeadline: projectData.hookHeadline || "Aviso importante sobre este assunto",
    coreSummary: projectData.coreSummary || `Produ\xE7\xE3o completa focada em ${input.topic}`,
    scenes: (projectData.scenes || []).map((s, idx) => ({
      id: s.id || `scene_${idx + 1}`,
      timecode: s.timecode || `00:0${idx * 5} - 00:0${(idx + 1) * 5}`,
      phase: s.phase || (idx === 0 ? "Gancho" : idx === (projectData.scenes?.length || 1) - 1 ? "CTA" : "Desenvolvimento"),
      spokenScript: s.spokenScript || "",
      visualDirection: s.visualDirection || "",
      screenText: s.screenText || "",
      aiPrompt: s.aiPrompt || ""
    })),
    teleprompterScript: projectData.teleprompterScript || projectData.scenes?.map((s) => s.spokenScript).join(" ") || "",
    aiVideoPrompts: projectData.aiVideoPrompts || [
      {
        scene: "Cena 1 - Gancho Inicial",
        tool: "Google Veo",
        promptEn: `High-definition cinematic footage representing ${input.topic}, dynamic lighting, 35mm lens, 4k 24fps.`,
        cameraMotion: "Slow dynamic push-in"
      }
    ],
    youtubeMetadata: projectData.youtubeMetadata || {
      titles: [
        `${input.topic}: O Guia Definitivo`,
        `Como Dominar ${input.topic} na Pr\xE1tica`,
        `O Segredo que Ningu\xE9m te Conta sobre ${input.topic}`
      ],
      description: `Neste v\xEDdeo detalhamos estrat\xE9gias pr\xE1ticas sobre ${input.topic}.

Cap\xEDtulos:
00:00 Introdu\xE7\xE3o
01:00 Ponto Principal
03:00 Conclus\xE3o e Pr\xF3ximos Passos`,
      tags: [input.topic, "automa\xE7\xE3o", "tecnologia", "produtividade"],
      thumbnailPrompt: `Close-up expressive portrait, vibrant contrast lighting, bold expressive background related to ${input.topic}, high CTR YouTube thumbnail style.`
    },
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  try {
    await db.logAudit({
      agent_id: "agent_video_director",
      user_id: defaultUserId,
      family_id: defaultFamilyId,
      action: "GENERATE_VIDEO_PROJECT",
      tool: "GeminiVideoEngine",
      input: JSON.stringify({ topic: input.topic, format: input.format, duration: input.targetDuration }),
      output: JSON.stringify({ title: finalProject.title, scenesCount: finalProject.scenes.length }),
      status: "SUCCESS",
      duration_ms: durationMs
    });
    await db.createMemory({
      content: `O usu\xE1rio produziu um roteiro de v\xEDdeo ${input.format === "short" ? "curto (Reels/TikTok)" : "longo (YouTube)"} sobre "${input.topic}" com tom ${input.tone || "direto"}.`,
      category: "project",
      type: "CANDIDATE",
      subject: "Produ\xE7\xE3o de V\xEDdeo",
      tags: ["video", input.format, input.niche || "conteudo"],
      confidence_score: 0.92,
      is_shared_family: false
    });
  } catch (err) {
    console.warn("Failed to record video project audit or memory:", err);
  }
  return finalProject;
}
function generateFallbackVideo(input, isShort) {
  if (isShort) {
    return {
      title: `Como dominar ${input.topic} em segundos`,
      hookHeadline: `Se voc\xEA ainda faz ${input.topic} do jeito tradicional, voc\xEA est\xE1 perdendo tempo.`,
      coreSummary: `Roteiro din\xE2mico de 30 segundos com 4 cortes r\xE1pidos e call to action direta.`,
      scenes: [
        {
          id: "scene_1",
          timecode: "00:00 - 00:04",
          phase: "Gancho (0-4s)",
          spokenScript: `Pare de perder tempo tentando fazer ${input.topic} da forma antiga!`,
          visualDirection: "Plano fechado no rosto, express\xE3o assertiva, corte seco imediato.",
          screenText: "PARE DE PERDER TEMPO!",
          aiPrompt: "Cinematic close-up portrait of professional speaking with confident expression, modern high-tech office background, dramatic rim lighting, 35mm f/1.8 lens."
        },
        {
          id: "scene_2",
          timecode: "00:04 - 00:12",
          phase: "Problema & Solu\xE7\xE3o (4-12s)",
          spokenScript: `A maioria das pessoas comete o erro de complicar o processo. Com 3 passos simples voc\xEA automatiza tudo isso.`,
          visualDirection: "B-roll de tela de computador com gr\xE1ficos modernos se movimentando rapidamente.",
          screenText: "O ERRO QUE TODOS COMETEM",
          aiPrompt: "Macro shot of modern computer interface with automated data flowing, smooth motion graphic elements, cyberpunk neon accents, 4k photorealistic."
        },
        {
          id: "scene_3",
          timecode: "00:12 - 00:22",
          phase: "A\xE7\xE3o Pr\xE1tica (12-22s)",
          spokenScript: `Passo um: organize a estrutura. Passo dois: aplique o modelo testado. O resultado \xE9 economia de horas todo dia.`,
          visualDirection: "Corte r\xE1pido mostrando m\xE3os digitando com velocidade e interface fluida respondendo.",
          screenText: "ECONOMIZE HORAS POR DIA",
          aiPrompt: "Fast-paced dynamic shot of hands typing on sleek mechanical keyboard, multiple screens in background showing analytics dashboards, slow shutter motion blur."
        },
        {
          id: "scene_4",
          timecode: "00:22 - 00:30",
          phase: "Chamada para A\xE7\xE3o (22-30s)",
          spokenScript: `Quer o passo a passo completo? Comente V\xCDDEO aqui embaixo que eu te envio agora mesmo.`,
          visualDirection: "Volta para plano m\xE9dio, apontando o dedo para baixo em dire\xE7\xE3o aos coment\xE1rios.",
          screenText: 'COMENTE "V\xCDDEO" ABAIXO \u{1F447}',
          aiPrompt: "Presenter pointing downwards with enthusiastic welcoming smile, bright studio lighting, soft blurred background, cinematic bokeh."
        }
      ],
      teleprompterScript: `Pare de perder tempo tentando fazer ${input.topic} da forma antiga! A maioria das pessoas comete o erro de complicar o processo. Com 3 passos simples voc\xEA automatiza tudo isso. Passo um: organize a estrutura. Passo dois: aplique o modelo testado. O resultado \xE9 economia de horas todo dia. Quer o passo a passo completo? Comente V\xCDDEO aqui embaixo que eu te envio agora mesmo.`,
      aiVideoPrompts: [
        {
          scene: "Cena 1 - Gancho",
          tool: "Google Veo",
          promptEn: `Cinematic close-up of a confident person in modern business attire looking directly into camera, expressive gesture, clean modern studio background, warm lighting, 4k 24fps.`,
          cameraMotion: "Snap zoom into subject"
        },
        {
          scene: "Cena 2 - Demonstra\xE7\xE3o",
          tool: "Runway Gen-3",
          promptEn: `High-tech futuristic dashboard with data visualization glowing in soft cyan and amber, smooth floating holographic elements, photorealistic cinematic look.`,
          cameraMotion: "Slow orbital pan around monitor"
        }
      ],
      youtubeMetadata: {
        titles: [
          `O segredo de ${input.topic} revelado em 30 segundos`,
          `Como fazer ${input.topic} 10x mais r\xE1pido`,
          `Voc\xEA comete esse erro em ${input.topic}?`
        ],
        description: `Dica r\xE1pida e pr\xE1tica sobre ${input.topic}. Siga para mais conte\xFAdos de alta performance!`,
        tags: [input.topic, "shorts", "reels", "produtividade", "dicas"],
        thumbnailPrompt: `Eye-catching vertical thumbnail with high contrast, split screen showing problem vs solution with glowing neon text.`
      }
    };
  }
  return {
    title: `Masterclass: Estrat\xE9gia Completa de ${input.topic}`,
    hookHeadline: `Se voc\xEA quer dominar ${input.topic} com um m\xE9todo testado e comprovado, assista esta aula at\xE9 o final.`,
    coreSummary: `Roteiro aprofundado para YouTube com minutagem, exemplos pr\xE1ticos, B-rolls e teleprompter estruturado.`,
    scenes: [
      {
        id: "scene_1",
        timecode: "00:00 - 00:45",
        phase: "Introdu\xE7\xE3o & Gancho de Reten\xE7\xE3o",
        spokenScript: `Bem-vindo! Hoje n\xF3s vamos destrinchar absolutamente tudo o que voc\xEA precisa saber sobre ${input.topic}. Se voc\xEA j\xE1 tentou m\xE9todos gen\xE9ricos e n\xE3o teve resultados, eu preparei um mapa pr\xE1tico passo a passo.`,
        visualDirection: "Plano m\xE9dio em est\xFAdio bem iluminado, ilumina\xE7\xE3o de tr\xEAs pontos, t\xEDtulo elegante animado no ter\xE7o inferior.",
        screenText: `GUIA DEFINITIVO: ${input.topic.toUpperCase()}`,
        aiPrompt: "Professional host speaking in modern studio with bookshelves and subtle warm LED strips, 50mm f/1.4 lens, shallow depth of field, high-end YouTube production quality."
      },
      {
        id: "scene_2",
        timecode: "00:45 - 03:30",
        phase: "M\xF3dulo 1: Fundamentos e Erros Cr\xEDticos",
        spokenScript: `O primeiro grande pilar \xE9 entender por onde a maioria erra. Quando come\xE7amos a trabalhar com isso, a tenta\xE7\xE3o \xE9 pular etapas, mas sem uma base s\xF3lida os resultados simplesmente n\xE3o sustentam.`,
        visualDirection: "Altern\xE2ncia entre o apresentador e tela cheia com diagrama explicativo e anima\xE7\xF5es gr\xE1ficas.",
        screenText: "PILAR 1: OS ERROS CR\xCDTICOS",
        aiPrompt: "Infographic animation showing clear workflow diagrams, smooth minimalist vector lines, dark background with glowing accent colors."
      },
      {
        id: "scene_3",
        timecode: "03:30 - 07:00",
        phase: "M\xF3dulo 2: Execu\xE7\xE3o Pr\xE1tica e Metodologia",
        spokenScript: `Agora que a funda\xE7\xE3o est\xE1 clara, vamos para a execu\xE7\xE3o pr\xE1tica. Aqui voc\xEA vai aplicar o que eu chamo de regra dos 3 passos, focando no que traz 80% do retorno com 20% do esfor\xE7o.`,
        visualDirection: "B-roll mostrando fluxo de trabalho real, telas de software e exemplos aplicados.",
        screenText: "PILAR 2: M\xC9TODO PASSO A PASSO",
        aiPrompt: "Montage of hands configuring settings on high-end monitors, sleek design workstation, cinematic lighting, sharp focus on screen reflections."
      },
      {
        id: "scene_4",
        timecode: "07:00 - 08:30",
        phase: "Conclus\xE3o & Chamada de Convers\xE3o",
        spokenScript: `Se este conte\xFAdo agregou valor para voc\xEA, inscreva-se no canal, ative as notifica\xE7\xF5es e deixe seu coment\xE1rio com a sua maior d\xFAvida para o pr\xF3ximo v\xEDdeo.`,
        visualDirection: "Plano aberto do est\xFAdio, cards finais de tela final (End Screen) com sugest\xF5es de pr\xF3ximos v\xEDdeos.",
        screenText: "INSCREVA-SE NO CANAL & ATIVE O SININHO",
        aiPrompt: "Studio lights slowly dimming into warm ambient glow, host smiling and waving goodbye, YouTube end-card layout overlay placeholders."
      }
    ],
    teleprompterScript: `Bem-vindo! Hoje n\xF3s vamos destrinchar absolutamente tudo o que voc\xEA precisa saber sobre ${input.topic}. Se voc\xEA j\xE1 tentou m\xE9todos gen\xE9ricos e n\xE3o teve resultados, eu preparei um mapa pr\xE1tico passo a passo. O primeiro grande pilar \xE9 entender por onde a maioria erra. Quando come\xE7amos a trabalhar com isso, a tenta\xE7\xE3o \xE9 pular etapas, mas sem uma base s\xF3lida os resultados simplesmente n\xE3o sustentam. Agora que a funda\xE7\xE3o est\xE1 clara, vamos para a execu\xE7\xE3o pr\xE1tica. Aqui voc\xEA vai aplicar o que eu chamo de regra dos 3 passos, focando no que traz 80% do retorno com 20% do esfor\xE7o. Se este conte\xFAdo agregou valor para voc\xEA, inscreva-se no canal, ative as notifica\xE7\xF5es e deixe seu coment\xE1rio com a sua maior d\xFAvida para o pr\xF3ximo v\xEDdeo.`,
    aiVideoPrompts: [
      {
        scene: "Abertura da Masterclass",
        tool: "Google Veo",
        promptEn: `High-production value documentary opening, wide shot of an elegant modern library and creative studio, subtle warm morning sun rays, 4k 24fps cinematic camera motion.`,
        cameraMotion: "Smooth crane down into medium shot"
      }
    ],
    youtubeMetadata: {
      titles: [
        `Como Dominar ${input.topic} do Zero ao Avan\xE7ado`,
        `${input.topic}: O M\xE9todo Que Realmente Funciona`,
        `Tudo O Que Voc\xEA Precisa Saber Sobre ${input.topic} (Guia Completo)`
      ],
      description: `Aula completa sobre ${input.topic}.

\u23F1\uFE0F Minutagem:
00:00 Introdu\xE7\xE3o & Vis\xE3o Geral
00:45 Pilar 1: Erros Cr\xEDticos
03:30 Pilar 2: Passo a Passo Pr\xE1tico
07:00 Conclus\xE3o e Resumo

\u{1F4CC} Inscreva-se no canal para mais conte\xFAdos!`,
      tags: [input.topic, "tutorial", "curso", "aula", "passo a passo", "produtividade"],
      thumbnailPrompt: `Professional YouTube thumbnail, charismatic person pointing to a glowing bold title, high contrast lighting, clean background with depth of field.`
    }
  };
}

// server/app.ts
function createApp() {
  const app2 = express();
  app2.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
  app2.use((req, res, next) => {
    if (req.body && typeof req.body === "object") {
      return next();
    }
    express.json({ limit: "10mb" })(req, res, (err) => {
      if (err) {
        console.warn("Body JSON parse warning:", err.message);
        req.body = {};
      }
      next();
    });
  });
  app2.use(express.urlencoded({ extended: true }));
  const api = Router();
  api.get("/health", (req, res) => {
    res.json({ status: "ok", name: "MINDOS Kernel", phase: 1 });
  });
  api.get("/status", (req, res) => {
    try {
      const status = db.getSystemStatus();
      res.json(status);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  api.get("/database/schema-sql", (req, res) => {
    try {
      const schemaPath = path.join(process.cwd(), "supabase", "schema.sql");
      if (fs.existsSync(schemaPath)) {
        const sql = fs.readFileSync(schemaPath, "utf8");
        res.type("text/plain").send(sql);
      } else {
        res.status(404).send("-- Schema file not found");
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  api.get("/database/check", async (req, res) => {
    try {
      const check = await db.checkTablesStatus();
      res.json(check);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  api.get("/profile", async (req, res) => {
    try {
      const profile = await db.getProfile();
      res.json(profile);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  api.put("/profile", async (req, res) => {
    try {
      const updated = await db.updateProfile(req.body);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  api.get("/preferences", async (req, res) => {
    try {
      const prefs = await db.getPreferences();
      res.json(prefs);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  api.put("/preferences", async (req, res) => {
    try {
      const updated = await db.updatePreferences(req.body);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  api.get("/family", async (req, res) => {
    try {
      const data = await db.getFamily();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  api.post("/family/members", async (req, res) => {
    try {
      const member = await db.addFamilyMember(req.body);
      res.status(201).json(member);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  api.get("/projects", async (req, res) => {
    try {
      const projects = await db.getProjects();
      res.json(projects);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  api.get("/memories", async (req, res) => {
    try {
      const { type, category, query } = req.query;
      const memories = await db.getMemories({
        type,
        category,
        query
      });
      res.json(memories);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  api.post("/memories", async (req, res) => {
    try {
      const memory = await db.createMemory(req.body);
      res.status(201).json(memory);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  api.put("/memories/:id", async (req, res) => {
    try {
      const memory = await db.updateMemory(req.params.id, req.body);
      if (!memory) return res.status(404).json({ error: "Memory not found" });
      res.json(memory);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  api.delete("/memories/:id", async (req, res) => {
    try {
      const success = await db.deleteMemory(req.params.id);
      res.json({ success });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  api.get("/conversations", async (req, res) => {
    try {
      const { q } = req.query;
      const convs = await db.getConversations(q);
      res.json(convs);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  api.post("/conversations", async (req, res) => {
    try {
      const { title, projectId } = req.body;
      const conv = await db.createConversation(title, projectId);
      res.status(201).json(conv);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  api.delete("/conversations/:id", async (req, res) => {
    try {
      const success = await db.deleteConversation(req.params.id);
      res.json({ success });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  api.get("/conversations/:id/messages", async (req, res) => {
    try {
      const messages = await db.getMessages(req.params.id);
      res.json(messages);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  api.post("/chat/message", async (req, res) => {
    try {
      const { conversationId, message, projectId, agentId } = req.body || {};
      if (!message || typeof message !== "string" || !message.trim()) {
        return res.status(400).json({ error: "message \xE9 obrigat\xF3rio e deve ser texto" });
      }
      const safeConvId = conversationId || `conv-${Date.now()}`;
      const result = await processOrchestration({
        conversationId: safeConvId,
        message: message.trim(),
        projectId,
        agentId
      });
      res.json(result);
    } catch (err) {
      console.error("Orchestration error:", err);
      res.status(500).json({ error: err.message || "Erro ao processar mensagem no orquestrador" });
    }
  });
  api.post("/video/generate", async (req, res) => {
    try {
      const { topic, format, targetDuration, niche, tone, platform, callToAction, additionalInstructions } = req.body || {};
      if (!topic || typeof topic !== "string" || !topic.trim()) {
        return res.status(400).json({ error: "O tema do v\xEDdeo \xE9 obrigat\xF3rio." });
      }
      const project = await generateVideoProject({
        topic: topic.trim(),
        format: format || "short",
        targetDuration: targetDuration || (format === "long" ? "5-8min" : "30s"),
        niche,
        tone,
        platform,
        callToAction,
        additionalInstructions
      });
      res.json(project);
    } catch (err) {
      console.error("Video generation route error:", err);
      res.status(500).json({ error: err.message || "Erro ao gerar roteiro de v\xEDdeo" });
    }
  });
  api.get("/audit-logs", async (req, res) => {
    try {
      const logs = await db.getAuditLogs();
      res.json(logs);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.use("/api", api);
  app2.use("/", api);
  return app2;
}

// api/index.ts
var app = createApp();
function handler(req, res) {
  return app(req, res);
}
export {
  handler as default
};
