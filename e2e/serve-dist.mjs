// Serves ./dist the way Vercel will: SPA fallback + the headers (including the CSP) from vercel.json.
// Used by the local end-to-end run so the tests exercise the real security headers, not a dev server.
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'

const root = join(process.cwd(), 'dist')
const port = Number(process.env.PORT ?? 4173)
const apiOrigin = process.env.E2E_API_ORIGIN ?? 'http://localhost:4000'

const config = JSON.parse(readFileSync('vercel.json', 'utf8'))
const globalHeaders = Object.fromEntries(
  config.headers.find((h) => h.source === '/(.*)').headers.map((h) => [h.key, h.value]),
)
// vercel.json allows the production API host (*.onrender.com); locally the API is on another origin.
globalHeaders['Content-Security-Policy'] = globalHeaders['Content-Security-Policy'].replace(
  'https://*.onrender.com',
  `https://*.onrender.com ${apiOrigin}`,
)

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
}

createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://x')
  let file = normalize(join(root, decodeURIComponent(url.pathname)))
  if (!file.startsWith(root)) {
    res.writeHead(403).end()
    return
  }
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(root, 'index.html') // SPA rewrite
  res.writeHead(200, { ...globalHeaders, 'Content-Type': types[extname(file)] ?? 'application/octet-stream' })
  createReadStream(file).pipe(res)
}).listen(port, () => console.log(`serving dist on :${port} (CSP connect-src allows ${apiOrigin})`))
