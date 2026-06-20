import React from 'react';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { Node } from '../lib/BinaryTree';

interface TraversalPanelProps {
  onStartTraversal: (type: 'pre' | 'in' | 'post') => void;
  onPauseResume: () => void;
  onStop: () => void;
  traversalActive: boolean;
  traversalPaused: boolean;
  traversalType: 'pre' | 'in' | 'post' | null;
  traversalSequence: Node[];
  traversalIndex: number;
  speed: number;
  setSpeed: (ms: number) => void;
  hasRoot: boolean;
}

export const TraversalPanel: React.FC<TraversalPanelProps> = ({
  onStartTraversal,
  onPauseResume,
  onStop,
  traversalActive,
  traversalPaused,
  traversalType,
  traversalSequence,
  traversalIndex,
  speed,
  setSpeed,
  hasRoot,
}) => {
  const traversalName = () => {
    switch (traversalType) {
      case 'pre': return 'Pré-ordem (Raiz → Esq → Dir)';
      case 'in': return 'Ordem Central (Esq → Raiz → Dir)';
      case 'post': return 'Pós-ordem (Esq → Dir → Raiz)';
      default: return '';
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col gap-5 w-full">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-slate-300">Percursos na Árvore (Traversal)</h3>
        <p className="text-xs text-slate-400">Gere e visualize o caminho de visitação dos nós em tempo real.</p>
      </div>

      {/* Botões dos Tipos de Percurso */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onStartTraversal('pre')}
          disabled={!hasRoot || (traversalActive && traversalType !== 'pre')}
          className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all duration-300 ${
            traversalType === 'pre'
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
              : 'bg-slate-900 border-white/5 text-slate-300 hover:border-slate-700/50 hover:bg-slate-800/50 disabled:opacity-40 disabled:cursor-not-allowed'
          }`}
        >
          Pré-ordem
        </button>
        <button
          onClick={() => onStartTraversal('in')}
          disabled={!hasRoot || (traversalActive && traversalType !== 'in')}
          className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all duration-300 ${
            traversalType === 'in'
              ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900 border-white/5 text-slate-300 hover:border-slate-700/50 hover:bg-slate-800/50 disabled:opacity-40 disabled:cursor-not-allowed'
          }`}
        >
          In-order
        </button>
        <button
          onClick={() => onStartTraversal('post')}
          disabled={!hasRoot || (traversalActive && traversalType !== 'post')}
          className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all duration-300 ${
            traversalType === 'post'
              ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 border-white/5 text-slate-300 hover:border-slate-700/50 hover:bg-slate-800/50 disabled:opacity-40 disabled:cursor-not-allowed'
          }`}
        >
          Pós-ordem
        </button>
      </div>

      {/* Controles de Reprodução se Ativo */}
      {traversalActive && (
        <div className="flex flex-col gap-4 bg-slate-950/40 p-4 rounded-xl border border-white/5 animate-fadeIn">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{traversalName()}</span>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20 font-mono">
              {traversalIndex + 1} / {traversalSequence.length}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button
              onClick={onPauseResume}
              className="p-2.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 hover:border-indigo-500/35 transition-colors"
            >
              {traversalPaused ? <Play size={16} /> : <Pause size={16} />}
            </button>

            {/* Stop/Reset */}
            <button
              onClick={onStop}
              className="p-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 hover:border-rose-500/35 transition-colors"
            >
              <Square size={16} />
            </button>

            {/* Seletor de Velocidade */}
            <div className="flex items-center gap-2 flex-grow">
              <Clock size={14} className="text-slate-400" />
              <input
                type="range"
                min="400"
                max="2000"
                step="200"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-[10px] font-mono text-slate-400 w-12 text-right">{(speed / 1000).toFixed(1)}s</span>
            </div>
          </div>
        </div>
      )}

      {/* Exibição da Sequência Gerada */}
      {traversalSequence.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sequência do Percurso</span>
          <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-900/50 border border-white/5 rounded-xl max-h-[140px] overflow-y-auto">
            {traversalSequence.map((node, index) => {
              const isActive = traversalActive && index === traversalIndex;
              const isVisited = index <= traversalIndex;
              const isOperator = ['+', '-', '*', '/'].includes(String(node.value));
              
              return (
                <React.Fragment key={index}>
                  {index > 0 && <span className="text-slate-600 text-xs">→</span>}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-md font-mono font-bold transition-all duration-300 border ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 border-amber-400 scale-110 shadow-lg shadow-amber-500/20 ring-2 ring-amber-500/30'
                        : isVisited
                        ? isOperator
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 font-bold'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold'
                        : 'bg-slate-950 text-slate-500 border-white/5'
                    }`}
                  >
                    {node.value}
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
