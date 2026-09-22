export type MemoryStatus = 'TEMPORARY' | 'CANDIDATE' | 'CONFIRMED' | 'PERMANENT';

export type MemoryCategory = 'preference' | 'correction' | 'fact' | 'project' | 'general' | 'family';

export interface Memory {
  id: string;
  user_id: string;
  family_id: string;
  type: MemoryStatus;
  category: MemoryCategory;
  content: string;
  source: string;
  confidence_score: number; // 0.0 to 1.0
  tags: string[];
  project_id?: string | null;
  subject?: string | null;
  is_shared_family: boolean;
  can_review: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  technical_level: 'iniciante' | 'intermediario' | 'avancado' | 'especialista';
  communication_style: 'direto' | 'didatico' | 'detalhado' | 'conciso';
  interests: string[];
  role: 'owner' | 'admin' | 'member' | 'child';
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  preferred_tone: string;
  technical_depth: string;
  avoid_jargon: boolean;
  active_project_id?: string | null;
  preferred_language: string;
  rules: string[];
}

export interface Family {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export interface FamilyMember {
  id: string;
  family_id: string;
  user_id: string;
  nickname: string;
  role: 'admin' | 'member' | 'child';
  is_child: boolean;
  joined_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  family_id: string;
  name: string;
  description: string;
  tags: string[];
  status: 'active' | 'archived' | 'completed';
  created_at: string;
}

export type AgentId = 'orchestrator' | 'business' | 'video' | 'content' | 'automation';

export interface AgentDefinition {
  id: AgentId;
  name: string;
  role: string;
  description: string;
  badge: string;
  color: string;
  avatarIcon: string;
  suggestedPrompts: string[];
}

export interface Conversation {
  id: string;
  user_id: string;
  family_id: string;
  project_id?: string | null;
  agent_id?: AgentId;
  title: string;
  summary?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  agent_id?: AgentId;
  content: string;
  extracted_memories?: MemoryCandidate[];
  duration_ms?: number;
  created_at: string;
}

export interface MemoryCandidate {
  content: string;
  category: MemoryCategory;
  type: MemoryStatus;
  subject?: string;
  tags: string[];
  confidence_score: number;
}

export interface AuditLog {
  id: string;
  agent_id: string;
  user_id: string;
  family_id: string;
  project_id?: string | null;
  action: string;
  tool?: string;
  input?: string;
  output?: string;
  status: 'SUCCESS' | 'FAILURE' | 'PENDING';
  error?: string;
  duration_ms?: number;
  created_at: string;
}

export interface SystemStatus {
  database: {
    provider: 'supabase' | 'in_memory_fallback';
    connected: boolean;
    hasCredentials: boolean;
    url?: string;
    projectRef?: string;
    tablesCreated?: boolean;
    sqlEditorUrl?: string;
  };
  gemini: {
    hasKey: boolean;
    model: string;
  };
  environment: string;
  activePhase: 1;
}

export type VideoFormat = 'short' | 'long';

export interface VideoScene {
  id: string;
  timecode: string;
  phase: string;
  spokenScript: string;
  visualDirection: string;
  screenText: string;
  aiPrompt: string;
}

export interface VideoProject {
  id: string;
  title: string;
  format: VideoFormat;
  platform: 'tiktok_reels_shorts' | 'youtube' | 'course_lecture';
  targetDuration: string;
  objective: string;
  tone: string;
  niche: string;
  hookHeadline: string;
  coreSummary: string;
  scenes: VideoScene[];
  teleprompterScript: string;
  aiVideoPrompts: Array<{
    scene: string;
    tool: 'Google Veo' | 'Runway Gen-3' | 'Midjourney' | 'Sora';
    promptEn: string;
    cameraMotion: string;
  }>;
  youtubeMetadata?: {
    titles: string[];
    description: string;
    tags: string[];
    thumbnailPrompt: string;
  };
  createdAt: string;
}
