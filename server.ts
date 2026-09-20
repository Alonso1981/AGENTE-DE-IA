import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/supabase';
import { processOrchestration } from './server/orchestrator';
import { generateVideoProject } from './server/videoAgent';
import fs from 'fs';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // -------------------------------------------------------------
  // API ROUTES (Mounted BEFORE Vite Middleware)
  // -------------------------------------------------------------

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', name: 'MINDOS Kernel', phase: 1 });
  });

  // System status (Supabase connection, Gemini status, environment)
  app.get('/api/status', (req, res) => {
    try {
      const status = db.getSystemStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Supabase SQL schema endpoint for instant export / review
  app.get('/api/database/schema-sql', (req, res) => {
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
  app.get('/api/database/check', async (req, res) => {
    try {
      const check = await db.checkTablesStatus();
      res.json(check);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Profile
  app.get('/api/profile', async (req, res) => {
    try {
      const profile = await db.getProfile();
      res.json(profile);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/profile', async (req, res) => {
    try {
      const updated = await db.updateProfile(req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Preferences
  app.get('/api/preferences', async (req, res) => {
    try {
      const prefs = await db.getPreferences();
      res.json(prefs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/preferences', async (req, res) => {
    try {
      const updated = await db.updatePreferences(req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Family & Members
  app.get('/api/family', async (req, res) => {
    try {
      const data = await db.getFamily();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/family/members', async (req, res) => {
    try {
      const member = await db.addFamilyMember(req.body);
      res.status(201).json(member);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Projects
  app.get('/api/projects', async (req, res) => {
    try {
      const projects = await db.getProjects();
      res.json(projects);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Memories
  app.get('/api/memories', async (req, res) => {
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

  app.post('/api/memories', async (req, res) => {
    try {
      const memory = await db.createMemory(req.body);
      res.status(201).json(memory);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/memories/:id', async (req, res) => {
    try {
      const memory = await db.updateMemory(req.params.id, req.body);
      if (!memory) return res.status(404).json({ error: 'Memory not found' });
      res.json(memory);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/memories/:id', async (req, res) => {
    try {
      const success = await db.deleteMemory(req.params.id);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Conversations
  app.get('/api/conversations', async (req, res) => {
    try {
      const { q } = req.query;
      const convs = await db.getConversations(q as string | undefined);
      res.json(convs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/conversations', async (req, res) => {
    try {
      const { title, projectId } = req.body;
      const conv = await db.createConversation(title, projectId);
      res.status(201).json(conv);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/conversations/:id', async (req, res) => {
    try {
      const success = await db.deleteConversation(req.params.id);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/conversations/:id/messages', async (req, res) => {
    try {
      const messages = await db.getMessages(req.params.id);
      res.json(messages);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Chat Orchestration Endpoint
  app.post('/api/chat/message', async (req, res) => {
    try {
      const { conversationId, message, projectId } = req.body;
      if (!conversationId || !message) {
        return res.status(400).json({ error: 'conversationId e message são obrigatórios' });
      }
      const result = await processOrchestration({
        conversationId,
        message,
        projectId,
      });
      res.json(result);
    } catch (err: any) {
      console.error('Orchestration error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Video Agents Studio Endpoint (Gemini-powered short & long video production)
  app.post('/api/video/generate', async (req, res) => {
    try {
      const { topic, format, targetDuration, niche, tone, platform, callToAction, additionalInstructions } = req.body;
      if (!topic) {
        return res.status(400).json({ error: 'O tema do vídeo é obrigatório.' });
      }
      const project = await generateVideoProject({
        topic,
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
      res.status(500).json({ error: err.message });
    }
  });

  // Audit Logs
  app.get('/api/audit-logs', async (req, res) => {
    try {
      const logs = await db.getAuditLogs();
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // -------------------------------------------------------------
  // Vite Middleware & SPA Handling
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MINDOS Kernel] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
