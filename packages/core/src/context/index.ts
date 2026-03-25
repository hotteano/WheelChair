/**
 * WheelChair Editor - Context
 * 
 * 提供编辑器上下文状态管理
 */

export {
  // 主题上下文
  ThemeProvider,
  useTheme,
  useThemeSafe,
  useThemeEffect,
  useThemeColor,
  withTheme,
  
  // 类型
  type Theme,
  type ResolvedTheme,
  type ThemeContextState,
  type ThemeProviderProps,
} from './ThemeContext';

export { default as ThemeContext } from './ThemeContext';
