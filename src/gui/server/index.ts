import { randomBytes } from 'crypto'
import { handleApiRoute, type ApiContext } from './api/router.js'
import { validateToken } from './auth.js'
import { createConfigService } from '../services/configService.js'
import { createSessionService } from '../services/sessionService.js'
import { createStatsService } from '../services/statsService.js'
import { getStaticAsset } from './staticAssets.js'
import { addWsClient, removeWsClient, startBroadcastLoop, stopBroadcastLoop, handleWsMessage } from './websocket.js'

const DEFAULT_PORT = 9277
const TOKEN_PARAM = 'token'

let serverToken = randomBytes(32).toString('hex')
let serverInstance: ReturnType<typeof Bun.serve> | null = null

export type GuiServices = {
  configService: ReturnType<typeof createConfigService>
  sessionService: ReturnType<typeof createSessionService>
  statsService: ReturnType<typeof createStatsService>
}

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function withCors(headers: Headers): Headers {
  for (const [k, v] of Object.entries(CORS_HEADERS)) {
    headers.set(k, v)
  }
  return headers
}

function authenticate(url: URL): boolean {
  const tokenParam = url.searchParams.get(TOKEN_PARAM)
  return validateToken(tokenParam, serverToken)
}

function isWebSocketUpgrade(request: Request): boolean {
  return request.headers.get('upgrade')?.toLowerCase() === 'websocket'
}

function handleRequest(request: Request, ctx: ApiContext): Response | Promise<Response> {
  const url = new URL(request.url)
  const path = url.pathname

  if (!authenticate(url)) {
    const authHeader = request.headers.get('Authorization')
    const bearerToken = authHeader?.replace('Bearer ', '')
    if (!validateToken(bearerToken, serverToken)) {
      return new Response('Unauthorized', { status: 401 })
    }
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: withCors(new Headers()) })
  }

  if (path.startsWith('/api/')) {
    return handleApiRoute(request, path, ctx).then(resp => {
      if (!resp) {
        return new Response('Not Found', { status: 404, headers: withCors(new Headers()) })
      }
      return new Response(resp.body, {
        status: resp.status,
        headers: withCors(new Headers(resp.headers)),
      })
    })
  }

  const asset = getStaticAsset(path)
  if (asset) {
    return new Response(asset.content, {
      headers: {
        'Content-Type': asset.contentType,
        'Cache-Control': 'no-cache',
        ...CORS_HEADERS,
      },
    })
  }

  if (path === '/chat' || path === '/chat.html') {
    const chatAsset = getStaticAsset('/chat.html')
    if (chatAsset) {
      return new Response(chatAsset.content, {
        headers: {
          'Content-Type': chatAsset.contentType,
          'Cache-Control': 'no-cache',
          ...CORS_HEADERS,
        },
      })
    }
  }

  const index = getStaticAsset('/index.html')
  if (index) {
    return new Response(index.content, {
      headers: { 'Content-Type': index.contentType, ...CORS_HEADERS },
    })
  }

  return new Response('Not Found', { status: 404 })
}

export async function startGuiServer(port = DEFAULT_PORT): Promise<{ url: string; token: string }> {
  if (serverInstance) {
    return { url: `http://localhost:${serverInstance.port}?${TOKEN_PARAM}=${serverToken}`, token: serverToken }
  }

  serverToken = randomBytes(32).toString('hex')

  const services: GuiServices = {
    configService: createConfigService(),
    sessionService: createSessionService(),
    statsService: createStatsService(),
  }

  const ctx: ApiContext = { services }

  try {
    serverInstance = Bun.serve({
      port,
      hostname: '127.0.0.1',
      fetch: (request, server) => {
        // WebSocket upgrade must be handled here; Bun only invokes the
        // `websocket` handlers if `server.upgrade()` is called and returns true.
        if (isWebSocketUpgrade(request)) {
          const url = new URL(request.url)
          if (!authenticate(url)) {
            return new Response('Unauthorized', { status: 401 })
          }
          if (server.upgrade(request)) {
            return undefined
          }
          return new Response('WebSocket upgrade failed', { status: 400 })
        }
        return handleRequest(request, ctx)
      },
      websocket: {
        open(ws) {
          addWsClient(ws)
        },
        close(ws) {
          removeWsClient(ws)
        },
        message(ws, message) {
          handleWsMessage(ws, message)
        },
      },
    })
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code
    if (code === 'EADDRINUSE') {
      throw new Error(`端口 ${port} 已被占用，请关闭占用该端口的程序或更换端口后重试。`)
    }
    throw err
  }

  startBroadcastLoop(services)

  const url = `http://localhost:${serverInstance.port}?${TOKEN_PARAM}=${serverToken}`
  return { url, token: serverToken }
}

export function stopGuiServer(): void {
  stopBroadcastLoop()
  if (serverInstance) {
    serverInstance.stop()
    serverInstance = null
  }
}
