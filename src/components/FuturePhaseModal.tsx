import React from 'react';
import { Sparkles, X, ArrowRight, ShieldCheck } from 'lucide-react';

interface FuturePhaseModalProps {
  phaseNumber: number;
  phaseTitle: string;
  phaseDescription: string;
  onClose: () => void;
}

export const FuturePhaseModal: React.FC<FuturePhaseModalProps> = ({
  phaseNumber,
  phaseTitle,
  phaseDescription,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
              Arquitetura Planejada
            </span>
            <h3 className="text-lg font-semibold text-slate-100">
              Fase {phaseNumber} — {phaseTitle}
            </h3>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          {phaseDescription}
        </p>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-200">Princípio Fundamental do MINDOS:</strong> O sistema é construído estritamente por fases.
              A estrutura da Fundação (Fase 1) já está preparada para acoplar este módulo assim que a autorização for concedida. Nenhuma funcionalidade falsa ou simulada é injetada.
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
