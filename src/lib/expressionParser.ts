import { Node } from './BinaryTree';

// Verifica se o token é um operador
function isOperator(token: string): boolean {
  return ['+', '-', '*', '/'].includes(token);
}

// Obtém a precedência do operador
function getPrecedence(op: string): number {
  if (op === '+' || op === '-') return 1;
  if (op === '*' || op === '/') return 2;
  return 0;
}

/**
 * Converte uma expressão matemática infix em uma Árvore de Expressão Binária.
 * Suporta operadores (+, -, *, /), números (inteiros e decimais) e parênteses.
 */
export function parseExpression(expression: string): Node {
  // 1. Tokenização
  const regex = /\d+(?:\.\d+)?|[+\-*/()]/g;
  const tokens = expression.match(regex) || [];

  if (tokens.length === 0) {
    throw new Error('A expressão está vazia ou contém caracteres inválidos.');
  }

  // 2. Shunting-Yard Algorithm (Conversão para RPN)
  const outputQueue: string[] = [];
  const operatorStack: string[] = [];

  for (const token of tokens) {
    if (!isNaN(Number(token))) {
      // Se for número
      outputQueue.push(token);
    } else if (isOperator(token)) {
      // Se for operador, desempilha operadores de precedência maior ou igual
      while (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1] !== '(' &&
        getPrecedence(operatorStack[operatorStack.length - 1]) >= getPrecedence(token)
      ) {
        outputQueue.push(operatorStack.pop()!);
      }
      operatorStack.push(token);
    } else if (token === '(') {
      operatorStack.push(token);
    } else if (token === ')') {
      let foundOpenParenthesis = false;
      while (operatorStack.length > 0) {
        const top = operatorStack[operatorStack.length - 1];
        if (top === '(') {
          operatorStack.pop();
          foundOpenParenthesis = true;
          break;
        } else {
          outputQueue.push(operatorStack.pop()!);
        }
      }
      if (!foundOpenParenthesis) {
        throw new Error('Parênteses incompatíveis: parêntese de fechamento ")" sem abertura correspondente.');
      }
    }
  }

  // Desempilha operadores restantes
  while (operatorStack.length > 0) {
    const top = operatorStack.pop()!;
    if (top === '(' || top === ')') {
      throw new Error('Parênteses incompatíveis: parêntese de abertura "(" sem fechamento correspondente.');
    }
    outputQueue.push(top);
  }

  // 3. Construção da Árvore a partir de RPN
  const treeStack: Node[] = [];

  for (const token of outputQueue) {
    if (!isOperator(token)) {
      // É operando (número)
      treeStack.push(new Node(token));
    } else {
      // É operador (consome os dois últimos nós da pilha)
      if (treeStack.length < 2) {
        throw new Error(`Operador '${token}' não possui operandos suficientes.`);
      }
      const rightNode = treeStack.pop()!;
      const leftNode = treeStack.pop()!;
      
      const opNode = new Node(token);
      opNode.left = leftNode;
      opNode.right = rightNode;
      
      treeStack.push(opNode);
    }
  }

  if (treeStack.length !== 1) {
    throw new Error('A expressão está incompleta ou mal-formada (faltam operadores ou operandos).');
  }

  return treeStack[0];
}
