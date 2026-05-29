import type { GuiServices } from './index.js'
import {
  createSessionManager,
  type SessionManager,
  type GuiMode,
} from '../services/sessionManager.js'
import type { ProcEvent } from '../services/sessionProcess.js'

let clients: Set<any> = new Set()
let broadcastInterval: Timer | null = null
let manager: SessionManager | null = null

export function addWsClient(ws: any) {
  clients.add(ws)
}

export function removeWsClient(ws: any) {
  clients.delete(ws)
}

export function broadcast(data: unknown) {
  const json = JSON.stringify(data)
  for (const ws of clients) {
    try {
      ws.send(json)
    } catch {
      clients.delete(ws)
    }
  }
}

/** Translate a child-process event into the WS wire protocol (§4.2). */
function translateEvent(sessionId: string, event: ProcEvent): void {
  switch (event.type) {
    case 'system':
      broadcast({
        type: 'session:init',
        data: { sessionId, cwd: event.cwd, tools: event.tools },
      })
      break
    case 'user-replay':
      // User bubble is rendered on chat:started; ignore the replay echo.
      break
    case 'text':
      broadcast({
        type: 'msg:text',
        data: { sessionId, messageId: event.messageId, delta: event.delta },
      })
      break
    case 'thinking':
      broadcast({
        type: 'msg:thinking',
        data: { sessionId, messageId: event.messageId, delta: event.delta },
      })
      break
    case 'tool_use':
      broadcast({
        type: 'tool:use',
        data: {
          sessionId,
          toolUseId: event.toolUseId,
          name: event.name,
          input: event.input,
        },
      })
      break
    case 'tool_result':
      broadcast({
        type: 'tool:result',
        data: {
          sessionId,
          toolUseId: event.toolUseId,
          content: event.content,
          isError: event.isError,
        },
      })
      break
    case 'permission':
      broadcast({
        type: 'perm:request',
        data: {
          sessionId,
          requestId: event.requestId,
          toolUseId: event.toolUseId,
          name: event.name,
          input: event.input,
          suggestions: event.suggestions,
          title: event.title,
        },
      })
      break
    case 'result':
      broadcast({
        type: 'chat:done',
        data: {
          sessionId,
          isError: event.isError,
          result: event.result,
          stopReason: event.stopReason,
          costUSD: event.costUSD,
          usage: event.usage,
        },
      })
      break
    case 'error':
      broadcast({ type: 'chat:error', data: { sessionId, error: event.error } })
      break
    case 'exit':
      broadcast({ type: 'session:exit', data: { sessionId, code: event.code } })
      break
  }
}

function getManager(): SessionManager {
  if (!manager) {
    manager = createSessionManager({
      defaultCwd: process.cwd(),
      onEvent: translateEvent,
      onDebug: msg => {
        if (process.env.WITCHCAT_GUI_DEBUG) process.stderr.write(msg + '\n')
      },
    })
  }
  return manager
}

export function startBroadcastLoop(services: GuiServices) {
  getManager()
  if (broadcastInterval) return
  broadcastInterval = setInterval(async () => {
    if (clients.size === 0) return
    try {
      const [providers, config, sessions, stats] = await Promise.all([
        services.configService.getProviders(),
        services.configService.getCurrentConfig(),
        services.sessionService.listSessions(50),
        services.statsService.getOverview(),
      ])
      broadcast({
        type: 'stats',
        data: { providers, config, sessions, stats },
      })
    } catch {
      // silent fail
    }
  }, 5000)
}

export function stopBroadcastLoop() {
  if (broadcastInterval) {
    clearInterval(broadcastInterval)
    broadcastInterval = null
  }
  if (manager) {
    manager.shutdown()
    manager = null
  }
  clients.clear()
}

type ChatStartPayload = {
  sessionId?: string
  message: string
  cwd?: string
  mode?: GuiMode
  model?: string
  thinking?: 'auto' | 'off'
  resume?: boolean
}
type SessionIdPayload = { sessionId: string }
type PermResponsePayload = {
  sessionId: string
  requestId: string
  decision: 'allow' | 'deny'
  scope?: 'once' | 'always'
  updatedInput?: Record<string, unknown>
}
type ModeSetPayload = { sessionId: string; mode: GuiMode }

export async function handleWsMessage(ws: any, raw: string | Buffer) {
  let msg: { type: string; payload?: unknown }
  try {
    msg = JSON.parse(typeof raw === 'string' ? raw : raw.toString())
  } catch {
    ws.send(JSON.stringify({ type: 'chat:error', data: { error: '无效消息格式' } }))
    return
  }

  const mgr = getManager()

  switch (msg.type) {
    case 'chat:start': {
      const payload = msg.payload as ChatStartPayload
      if (!payload?.message || typeof payload.message !== 'string') {
        ws.send(JSON.stringify({ type: 'chat:error', data: { error: '缺少消息内容' } }))
        return
      }
      const sessionId = mgr.ensure(payload.sessionId, {
        cwd: payload.cwd,
        mode: payload.mode,
        model: payload.model,
        thinking: payload.thinking,
        resume: payload.resume,
      })
      ws.send(
        JSON.stringify({
          type: 'chat:started',
          data: { sessionId, userMessage: payload.message, mode: mgr.getMode(sessionId) },
        }),
      )
      const ok = mgr.send(sessionId, payload.message)
      if (!ok) {
        ws.send(
          JSON.stringify({
            type: 'chat:error',
            data: { sessionId, error: '会话进程不可用，请重试' },
          }),
        )
      }
      break
    }

    case 'chat:abort': {
      const payload = msg.payload as SessionIdPayload
      if (payload?.sessionId) mgr.abort(payload.sessionId)
      break
    }

    case 'chat:clear': {
      const payload = msg.payload as SessionIdPayload
      if (payload?.sessionId) {
        mgr.clear(payload.sessionId)
        ws.send(
          JSON.stringify({ type: 'chat:cleared', data: { sessionId: payload.sessionId } }),
        )
      }
      break
    }

    case 'perm:response': {
      const payload = msg.payload as PermResponsePayload
      if (!payload?.sessionId || !payload.requestId) return
      const decision =
        payload.decision === 'allow'
          ? {
              behavior: 'allow' as const,
              updatedInput: payload.updatedInput,
              always: payload.scope === 'always',
            }
          : { behavior: 'deny' as const }
      mgr.respondPermission(payload.sessionId, payload.requestId, decision)
      break
    }

    case 'mode:set': {
      const payload = msg.payload as ModeSetPayload
      if (payload?.sessionId && payload.mode) {
        const ok = mgr.setMode(payload.sessionId, payload.mode)
        ws.send(
          JSON.stringify({
            type: 'mode:set',
            data: { sessionId: payload.sessionId, mode: payload.mode, ok },
          }),
        )
      }
      break
    }

    case 'model:set': {
      const payload = msg.payload as { sessionId: string; model: string }
      if (payload?.sessionId && payload.model) {
        mgr.setModel(payload.sessionId, payload.model)
      }
      break
    }

    case 'thinking:set': {
      const payload = msg.payload as { sessionId: string; thinking: 'auto' | 'off' }
      if (payload?.sessionId && payload.thinking) {
        mgr.setThinking(payload.sessionId, payload.thinking)
      }
      break
    }
  }
}
