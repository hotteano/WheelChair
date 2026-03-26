import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import path from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

// 自定义插件：复制 CSS 文件到 dist
const copyStylesPlugin = () => ({
  name: 'copy-styles',
  closeBundle() {
    const srcDir = path.resolve(__dirname, 'src/styles');
    const destDir = path.resolve(__dirname, 'dist/styles');
    
    // 创建目标目录
    if (!existsSync(destDir)) {
      mkdirSync(destDir, { recursive: true });
    }
    
    // 复制主题目录
    const themesSrc = path.join(srcDir, 'themes');
    const themesDest = path.join(destDir, 'themes');
    if (!existsSync(themesDest)) {
      mkdirSync(themesDest, { recursive: true });
    }
    
    // 复制 CSS 文件
    copyFileSync(
      path.join(srcDir, 'index.css'),
      path.join(destDir, 'index.css')
    );
    copyFileSync(
      path.join(srcDir, 'editor.css'),
      path.join(destDir, 'editor.css')
    );
    copyFileSync(
      path.join(themesSrc, 'light.css'),
      path.join(themesDest, 'light.css')
    );
    copyFileSync(
      path.join(themesSrc, 'dark.css'),
      path.join(themesDest, 'dark.css')
    );
    
    console.log('✅ Styles copied to dist/styles');
  },
});

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      skipDiagnostics: true, // 跳过类型诊断
      compilerOptions: {
        skipLibCheck: true,
        strict: false,
      },
    }),
    copyStylesPlugin(),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'WheelChairCore',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@tiptap/core', '@tiptap/react', '@tiptap/starter-kit', 'zustand'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
});
