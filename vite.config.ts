import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173, // 固定端口，避免端口变化导致localStorage数据丢失
    strictPort: true, // 如果端口被占用则报错，而不是自动选择其他端口
    allowedHosts: true,
    hmr: {
      overlay: true
    }
  },
  // 优化构建和缓存
  optimizeDeps: {
    force: false // 不强制重新优化依赖
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
