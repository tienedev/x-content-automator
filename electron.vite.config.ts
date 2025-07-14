import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@/types': resolve('src/types')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@/types': resolve('src/types')
      }
    }
  },
  renderer: {
    root: 'src/renderer',
    build: {
      rollupOptions: {
        input: {
          index: resolve('src/renderer/index.html')
        }
      }
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve('src/renderer'),
        '@/components': resolve('src/renderer/components'),
        '@/pages': resolve('src/renderer/pages'),
        '@/hooks': resolve('src/renderer/hooks'),
        '@/utils': resolve('src/renderer/utils'),
        '@/types': resolve('src/types'),
        '@/services': resolve('src/services'),
        '@/agents': resolve('src/agents')
      }
    },
    server: {
      port: 5173,
      host: 'localhost'
    }
  }
})