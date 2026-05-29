import { join, resolve, sep } from 'path'
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

/**
 * Resolve a request path against a base dir, rejecting any path that escapes
 * the base dir (path traversal, e.g. `/../../package.json`).
 */
function safeResolve(baseDir: string, requestPath: string): string | null {
  const resolved = resolve(baseDir, '.' + (requestPath.startsWith('/') ? requestPath : '/' + requestPath))
  const baseWithSep = baseDir.endsWith(sep) ? baseDir : baseDir + sep
  if (resolved !== baseDir && !resolved.startsWith(baseWithSep)) return null
  return resolved
}

function loadAssets(): Map<string, { content: string; contentType: string }> {
  if (assetsCache) return assetsCache

  assetsCache = new Map()

  const indexHtml = tryReadFile(join(WEB_DIR, 'index.html'), join(DIST_DIR, 'index.html'))
  if (indexHtml) {
    assetsCache.set('/index.html', { content: indexHtml, contentType: 'text/html; charset=utf-8' })
  }

  const chatHtml = tryReadFile(join(WEB_DIR, 'chat.html'), join(DIST_DIR, 'chat.html'))
  if (chatHtml) {
    assetsCache.set('/chat.html', { content: chatHtml, contentType: 'text/html; charset=utf-8' })
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
    const webPath = safeResolve(WEB_DIR, path)
    const distPath = safeResolve(DIST_DIR, path)
    if (!webPath && !distPath) return null
    const content = tryReadFile(...[webPath, distPath].filter((p): p is string => p !== null))
    if (content) {
      assets.set(path, { content, contentType })
      return { content, contentType }
    }
  }

  return null
}
