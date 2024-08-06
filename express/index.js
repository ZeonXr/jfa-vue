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

// eslint-disable-next-line no-undef
const port = process.env.SERVER_PORT || 8080
app.listen(port, () => {
  console.log('jfa-vue启动成功')
})
