// ============================================
// 基础文本格式
// ============================================
export { BoldExtension as Bold } from './Bold';
export { ItalicExtension as Italic } from './Italic';
export { UnderlineExtension as Underline } from './Underline';
export { StrikeExtension as Strike } from './Strike';

// ============================================
// 高亮和颜色
// ============================================
export { HighlightExtension as Highlight } from './Highlight';
export { TextColorExtension as TextColor } from './TextColor';

// ============================================
// 链接
// ============================================
export { Link, isValidUrl, normalizeUrl, getDomainFromUrl } from './Link';

// ============================================
// 类型
// ============================================
export type { LinkOptions } from './Link';
