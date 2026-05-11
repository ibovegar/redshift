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
        manualChunks: {
          three: ['three'],
          vendor: ['react', 'react-dom', '@mui/material', '@tanstack/react-query']
        }
      }
    }
  }
})
