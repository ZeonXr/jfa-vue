import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { PrimeVueResolver } from '@primevue/auto-import-resolver'

// https://vitejs.dev/config/
export default ({ mode }: { mode: 'development' | 'production' }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd(), '') }
  return defineConfig({
    plugins: [
      vue(),
      Components({
        resolvers: [PrimeVueResolver()]
      })
    ],
    server: {
      host: '0.0.0.0',
      port: Number(process.env.SERVER_PORT),
      proxy: {
        [process.env.VITE_PROXY_PREFIX]: {
          changeOrigin: true,
          configure(_, options) {
            options.rewrite = (path) => {
              path = path.replace(process.env.VITE_PROXY_PREFIX, '')
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
}
