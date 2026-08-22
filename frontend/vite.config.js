import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Guarantee a single copy of React is used — prevents "Invalid hook call" on refresh
    dedupe: ['react', 'react-dom', 'react-dom/client'],
  },
  server: {
    port: 5173,
    strictPort: true,        // NEVER fall back to another port — Google OAuth requires exactly :5173
    hmr: {
      overlay: true,
      timeout: 5000,
    },
  },
  optimizeDeps: {
    force: false,
    // Pre-bundle React together so they are never split across module graphs
    include: ['react', 'react-dom', 'react-dom/client', 'react-router-dom'],
  },
})


