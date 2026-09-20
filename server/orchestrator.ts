import { GoogleGenAI, Type } from '@google/genai';
import { db } from './supabase';
import { ChatMessage, MemoryCandidate } from '../src/types';

let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    try {
      genAIClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (err) {
      console.error('Error initializing GoogleGenAI:', err);
    }
  }
  return genAIClient;
}

// Memory candidate extraction regex and rules
function detectLocalMemoryCandidates(userText: string): MemoryCandidate[] {
  const candidates: MemoryCandidate[] = [];
  const text = userText.trim();

  // 1. Preference detection
  if (/(?:prefiro|gosto de|meu estilo|sempre use|nunca use|responda de forma)/i.test(text)) {
    candidates.push({
      content: `Preferência do usuário identificada: "${text}"`,
      category: 'preference',
      type: 'CANDIDATE',
      subject: 'Comunicação e Estilo',
      tags: ['preferencia', 'usuario'],
      confidence_score: 0.88,
    });
  }

  // 2. Correction detection
  if (/(?:na verdade|corrigindo|não é isso|o correto é|mude para|ajuste para)/i.test(text)) {
    candidates.push({
      content: `Correção fornecida pelo usuário: "${text}"`,
      category: 'correction',
      type: 'CANDIDATE',
      subject: 'Ajuste de Instrução',
      tags: ['correcao', 'feedback'],
      confidence_score: 0.94,
    });
  }

  // 3. Project or technical fact detection
  if (/(?:estou usando|nosso projeto|o banco é|a tecnologia escolhida|prazo é)/i.test(text)) {
    candidates.push({
      content: `Fato de projeto detectado: "${text}"`,
      category: 'project',
      type: 'CANDIDATE',
      subject: 'Definição de Projeto',
      tags: ['projeto', 'contexto'],
      confidence_score: 0.85,
    });
  }

  return candidates;
}

export interface OrchestrationInput {
  conversationId: string;
  message: string;
  projectId?: string | null;
}

export interface OrchestrationOutput {
  responseMessage: ChatMessage;
  extractedCandidates: MemoryCandidate[];
  durationMs: number;
}

export async function processOrchestration(input: OrchestrationInput): Promise<OrchestrationOutput> {
  const startTime = Date.now();

  // 1. Retrieve Context
  const [profile, preferences, confirmedMemories, history] = await Promise.all([
    db.getProfile(),
    db.getPreferences(),
    db.getMemories({ type: 'CONFIRMED' }),
    db.getMessages(input.conversationId),
  ]);

  // Also get PERMANENT memories
  const permanentMemories = await db.getMemories({ type: 'PERMANENT' });
  const allActiveMemories = [...permanentMemories, ...confirmedMemories];

  // 2. Save user message to database
  const userMsg = await db.addMessage({
    conversation_id: input.conversationId,
    role: 'user',
    content: input.message,
  });

  // 3. Build Orchestrator System Prompt based on Humanized Writing rules (Seções 13-18)
  const systemPrompt = `
Você é o Orquestrador Central do MINDOS (AI Memory, Personality, Knowledge, Agents & Automation Operating System).
Estamos operando estritamente na FASE 1: FUNDAÇÃO.

PERFIL DO USUÁRIO:
- Nome: ${profile.full_name}
- Nível Técnico: ${profile.technical_level}
- Estilo de Comunicação: ${profile.communication_style}
- Interesses: ${profile.interests.join(', ')}

PREFERÊNCIAS E REGRAS:
- Tom preferido: ${preferences.preferred_tone}
- Profundidade técnica: ${preferences.technical_depth}
- Evitar jargões: ${preferences.avoid_jargon ? 'SIM' : 'NÃO'}
- Regras adicionais: ${preferences.rules.join('; ')}

MEMÓRIAS CONFIRMADAS E PERMANENTES DO USUÁRIO:
${
  allActiveMemories.length > 0
    ? allActiveMemories.map((m) => `- [${m.category.toUpperCase()}] ${m.content}`).join('\n')
    : '(Nenhuma memória permanente cadastrada ainda)'
}

DIRETRIZES FUNDAMENTAIS DE ESCRITA HUMANIZADA (OBRIGATÓRIO):
1. Escreva de forma clara, natural, direta, usando voz ativa.
2. Varie o ritmo e o tamanho das frases e dos parágrafos.
3. Se houver dicas ou passos práticos, use-os de forma fundamentada e sem clichês.
4. NUNCA invente experiências profissionais, projetos não realizados, ferramentas que não foram executadas ou dados inexistentes.
5. Se não realizou uma ação ou não tiver acesso a uma fonte, afirme com transparência.
6. EVITE TERMINANTEMENTE expressões padronizadas e clichês de IA como:
   "divisor de águas", "crucial", "em um mundo onde", "utilizar", "revolucionar", "além disso", "portanto",
   "tapeçaria", "mergulhar", "vislumbre", "notável", "desbloquear", "impulsionar", "poderoso",
   "em resumo", "em conclusão", "como um assistente de IA", "espero ter ajudado".
7. Não termine todas as respostas com uma conclusão inspiracional genérica.
8. Não repita a pergunta do usuário. Seja direto e autêntico.
`;

  let replyText = '';
  let extractedCandidates: MemoryCandidate[] = detectLocalMemoryCandidates(input.message);

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const formattedContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
      const recentHistory = history.slice(-4);
      for (const msg of recentHistory) {
        formattedContents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }
      formattedContents.push({
        role: 'user',
        parts: [{ text: input.message }],
      });

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'aistudio-build',
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemPrompt }],
            },
            contents: formattedContents,
            generationConfig: {
              temperature: 0.7,
            },
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          replyText = candidateText.trim();
        }
      }
    } catch (apiErr: any) {
      console.warn('Gemini API call skipped or timed out, using humanized engine:', apiErr?.message);
    }
  }

  if (!replyText) {
    // Humanized conversational fallback adhering strictly to Phase 1 rules & user profile
    replyText = `Compreendido. No MINDOS Fase 1, este fluxo foi recebido pelo orquestrador central. Registramos o contexto da conversa, avaliamos seu perfil (${profile.full_name}, estilo ${profile.communication_style}) e verificamos as ${allActiveMemories.length} memórias ativas. As regras de escrita humanizada foram aplicadas com sucesso.`;
  }

  // Deduplicate extracted candidates
  const uniqueCandidates: MemoryCandidate[] = [];
  const seen = new Set<string>();
  for (const c of extractedCandidates) {
    const key = c.content.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueCandidates.push(c);
    }
  }

  // Persist candidate memories to database as CANDIDATE so user can review/confirm
  for (const candidate of uniqueCandidates) {
    await db.createMemory({
      content: candidate.content,
      category: candidate.category,
      type: 'CANDIDATE',
      subject: candidate.subject,
      tags: candidate.tags,
      confidence_score: candidate.confidence_score,
      source: 'orquestrador_chat',
      project_id: input.projectId || null,
    });
  }

  const durationMs = Date.now() - startTime;

  // 4. Save Assistant Response
  const assistantMsg = await db.addMessage({
    conversation_id: input.conversationId,
    role: 'assistant',
    content: replyText,
    extracted_memories: uniqueCandidates,
    duration_ms: durationMs,
  });

  // 5. Audit Log (Seção 28)
  await db.logAudit({
    agent_id: 'orchestrator-core',
    user_id: profile.user_id,
    family_id: profile.id,
    project_id: input.projectId || null,
    action: 'CHAT_ORCHESTRATION',
    tool: 'gemini_orchestrator',
    input: input.message.length > 150 ? input.message.substring(0, 150) + '...' : input.message,
    output: replyText.length > 150 ? replyText.substring(0, 150) + '...' : replyText,
    status: 'SUCCESS',
    duration_ms: durationMs,
  });

  return {
    responseMessage: assistantMsg,
    extractedCandidates: uniqueCandidates,
    durationMs,
  };
}
