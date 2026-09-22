import React, { useState } from 'react';
import {
  Film,
  Sparkles,
  Smartphone,
  Tv,
  Play,
  Copy,
  Check,
  Download,
  Clock,
  Wand2,
  Sliders,
  Layers,
  ChevronRight,
  Flame,
  FileText,
  Video,
  Bot,
  RefreshCw,
  Search,
  Hash,
  AlertCircle,
} from 'lucide-react';
import { VideoProject, VideoFormat, VideoScene } from '../types';

interface VideoStudioViewProps {
  onSaveToMemories?: (title: string, summary: string) => void;
}

export const VideoStudioView: React.FC<VideoStudioViewProps> = ({ onSaveToMemories }) => {
  const [format, setFormat] = useState<VideoFormat>('short');
  const [topic, setTopic] = useState('');
  const [targetDuration, setTargetDuration] = useState('30s');
  const [tone, setTone] = useState('Direto, enérgico e com autoridade');
  const [niche, setNiche] = useState('Farmácia & Saúde');
  const [platform, setPlatform] = useState<'tiktok_reels_shorts' | 'youtube' | 'course_lecture'>('tiktok_reels_shorts');
  const [callToAction, setCallToAction] = useState('Comentar para receber o guia completo');
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<VideoProject | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'scenes' | 'teleprompter' | 'aiPrompts' | 'seo'>('scenes');
  const [mobileTab, setMobileTab] = useState<'form' | 'result'>('form');

  // Quick preset templates for one-click inspiration
  const quickPresets = [
    {
      title: 'Farmácia: 3 Erros Fatais',
      format: 'short' as VideoFormat,
      duration: '30s',
      niche: 'Farmácia & Saúde',
      topic: '3 erros graves na gestão de estoque de farmácia que drenam o lucro todo mês',
      cta: 'Comentar ESTOQUE para receber a planilha grátis',
    },
    {
      title: 'IA & Automação de Processos',
      format: 'short' as VideoFormat,
      duration: '45s',
      niche: 'Automação & Tecnologia',
      topic: 'Como automatizar 80% do atendimento no balcão e WhatsApp usando IA sem complicação',
      cta: 'Salvar este vídeo e seguir para o passo 2',
    },
    {
      title: 'Masterclass: Do Balcão à Gestão',
      format: 'long' as VideoFormat,
      duration: '8-10min',
      niche: 'Empreendedorismo & Farmácia',
      topic: 'Guia Completo: Como transformar uma farmácia tradicional em uma operação de alta escala com processos',
      cta: 'Inscrever-se no canal e baixar o resumo na descrição',
    },
    {
      title: 'Rotina de Alta Produtividade',
      format: 'short' as VideoFormat,
      duration: '30s',
      niche: 'Produtividade & Negócios',
      topic: 'A regra dos 2 minutos que profissionais de sucesso usam para eliminar tarefas pendentes',
      cta: 'Compartilhar com quem precisa ver isso hoje',
    },
  ];

  const handleApplyPreset = (preset: typeof quickPresets[0]) => {
    setFormat(preset.format);
    setTargetDuration(preset.duration);
    setNiche(preset.niche);
    setTopic(preset.topic);
    setCallToAction(preset.cta);
    if (preset.format === 'short') {
      setPlatform('tiktok_reels_shorts');
    } else {
      setPlatform('youtube');
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      setError('Por favor, informe o tema ou premissa do vídeo.');
      return;
    }

    setError(null);
    setLoading(true);
    setLoadingStep(1);
    setMobileTab('result');

    // Simulated progress steps for specialized sub-agents
    const timer1 = setTimeout(() => setLoadingStep(2), 1500);
    const timer2 = setTimeout(() => setLoadingStep(3), 3500);
    const timer3 = setTimeout(() => setLoadingStep(4), 5500);

    try {
      const res = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          format,
          targetDuration,
          niche,
          tone,
          platform,
          callToAction,
          additionalInstructions,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Falha ao acionar os agentes de vídeo.');
      }

      const data: VideoProject = await res.json();
      setCurrentProject(data);
      setActiveTab('scenes');
      setMobileTab('result');
    } catch (err: any) {
      console.error('Error generating video project:', err);
      setError(err.message || 'Erro inesperado ao gerar o roteiro.');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleDownloadTxt = () => {
    if (!currentProject) return;

    let content = `=====================================================\n`;
    content += `MINDOS VIDEO ENGINE - ROTEIRO DE PRODUÇÃO\n`;
    content += `Título: ${currentProject.title}\n`;
    content += `Formato: ${currentProject.format === 'short' ? 'Vídeo Curto (Reels/TikTok)' : 'Vídeo Longo (YouTube)'}\n`;
    content += `Duração Estimada: ${currentProject.targetDuration}\n`;
    content += `Nicho: ${currentProject.niche} | Tom: ${currentProject.tone}\n`;
    content += `Gancho Inicial (0-3s): ${currentProject.hookHeadline}\n`;
    content += `=====================================================\n\n`;

    content += `--- CENAS & DIREÇÃO SEGUNDO A SEGUNDO ---\n\n`;
    currentProject.scenes.forEach((s, idx) => {
      content += `[CENA ${idx + 1}] (${s.timecode}) - ${s.phase}\n`;
      content += `FALA / LOCUÇÃO: "${s.spokenScript}"\n`;
      content += `DIREÇÃO VISUAL / B-ROLL: ${s.visualDirection}\n`;
      if (s.screenText) content += `TEXTO NA TELA: ${s.screenText}\n`;
      if (s.aiPrompt) content += `PROMPT DE VÍDEO IA (Veo/Runway): ${s.aiPrompt}\n`;
      content += `\n`;
    });

    content += `\n--- TELEPROMPTER / LOCUÇÃO COMPLETA ---\n\n`;
    content += `${currentProject.teleprompterScript}\n\n`;

    if (currentProject.youtubeMetadata) {
      content += `\n--- METADADOS & SEO ---\n\n`;
      content += `TÍTULOS RECOMENDADOS:\n`;
      currentProject.youtubeMetadata.titles.forEach((t) => {
        content += `- ${t}\n`;
      });
      content += `\nDESCRIÇÃO:\n${currentProject.youtubeMetadata.description}\n\n`;
      content += `TAGS: ${currentProject.youtubeMetadata.tags.join(', ')}\n\n`;
      content += `PROMPT DE THUMBNAIL: ${currentProject.youtubeMetadata.thumbnailPrompt}\n`;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roteiro_${currentProject.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 text-slate-100 overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Film className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Agentes de Produção de Vídeos
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300">
                Gemini Multi-Agent
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Roteiros com ganchos de alta retenção, direção cena a cena, teleprompter e prompts para Google Veo & Runway
          </p>
        </div>

        {/* Quick Format Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setFormat('short');
              setTargetDuration('30s');
              setPlatform('tiktok_reels_shorts');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              format === 'short'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Vídeos Curtos (Reels / TikTok)
          </button>
          <button
            type="button"
            onClick={() => {
              setFormat('long');
              setTargetDuration('5-8min');
              setPlatform('youtube');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              format === 'long'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            Vídeos Longos (YouTube / Aulas)
          </button>
        </div>
      </header>

      {/* Mobile View Toggle (hidden on lg screens) */}
      <div className="lg:hidden flex items-center bg-slate-950 border-b border-slate-800 p-2 gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setMobileTab('form')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            mobileTab === 'form'
              ? 'bg-cyan-500 text-slate-950 shadow'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          1. Configurar & Prompt
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('result')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            mobileTab === 'result'
              ? 'bg-cyan-500 text-slate-950 shadow'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          2. Roteiro & Prompts {currentProject ? '(Pronto)' : ''}
        </button>
      </div>

      {/* Main Studio Body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: Generator Form & Parameters */}
        <div
          className={`w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950/40 p-5 overflow-y-auto space-y-5 shrink-0 ${
            mobileTab === 'form' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Quick Presets */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Inspiração & Modelos Prontos
            </label>
            <div className="grid grid-cols-1 gap-2">
              {quickPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="text-left p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:border-cyan-500/40 hover:bg-slate-800/80 transition-all group"
                >
                  <div className="flex items-center justify-between text-xs font-medium text-slate-200 group-hover:text-cyan-300">
                    <span>{preset.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {preset.duration}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">{preset.topic}</p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            {/* Topic Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Tema / Ideia Central do Vídeo <span className="text-cyan-400">*</span>
                </label>
                <span className="text-[10px] text-slate-400">Enter para gerar (Shift+Enter quebra linha)</span>
              </div>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
                placeholder={
                  format === 'short'
                    ? 'Ex: 3 sinais de que você está perdendo dinheiro na farmácia por falta de processos...'
                    : 'Ex: Como estruturar uma operação completa com automações inteligentes e IA...'
                }
                rows={3}
                className="w-full rounded-xl bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 resize-none transition-all"
              />
              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={loading || !topic.trim()}
                className="mt-2 w-full py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm disabled:opacity-40"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                {loading ? 'Gerando com IA...' : '⚡ Acionar Agentes & Criar Roteiro'}
              </button>
            </div>

            {/* Target Duration & Platform */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  Duração Alvo
                </label>
                <select
                  value={targetDuration}
                  onChange={(e) => setTargetDuration(e.target.value)}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700/80 px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  {format === 'short' ? (
                    <>
                      <option value="15s">15 segundos (Micro-dica)</option>
                      <option value="30s">30 segundos (Padrão Reels/Shorts)</option>
                      <option value="45s">45 segundos (Dica + Exemplo)</option>
                      <option value="60s">60 segundos (História Dinâmica)</option>
                    </>
                  ) : (
                    <>
                      <option value="3-5min">3 a 5 minutos (Direto ao ponto)</option>
                      <option value="5-8min">5 a 8 minutos (Tutorial prático)</option>
                      <option value="8-12min">8 a 12 minutos (Aula estruturada)</option>
                      <option value="15min+">15+ minutos (Masterclass aprofundada)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-slate-400" />
                  Nicho / Setor
                </label>
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700/80 px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="Farmácia & Saúde">Farmácia & Saúde</option>
                  <option value="Automação & IA">Automação & IA</option>
                  <option value="Empreendedorismo & Negócios">Empreendedorismo & Negócios</option>
                  <option value="Produtividade Pessoal">Produtividade Pessoal</option>
                  <option value="Tecnologia & Programação">Tecnologia & Programação</option>
                  <option value="Geral & Curiosidades">Geral & Curiosidades</option>
                </select>
              </div>
            </div>

            {/* Tone of Voice */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Tom de Voz dos Agentes
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700/80 px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="Direto, enérgico e com autoridade">Direto, enérgico e com autoridade</option>
                <option value="Didático, calmo e passo a passo">Didático, calmo e passo a passo</option>
                <option value="Provocativo com curiosidade magnética">Provocativo com curiosidade magnética</option>
                <option value="Storytelling pessoal e inspirador">Storytelling pessoal e inspirador</option>
                <option value="Técnico e fundamentado">Técnico e fundamentado</option>
              </select>
            </div>

            {/* Call To Action */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Chamada para Ação (CTA) Final
              </label>
              <input
                type="text"
                value={callToAction}
                onChange={(e) => setCallToAction(e.target.value)}
                placeholder="Ex: Comente 'VÍDEO' para receber o material..."
                className="w-full rounded-lg bg-slate-900 border border-slate-700/80 px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Main Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>
                    {loadingStep === 1 && 'Roteirista estruturando ganchos...'}
                    {loadingStep === 2 && 'Diretor planejando cortes e B-rolls...'}
                    {loadingStep === 3 && 'Engenheiro gerando prompts Veo/Runway...'}
                    {loadingStep === 4 && 'Finalizando roteiro e SEO...'}
                  </span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-slate-950" />
                  <span>Acionar Agentes & Criar Roteiro</span>
                </>
              )}
            </button>
          </form>

          {/* Sub-Agents Info Panel */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Equipe de 4 Agentes Alocada
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="font-medium text-cyan-400">1. Roteirista Viral</div>
                <div className="text-slate-400">Ganchos e retenção</div>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="font-medium text-blue-400">2. Diretor B-Roll</div>
                <div className="text-slate-400">Cenas segundo a segundo</div>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="font-medium text-purple-400">3. Prompts IA</div>
                <div className="text-slate-400">Google Veo & Runway</div>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="font-medium text-emerald-400">4. Estrategista SEO</div>
                <div className="text-slate-400">Títulos A/B e Thumbnails</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Output Viewer */}
        <div
          className={`flex-1 flex flex-col overflow-hidden bg-slate-900 ${
            mobileTab === 'result' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {currentProject ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Project Header Bar */}
              <div className="p-5 bg-slate-950/60 border-b border-slate-800 shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                        {currentProject.format === 'short' ? 'Vídeo Curto' : 'Vídeo Longo'}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {currentProject.targetDuration}
                      </span>
                      <span className="text-xs text-slate-400">| {currentProject.niche}</span>
                    </div>
                    <h2 className="text-lg font-bold text-white mt-1">{currentProject.title}</h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadTxt}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all"
                      title="Baixar Roteiro em arquivo TXT"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Baixar (.TXT)
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(currentProject.teleprompterScript, 'all')}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      {copiedSection === 'all' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedSection === 'all' ? 'Copiado!' : 'Copiar Roteiro'}
                    </button>
                  </div>
                </div>

                {/* Hook Highlight */}
                <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-transparent border border-amber-500/20 flex items-start gap-2.5">
                  <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                      Gancho Magnético (Primeiros 0 a 3 Segundos)
                    </div>
                    <div className="text-xs text-slate-100 font-medium mt-0.5">
                      "{currentProject.hookHeadline}"
                    </div>
                  </div>
                </div>

                {/* Output Navigation Tabs */}
                <div className="flex items-center gap-2 mt-4 border-b border-slate-800 -mb-5 pb-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab('scenes')}
                    className={`pb-3 px-3 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 ${
                      activeTab === 'scenes'
                        ? 'border-cyan-400 text-cyan-300 font-semibold'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Cenas Segundo a Segundo ({currentProject.scenes.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('teleprompter')}
                    className={`pb-3 px-3 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 ${
                      activeTab === 'teleprompter'
                        ? 'border-cyan-400 text-cyan-300 font-semibold'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Teleprompter & Locução
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('aiPrompts')}
                    className={`pb-3 px-3 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 ${
                      activeTab === 'aiPrompts'
                        ? 'border-cyan-400 text-cyan-300 font-semibold'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    Prompts de IA (Veo / Runway)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('seo')}
                    className={`pb-3 px-3 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 ${
                      activeTab === 'seo'
                        ? 'border-cyan-400 text-cyan-300 font-semibold'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5" />
                    Títulos A/B & SEO
                  </button>
                </div>
              </div>

              {/* Tab Content Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* TAB 1: SCENES & DIRECTION */}
                {activeTab === 'scenes' && (
                  <div className="space-y-4">
                    {currentProject.scenes.map((scene, idx) => (
                      <div
                        key={scene.id}
                        className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3 hover:border-slate-700 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-xs font-bold">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-semibold text-white">{scene.phase}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                              {scene.timecode}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => copyToClipboard(scene.spokenScript, `scene_${idx}`)}
                            className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1"
                          >
                            {copiedSection === `scene_${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            {copiedSection === `scene_${idx}` ? 'Copiado' : 'Copiar fala'}
                          </button>
                        </div>

                        {/* Spoken script */}
                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                            O Que Falar (Texto Exato):
                          </span>
                          <p className="text-sm font-medium text-slate-100 leading-relaxed">
                            "{scene.spokenScript}"
                          </p>
                        </div>

                        {/* Visual direction & B-Roll */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/60">
                            <span className="text-[10px] font-bold text-blue-400 uppercase block mb-1">
                              🎥 O Que Mostrar (Cena / B-Roll):
                            </span>
                            <p className="text-slate-300 leading-relaxed">{scene.visualDirection}</p>
                          </div>

                          <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/60">
                            <span className="text-[10px] font-bold text-amber-400 uppercase block mb-1">
                              💬 Texto na Tela / Legenda:
                            </span>
                            <p className="text-slate-200 font-mono text-xs">{scene.screenText || '(Legenda automática da fala)'}</p>
                          </div>
                        </div>

                        {/* AI Video Prompt */}
                        {scene.aiPrompt && (
                          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                            <div className="text-slate-400 text-[11px] truncate mr-2">
                              <span className="text-purple-400 font-semibold">Prompt Veo/Runway: </span>
                              <span className="font-mono text-slate-300">{scene.aiPrompt}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(scene.aiPrompt, `prompt_${idx}`)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 shrink-0 flex items-center gap-1"
                            >
                              {copiedSection === `prompt_${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              Prompt
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 2: TELEPROMPTER */}
                {activeTab === 'teleprompter' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                      <div className="text-xs text-slate-400 space-x-4">
                        <span>
                          Palavras: <strong className="text-white">{currentProject.teleprompterScript.split(/\s+/).length}</strong>
                        </span>
                        <span>
                          Tempo estimado: <strong className="text-white">{currentProject.targetDuration}</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(currentProject.teleprompterScript, 'teleprompter')}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium flex items-center gap-1.5"
                      >
                        {copiedSection === 'teleprompter' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        Copiar Texto Completo
                      </button>
                    </div>

                    <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-base md:text-lg leading-loose font-normal tracking-wide whitespace-pre-line shadow-inner select-text">
                      {currentProject.teleprompterScript}
                    </div>
                  </div>
                )}

                {/* TAB 3: AI PROMPTS */}
                {activeTab === 'aiPrompts' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200 flex items-center gap-3">
                      <Bot className="w-5 h-5 text-purple-400 shrink-0" />
                      <span>
                        Estes prompts foram estruturados em <strong>inglês cinematográfico</strong> com diretrizes de lentes, iluminação e movimento de câmera, prontos para colar diretamente no <strong>Google Veo</strong>, <strong>Runway Gen-3</strong> ou <strong>Sora</strong>.
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {currentProject.aiVideoPrompts.map((aiPrompt, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                {aiPrompt.tool}
                              </span>
                              <span className="text-xs font-semibold text-slate-200">{aiPrompt.scene}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(aiPrompt.promptEn, `aiprompt_${idx}`)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 flex items-center gap-1.5 transition-all"
                            >
                              {copiedSection === `aiprompt_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              Copiar Prompt
                            </button>
                          </div>

                          <div className="p-3 rounded-lg bg-slate-900 font-mono text-xs text-slate-300 select-all leading-relaxed">
                            {aiPrompt.promptEn}
                          </div>

                          {aiPrompt.cameraMotion && (
                            <div className="text-[11px] text-slate-400">
                              <span className="font-semibold text-slate-300">Movimento sugerido: </span>
                              {aiPrompt.cameraMotion}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 4: SEO & TITLES */}
                {activeTab === 'seo' && currentProject.youtubeMetadata && (
                  <div className="space-y-4">
                    {/* Titles */}
                    <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-cyan-400" />
                        Títulos de Alta Conversão de Clique (Teste A/B)
                      </h3>
                      <div className="space-y-2">
                        {currentProject.youtubeMetadata.titles.map((title, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between group hover:border-cyan-500/40"
                          >
                            <span className="text-xs font-medium text-slate-200">{title}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(title, `title_${idx}`)}
                              className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1"
                            >
                              {copiedSection === `title_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                          Descrição Pronta para Publicação
                        </h3>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(currentProject.youtubeMetadata?.description || '', 'desc')}
                          className="text-xs text-cyan-300 flex items-center gap-1"
                        >
                          {copiedSection === 'desc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          Copiar Descrição
                        </button>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-900 text-xs text-slate-300 whitespace-pre-line font-mono leading-relaxed">
                        {currentProject.youtubeMetadata.description}
                      </div>
                    </div>

                    {/* Thumbnail Prompt */}
                    <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                          Prompt para Criação da Capa (Thumbnail)
                        </h3>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(currentProject.youtubeMetadata?.thumbnailPrompt || '', 'thumb')}
                          className="text-xs text-amber-300 flex items-center gap-1"
                        >
                          {copiedSection === 'thumb' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          Copiar Prompt
                        </button>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-900 text-xs text-slate-300 font-mono leading-relaxed">
                        {currentProject.youtubeMetadata.thumbnailPrompt}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Empty state before generation
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-900/10">
                <Film className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1.5">
                <h3 className="text-base font-bold text-white">Estúdio de Criação & Roteirização</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Selecione um formato ao lado (Vídeo Curto para Reels/TikTok ou Vídeo Longo para YouTube), defina o tema e clique em <strong>Acionar Agentes</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full text-left pt-2">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5" />
                    Vídeos Curtos (15s a 60s)
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Ganchos de 0 a 3 segundos, cortes rápidos, retenção máxima para TikTok, Reels e YouTube Shorts.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
                    <Tv className="w-3.5 h-3.5" />
                    Vídeos Longos (5m a 15m+)
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Aulas, tutoriais e roteiros com minutagem, B-rolls, teleprompter contínuo e títulos A/B.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
