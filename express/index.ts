import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import path from 'path'

const app = express()

const staticPath = path.resolve(import.meta.dirname, '../dist')
app.use(express.static(staticPath))

app.use(
  process.env.VITE_PROXY_PREFIX,
  createProxyMiddleware({
    router: (req) => {
      const origin = new URL(req.url?.slice(1) ?? '').origin
      return origin
    },
    pathRewrite: (path) => {
      const url = new URL(path.slice(1))
      return url.pathname
    }
  })
)

const port = process.env.VITE_SERVER_PORT
app.listen(port, () => {
  console.log(`jfa-vue启动成功---端口: ${process.env.VITE_SERVER_PORT}`)
})
