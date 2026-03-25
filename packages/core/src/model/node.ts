/**
 * Node Model
 * 编辑器节点类型定义
 */

/**
 * 文本节点
 */
export interface TextNode {
  type: 'text';
  /** 文本内容 */
  text: string;
  /** 文本标记（如加粗、斜体等） */
  marks?: Mark[];
  /** 节点位置信息 */
  position?: NodePosition;
}

/**
 * 元素节点
 */
export interface ElementNode {
  type: 'element';
  /** 节点类型 */
  nodeType: string;
  /** 子节点 */
  children: Node[];
  /** 属性 */
  attrs?: Record<string, string | number | boolean>;
  /** 样式 */
  styles?: Record<string, string>;
  /** 文本标记 */
  marks?: Mark[];
  /** 节点位置信息 */
  position?: NodePosition;
}

/**
 * 节点位置信息
 */
export interface NodePosition {
  /** 开始偏移 */
  start: number;
  /** 结束偏移 */
  end: number;
  /** 行号 */
  line?: number;
  /** 列号 */
  column?: number;
}

/**
 * 文本标记
 */
export interface Mark {
  /** 标记类型 */
  type: string;
  /** 标记属性 */
  attrs?: Record<string, unknown>;
}

/**
 * 节点联合类型
 */
export type Node = TextNode | ElementNode;

/**
 * 文档节点类型
 */
export type NodeType =
  // 块级元素
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'heading4'
  | 'heading5'
  | 'heading6'
  | 'codeBlock'
  | 'blockquote'
  | 'unorderedList'
  | 'orderedList'
  | 'listItem'
  | 'table'
  | 'tableHeaderRow'
  | 'tableRow'
  | 'tableHeader'
  | 'tableCell'
  | 'horizontalRule'
  // 行内元素
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'inlineCode'
  | 'link'
  | 'image'
  | 'hardBreak'
  | 'lineBreak'
  // 通用容器
  | 'div'
  | 'span';

/**
 * 判断是否为文本节点
 */
export function isTextNode(node: Node): node is TextNode {
  return node.type === 'text';
}

/**
 * 判断是否为元素节点
 */
export function isElementNode(node: Node): node is ElementNode {
  return node.type === 'element';
}

/**
 * 创建文本节点
 */
export function createTextNode(text: string, marks?: Mark[]): TextNode {
  return {
    type: 'text',
    text,
    marks,
  };
}

/**
 * 创建元素节点
 */
export function createElementNode(
  nodeType: string,
  children: Node[] = [],
  attrs?: Record<string, string | number | boolean>,
  styles?: Record<string, string>
): ElementNode {
  const node: ElementNode = {
    type: 'element',
    nodeType,
    children,
    attrs,
  };

  if (styles && Object.keys(styles).length > 0) {
    node.styles = styles;
  }

  return node;
}

/**
 * 遍历所有节点
 */
export function traverseNodes(
  nodes: Node[],
  callback: (node: Node, parent: Node | null, index: number) => void | boolean,
  parent: Node | null = null
): void {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const shouldStop = callback(node, parent, i);
    
    if (shouldStop === true) {
      return;
    }

    if (isElementNode(node)) {
      traverseNodes(node.children, callback, node);
    }
  }
}

/**
 * 查找节点
 */
export function findNode(
  nodes: Node[],
  predicate: (node: Node) => boolean
): Node | null {
  let found: Node | null = null;

  traverseNodes(nodes, (node) => {
    if (predicate(node)) {
      found = node;
      return true; // 停止遍历
    }
  });

  return found;
}

/**
 * 过滤节点
 */
export function filterNodes(
  nodes: Node[],
  predicate: (node: Node) => boolean
): Node[] {
  const result: Node[] = [];

  traverseNodes(nodes, (node) => {
    if (predicate(node)) {
      result.push(node);
    }
  });

  return result;
}

/**
 * 获取节点文本内容
 */
export function getNodeText(node: Node): string {
  if (isTextNode(node)) {
    return node.text;
  }

  if (isElementNode(node)) {
    return node.children.map(getNodeText).join('');
  }

  return '';
}

/**
 * 获取所有文本内容
 */
export function getAllText(nodes: Node[]): string {
  return nodes.map(getNodeText).join('');
}

/**
 * 深度克隆节点
 */
export function cloneNode(node: Node): Node {
  if (isTextNode(node)) {
    return createTextNode(node.text, node.marks ? [...node.marks] : undefined);
  }

  if (isElementNode(node)) {
    return createElementNode(
      node.nodeType,
      node.children.map(cloneNode),
      node.attrs ? { ...node.attrs } : undefined,
      node.styles ? { ...node.styles } : undefined
    );
  }

  return node;
}

/**
 * 克隆节点数组
 */
export function cloneNodes(nodes: Node[]): Node[] {
  return nodes.map(cloneNode);
}

export default {
  isTextNode,
  isElementNode,
  createTextNode,
  createElementNode,
  traverseNodes,
  findNode,
  filterNodes,
  getNodeText,
  getAllText,
  cloneNode,
  cloneNodes,
};
