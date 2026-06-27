import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  worker: {
    format: 'es',
  },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('gsap')) return 'gsap'
          if (id.includes('@tanstack')) return 'query'
          if (id.includes('@phosphor-icons')) return 'icons'
          if (
            id.includes('react-router') ||
            id.includes('react-dom') ||
            id.includes('scheduler') ||
            /node_modules\/react\//.test(id)
          ) {
            return 'react'
          }
          return undefined
        },
      },
    },
  },
})
