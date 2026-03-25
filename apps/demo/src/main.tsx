import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
// 使用 Vite 别名导入 ThemeProvider
import { ThemeProvider } from '@wheelchair/core/context/ThemeContext';

// 初始化应用
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find root element');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system">
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

// 开发模式下的热更新处理
if (import.meta.hot) {
  import.meta.hot.accept();
}
