import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import path from 'path'

const app = express()

const staticPath = path.resolve(import.meta.dirname, '../dist')
app.use(express.static(staticPath))

app.use(
  '/_proxy_',
  createProxyMiddleware({
    router: (req) => {
      const target = req.originalUrl.replace('/_proxy_/', '')
      const origin = new URL(target).origin
      return origin
    },
    pathRewrite: (path) => {
      const url = new URL(path.slice(1))
      return url.pathname
    }
  })
)

// 启动服务器
const port = 8080
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`)
})
