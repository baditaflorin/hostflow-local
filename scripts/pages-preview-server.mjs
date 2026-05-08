import { createServer } from 'node:http'
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
} from 'node:fs'
import { extname, join, normalize, resolve } from 'node:path'

const port = Number(process.env.PORT ?? 4289)
const source = resolve('dist')
const root = resolve('tmp/pages')
const appRoot = join(root, 'hostflow-local')

if (!existsSync(join(source, 'index.html'))) {
  throw new Error('dist/index.html is missing. Run npm run build first.')
}

rmSync(root, { recursive: true, force: true })
mkdirSync(appRoot, { recursive: true })
cpSync(source, appRoot, { recursive: true })
copyFileSync(join(source, 'index.html'), join(appRoot, '404.html'))

const mimeTypes = {
  '.html': 'text/html;charset=utf-8',
  '.js': 'text/javascript;charset=utf-8',
  '.css': 'text/css;charset=utf-8',
  '.json': 'application/json;charset=utf-8',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
  '.webmanifest': 'application/manifest+json',
}

createServer((request, response) => {
  const url = new URL(request.url ?? '/', `http://127.0.0.1:${port}`)
  const cleanPath = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '')
  const candidate = join(root, cleanPath)
  const filePath = fileFor(candidate, cleanPath)

  if (!filePath) {
    response.writeHead(404)
    response.end('Not found')
    return
  }

  response.writeHead(200, {
    'content-type': mimeTypes[extname(filePath)] ?? 'application/octet-stream',
    'cache-control': 'no-store',
  })
  response.end(readFileSync(filePath))
}).listen(port, '127.0.0.1', () => {
  console.log(`Pages preview listening at http://127.0.0.1:${port}/hostflow-local/`)
})

function fileFor(candidate, cleanPath) {
  if (existsSync(candidate) && statSync(candidate).isFile()) return candidate
  if (existsSync(candidate) && statSync(candidate).isDirectory()) {
    const index = join(candidate, 'index.html')
    if (existsSync(index)) return index
  }
  if (cleanPath.startsWith('/hostflow-local')) return join(appRoot, 'index.html')
  return null
}
