import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: {
        entry: resolve('src/main.ts'),
      },
    },
    resolve: {
      alias: {
        '@x-community/shared': resolve('../shared/src'),
        '@/services': resolve('src/services'),
        '@/config': resolve('src/config'),
        '@': resolve('src'),
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: {
        entry: resolve('src/preload/preload.ts'),
      },
    },
    resolve: {
      alias: {
        '@x-community/shared': resolve('../shared/src'),
        '@/services': resolve('src/services'),
        '@/config': resolve('src/config'),
        '@': resolve('src'),
      },
    },
  },
  renderer: {
    root: 'src/renderer',
    build: {
      rollupOptions: {
        input: {
          index: resolve('src/renderer/index.html'),
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: [
        { find: '@x-community/shared', replacement: resolve('../shared/src') },
        { find: '@x-community/ui', replacement: resolve('../ui/src') },
        { find: '@/components', replacement: resolve('src/renderer/components') },
        { find: '@/pages', replacement: resolve('src/renderer/pages') },
        { find: '@/hooks', replacement: resolve('src/hooks') },
        { find: '@/utils', replacement: resolve('src/renderer/utils') },
        { find: '@/services', replacement: resolve('src/services') },
        { find: '@/config', replacement: resolve('src/config') },
        { find: '@/contexts', replacement: resolve('src/contexts') },
        { find: '@', replacement: resolve('src') },
      ],
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },
    server: {
      port: 5173,
      host: 'localhost',
    },
  },
});
