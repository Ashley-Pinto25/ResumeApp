import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['pdfjs-dist']
  },
  worker: {
    format: 'es'
  },
  build: {
    sourcemap: false,
    minify: 'esbuild', // Using esbuild instead of terser for compatibility
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          pdf: ['pdfjs-dist']
        }
      }
    }
  },
  server: {
    host: true
  }
})
