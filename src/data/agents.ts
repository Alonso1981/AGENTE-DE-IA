import { AgentDefinition } from '../types';

export const AVAILABLE_AGENTS: AgentDefinition[] = [
  {
    id: 'orchestrator',
    name: 'Orquestrador Central',
    role: 'Coordenação, Memória & Sistema',
    description: 'Gerencia o ecossistema MINDOS, orquestra subagentes, valida memórias de longo prazo e garante escritas humanizadas sem clichês.',
    badge: 'Core Kernel',
    color: 'cyan',
    avatarIcon: 'Brain',
    suggestedPrompts: [
      'Quais memórias permanentes estão ativas no meu perfil?',
      'Como funciona o isolamento por fases do MINDOS?',
      'Analise os dados cadastrados e sugira as próximas prioridades.',
    ],
  },
  {
    id: 'business',
    name: 'Especialista em Negócios & Farmácia',
    role: 'Gestão, Processos, Estoque & POPs',
    description: 'Especialista em gestão de farmácias e pequenos negócios. Otimiza controle de estoque, curva ABC, compras com distribuidores, precificação e POPs operacionais.',
    badge: 'Especialista',
    color: 'emerald',
    avatarIcon: 'Store',
    suggestedPrompts: [
      'Como organizar o controle de validade e evitar perdas de medicamentos?',
      'Elabore um POP simples para conferência de mercadorias no recebimento.',
      'Quais estratégias práticas aumentam a margem de lucro de uma farmácia independente?',
    ],
  },
  {
    id: 'video',
    name: 'Roteirista & Diretor de Vídeo',
    role: 'Vídeos Virais, Ganchos & Prompts IA',
    description: 'Cria roteiros magnéticos com retenção nos primeiros 3 segundos, direção visual cena a cena e prompts profissionais prontos para Google Veo e Runway Gen-3.',
    badge: 'Produção Audiovisual',
    color: 'amber',
    avatarIcon: 'Film',
    suggestedPrompts: [
      'Crie um roteiro de 30s sobre como não perder dinheiro no estoque da farmácia.',
      'Me dê 5 ideias de ganchos virais para chamar atenção no Reels/TikTok.',
      'Gere prompts em inglês para o Google Veo de um farmacêutico atendendo um cliente.',
    ],
  },
  {
    id: 'content',
    name: 'Agente de Conteúdo & Copywriting',
    role: 'Social Media, Carrosséis & Artigos',
    description: 'Produz textos envolventes com tom autêntico e voz humana. Elabora carrosséis de alto salvamento, postagens persuasivas e newsletters sem jargões de IA.',
    badge: 'Estratégia de Conteúdo',
    color: 'purple',
    avatarIcon: 'FileText',
    suggestedPrompts: [
      'Escreva um carrossel de 5 slides explicando como organizar a farmácia.',
      'Crie uma legenda persuasiva para o Instagram convidando clientes para o WhatsApp.',
      'Escreva uma mensagem de pós-venda que gere fidelização genuína sem parecer robô.',
    ],
  },
  {
    id: 'automation',
    name: 'Engenheiro de Automação & Sistemas',
    role: 'Arquitetura, APIs, SQL & Workflows',
    description: 'Desenha integrações técnicas, schemas Supabase PostgreSQL, consultas SQL otimizadas, webhooks e automações orientadas a eventos.',
    badge: 'Engenharia Técnica',
    color: 'blue',
    avatarIcon: 'Zap',
    suggestedPrompts: [
      'Como estruturar uma automação que avisa 30 dias antes do remédio vencer?',
      'Gere uma query SQL para identificar produtos com giro lento no estoque.',
      'Explique como conectar o Supabase com um webhook de vendas.',
    ],
  },
];
