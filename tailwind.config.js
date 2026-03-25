/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './packages/core/src/**/*.{js,ts,jsx,tsx}',
    './apps/demo/src/**/*.{js,ts,jsx,tsx}',
    './index.html',
  ],
  theme: {
    extend: {
      colors: {
        editor: {
          bg: '#ffffff',
          border: '#e2e8f0',
          toolbar: '#f8fafc',
          hover: '#f1f5f9',
          active: '#e2e8f0',
          text: '#1e293b',
          muted: '#64748b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
