import React, { useState } from 'react';
import { Sigma, PlusCircle, Trash2, HelpCircle, RefreshCw } from 'lucide-react';

interface ExpressionInputProps {
  onBuildExpressionTree: (expression: string) => void;
  onInsertBSTValue: (value: number) => void;
  onClearTree: () => void;
  treeMode: 'expression' | 'bst';
  setTreeMode: (mode: 'expression' | 'bst') => void;
}

export const ExpressionInput: React.FC<ExpressionInputProps> = ({
  onBuildExpressionTree,
  onInsertBSTValue,
  onClearTree,
  treeMode,
  setTreeMode,
}) => {
  const [expression, setExpression] = useState('6 * ((2+7)*9*4 + 8)');
  const [bstValue, setBstValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleBuildExpression = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expression.trim()) {
      setError('Por favor, digite uma expressão matemática.');
      return;
    }
    try {
      setError(null);
      onBuildExpressionTree(expression);
    } catch (err: any) {
      setError(err.message || 'Erro ao analisar a expressão.');
    }
  };

  const handleInsertBST = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(bstValue);
    if (isNaN(val)) {
      setError('Por favor, insira um número válido.');
      return;
    }
    setError(null);
    onInsertBSTValue(val);
    setBstValue('');
  };

  const handleClear = () => {
    setError(null);
    onClearTree();
  };

  const loadExampleBST = () => {
    setError(null);
    onClearTree();
    // Carrega uma sequência para BST bonita
    const sequence = [15, 10, 20, 8, 12, 17, 25, 6, 9, 11, 13];
    sequence.forEach((val) => onInsertBSTValue(val));
  };

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col gap-5 w-full">
      {/* Abas de Modo */}
      <div className="flex border-b border-white/10 p-1 bg-slate-900/60 rounded-xl">
        <button
          onClick={() => {
            setTreeMode('expression');
            setError(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all duration-300 ${
            treeMode === 'expression'
              ? 'bg-indigo-600/80 border border-indigo-500 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sigma size={14} />
          Árvore de Expressão
        </button>
        <button
          onClick={() => {
            setTreeMode('bst');
            setError(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all duration-300 ${
            treeMode === 'bst'
              ? 'bg-indigo-600/80 border border-indigo-500 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PlusCircle size={14} />
          Árvore BST
        </button>
      </div>

      {/* Formulários Correspondentes */}
      {treeMode === 'expression' ? (
        <form onSubmit={handleBuildExpression} className="flex flex-col gap-4 animate-fadeIn">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Expressão Matemática</label>
              <div className="group relative">
                <HelpCircle size={14} className="text-slate-400 hover:text-slate-200 cursor-pointer" />
                <div className="pointer-events-none absolute bottom-full right-0 mb-2 w-64 bg-slate-900/95 border border-white/10 p-2.5 rounded-lg text-[10px] text-slate-300 leading-relaxed shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
                  Suporta números inteiros/decimais, operadores básicos (+, -, *, /) e parênteses. 
                  Exemplo: <span className="font-mono text-indigo-400">6 * ((2+7)*9*4 + 8)</span>
                </div>
              </div>
            </div>
            <input
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder="Digite a expressão, ex: (2 + 3) * 5"
              className="w-full px-4 py-2.5 rounded-xl text-sm font-medium glass-input text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all duration-300"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
          >
            Construir Árvore
          </button>
        </form>
      ) : (
        <form onSubmit={handleInsertBST} className="flex flex-col gap-4 animate-fadeIn">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Valor do Nó (BST)</label>
              <div className="group relative">
                <HelpCircle size={14} className="text-slate-400 hover:text-slate-200 cursor-pointer" />
                <div className="pointer-events-none absolute bottom-full right-0 mb-2 w-64 bg-slate-900/95 border border-white/10 p-2.5 rounded-lg text-[10px] text-slate-300 leading-relaxed shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
                  A Árvore Binária de Busca ordena os nós: valores menores que o pai vão à esquerda; iguais ou maiores vão à direita.
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                step="any"
                value={bstValue}
                onChange={(e) => setBstValue(e.target.value)}
                placeholder="Ex: 15"
                className="flex-grow px-4 py-2.5 rounded-xl text-sm font-medium glass-input text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all duration-300"
              />
              <button
                type="submit"
                className="py-2.5 px-4 text-xs font-bold uppercase tracking-wider rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
              >
                Inserir
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={loadExampleBST}
            className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-slate-900 border border-white/5 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700/50 flex items-center justify-center gap-2 transition-all duration-200"
          >
            <RefreshCw size={14} />
            Carregar Árvore Exemplo (BST)
          </button>
        </form>
      )}

      {/* Exibição de Erros */}
      {error && (
        <div className="text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl animate-shake">
          {error}
        </div>
      )}

      {/* Botão Reset / Limpar */}
      <button
        onClick={handleClear}
        className="w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/30 flex items-center justify-center gap-2 transition-all duration-200"
      >
        <Trash2 size={14} />
        Limpar Árvore
      </button>
    </div>
  );
};
