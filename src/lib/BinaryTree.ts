export class Node {
  id: string;
  value: string | number;
  left: Node | null;
  right: Node | null;

  constructor(value: string | number) {
    this.id = Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

export class BinaryTree {
  root: Node | null;

  constructor(root: Node | null = null) {
    this.root = root;
  }

  // Insere um valor em uma Árvore Binária de Busca (BST)
  insertBST(value: number): void {
    const newNode = new Node(value);
    if (!this.root) {
      this.root = newNode;
      return;
    }
    this._insertBSTNode(this.root, newNode);
  }

  private _insertBSTNode(node: Node, newNode: Node): void {
    const val = Number(newNode.value);
    const currVal = Number(node.value);

    if (val < currVal) {
      if (!node.left) {
        node.left = newNode;
      } else {
        this._insertBSTNode(node.left, newNode);
      }
    } else {
      // Valores iguais ou maiores vão para a direita
      if (!node.right) {
        node.right = newNode;
      } else {
        this._insertBSTNode(node.right, newNode);
      }
    }
  }

  // Reseta a árvore
  clear(): void {
    this.root = null;
  }

  // Métricas: total de nós
  getNodeCount(): number {
    return this._countNodes(this.root);
  }

  private _countNodes(node: Node | null): number {
    if (!node) return 0;
    return 1 + this._countNodes(node.left) + this._countNodes(node.right);
  }

  // Métricas: total de nós folha
  getLeafCount(): number {
    return this._countLeafNodes(this.root);
  }

  private _countLeafNodes(node: Node | null): number {
    if (!node) return 0;
    if (!node.left && !node.right) return 1;
    return this._countLeafNodes(node.left) + this._countLeafNodes(node.right);
  }

  // Métricas: altura da árvore (número de arestas do maior caminho)
  // Raiz sem filhos tem altura 0; árvore vazia tem altura 0 (ou 0 arestas)
  getHeight(): number {
    if (!this.root) return 0;
    return this._getNodeHeight(this.root);
  }

  private _getNodeHeight(node: Node | null): number {
    if (!node) return -1;
    return 1 + Math.max(this._getNodeHeight(node.left), this._getNodeHeight(node.right));
  }

  // Métricas: largura máxima (maior número de nós em um mesmo nível)
  getMaxWidth(): number {
    if (!this.root) return 0;
    let maxWidth = 0;
    const queue: Node[] = [this.root];

    while (queue.length > 0) {
      const levelSize = queue.length;
      maxWidth = Math.max(maxWidth, levelSize);

      for (let i = 0; i < levelSize; i++) {
        const current = queue.shift()!;
        if (current.left) queue.push(current.left);
        if (current.right) queue.push(current.right);
      }
    }
    return maxWidth;
  }

  // Nível de cada nó (distância da raiz)
  getNodeLevels(): Record<string, number> {
    const levels: Record<string, number> = {};
    this._computeNodeLevels(this.root, 0, levels);
    return levels;
  }

  private _computeNodeLevels(node: Node | null, level: number, levels: Record<string, number>): void {
    if (!node) return;
    levels[node.id] = level;
    this._computeNodeLevels(node.left, level + 1, levels);
    this._computeNodeLevels(node.right, level + 1, levels);
  }

  // Percurso Pré-ordem (Raiz -> Esquerda -> Direita)
  preOrder(): Node[] {
    const result: Node[] = [];
    this._preOrderTraversal(this.root, result);
    return result;
  }

  private _preOrderTraversal(node: Node | null, result: Node[]): void {
    if (!node) return;
    result.push(node);
    this._preOrderTraversal(node.left, result);
    this._preOrderTraversal(node.right, result);
  }

  // Percurso Ordem Central / In-order (Esquerda -> Raiz -> Direita)
  inOrder(): Node[] {
    const result: Node[] = [];
    this._inOrderTraversal(this.root, result);
    return result;
  }

  private _inOrderTraversal(node: Node | null, result: Node[]): void {
    if (!node) return;
    this._inOrderTraversal(node.left, result);
    result.push(node);
    this._inOrderTraversal(node.right, result);
  }

  // Percurso Pós-ordem (Esquerda -> Direita -> Raiz)
  postOrder(): Node[] {
    const result: Node[] = [];
    this._postOrderTraversal(this.root, result);
    return result;
  }

  private _postOrderTraversal(node: Node | null, result: Node[]): void {
    if (!node) return;
    this._postOrderTraversal(node.left, result);
    this._postOrderTraversal(node.right, result);
    result.push(node);
  }

  // Clona a árvore inteira preservando IDs
  clone(): BinaryTree {
    const newTree = new BinaryTree();
    newTree.root = this._cloneNode(this.root);
    return newTree;
  }

  private _cloneNode(node: Node | null): Node | null {
    if (!node) return null;
    const newNode = new Node(node.value);
    newNode.id = node.id;
    newNode.left = this._cloneNode(node.left);
    newNode.right = this._cloneNode(node.right);
    return newNode;
  }
}
