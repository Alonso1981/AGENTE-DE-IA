import crypto from 'crypto';
import { db, defaultUserId, defaultFamilyId } from './supabase';
import { generateContentResilient } from './gemini';
import { VideoProject, VideoScene } from '../src/types';

export interface VideoGenerateInput {
  topic: string;
  format: 'short' | 'long';
  targetDuration: string;
  niche?: string;
  tone?: string;
  platform?: 'tiktok_reels_shorts' | 'youtube' | 'course_lecture';
  callToAction?: string;
  additionalInstructions?: string;
}

export async function generateVideoProject(input: VideoGenerateInput): Promise<VideoProject> {
  const startTime = Date.now();
  const apiKey = process.env.GEMINI_API_KEY;

  // Retrieve user's confirmed memories to align tone and niche
  let userMemories: any[] = [];
  try {
    userMemories = await db.getMemories({ type: 'PERMANENT' });
    if (userMemories.length === 0) {
      userMemories = await db.getMemories({ type: 'CONFIRMED' });
    }
  } catch (err) {
    console.warn('Could not load memories for video generation:', err);
  }

  const memoryContext = userMemories
    .slice(0, 5)
    .map((m) => `- ${m.content}`)
    .join('\n');

  const systemPrompt = `
Você é a unidade de Produção e Direção de Vídeos do MINDOS (Video Production Engine).
Sua missão é atuar como uma equipe de 4 Agentes Especialistas de Cinema & Mídia Digital:
1. AGENTE 1 - ROTEIRISTA VIRAL & COPYWRITER: Cria ganchos hipnóticos nos primeiros 3 segundos, retenção psicológica, ritmo dinâmico e chamadas para ação autênticas.
2. AGENTE 2 - DIRETOR DE CENA & B-ROLL: Especifica exatamente o que deve aparecer na tela a cada fração de tempo (ângulos, expressões faciais, gráficos na tela e B-rolls).
3. AGENTE 3 - ENGENHEIRO DE PROMPTS PARA IA (Google Veo / Runway Gen-3 / Sora): Elabora prompts técnicos em inglês cinematográfico (iluminação 8k, lentes 35mm/50mm anamorphic, movimentos de câmera como slow push-in, drone shot, macro, cinematic lighting).
4. AGENTE 4 - ESTRATEGISTA DE DISTRIBUIÇÃO & SEO: Cria títulos magnéticos de alta conversão de clique (CTR), descrição otimizada, tags e descrição detalhada da miniatura (thumbnail).

DIRETRIZES DE ESTILO:
- Linguagem em Português do Brasil (pt-BR) autêntica, direta, com ritmo natural de fala.
- SEM clichês manjados de IA (NUNCA use "divisor de águas", "crucial", "prepare-se", "em um mundo onde", "mergulhar de cabeça").
- Para vídeos curtos (15s a 60s): foco absoluto em dinamismo, cortes a cada 3 a 5 segundos, frases curtas e impacto imediato.
- Para vídeos longos (3min a 15min): estrutura em capítulos bem definidos com timecodes progressivos, storytelling engajante e aprofundamento prático.

MEMÓRIAS E REGRAS DO USUÁRIO:
${memoryContext || '(Sem memórias permanentes registradas ainda)'}

RETORNE ESTRITAMENTE UM OBJETO JSON VÁLIDO (sem blocos de código markdown desnecessários, apenas JSON puro):
{
  "title": "Título conciso do projeto",
  "hookHeadline": "Frase de impacto que abre o vídeo nos primeiros 0 a 3 segundos",
  "coreSummary": "Resumo da premissa central do vídeo em 2 frases",
  "scenes": [
    {
      "id": "scene_1",
      "timecode": "00:00 - 00:04",
      "phase": "Gancho / Retenção",
      "spokenScript": "Texto falado exato com entonação",
      "visualDirection": "Instrução visual detalhada de corte, B-roll e ator",
      "screenText": "Texto grande animado na tela",
      "aiPrompt": "Cinematic prompt in English for Veo/Runway: Photorealistic, 35mm lens, cinematic lighting, ..."
    }
  ],
  "teleprompterScript": "Texto corrido integral pronto para leitura no teleprompter sem interrupções",
  "aiVideoPrompts": [
    {
      "scene": "Cena 1 - Gancho",
      "tool": "Google Veo",
      "promptEn": "Cinematic shot in English...",
      "cameraMotion": "Slow push-in, 4k 24fps"
    }
  ],
  "youtubeMetadata": {
    "titles": ["Título Opção A (Curiosidade)", "Título Opção B (Benefício Direto)", "Título Opção C (Impacto)"],
    "description": "Descrição envolvente com minutagem e links",
    "tags": ["tag1", "tag2", "tag3"],
    "thumbnailPrompt": "Prompt visual detalhado para criar a capa de alto clique"
  }
}
`;

  const userPrompt = `
DADOS DO VÍDEO SOLICITADO:
- Tema / Assunto: ${input.topic}
- Formato: ${input.format === 'short' ? 'VÍDEO CURTO (Reels / TikTok / YouTube Shorts)' : 'VÍDEO LONGO (YouTube / Treinamento / Documentário)'}
- Duração Alvo: ${input.targetDuration}
- Nicho / Audiência: ${input.niche || 'Geral / Negócios'}
- Tom de Voz: ${input.tone || 'Direto, enérgico e prático'}
- Plataforma: ${input.platform || 'tiktok_reels_shorts'}
- Chamada para Ação (CTA): ${input.callToAction || 'Comentar ou Seguir'}
- Instruções Adicionais: ${input.additionalInstructions || 'Nenhuma'}

Gere agora o roteiro completo estruturado em JSON com todas as cenas e prompts de IA.
`;

  let projectData: Partial<VideoProject> = {};

  try {
    const rawText = await generateContentResilient({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
        },
      ],
      temperature: 0.7,
      responseMimeType: 'application/json',
    });

    if (rawText) {
      let cleanJson = rawText.trim();
      cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      try {
        projectData = JSON.parse(cleanJson);
      } catch (pErr) {
        const start = cleanJson.indexOf('{');
        const end = cleanJson.lastIndexOf('}');
        if (start !== -1 && end !== -1 && end > start) {
          try {
            projectData = JSON.parse(cleanJson.substring(start, end + 1));
          } catch {
            // fallback will be triggered
          }
        }
      }
    }
  } catch (err) {
    console.error('Failed to call Gemini for video project:', err);
  }

  // Fallback intelligent generator if API key was missing or failed
  if (!projectData.scenes || projectData.scenes.length === 0) {
    const isShort = input.format === 'short';
    projectData = generateFallbackVideo(input, isShort);
  }

  const durationMs = Date.now() - startTime;
  const projectId = crypto.randomUUID();

  const finalProject: VideoProject = {
    id: projectId,
    title: projectData.title || `Vídeo: ${input.topic.slice(0, 40)}`,
    format: input.format,
    platform: input.platform || (input.format === 'short' ? 'tiktok_reels_shorts' : 'youtube'),
    targetDuration: input.targetDuration,
    objective: input.callToAction || 'Engajamento e retenção',
    tone: input.tone || 'Direto e prático',
    niche: input.niche || 'Geral',
    hookHeadline: projectData.hookHeadline || 'Aviso importante sobre este assunto',
    coreSummary: projectData.coreSummary || `Produção completa focada em ${input.topic}`,
    scenes: (projectData.scenes || []).map((s: any, idx: number) => ({
      id: s.id || `scene_${idx + 1}`,
      timecode: s.timecode || `00:0${idx * 5} - 00:0${(idx + 1) * 5}`,
      phase: s.phase || (idx === 0 ? 'Gancho' : idx === (projectData.scenes?.length || 1) - 1 ? 'CTA' : 'Desenvolvimento'),
      spokenScript: s.spokenScript || '',
      visualDirection: s.visualDirection || '',
      screenText: s.screenText || '',
      aiPrompt: s.aiPrompt || '',
    })),
    teleprompterScript: projectData.teleprompterScript || projectData.scenes?.map((s: any) => s.spokenScript).join(' ') || '',
    aiVideoPrompts: projectData.aiVideoPrompts || [
      {
        scene: 'Cena 1 - Gancho Inicial',
        tool: 'Google Veo',
        promptEn: `High-definition cinematic footage representing ${input.topic}, dynamic lighting, 35mm lens, 4k 24fps.`,
        cameraMotion: 'Slow dynamic push-in',
      },
    ],
    youtubeMetadata: projectData.youtubeMetadata || {
      titles: [
        `${input.topic}: O Guia Definitivo`,
        `Como Dominar ${input.topic} na Prática`,
        `O Segredo que Ninguém te Conta sobre ${input.topic}`,
      ],
      description: `Neste vídeo detalhamos estratégias práticas sobre ${input.topic}.\n\nCapítulos:\n00:00 Introdução\n01:00 Ponto Principal\n03:00 Conclusão e Próximos Passos`,
      tags: [input.topic, 'automação', 'tecnologia', 'produtividade'],
      thumbnailPrompt: `Close-up expressive portrait, vibrant contrast lighting, bold expressive background related to ${input.topic}, high CTR YouTube thumbnail style.`,
    },
    createdAt: new Date().toISOString(),
  };

  // Register in audit logs
  try {
    await db.logAudit({
      agent_id: 'agent_video_director',
      user_id: defaultUserId,
      family_id: defaultFamilyId,
      action: 'GENERATE_VIDEO_PROJECT',
      tool: 'GeminiVideoEngine',
      input: JSON.stringify({ topic: input.topic, format: input.format, duration: input.targetDuration }),
      output: JSON.stringify({ title: finalProject.title, scenesCount: finalProject.scenes.length }),
      status: 'SUCCESS',
      duration_ms: durationMs,
    });

    // Save memory candidate about user video niche interest
    await db.createMemory({
      content: `O usuário produziu um roteiro de vídeo ${input.format === 'short' ? 'curto (Reels/TikTok)' : 'longo (YouTube)'} sobre "${input.topic}" com tom ${input.tone || 'direto'}.`,
      category: 'project',
      type: 'CANDIDATE',
      subject: 'Produção de Vídeo',
      tags: ['video', input.format, input.niche || 'conteudo'],
      confidence_score: 0.92,
      is_shared_family: false,
    });
  } catch (err) {
    console.warn('Failed to record video project audit or memory:', err);
  }

  return finalProject;
}

function generateFallbackVideo(input: VideoGenerateInput, isShort: boolean): any {
  if (isShort) {
    return {
      title: `Como dominar ${input.topic} em segundos`,
      hookHeadline: `Se você ainda faz ${input.topic} do jeito tradicional, você está perdendo tempo.`,
      coreSummary: `Roteiro dinâmico de 30 segundos com 4 cortes rápidos e call to action direta.`,
      scenes: [
        {
          id: 'scene_1',
          timecode: '00:00 - 00:04',
          phase: 'Gancho (0-4s)',
          spokenScript: `Pare de perder tempo tentando fazer ${input.topic} da forma antiga!`,
          visualDirection: 'Plano fechado no rosto, expressão assertiva, corte seco imediato.',
          screenText: 'PARE DE PERDER TEMPO!',
          aiPrompt: 'Cinematic close-up portrait of professional speaking with confident expression, modern high-tech office background, dramatic rim lighting, 35mm f/1.8 lens.',
        },
        {
          id: 'scene_2',
          timecode: '00:04 - 00:12',
          phase: 'Problema & Solução (4-12s)',
          spokenScript: `A maioria das pessoas comete o erro de complicar o processo. Com 3 passos simples você automatiza tudo isso.`,
          visualDirection: 'B-roll de tela de computador com gráficos modernos se movimentando rapidamente.',
          screenText: 'O ERRO QUE TODOS COMETEM',
          aiPrompt: 'Macro shot of modern computer interface with automated data flowing, smooth motion graphic elements, cyberpunk neon accents, 4k photorealistic.',
        },
        {
          id: 'scene_3',
          timecode: '00:12 - 00:22',
          phase: 'Ação Prática (12-22s)',
          spokenScript: `Passo um: organize a estrutura. Passo dois: aplique o modelo testado. O resultado é economia de horas todo dia.`,
          visualDirection: 'Corte rápido mostrando mãos digitando com velocidade e interface fluida respondendo.',
          screenText: 'ECONOMIZE HORAS POR DIA',
          aiPrompt: 'Fast-paced dynamic shot of hands typing on sleek mechanical keyboard, multiple screens in background showing analytics dashboards, slow shutter motion blur.',
        },
        {
          id: 'scene_4',
          timecode: '00:22 - 00:30',
          phase: 'Chamada para Ação (22-30s)',
          spokenScript: `Quer o passo a passo completo? Comente VÍDEO aqui embaixo que eu te envio agora mesmo.`,
          visualDirection: 'Volta para plano médio, apontando o dedo para baixo em direção aos comentários.',
          screenText: 'COMENTE "VÍDEO" ABAIXO 👇',
          aiPrompt: 'Presenter pointing downwards with enthusiastic welcoming smile, bright studio lighting, soft blurred background, cinematic bokeh.',
        },
      ],
      teleprompterScript: `Pare de perder tempo tentando fazer ${input.topic} da forma antiga! A maioria das pessoas comete o erro de complicar o processo. Com 3 passos simples você automatiza tudo isso. Passo um: organize a estrutura. Passo dois: aplique o modelo testado. O resultado é economia de horas todo dia. Quer o passo a passo completo? Comente VÍDEO aqui embaixo que eu te envio agora mesmo.`,
      aiVideoPrompts: [
        {
          scene: 'Cena 1 - Gancho',
          tool: 'Google Veo',
          promptEn: `Cinematic close-up of a confident person in modern business attire looking directly into camera, expressive gesture, clean modern studio background, warm lighting, 4k 24fps.`,
          cameraMotion: 'Snap zoom into subject',
        },
        {
          scene: 'Cena 2 - Demonstração',
          tool: 'Runway Gen-3',
          promptEn: `High-tech futuristic dashboard with data visualization glowing in soft cyan and amber, smooth floating holographic elements, photorealistic cinematic look.`,
          cameraMotion: 'Slow orbital pan around monitor',
        },
      ],
      youtubeMetadata: {
        titles: [
          `O segredo de ${input.topic} revelado em 30 segundos`,
          `Como fazer ${input.topic} 10x mais rápido`,
          `Você comete esse erro em ${input.topic}?`,
        ],
        description: `Dica rápida e prática sobre ${input.topic}. Siga para mais conteúdos de alta performance!`,
        tags: [input.topic, 'shorts', 'reels', 'produtividade', 'dicas'],
        thumbnailPrompt: `Eye-catching vertical thumbnail with high contrast, split screen showing problem vs solution with glowing neon text.`,
      },
    };
  }

  return {
    title: `Masterclass: Estratégia Completa de ${input.topic}`,
    hookHeadline: `Se você quer dominar ${input.topic} com um método testado e comprovado, assista esta aula até o final.`,
    coreSummary: `Roteiro aprofundado para YouTube com minutagem, exemplos práticos, B-rolls e teleprompter estruturado.`,
    scenes: [
      {
        id: 'scene_1',
        timecode: '00:00 - 00:45',
        phase: 'Introdução & Gancho de Retenção',
        spokenScript: `Bem-vindo! Hoje nós vamos destrinchar absolutamente tudo o que você precisa saber sobre ${input.topic}. Se você já tentou métodos genéricos e não teve resultados, eu preparei um mapa prático passo a passo.`,
        visualDirection: 'Plano médio em estúdio bem iluminado, iluminação de três pontos, título elegante animado no terço inferior.',
        screenText: `GUIA DEFINITIVO: ${input.topic.toUpperCase()}`,
        aiPrompt: 'Professional host speaking in modern studio with bookshelves and subtle warm LED strips, 50mm f/1.4 lens, shallow depth of field, high-end YouTube production quality.',
      },
      {
        id: 'scene_2',
        timecode: '00:45 - 03:30',
        phase: 'Módulo 1: Fundamentos e Erros Críticos',
        spokenScript: `O primeiro grande pilar é entender por onde a maioria erra. Quando começamos a trabalhar com isso, a tentação é pular etapas, mas sem uma base sólida os resultados simplesmente não sustentam.`,
        visualDirection: 'Alternância entre o apresentador e tela cheia com diagrama explicativo e animações gráficas.',
        screenText: 'PILAR 1: OS ERROS CRÍTICOS',
        aiPrompt: 'Infographic animation showing clear workflow diagrams, smooth minimalist vector lines, dark background with glowing accent colors.',
      },
      {
        id: 'scene_3',
        timecode: '03:30 - 07:00',
        phase: 'Módulo 2: Execução Prática e Metodologia',
        spokenScript: `Agora que a fundação está clara, vamos para a execução prática. Aqui você vai aplicar o que eu chamo de regra dos 3 passos, focando no que traz 80% do retorno com 20% do esforço.`,
        visualDirection: 'B-roll mostrando fluxo de trabalho real, telas de software e exemplos aplicados.',
        screenText: 'PILAR 2: MÉTODO PASSO A PASSO',
        aiPrompt: 'Montage of hands configuring settings on high-end monitors, sleek design workstation, cinematic lighting, sharp focus on screen reflections.',
      },
      {
        id: 'scene_4',
        timecode: '07:00 - 08:30',
        phase: 'Conclusão & Chamada de Conversão',
        spokenScript: `Se este conteúdo agregou valor para você, inscreva-se no canal, ative as notificações e deixe seu comentário com a sua maior dúvida para o próximo vídeo.`,
        visualDirection: 'Plano aberto do estúdio, cards finais de tela final (End Screen) com sugestões de próximos vídeos.',
        screenText: 'INSCREVA-SE NO CANAL & ATIVE O SININHO',
        aiPrompt: 'Studio lights slowly dimming into warm ambient glow, host smiling and waving goodbye, YouTube end-card layout overlay placeholders.',
      },
    ],
    teleprompterScript: `Bem-vindo! Hoje nós vamos destrinchar absolutamente tudo o que você precisa saber sobre ${input.topic}. Se você já tentou métodos genéricos e não teve resultados, eu preparei um mapa prático passo a passo. O primeiro grande pilar é entender por onde a maioria erra. Quando começamos a trabalhar com isso, a tentação é pular etapas, mas sem uma base sólida os resultados simplesmente não sustentam. Agora que a fundação está clara, vamos para a execução prática. Aqui você vai aplicar o que eu chamo de regra dos 3 passos, focando no que traz 80% do retorno com 20% do esforço. Se este conteúdo agregou valor para você, inscreva-se no canal, ative as notificações e deixe seu comentário com a sua maior dúvida para o próximo vídeo.`,
    aiVideoPrompts: [
      {
        scene: 'Abertura da Masterclass',
        tool: 'Google Veo',
        promptEn: `High-production value documentary opening, wide shot of an elegant modern library and creative studio, subtle warm morning sun rays, 4k 24fps cinematic camera motion.`,
        cameraMotion: 'Smooth crane down into medium shot',
      },
    ],
    youtubeMetadata: {
      titles: [
        `Como Dominar ${input.topic} do Zero ao Avançado`,
        `${input.topic}: O Método Que Realmente Funciona`,
        `Tudo O Que Você Precisa Saber Sobre ${input.topic} (Guia Completo)`,
      ],
      description: `Aula completa sobre ${input.topic}.\n\n⏱️ Minutagem:\n00:00 Introdução & Visão Geral\n00:45 Pilar 1: Erros Críticos\n03:30 Pilar 2: Passo a Passo Prático\n07:00 Conclusão e Resumo\n\n📌 Inscreva-se no canal para mais conteúdos!`,
      tags: [input.topic, 'tutorial', 'curso', 'aula', 'passo a passo', 'produtividade'],
      thumbnailPrompt: `Professional YouTube thumbnail, charismatic person pointing to a glowing bold title, high contrast lighting, clean background with depth of field.`,
    },
  };
}
