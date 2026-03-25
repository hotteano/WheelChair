/**
 * ThemeContext - WheelChair Editor 主题上下文
 * 
 * 提供主题状态管理、主题切换功能和系统主题监听
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
  type Context,
} from 'react';

// ============================================
// 类型定义
// ============================================

/** 主题类型 */
export type Theme = 'light' | 'dark' | 'system';

/** 实际应用的主题（系统主题解析后的最终主题） */
export type ResolvedTheme = 'light' | 'dark';

/** 主题上下文状态 */
export interface ThemeContextState {
  /** 当前设置的主题 */
  theme: Theme;
  /** 实际应用的主题（系统主题解析后的结果） */
  resolvedTheme: ResolvedTheme;
  /** 切换主题 */
  setTheme: (theme: Theme) => void;
  /** 切换到亮色主题 */
  setLightTheme: () => void;
  /** 切换到暗色主题 */
  setDarkTheme: () => void;
  /** 切换到系统主题 */
  applySystemTheme: () => void;
  /** 在 light 和 dark 之间切换 */
  toggleTheme: () => void;
  /** 是否是系统主题 */
  isSystemTheme: boolean;
  /** 系统主题偏好 */
  systemTheme: ResolvedTheme | null;
}

/** 主题提供者属性 */
export interface ThemeProviderProps {
  /** 子元素 */
  children: ReactNode;
  /** 默认主题 */
  defaultTheme?: Theme;
  /** 存储主题的 key（用于 localStorage） */
  storageKey?: string;
  /** 是否禁用系统主题监听 */
  disableSystem?: boolean;
  /** 是否强制应用主题到 document.documentElement */
  enableSystem?: boolean;
  /** 属性名用于在 DOM 元素上设置主题 */
  attribute?: string;
  /** 命名空间前缀 */
  namespace?: string;
  /** 主题变化回调 */
  onThemeChange?: (theme: Theme, resolvedTheme: ResolvedTheme) => void;
}

// ============================================
// 常量定义
// ============================================

const THEME_STORAGE_KEY = 'wheelchair-theme';
const THEME_ATTRIBUTE = 'data-theme';

// ============================================
// 工具函数
// ============================================

/**
 * 获取系统主题偏好
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') {
    return 'light';
  }
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  return mediaQuery.matches ? 'dark' : 'light';
}

/**
 * 从存储中读取主题
 */
function getStoredTheme(storageKey: string): Theme | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored as Theme;
    }
  } catch (e) {
    // localStorage 不可用
    console.warn('Failed to read theme from localStorage:', e);
  }
  
  return null;
}

/**
 * 保存主题到存储
 */
function storeTheme(storageKey: string, theme: Theme): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    window.localStorage.setItem(storageKey, theme);
  } catch (e) {
    console.warn('Failed to save theme to localStorage:', e);
  }
}

/**
 * 应用主题到 DOM
 */
function applyThemeToDOM(
  theme: ResolvedTheme,
  attribute: string,
  namespace?: string
): void {
  if (typeof document === 'undefined') {
    return;
  }
  
  const root = document.documentElement;
  const prefix = namespace ? `${namespace}-` : '';
  
  // 设置 data-theme 属性
  root.setAttribute(attribute, `${prefix}${theme}`);
  
  // 同时设置 class 以便 CSS 选择器使用
  root.classList.remove(`${prefix}light`, `${prefix}dark`);
  root.classList.add(`${prefix}${theme}`);
}

// ============================================
// 创建上下文
// ============================================

const ThemeContext: Context<ThemeContextState | undefined> = createContext<
  ThemeContextState | undefined
>(undefined);

// ============================================
// 主题提供者组件
// ============================================

/**
 * 主题提供者组件
 * 
 * 包裹应用以提供主题功能
 * 
 * @example
 * ```tsx
 * <ThemeProvider defaultTheme="system">
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = THEME_STORAGE_KEY,
  disableSystem = false,
  enableSystem = true,
  attribute = THEME_ATTRIBUTE,
  namespace,
  onThemeChange,
}: ThemeProviderProps): React.ReactElement {
  // 主题状态
  const [theme, setThemeState] = useState<Theme>(() => {
    // 服务端渲染时使用默认主题
    if (typeof window === 'undefined') {
      return defaultTheme;
    }
    // 客户端尝试从存储中读取
    return getStoredTheme(storageKey) || defaultTheme;
  });

  // 系统主题状态
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme | null>(null);

  // 解析后的实际主题
  const resolvedTheme: ResolvedTheme = useMemo(() => {
    if (theme === 'system' && !disableSystem) {
      return systemTheme || 'light';
    }
    return theme === 'system' ? 'light' : theme;
  }, [theme, systemTheme, disableSystem]);

  // 是否是系统主题
  const isSystemTheme = theme === 'system';

  // 设置主题
  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      storeTheme(storageKey, newTheme);
    },
    [storageKey]
  );

  // 快捷方法
  const setLightTheme = useCallback(() => setTheme('light'), [setTheme]);
  const setDarkTheme = useCallback(() => setTheme('dark'), [setTheme]);
  const applySystemTheme = useCallback(() => setTheme('system'), [setTheme]);

  // 切换主题
  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  // 监听系统主题变化
  useEffect(() => {
    if (disableSystem || typeof window === 'undefined') {
      return;
    }

    // 初始化系统主题
    setSystemTheme(getSystemTheme());

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };

    // 现代 API
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // 兼容性 API
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [disableSystem]);

  // 应用主题到 DOM
  useEffect(() => {
    if (!enableSystem || typeof document === 'undefined') {
      return;
    }

    applyThemeToDOM(resolvedTheme, attribute, namespace);
  }, [resolvedTheme, attribute, namespace, enableSystem]);

  // 触发主题变化回调
  useEffect(() => {
    onThemeChange?.(theme, resolvedTheme);
  }, [theme, resolvedTheme, onThemeChange]);

  // 上下文值
  const contextValue = useMemo<ThemeContextState>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      setLightTheme,
      setDarkTheme,
      applySystemTheme,
      toggleTheme,
      isSystemTheme,
      systemTheme,
    }),
    [
      theme,
      resolvedTheme,
      setTheme,
      setLightTheme,
      setDarkTheme,
      applySystemTheme,
      toggleTheme,
      isSystemTheme,
      systemTheme,
    ]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

/**
 * 使用主题上下文的 Hook
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, resolvedTheme, toggleTheme } = useTheme();
 *   
 *   return (
 *     <button onClick={toggleTheme}>
 *       当前主题: {resolvedTheme}
 *     </button>
 *   );
 * }
 * ```
 * 
 * @throws 如果在 ThemeProvider 外部使用会抛出错误
 */
export function useTheme(): ThemeContextState {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

/**
 * 安全地使用主题上下文的 Hook（不会抛出错误）
 * 
 * @returns 主题上下文或 null（如果不在 Provider 中）
 */
export function useThemeSafe(): ThemeContextState | null {
  return useContext(ThemeContext) || null;
}

// ============================================
// 高阶组件
// ============================================

/**
 * 注入主题属性的高阶组件
 * 
 * @example
 * ```tsx
 * const ThemedComponent = withTheme(MyComponent);
 * ```
 */
export function withTheme<P extends object>(
  WrappedComponent: React.ComponentType<P & { themeContext: ThemeContextState }>
): React.FC<P> {
  return function WithThemeComponent(props: P) {
    const themeContext = useTheme();
    return <WrappedComponent {...props} themeContext={themeContext} />;
  };
}

// ============================================
// 工具 Hook
// ============================================

/**
 * 监听主题变化的 Hook
 * 
 * @param callback 主题变化时的回调函数
 * @param deps 依赖数组
 */
export function useThemeEffect(
  callback: (theme: Theme, resolvedTheme: ResolvedTheme) => void,
  deps: React.DependencyList = []
): void {
  const { theme, resolvedTheme } = useTheme();
  
  useEffect(() => {
    callback(theme, resolvedTheme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, resolvedTheme, ...deps]);
}

/**
 * 获取当前主题颜色的 Hook
 * 可用于动态样式计算
 */
export function useThemeColor(
  lightColor: string,
  darkColor: string
): string {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === 'dark' ? darkColor : lightColor;
}

// ============================================
// 导出
// ============================================

export default ThemeContext;
