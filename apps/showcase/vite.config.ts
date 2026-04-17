import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('@tanstack')) return 'vendor-tanstack'
          if (
            id.includes('lucide-react') ||
            id.includes('@base-ui') ||
            id.includes('class-variance-authority')
          )
            return 'vendor-ui'
          if (id.includes('date-fns') || id.includes('zustand') || id.includes('/zod/'))
            return 'vendor-data'
        },
      },
    },
  },
  plugins: [tailwindcss(), tanstackStart(), viteReact()],
})
