import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'unsafe-none',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      process: "process/browser",
      buffer: "buffer",
      crypto: "crypto-browserify",
      stream: "stream-browserify",
      assert: "assert",
      http: "stream-http",
      https: "https-browserify",
      os: "os-browserify",
      url: "url",
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
})