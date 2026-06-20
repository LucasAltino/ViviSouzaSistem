import React from 'react';
import { BinaryTree, Node } from '../lib/BinaryTree';
import { Network, Hash, Leaf, GitCommit, Layers } from 'lucide-react';

interface TreeInfoProps {
  tree: BinaryTree;
}

export const TreeInfo: React.FC<TreeInfoProps> = ({ tree }) => {
  const rootValue = tree.root ? String(tree.root.value) : 'Vazia';
  const nodeCount = tree.getNodeCount();
  const leafCount = tree.getLeafCount();
  const height = tree.getHeight();
  const maxWidth = tree.getMaxWidth();

  // Agrupa os nós por nível
  const nodesByLevel: Record<number, Node[]> = {};
  if (tree.root) {
    const queue: { node: Node; lvl: number }[] = [{ node: tree.root, lvl: 0 }];
    while (queue.length > 0) {
      const { node, lvl } = queue.shift()!;
      if (!nodesByLevel[lvl]) {
        nodesByLevel[lvl] = [];
      }
      nodesByLevel[lvl].push(node);

      if (node.left) queue.push({ node: node.left, lvl: lvl + 1 });
      if (node.right) queue.push({ node: node.right, lvl: lvl + 1 });
    }
  }

  const statCards = [
    { label: 'Nó Raiz', value: rootValue, icon: Network, color: 'text-indigo-400 bg-indigo-500/10' },
    { label: 'Total de Nós', value: nodeCount, icon: Hash, color: 'text-emerald-400 bg-emerald-500/10' },
    { label: 'Nós Folha', value: leafCount, icon: Leaf, color: 'text-amber-400 bg-amber-500/10' },
    { label: 'Altura da Árvore', value: height, icon: GitCommit, color: 'text-rose-400 bg-rose-500/10' },
    { label: 'Largura Máxima', value: maxWidth, icon: Layers, color: 'text-cyan-400 bg-cyan-500/10' },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Grid de Cards de Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="glass-panel p-4 rounded-2xl flex flex-col justify-between hover:scale-[1.02] transition-all duration-300">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</span>
                <div className={`p-1.5 rounded-lg ${card.color}`}>
                  <Icon size={14} />
                </div>
              </div>
              <div className="text-xl font-bold text-white mt-1">{card.value}</div>
            </div>
          );
        })}
      </div>

      {/* Seção de Nível dos Nós */}
      <div className="glass-panel rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <Layers size={16} className="text-indigo-400" />
          Nível de cada Nó (Distância da Raiz)
        </h3>

        {nodeCount === 0 ? (
          <p className="text-sm text-slate-400 italic">Árvore vazia. Construa ou insira nós para visualizar os níveis.</p>
        ) : (
          <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-2">
            {Object.keys(nodesByLevel).map((lvlStr) => {
              const lvl = Number(lvlStr);
              const nodes = nodesByLevel[lvl];
              return (
                <div key={lvl} className="flex items-center gap-4 py-2 border-b border-white/5 last:border-0">
                  <div className="flex-shrink-0 w-24 text-[10px] font-bold text-indigo-400 uppercase bg-indigo-500/10 px-2.5 py-1 rounded-md text-center border border-indigo-500/20">
                    Nível {lvl}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {nodes.map((node) => {
                      const isOperator = ['+', '-', '*', '/'].includes(String(node.value));
                      return (
                        <span
                          key={node.id}
                          className={`text-xs px-2.5 py-1 rounded-full border font-semibold tracking-wider ${
                            isOperator
                              ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                          }`}
                        >
                          {node.value}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
