import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ChatView } from './components/ChatView';
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

  // Future phase modal state
  const [futureModalData, setFutureModalData] = useState<{
    phase: number;
    title: string;
    desc: string;
  } | null>(null);

  // Quick memory modal trigger from header or dashboard
  const [openNewMemoryModalDirect, setOpenNewMemoryModalDirect] = useState(false);

  // Fetch initial data
  const loadInitialData = useCallback(async () => {
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
        fetch('/api/status').then((r) => r.json()),
        fetch('/api/profile').then((r) => r.json()),
        fetch('/api/preferences').then((r) => r.json()),
        fetch('/api/family').then((r) => r.json()),
        fetch('/api/projects').then((r) => r.json()),
        fetch('/api/memories').then((r) => r.json()),
        fetch('/api/conversations').then((r) => r.json()),
        fetch('/api/audit-logs').then((r) => r.json()),
      ]);

      setSystemStatus(statusRes);
      setProfile(profileRes);
      setPreferences(prefRes);
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
        const msgs = await fetch(`/api/conversations/${convsRes[0].id}/messages`).then((r) =>
          r.json()
        );
        setMessages(msgs || []);
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
    fetch(`/api/conversations/${currentConversationId}/messages`)
      .then((r) => r.json())
      .then((msgs) => setMessages(msgs || []))
      .catch((err) => console.error('Error loading messages:', err));
  }, [currentConversationId]);

  // Chat message sending
  const handleSendMessage = async (text: string) => {
    let activeConvId = currentConversationId;

    // Create conversation if none exists
    if (!activeConvId) {
      try {
        const newConvRes = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: text.length > 30 ? text.substring(0, 30) + '...' : text,
          }),
        });
        const createdConv = await newConvRes.json();
        activeConvId = createdConv.id;
        setCurrentConversationId(createdConv.id);
        setConversations((prev) => [createdConv, ...prev]);
      } catch (err) {
        console.error('Error creating conversation:', err);
        return;
      }
    }

    if (!activeConvId) return;

    // Optimistically add user message to UI
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: activeConvId,
      role: 'user',
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
        }),
      });
      const data = await res.json();

      if (data.responseMessage) {
        // Replace temp or add response message
        setMessages((prev) => [...prev, data.responseMessage]);
      }

      // Refresh memories and audit logs if extracted
      const [updatedMemories, updatedAuditLogs] = await Promise.all([
        fetch('/api/memories').then((r) => r.json()),
        fetch('/api/audit-logs').then((r) => r.json()),
      ]);
      setMemories(updatedMemories || []);
      setAuditLogs(updatedAuditLogs || []);
    } catch (err) {
      console.error('Error sending message to orchestrator:', err);
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
          source: 'validacao_usuario',
        }),
      });
      const created = await res.json();
      setMemories((prev) => [created, ...prev]);
    } catch (err) {
      console.error('Error confirming candidate memory:', err);
    }
  };

  // Memory CRUD
  const handleCreateMemory = async (mem: Partial<Memory>) => {
    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mem),
      });
      const created = await res.json();
      setMemories((prev) => [created, ...prev]);
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

  // Profile update
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

  // Preferences update
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

  const currentConv = conversations.find((c) => c.id === currentConversationId) || null;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 antialiased overflow-hidden font-sans">
      {/* Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        systemStatus={systemStatus}
        onOpenFuturePhase={(phase, title, desc) => setFutureModalData({ phase, title, desc })}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
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
              onSelectConversation={(id) => {
                setCurrentConversationId(id);
                setCurrentTab('chat');
              }}
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
              onSelectConversation={(id) => {
                setCurrentConversationId(id);
                setCurrentTab('chat');
              }}
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

          {currentTab === 'audit' && <AuditSecurityView auditLogs={auditLogs} />}

          {currentTab === 'settings' && <SettingsView systemStatus={systemStatus} />}
        </main>
      </div>

      {/* Informational Future Phase Modal */}
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
