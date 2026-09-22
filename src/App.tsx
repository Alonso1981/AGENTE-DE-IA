import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ChatView } from './components/ChatView';
import { AgentsHubView } from './components/AgentsHubView';
import { MemoriesView } from './components/MemoriesView';
import { HistoryView } from './components/HistoryView';
import { FamilyView } from './components/FamilyView';
import { AuditSecurityView } from './components/AuditSecurityView';
import { SettingsView } from './components/SettingsView';
import { VideoStudioView } from './components/VideoStudioView';
import { FuturePhaseModal } from './components/FuturePhaseModal';
import {
  UserProfile,
  UserPreferences,
  Family,
  FamilyMember,
  Project,
  Memory,
  Conversation,
  ChatMessage,
  AuditLog,
  SystemStatus,
  MemoryCandidate,
  AgentId,
} from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const skipMessageFetchRef = useRef(false);
  const activeConversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    activeConversationIdRef.current = currentConversationId;
  }, [currentConversationId]);

  // Future phase modal state
  const [futureModalData, setFutureModalData] = useState<{
    phase: number;
    title: string;
    desc: string;
  } | null>(null);

  // Fetch initial data safely
  const loadInitialData = useCallback(async () => {
    const safeFetch = async (url: string) => {
      try {
        const r = await fetch(url);
        if (!r.ok) return null;
        return await r.json();
      } catch {
        return null;
      }
    };

    try {
      const [
        statusRes,
        profileRes,
        prefRes,
        familyRes,
        projectsRes,
        memoriesRes,
        convsRes,
        auditRes,
      ] = await Promise.all([
        safeFetch('/api/status'),
        safeFetch('/api/profile'),
        safeFetch('/api/preferences'),
        safeFetch('/api/family'),
        safeFetch('/api/projects'),
        safeFetch('/api/memories'),
        safeFetch('/api/conversations'),
        safeFetch('/api/audit-logs'),
      ]);

      if (statusRes) setSystemStatus(statusRes);
      if (profileRes) setProfile(profileRes);
      if (prefRes) setPreferences(prefRes);
      if (familyRes) {
        setFamily(familyRes.family);
        setFamilyMembers(familyRes.members || []);
      }
      setProjects(projectsRes || []);
      setMemories(memoriesRes || []);
      setConversations(convsRes || []);
      setAuditLogs(auditRes || []);

      // If conversations exist, set the first one as active
      if (convsRes && convsRes.length > 0) {
        setCurrentConversationId(convsRes[0].id);
        const msgs = await safeFetch(`/api/conversations/${convsRes[0].id}/messages`);
        if (Array.isArray(msgs)) {
          setMessages(msgs);
        }
      }
    } catch (err) {
      console.error('Error loading initial MINDOS data:', err);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!currentConversationId) return;
    if (skipMessageFetchRef.current) {
      skipMessageFetchRef.current = false;
      return;
    }
    fetch(`/api/conversations/${currentConversationId}/messages`)
      .then((r) => r.json())
      .then((msgs) => {
        if (Array.isArray(msgs)) {
          setMessages(msgs);
        }
      })
      .catch((err) => console.error('Error loading messages:', err));
  }, [currentConversationId]);

  // Chat message sending
  const handleSendMessage = async (text: string, agentId?: AgentId) => {
    if (!text.trim()) return;

    let activeConvId = activeConversationIdRef.current;

    // Ensure we always have an active conversation ID
    if (!activeConvId) {
      if (conversations.length > 0) {
        activeConvId = conversations[0].id;
        skipMessageFetchRef.current = false;
        setCurrentConversationId(activeConvId);
      } else {
        activeConvId = `conv-${Date.now()}`;
        skipMessageFetchRef.current = true;
        setCurrentConversationId(activeConvId);
        // Create conversation in background
        fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: text.length > 30 ? text.substring(0, 30) + '...' : text,
          }),
        })
          .then((r) => r.json())
          .then((created) => {
            if (created && created.id) {
              setConversations((prev) => [created, ...prev]);
            }
          })
          .catch(() => {});
      }
    }

    // Optimistically add user message to UI immediately
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: activeConvId,
      role: 'user',
      agent_id: agentId || 'orchestrator',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConvId,
          message: text,
          agentId: agentId || 'orchestrator',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP ${res.status}`);
      }

      const data = await res.json();

      if (data.responseMessage) {
        setMessages((prev) => [...prev, data.responseMessage]);
      }

      // Refresh memories and audit logs if extracted
      const [updatedMemories, updatedAuditLogs] = await Promise.all([
        fetch('/api/memories').then((r) => r.json()).catch(() => []),
        fetch('/api/audit-logs').then((r) => r.json()).catch(() => []),
      ]);
      if (Array.isArray(updatedMemories)) setMemories(updatedMemories);
      if (Array.isArray(updatedAuditLogs)) setAuditLogs(updatedAuditLogs);
    } catch (err: any) {
      console.error('Error sending message to orchestrator:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        conversation_id: activeConvId,
        role: 'assistant',
        agent_id: agentId || 'orchestrator',
        content: `⚠️ Não foi possível obter resposta do agente no momento: ${err.message || 'Erro de conexão'}. Por favor, tente enviar novamente.`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Promote candidate memory to CONFIRMED
  const handlePromoteCandidateToConfirmed = async (candidate: MemoryCandidate) => {
    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: candidate.content,
          category: candidate.category,
          type: 'CONFIRMED',
          subject: candidate.subject,
          tags: candidate.tags,
          confidence_score: 1.0,
          source: 'revisao_manual_usuario',
          is_shared_family: false,
        }),
      });
      const newMem = await res.json();
      setMemories((prev) => [newMem, ...prev]);

      // Remove candidate pill from message state
      setMessages((prev) =>
        prev.map((m) => {
          if (!m.extracted_memories) return m;
          return {
            ...m,
            extracted_memories: m.extracted_memories.filter((c) => c.content !== candidate.content),
          };
        })
      );
    } catch (err) {
      console.error('Error confirming candidate memory:', err);
    }
  };

  // Memory CRUD
  const handleCreateMemory = async (memData: Partial<Memory>) => {
    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memData),
      });
      const newMem = await res.json();
      setMemories((prev) => [newMem, ...prev]);
    } catch (err) {
      console.error('Error creating memory:', err);
    }
  };

  const handleUpdateMemory = async (id: string, updates: Partial<Memory>) => {
    try {
      const res = await fetch(`/api/memories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const updated = await res.json();
      setMemories((prev) => prev.map((m) => (m.id === id ? updated : m)));
    } catch (err) {
      console.error('Error updating memory:', err);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      await fetch(`/api/memories/${id}`, { method: 'DELETE' });
      setMemories((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error('Error deleting memory:', err);
    }
  };

  // Conversation handlers
  const handleNewChat = async () => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Nova Sessão' }),
      });
      const conv = await res.json();
      skipMessageFetchRef.current = true;
      setConversations((prev) => [conv, ...prev]);
      setCurrentConversationId(conv.id);
      setMessages([]);
      setCurrentTab('chat');
    } catch (err) {
      console.error('Error creating new conversation:', err);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (currentConversationId === id) {
        const remaining = conversations.filter((c) => c.id !== id);
        if (remaining.length > 0) {
          skipMessageFetchRef.current = false;
          setCurrentConversationId(remaining[0].id);
        } else {
          setCurrentConversationId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
    }
  };

  // Family & Member handlers
  const handleAddFamilyMember = async (
    memberData: Omit<FamilyMember, 'id' | 'family_id' | 'joined_at'>
  ) => {
    try {
      const res = await fetch('/api/family/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData),
      });
      const newMember = await res.json();
      setFamilyMembers((prev) => [...prev, newMember]);
    } catch (err) {
      console.error('Error adding family member:', err);
    }
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const updated = await res.json();
      setProfile(updated);
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const handleUpdatePreferences = async (updates: Partial<UserPreferences>) => {
    try {
      const res = await fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const updated = await res.json();
      setPreferences(updated);
    } catch (err) {
      console.error('Error updating preferences:', err);
    }
  };

  const handleSelectConversation = (id: string) => {
    skipMessageFetchRef.current = false;
    setCurrentConversationId(id);
    setCurrentTab('chat');
  };

  const currentConv = conversations.find((c) => c.id === currentConversationId) || null;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        systemStatus={systemStatus}
        onOpenFuturePhase={(phase, title, desc) => {
          setFutureModalData({ phase, title, desc });
        }}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          currentTab={currentTab}
          profile={profile}
          family={family}
          systemStatus={systemStatus}
          onNewChat={handleNewChat}
          onNewMemory={() => setCurrentTab('memories')}
        />

        <main className="flex-1 overflow-y-auto bg-slate-950">
          {currentTab === 'dashboard' && (
            <DashboardView
              memories={memories}
              conversations={conversations}
              familyMembers={familyMembers}
              auditLogs={auditLogs}
              systemStatus={systemStatus}
              onNavigate={setCurrentTab}
              onSelectConversation={handleSelectConversation}
              onOpenNewMemoryModal={() => setCurrentTab('memories')}
            />
          )}

          {currentTab === 'chat' && (
            <ChatView
              currentConversation={currentConv}
              messages={messages}
              profile={profile}
              preferences={preferences}
              memories={memories}
              isLoading={isChatLoading}
              onSendMessage={handleSendMessage}
              onPromoteCandidateToConfirmed={handlePromoteCandidateToConfirmed}
              onNewChat={handleNewChat}
            />
          )}

          {currentTab === 'agents' && (
            <AgentsHubView
              onNavigateToChat={(initialMessage, agentId) => {
                setCurrentTab('chat');
                if (initialMessage) {
                  handleSendMessage(initialMessage, agentId);
                }
              }}
              onSaveToMemories={async (title, content) => {
                await handleCreateMemory({
                  content: `${title}: ${content}`,
                  category: 'project',
                  type: 'CANDIDATE',
                  subject: 'Diretriz de Agente',
                  tags: ['agente', 'diretriz'],
                  confidence_score: 0.95,
                  is_shared_family: false,
                });
              }}
            />
          )}

          {currentTab === 'video-agents' && (
            <VideoStudioView
              onSaveToMemories={async (title, summary) => {
                await handleCreateMemory({
                  content: `${title}: ${summary}`,
                  category: 'project',
                  type: 'CANDIDATE',
                  subject: 'Produção de Vídeo',
                  tags: ['video', 'roteiro'],
                  confidence_score: 0.95,
                  is_shared_family: false,
                });
              }}
            />
          )}

          {currentTab === 'memories' && (
            <MemoriesView
              memories={memories}
              onCreateMemory={handleCreateMemory}
              onUpdateMemory={handleUpdateMemory}
              onDeleteMemory={handleDeleteMemory}
            />
          )}

          {currentTab === 'history' && (
            <HistoryView
              conversations={conversations}
              projects={projects}
              onSelectConversation={handleSelectConversation}
              onNewConversation={handleNewChat}
              onDeleteConversation={handleDeleteConversation}
            />
          )}

          {currentTab === 'family' && (
            <FamilyView
              family={family}
              familyMembers={familyMembers}
              profile={profile}
              preferences={preferences}
              onAddFamilyMember={handleAddFamilyMember}
              onUpdateProfile={handleUpdateProfile}
              onUpdatePreferences={handleUpdatePreferences}
            />
          )}

          {currentTab === 'audit' && (
            <AuditSecurityView auditLogs={auditLogs} />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              systemStatus={systemStatus}
            />
          )}
        </main>
      </div>

      {/* Planned Future Phase Educational Modal */}
      {futureModalData && (
        <FuturePhaseModal
          phaseNumber={futureModalData.phase}
          phaseTitle={futureModalData.title}
          phaseDescription={futureModalData.desc}
          onClose={() => setFutureModalData(null)}
        />
      )}
    </div>
  );
}
