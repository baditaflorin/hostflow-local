import { existsSync, readFileSync } from 'node:fs'

const indexPath = 'dist/index.html'
if (!existsSync(indexPath)) {
  throw new Error('dist/index.html is missing')
}

const html = readFileSync(indexPath, 'utf8')
if (!html.includes('/hostflow-local/assets/')) {
  throw new Error('dist/index.html does not contain the GitHub Pages base path')
}

if (!existsSync('dist/404.html')) {
  throw new Error('dist/404.html is missing')
}
