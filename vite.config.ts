import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { PrimeVueResolver } from '@primevue/auto-import-resolver'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [PrimeVueResolver()]
    })
  ],
  server: {
    host: '0.0.0.0',
    proxy: {
      '^/_proxy_/.*': {
        changeOrigin: true,
        configure(_, options) {
          options.rewrite = (path) => {
            path = path.replace(/^\/_proxy_\//, '')
            const proxyUrl = new URL(path)
            options.target = proxyUrl.origin
            // return proxyUrl.pathname + proxyUrl.search
            return proxyUrl.pathname
          }
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
