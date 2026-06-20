import React, { useMemo } from 'react';
import { BinaryTree, Node } from '../lib/BinaryTree';

interface TreeDiagramProps {
  tree: BinaryTree;
  highlightedNodeId: string | null;
  visitedNodeIds: Set<string>;
  searchMatchIds: Set<string>;
}

interface Point {
  x: number;
  y: number;
}

interface RenderNode {
  node: Node;
  x: number;
  y: number;
  level: number;
}

interface RenderEdge {
  id: string;
  from: Point;
  to: Point;
}

export const TreeDiagram: React.FC<TreeDiagramProps> = ({
  tree,
  highlightedNodeId,
  visitedNodeIds,
  searchMatchIds,
}) => {
  const levelHeight = 85;
  const minSpacing = 44;
  const nodeRadius = 22;

  // Calcula o layout da árvore usando o hook useMemo
  const { nodes, edges, viewBox } = useMemo(() => {
    if (!tree.root) {
      return {
        nodes: [],
        edges: [],
        viewBox: '0 0 400 200',
      };
    }

    const nodesList: RenderNode[] = [];
    const edgesList: RenderEdge[] = [];

    // Helper para obter a altura recursivamente
    const getHeight = (n: Node | null): number => {
      if (!n) return -1;
      return 1 + Math.max(getHeight(n.left), getHeight(n.right));
    };

    const treeHeight = getHeight(tree.root);
    // Espaçamento inicial na raiz depende da altura da árvore
    const initialSpread = minSpacing * Math.pow(2, Math.max(0, treeHeight));

    // Função recursiva para calcular posições (x, y) dos nós
    const calculatePositions = (node: Node, level: number, x: number, spread: number) => {
      const y = level * levelHeight;
      nodesList.push({ node, x, y, level });

      if (node.left) {
        const leftX = x - spread;
        const leftY = (level + 1) * levelHeight;
        edgesList.push({
          id: `${node.id}-${node.left.id}`,
          from: { x, y },
          to: { x: leftX, y: leftY },
        });
        calculatePositions(node.left, level + 1, leftX, spread / 2);
      }

      if (node.right) {
        const rightX = x + spread;
        const rightY = (level + 1) * levelHeight;
        edgesList.push({
          id: `${node.id}-${node.right.id}`,
          from: { x, y },
          to: { x: rightX, y: rightY },
        });
        calculatePositions(node.right, level + 1, rightX, spread / 2);
      }
    };

    // Inicia o posicionamento a partir da raiz na coordenada X = 0
    calculatePositions(tree.root, 0, 0, initialSpread / 2);

    // Calcula os limites da caixa delimitadora (Bounding Box)
    const xs = nodesList.map((n) => n.x);
    const ys = nodesList.map((n) => n.y);

    const minX = xs.length ? Math.min(...xs) : -100;
    const maxX = xs.length ? Math.max(...xs) : 100;
    const minY = ys.length ? Math.min(...ys) : 0;
    const maxY = ys.length ? Math.max(...ys) : 100;

    const paddingX = 60;
    const paddingY = 40;
    const width = maxX - minX + paddingX * 2;
    const height = maxY - minY + paddingY * 2;
    const computedViewBox = `${minX - paddingX} ${minY - paddingY} ${width} ${height}`;

    return {
      nodes: nodesList,
      edges: edgesList,
      viewBox: computedViewBox,
    };
  }, [tree.root]);

  // Função auxiliar para verificar se um nó é um operador matemático
  const isOperator = (val: string | number) => {
    return ['+', '-', '*', '/'].includes(String(val));
  };

  const transitionStyle = {
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-950/65 border border-white/5 rounded-2xl relative overflow-hidden min-h-[350px] md:min-h-[500px]">
      {/* Grade de Fundo sutil */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-40" />

      {!tree.root ? (
        <div className="text-center z-10 flex flex-col items-center gap-3 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-slate-500 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-indigo-500/50">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-slate-400">Árvore vazia</span>
          <span className="text-xs text-slate-500 max-w-[280px]">Escreva uma expressão matemática ou insira valores no modo BST para gerar o diagrama visual.</span>
        </div>
      ) : (
        <svg
          viewBox={viewBox}
          className="w-full h-full select-none z-10 filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Definições de filtros para glows/sombras e gradientes */}
          <defs>
            <filter id="glow-search" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-active" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="edge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* Renderização das Arestas (Linhas) */}
          <g>
            {edges.map((edge) => {
              // Verifica se a aresta conecta nós visitados no percurso
              const fromId = nodes.find((n) => n.x === edge.from.x && n.y === edge.from.y)?.node.id;
              const toId = nodes.find((n) => n.x === edge.to.x && n.y === edge.to.y)?.node.id;
              const isVisitedConnection = fromId && toId && visitedNodeIds.has(fromId) && visitedNodeIds.has(toId);

              return (
                <line
                  key={edge.id}
                  x1={edge.from.x}
                  y1={edge.from.y}
                  x2={edge.to.x}
                  y2={edge.to.y}
                  stroke={isVisitedConnection ? '#a855f7' : 'rgba(148, 163, 184, 0.25)'}
                  strokeWidth={isVisitedConnection ? 3 : 2}
                  style={transitionStyle}
                  className="transition-all duration-500"
                />
              );
            })}
          </g>

          {/* Renderização dos Nós */}
          <g>
            {nodes.map(({ node, x, y }) => {
              const op = isOperator(node.value);
              const isHighlighted = highlightedNodeId === node.id;
              const isVisited = visitedNodeIds.has(node.id);
              const isSearchMatch = searchMatchIds.has(node.id);

              // Determina as cores de fill, stroke e glow do nó
              let fill = op ? '#4f46e5' : '#10b981'; // Indigo para operadores, Emerald para números
              let stroke = 'rgba(255, 255, 255, 0.15)';
              let strokeWidth = 1.5;
              let filter = undefined;

              if (isVisited) {
                fill = '#9333ea'; // Roxo se visitado
              }

              if (isSearchMatch) {
                stroke = '#fbbf24'; // Dourado se bater na busca
                strokeWidth = 3;
                filter = 'url(#glow-search)';
              }

              if (isHighlighted) {
                stroke = '#fbbf24'; // Borda dourada
                strokeWidth = 3;
                filter = 'url(#glow-active)';
              }

              return (
                <g
                  key={node.id}
                  className="cursor-pointer group"
                  transform={`translate(${x}, ${y})`}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {/* Círculo de Pulsação de Destaque Ativo */}
                  {isHighlighted && (
                    <circle
                      r={nodeRadius + 6}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="2"
                      className="animate-ping-slow opacity-60"
                    />
                  )}

                  {/* Círculo de Pulsação de Busca */}
                  {isSearchMatch && !isHighlighted && (
                    <circle
                      r={nodeRadius + 4}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="1.5"
                      className="animate-pulse opacity-80"
                    />
                  )}

                  {/* Círculo do Nó Principal */}
                  <circle
                    r={nodeRadius}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    filter={filter}
                    style={transitionStyle}
                    className="transition-all duration-300 drop-shadow-md group-hover:brightness-110 group-hover:scale-105"
                  />

                  {/* Texto do Nó */}
                  <text
                    dy=".3em"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="13px"
                    fontWeight="700"
                    className="font-sans pointer-events-none select-none tracking-tight"
                    style={transitionStyle}
                  >
                    {node.value}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      )}
    </div>
  );
};
