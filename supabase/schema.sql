-- ==============================================================================
-- MINDOS: AI Memory, Personality, Knowledge, Agents & Automation Operating System
-- FASE 1: FUNDAÇÃO - Database Schema (Supabase PostgreSQL + pgvector + RLS)
-- ==============================================================================

-- 1. Enable pgvector extension for semantic memory search (prepared for Phase 1/2)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Families Table
CREATE TABLE IF NOT EXISTS public.families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    technical_level VARCHAR(50) DEFAULT 'intermediario',
    communication_style VARCHAR(50) DEFAULT 'direto',
    interests TEXT[] DEFAULT ARRAY[]::TEXT[],
    role VARCHAR(50) DEFAULT 'owner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Family Members Table (Multi-member family isolation)
CREATE TABLE IF NOT EXISTS public.family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    nickname VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'member', -- 'admin', 'member', 'child'
    is_child BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(family_id, user_id)
);

-- 5. User Preferences Table
CREATE TABLE IF NOT EXISTS public.preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    preferred_tone VARCHAR(100) DEFAULT 'natural, direto e prático',
    technical_depth VARCHAR(50) DEFAULT 'equilibrado',
    avoid_jargon BOOLEAN DEFAULT TRUE,
    active_project_id UUID,
    preferred_language VARCHAR(10) DEFAULT 'pt-BR',
    rules TEXT[] DEFAULT ARRAY[]::TEXT[],
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Projects Table (Context organization)
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Memories Table (Phase 1 Foundation with status: TEMPORARY, CANDIDATE, CONFIRMED, PERMANENT)
CREATE TABLE IF NOT EXISTS public.memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'CANDIDATE', -- 'TEMPORARY', 'CANDIDATE', 'CONFIRMED', 'PERMANENT'
    category VARCHAR(50) NOT NULL DEFAULT 'general', -- 'preference', 'correction', 'fact', 'project', 'general', 'family'
    content TEXT NOT NULL,
    source VARCHAR(255) DEFAULT 'chat_interaction',
    confidence_score NUMERIC(3, 2) DEFAULT 0.85,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    subject VARCHAR(255),
    is_shared_family BOOLEAN DEFAULT FALSE,
    can_review BOOLEAN DEFAULT TRUE,
    embedding vector(768), -- Prepared for Gemini text-embedding vector search
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- 'user', 'assistant', 'system'
    agent_id VARCHAR(50) DEFAULT 'orchestrator',
    content TEXT NOT NULL,
    extracted_memories JSONB DEFAULT '[]'::jsonb,
    duration_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Audit Logs Table (Auditoria e Rastreabilidade)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(100) NOT NULL,
    user_id UUID NOT NULL,
    family_id UUID NOT NULL,
    project_id UUID,
    action VARCHAR(100) NOT NULL,
    tool VARCHAR(100),
    input TEXT,
    output TEXT,
    status VARCHAR(50) DEFAULT 'SUCCESS',
    error TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict user and family isolation
-- ==============================================================================

ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: Users can view and update their own profile
CREATE POLICY "Users view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- 2. Families: Members can view family data
CREATE POLICY "Family members view family" ON public.families
    FOR SELECT USING (
        id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid())
    );

-- 3. Memories:
-- User can view own memories OR shared family memories if member of family
CREATE POLICY "Users view own or shared family memories" ON public.memories
    FOR SELECT USING (
        user_id = auth.uid() OR (
            is_shared_family = TRUE AND
            family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Users manage own memories" ON public.memories
    FOR ALL USING (user_id = auth.uid());

-- 4. Conversations & Messages:
CREATE POLICY "Users manage own conversations" ON public.conversations
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users manage own messages" ON public.messages
    FOR ALL USING (
        conversation_id IN (SELECT id FROM public.conversations WHERE user_id = auth.uid())
    );

-- 5. Audit Logs:
CREATE POLICY "Users view own audit logs" ON public.audit_logs
    FOR SELECT USING (user_id = auth.uid());

-- Indexes for fast selective retrieval and query performance
CREATE INDEX IF NOT EXISTS idx_memories_user_family ON public.memories(user_id, family_id);
CREATE INDEX IF NOT EXISTS idx_memories_type ON public.memories(type);
CREATE INDEX IF NOT EXISTS idx_conversations_user ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
