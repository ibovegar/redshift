import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'build',
    sourcemap: false,
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('/three/')) return 'three'
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/@mui/material/') ||
            id.includes('/@tanstack/react-query/')
          ) {
            return 'vendor'
          }
        }
      }
    }
  }
})
