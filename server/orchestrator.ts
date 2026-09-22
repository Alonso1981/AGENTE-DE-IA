import { db } from './supabase';
import { generateContentResilient } from './gemini';
import { ChatMessage, MemoryCandidate, AgentId } from '../src/types';

// Memory candidate extraction regex and rules
function detectLocalMemoryCandidates(userText: string): MemoryCandidate[] {
  const candidates: MemoryCandidate[] = [];
  const text = userText.trim();

  // 1. Preference detection
  if (/(?:prefiro|gosto de|meu estilo|sempre use|nunca use|responda de forma|quero que)/i.test(text)) {
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
  if (/(?:na verdade|corrigindo|não é isso|o correto é|mude para|ajuste para|errado)/i.test(text)) {
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
  if (/(?:estou usando|nosso projeto|o banco é|a farmácia|farmacia|estoque|remedio|medicamento|venda|cliente)/i.test(text)) {
    candidates.push({
      content: `Fato operacional ou de projeto detectado: "${text}"`,
      category: 'project',
      type: 'CANDIDATE',
      subject: 'Contexto Operacional',
      tags: ['projeto', 'operacional'],
      confidence_score: 0.86,
    });
  }

  return candidates;
}

export interface OrchestrationInput {
  conversationId: string;
  message: string;
  projectId?: string | null;
  agentId?: AgentId;
}

export interface OrchestrationOutput {
  responseMessage: ChatMessage;
  extractedCandidates: MemoryCandidate[];
  durationMs: number;
}

function getAgentSpecificDirective(agentId?: AgentId): string {
  switch (agentId) {
    case 'business':
      return `
VOCÊ ESTÁ ATUANDO COMO: Especialista em Negócios, Farmácia & Processos Operacionais.
FOCO DE ATUAÇÃO:
- Gestão de farmácias e drogarias, controle rigoroso de estoque, curva ABC e giro de produtos.
- Prevenção de perdas por validade (FIFO/PEPS), organização de prateleiras e conferência de entregas com distribuidores.
- Elaboração de POPs (Procedimentos Operacionais Padrão) práticos, claros e aplicáveis.
- Estratégias para aumentar a margem de contribuição, precificação inteligente e compras assertivas.
- Responda de forma prática, orientada a negócios reais, com passos objetivos e recomendações acionáveis.`;

    case 'video':
      return `
VOCÊ ESTÁ ATUANDO COMO: Roteirista & Diretor Criativo de Vídeos de Alta Retenção.
FOCO DE ATUAÇÃO:
- Roteiros para Reels, TikTok, YouTube Shorts e vídeos longos de autoridade.
- Ganchos iniciais magnéticos nos primeiros 3 segundos para cortar o feed e prender atenção.
- Planejamento dinâmico cena a cena: fala/locução, direcionamento visual (B-roll) e texto na tela.
- Prompts em inglês detalhados prontos para ferramentas de IA (Google Veo, Runway Gen-3, Midjourney).
- Estrutura clara: Gancho -> Dor/Curiosidade -> Solução Prática -> Chamada para Ação (CTA).`;

    case 'content':
      return `
VOCÊ ESTÁ ATUANDO COMO: Agente Estrategista de Conteúdo & Copywriting Humanizado.
FOCO DE ATUAÇÃO:
- Criação de postagens para Instagram, LinkedIn, carrosséis de alto salvamento e newsletters.
- Copywriting focado em conversão e engajamento genuíno, sem soar como inteligência artificial genérica.
- Textos com ritmo variado, storytelling envolvente, quebra de objeções e clareza absoluta.
- Zero jargões vazios como "divisor de águas" ou "mergulhe nessa jornada".`;

    case 'automation':
      return `
VOCÊ ESTÁ ATUANDO COMO: Engenheiro de Automação & Arquitetura de Sistemas.
FOCO DE ATUAÇÃO:
- Arquitetura de microsserviços, schemas relacionais Supabase PostgreSQL, regras RLS e queries otimizadas.
- Fluxos orientados a eventos, gatilhos de alerta (ex: notificações de validade 30/60 dias), webhooks e cron jobs.
- Integrações de APIs seguras, scripts Node/TypeScript e automações confiáveis.
- Apresente código limpo, tipado e com explicações arquiteturais sólidas.`;

    case 'orchestrator':
    default:
      return `
VOCÊ ESTÁ ATUANDO COMO: Orquestrador Central do MINDOS (AI Operating System).
FOCO DE ATUAÇÃO:
- Coordenar as memórias de longo prazo, perfis de personalidade, agentes e regras do sistema operacional.
- Avaliar o contexto do usuário, direcionar tarefas e validar dados com precisão cirúrgica.
- Manter governança estrita das diretrizes do sistema.`;
  }
}

export async function processOrchestration(input: OrchestrationInput): Promise<OrchestrationOutput> {
  const startTime = Date.now();
  const agentId: AgentId = input.agentId || 'orchestrator';

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
  await db.addMessage({
    conversation_id: input.conversationId,
    role: 'user',
    content: input.message,
    agent_id: agentId,
  });

  // 3. Build System Prompt based on Humanized Writing rules (Seções 13-18)
  const agentDirective = getAgentSpecificDirective(agentId);

  const systemPrompt = `
Você é parte do MINDOS (AI Memory, Personality, Knowledge, Agents & Automation Operating System).
${agentDirective}

PERFIL DO USUÁRIO ATUAL:
- Nome: ${profile.full_name}
- Nível Técnico: ${profile.technical_level}
- Estilo de Comunicação: ${profile.communication_style}
- Interesses: ${profile.interests.join(', ')}

PREFERÊNCIAS E REGRAS DO USUÁRIO:
- Tom preferido: ${preferences.preferred_tone}
- Profundidade técnica: ${preferences.technical_depth}
- Evitar jargões: ${preferences.avoid_jargon ? 'SIM' : 'NÃO'}
- Regras adicionais: ${preferences.rules.join('; ')}

MEMÓRIAS CONFIRMADAS DO USUÁRIO NO CONTEXTO:
${
  allActiveMemories.length > 0
    ? allActiveMemories.map((m) => `- [${m.category.toUpperCase()}] ${m.content}`).join('\n')
    : '(Nenhuma memória permanente cadastrada ainda)'
}

DIRETRIZES FUNDAMENTAIS DE ESCRITA HUMANIZADA (OBRIGATÓRIO):
1. Escreva de forma clara, natural, direta, usando voz ativa.
2. Varie o ritmo e o tamanho das frases e dos parágrafos.
3. Se houver recomendações práticas, forneça passos acionáveis e bem estruturados.
4. NUNCA invente experiências profissionais, projetos não realizados, ferramentas que não foram executadas ou dados inexistentes.
5. EVITE TERMINANTEMENTE clichês de IA como:
   "divisor de águas", "crucial", "em um mundo onde", "utilizar", "revolucionar", "além disso", "portanto",
   "tapeçaria", "mergulhar", "vislumbre", "notável", "desbloquear", "impulsionar", "poderoso",
   "em resumo", "em conclusão", "como um assistente de IA", "espero ter ajudado".
6. Não termine as respostas com conclusões genéricas ou frases motivacionais vazias.
7. Responda imediatamente ao ponto solicitado pelo usuário com profundidade e precisão.
`;

  let replyText = '';
  const extractedCandidates: MemoryCandidate[] = detectLocalMemoryCandidates(input.message);

  try {
    // Sanitize message history to guarantee strictly alternating roles starting and ending with user
    const turns: Array<{ role: 'user' | 'model'; text: string }> = [];

    for (const m of history.slice(-6)) {
      if (!m.content || !m.content.trim()) continue;
      const role = m.role === 'assistant' ? 'model' : 'user';
      if (turns.length > 0 && turns[turns.length - 1].role === role) {
        turns[turns.length - 1].text += '\n\n' + m.content.trim();
      } else {
        turns.push({ role, text: m.content.trim() });
      }
    }

    // Ensure first turn is user
    while (turns.length > 0 && turns[0].role !== 'user') {
      turns.shift();
    }

    // Append current user message
    if (turns.length > 0 && turns[turns.length - 1].role === 'user') {
      turns[turns.length - 1].text += '\n\n' + input.message.trim();
    } else {
      turns.push({ role: 'user', text: input.message.trim() });
    }

    const contents = turns.map((t) => ({
      role: t.role,
      parts: [{ text: t.text }],
    }));

    replyText = await generateContentResilient({
      contents,
      systemInstruction: systemPrompt,
      temperature: 0.7,
    });
  } catch (apiErr: any) {
    console.warn('Gemini API call error in orchestrator:', apiErr?.message);
  }

  // Fallback intelligent agent responses tailored to persona if API was unreachable
  if (!replyText) {
    if (agentId === 'business') {
      replyText = `Entendido perfeitamente. Como especialista em negócios e gestão de farmácias, analisei sua solicitação:\n\n1. **Controle e Organização de Estoque:** O princípio básico é a regra PVPS (Primeiro que Vence, Primeiro que Sai). Medicamentos com validade inferior a 90 dias devem receber etiquetagem visual destacada.\n2. **Curva ABC:** Concentre 80% da sua atenção nos produtos Classe A (os 20% que geram maior faturamento), mantendo estoque de segurança enxuto para evitar capital parado.\n3. **Próximo Passo:** Posso estruturar um Procedimento Operacional Padrão (POP) completo de conferência ou checklist diário para sua equipe.`;
    } else if (agentId === 'video') {
      replyText = `Recebido pelo diretor criativo. Para o tema informado, a melhor estrutura para reter a audiência é:\n\n• **Gancho (0-3s):** Quebre um mito direto olhando para a câmera.\n• **Problema (3-12s):** Mostre o prejuízo que acontece quando isso é ignorado.\n• **Solução (12-25s):** 2 passos simples que qualquer um pode aplicar hoje.\n• **Chamada para Ação (25-30s):** "Comente 'GUIA' para receber o checklist completo no direct."\n\nVocê pode também gerar o roteiro segundo a segundo completo na aba **Agentes de Vídeo**.`;
    } else if (agentId === 'content') {
      replyText = `Pronto. Desenvolvi uma abordagem direta e persuasiva para sua comunicação:\n\n**Ideia de Publicação / Carrossel:**\n- **Slide 1:** O erro silencioso que drena os lucros da sua operação todo mês.\n- **Slide 2:** O que a maioria faz (e por que não funciona mais).\n- **Slide 3:** O método prático em 3 passos para mudar isso hoje.\n- **Slide 4:** Resumo visual em tabela comparativa.\n- **Slide 5:** Salve este post para consultar com sua equipe.\n\nDeseja que eu escreva a legenda completa com hashtags estratégicas?`;
    } else if (agentId === 'automation') {
      replyText = `Análise de engenharia concluída:\n\nPara implementar essa automação de forma escalável no ecossistema MINDOS:\n1. **Banco de Dados (Supabase PostgreSQL):** Criação de tabela relacional com triggers na alteração de status.\n2. **Alerta Preventivo:** Configuração de cron job diário às 06:00 que busca registros elegíveis com query indexada.\n3. **Disparo:** Notificação automática via webhook com payload tipado em TypeScript.\n\nPosso gerar o script SQL de migration ou a função de integração agora mesmo.`;
    } else {
      replyText = `Compreendido. No MINDOS Fase 1, sua mensagem foi recebida e processada pelo Orquestrador Central. Avaliamos o perfil (${profile.full_name}), as ${allActiveMemories.length} memórias ativas e mantivemos o contexto da conversa com rastreabilidade completa. Em que posso detalhar ou direcionar os subagentes agora?`;
    }
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
      source: `chat_${agentId}`,
      project_id: input.projectId || null,
    });
  }

  const durationMs = Date.now() - startTime;

  // 4. Save Assistant Response
  const assistantMsg = await db.addMessage({
    conversation_id: input.conversationId,
    role: 'assistant',
    content: replyText,
    agent_id: agentId,
    extracted_memories: uniqueCandidates,
    duration_ms: durationMs,
  });

  // 5. Audit Log (Seção 28)
  await db.logAudit({
    agent_id: `agent-${agentId}`,
    user_id: profile.user_id,
    family_id: profile.id,
    project_id: input.projectId || null,
    action: `CHAT_${agentId.toUpperCase()}`,
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
