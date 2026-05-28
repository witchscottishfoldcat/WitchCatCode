import { join } from 'path'
import { readFileSync } from 'fs'

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
}

const WEB_DIR = join(import.meta.dir, '..', 'web')
const DIST_DIR = join(WEB_DIR, 'dist')

let assetsCache: Map<string, { content: string; contentType: string }> | null = null

function getExt(filePath: string): string {
  const dot = filePath.lastIndexOf('.')
  return dot >= 0 ? filePath.slice(dot) : ''
}

function tryReadFile(...candidates: string[]): string | null {
  for (const p of candidates) {
    try { return readFileSync(p, 'utf-8') } catch { /* next */ }
  }
  return null
}

function loadAssets(): Map<string, { content: string; contentType: string }> {
  if (assetsCache) return assetsCache

  assetsCache = new Map()

  const indexHtml = tryReadFile(join(WEB_DIR, 'index.html'), join(DIST_DIR, 'index.html'))
  if (indexHtml) {
    assetsCache.set('/index.html', { content: indexHtml, contentType: 'text/html; charset=utf-8' })
  }

  return assetsCache
}

export function getStaticAsset(path: string): { content: string; contentType: string } | null {
  const assets = loadAssets()
  const asset = assets.get(path)
  if (asset) return asset

  const ext = getExt(path)
  const contentType = MIME_TYPES[ext]
  if (contentType) {
    const content = tryReadFile(join(WEB_DIR, path), join(DIST_DIR, path))
    if (content) {
      assets.set(path, { content, contentType })
      return { content, contentType }
    }
  }

  return null
}
