import express, { Express, Router } from 'express';
import path from 'path';
import fs from 'fs';
import { db } from './supabase';
import { processOrchestration } from './orchestrator';
import { generateVideoProject } from './videoAgent';

export function createApp(): Express {
  const app = express();

  // Basic CORS & Preflight handling
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Support pre-parsed body (Vercel serverless) and stream body (standard Node)
  app.use((req, res, next) => {
    if (req.body && typeof req.body === 'object') {
      return next();
    }
    express.json({ limit: '10mb' })(req, res, (err) => {
      if (err) {
        console.warn('Body JSON parse warning:', err.message);
        req.body = {};
      }
      next();
    });
  });
  app.use(express.urlencoded({ extended: true }));

  // Create unified API router
  const api = Router();

  // Health check
  api.get('/health', (req, res) => {
    res.json({ status: 'ok', name: 'MINDOS Kernel', phase: 1 });
  });

  // System status (Supabase connection, Gemini status, environment)
  api.get('/status', (req, res) => {
    try {
      const status = db.getSystemStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Supabase SQL schema endpoint for instant export / review
  api.get('/database/schema-sql', (req, res) => {
    try {
      const schemaPath = path.join(process.cwd(), 'supabase', 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const sql = fs.readFileSync(schemaPath, 'utf8');
        res.type('text/plain').send(sql);
      } else {
        res.status(404).send('-- Schema file not found');
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Check live Supabase schema tables and trigger auto-seed if newly ready
  api.get('/database/check', async (req, res) => {
    try {
      const check = await db.checkTablesStatus();
      res.json(check);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Profile
  api.get('/profile', async (req, res) => {
    try {
      const profile = await db.getProfile();
      res.json(profile);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  api.put('/profile', async (req, res) => {
    try {
      const updated = await db.updateProfile(req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Preferences
  api.get('/preferences', async (req, res) => {
    try {
      const prefs = await db.getPreferences();
      res.json(prefs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  api.put('/preferences', async (req, res) => {
    try {
      const updated = await db.updatePreferences(req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Family & Members
  api.get('/family', async (req, res) => {
    try {
      const data = await db.getFamily();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  api.post('/family/members', async (req, res) => {
    try {
      const member = await db.addFamilyMember(req.body);
      res.status(201).json(member);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Projects
  api.get('/projects', async (req, res) => {
    try {
      const projects = await db.getProjects();
      res.json(projects);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Memories
  api.get('/memories', async (req, res) => {
    try {
      const { type, category, query } = req.query;
      const memories = await db.getMemories({
        type: type as string | undefined,
        category: category as string | undefined,
        query: query as string | undefined,
      });
      res.json(memories);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  api.post('/memories', async (req, res) => {
    try {
      const memory = await db.createMemory(req.body);
      res.status(201).json(memory);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  api.put('/memories/:id', async (req, res) => {
    try {
      const memory = await db.updateMemory(req.params.id, req.body);
      if (!memory) return res.status(404).json({ error: 'Memory not found' });
      res.json(memory);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  api.delete('/memories/:id', async (req, res) => {
    try {
      const success = await db.deleteMemory(req.params.id);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Conversations
  api.get('/conversations', async (req, res) => {
    try {
      const { q } = req.query;
      const convs = await db.getConversations(q as string | undefined);
      res.json(convs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  api.post('/conversations', async (req, res) => {
    try {
      const { title, projectId } = req.body;
      const conv = await db.createConversation(title, projectId);
      res.status(201).json(conv);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  api.delete('/conversations/:id', async (req, res) => {
    try {
      const success = await db.deleteConversation(req.params.id);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  api.get('/conversations/:id/messages', async (req, res) => {
    try {
      const messages = await db.getMessages(req.params.id);
      res.json(messages);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Chat Orchestration Endpoint
  api.post('/chat/message', async (req, res) => {
    try {
      const { conversationId, message, projectId, agentId } = req.body || {};
      if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ error: 'message é obrigatório e deve ser texto' });
      }
      const safeConvId = conversationId || `conv-${Date.now()}`;
      const result = await processOrchestration({
        conversationId: safeConvId,
        message: message.trim(),
        projectId,
        agentId,
      });
      res.json(result);
    } catch (err: any) {
      console.error('Orchestration error:', err);
      res.status(500).json({ error: err.message || 'Erro ao processar mensagem no orquestrador' });
    }
  });

  // Video Agents Studio Endpoint (Gemini-powered short & long video production)
  api.post('/video/generate', async (req, res) => {
    try {
      const { topic, format, targetDuration, niche, tone, platform, callToAction, additionalInstructions } = req.body || {};
      if (!topic || typeof topic !== 'string' || !topic.trim()) {
        return res.status(400).json({ error: 'O tema do vídeo é obrigatório.' });
      }
      const project = await generateVideoProject({
        topic: topic.trim(),
        format: format || 'short',
        targetDuration: targetDuration || (format === 'long' ? '5-8min' : '30s'),
        niche,
        tone,
        platform,
        callToAction,
        additionalInstructions,
      });
      res.json(project);
    } catch (err: any) {
      console.error('Video generation route error:', err);
      res.status(500).json({ error: err.message || 'Erro ao gerar roteiro de vídeo' });
    }
  });

  // Audit Logs
  api.get('/audit-logs', async (req, res) => {
    try {
      const logs = await db.getAuditLogs();
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // MOUNT ON BOTH '/api' AND '/' TO BE 100% COMPATIBLE WITH VERCEL & LOCAL DEV
  app.use('/api', api);
  app.use('/', api);

  return app;
}
