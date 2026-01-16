import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({
      // Enables React fast refresh + TSX support
      jsxRuntime: 'automatic',
    })],
  root: resolve(__dirname),
  base: "/static",
  build: {
    outDir: resolve(__dirname, "../static"),
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: {
        dashboard: "src/Dashboard/main.tsx"
      }
    }
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
})
