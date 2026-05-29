import { randomUUID } from 'crypto'
import {
  createSessionProcess,
  type SessionProcess,
  type ProcEvent,
  type PermissionDecision,
} from './sessionProcess.js'

/**
 * Manages the pool of per-session CLI subprocesses: lifecycle, concurrency cap,
 * idle reaping. The WebSocket layer drives it and consumes its events.
 *
 * GUI-facing permission modes (Codex Desktop's three) map to CLI PermissionMode:
 *   read-only   → default            (read auto, changes ask)
 *   auto        → acceptEdits        (edits auto, bash/network ask)
 *   full-access → bypassPermissions  (no prompts)
 */

export type GuiMode = 'read-only' | 'auto' | 'full-access'

const MODE_MAP: Record<GuiMode, string> = {
  'read-only': 'default',
  auto: 'acceptEdits',
  'full-access': 'bypassPermissions',
}

export function guiModeToPermissionMode(mode: GuiMode): string {
  return MODE_MAP[mode] ?? 'default'
}

type Session = {
  proc: SessionProcess
  mode: GuiMode
  cwd: string
  model?: string
  thinking: 'auto' | 'off'
  lastActivity: number
}

export type SessionManagerOpts = {
  /** Where session events are delivered (translated to WS by caller). */
  onEvent: (sessionId: string, event: ProcEvent) => void
  /** Default working directory for new sessions. */
  defaultCwd: string
  maxSessions?: number
  idleMs?: number
  onDebug?: (msg: string) => void
}

export type SessionManager = ReturnType<typeof createSessionManager>

export function createSessionManager(opts: SessionManagerOpts) {
  const sessions = new Map<string, Session>()
  const maxSessions = opts.maxSessions ?? 8
  const idleMs = opts.idleMs ?? 30 * 60 * 1000
  const debug = opts.onDebug ?? (() => {})

  const reaper = setInterval(() => {
    const now = Date.now()
    for (const [id, s] of sessions) {
      if (now - s.lastActivity > idleMs) {
        debug(`[gui:manager] reaping idle session ${id}`)
        s.proc.kill()
        sessions.delete(id)
      }
    }
  }, 60_000)
  reaper.unref?.()

  function touch(id: string): void {
    const s = sessions.get(id)
    if (s) s.lastActivity = Date.now()
  }

  function evictOldestIdleIfNeeded(): void {
    if (sessions.size < maxSessions) return
    let oldestId: string | null = null
    let oldest = Infinity
    for (const [id, s] of sessions) {
      if (s.lastActivity < oldest) {
        oldest = s.lastActivity
        oldestId = id
      }
    }
    if (oldestId) {
      debug(`[gui:manager] capacity reached, evicting ${oldestId}`)
      sessions.get(oldestId)?.proc.kill()
      sessions.delete(oldestId)
    }
  }

  function ensure(
    sessionId: string | undefined,
    config: {
      cwd?: string
      mode?: GuiMode
      model?: string
      thinking?: 'auto' | 'off'
      /** Resume an on-disk transcript (e.g. reopening from history). */
      resume?: boolean
    } = {},
  ): string {
    const id = sessionId || randomUUID()
    const existing = sessions.get(id)
    if (existing && !existing.proc.exited) {
      touch(id)
      return id
    }
    if (existing?.proc.exited) sessions.delete(id)

    evictOldestIdleIfNeeded()

    const mode: GuiMode = config.mode ?? 'read-only'
    const cwd = config.cwd || opts.defaultCwd
    const thinking = config.thinking ?? 'auto'
    const proc = createSessionProcess({
      sessionId: id,
      cwd,
      permissionMode: guiModeToPermissionMode(mode),
      model: config.model,
      maxThinkingTokens: thinking === 'off' ? 0 : undefined,
      // Resume if the id was used before this run, or caller asks (history).
      resume: !!existing || config.resume === true,
      onEvent: event => opts.onEvent(id, event),
      onDebug: debug,
    })
    sessions.set(id, { proc, mode, cwd, model: config.model, thinking, lastActivity: Date.now() })
    debug(`[gui:manager] created session ${id} cwd=${cwd} mode=${mode} model=${config.model ?? '(default)'} thinking=${thinking}`)
    return id
  }

  return {
    ensure,

    send(sessionId: string, text: string): boolean {
      const s = sessions.get(sessionId)
      if (!s) return false
      touch(sessionId)
      return s.proc.sendUserMessage(text)
    },

    respondPermission(
      sessionId: string,
      requestId: string,
      decision: PermissionDecision,
    ): boolean {
      const s = sessions.get(sessionId)
      if (!s) return false
      touch(sessionId)
      return s.proc.respondPermission(requestId, decision)
    },

    setMode(sessionId: string, mode: GuiMode): boolean {
      const s = sessions.get(sessionId)
      if (!s) return false
      s.mode = mode
      touch(sessionId)
      return s.proc.setMode(guiModeToPermissionMode(mode))
    },

    getMode(sessionId: string): GuiMode | undefined {
      return sessions.get(sessionId)?.mode
    },

    setModel(sessionId: string, model: string): boolean {
      const s = sessions.get(sessionId)
      if (!s) return false
      s.model = model
      touch(sessionId)
      return s.proc.setModel(model)
    },

    setThinking(sessionId: string, thinking: 'auto' | 'off'): boolean {
      const s = sessions.get(sessionId)
      if (!s) return false
      s.thinking = thinking
      touch(sessionId)
      // 0 disables; a large budget re-enables for the rest of the session.
      return s.proc.setThinking(thinking === 'off' ? 0 : 16000)
    },

    abort(sessionId: string): boolean {
      const s = sessions.get(sessionId)
      if (!s) return false
      return s.proc.abort()
    },

    /** Kill and forget a session (new conversation). */
    clear(sessionId: string): void {
      const s = sessions.get(sessionId)
      if (s) {
        s.proc.kill()
        sessions.delete(sessionId)
      }
    },

    has(sessionId: string): boolean {
      const s = sessions.get(sessionId)
      return !!s && !s.proc.exited
    },

    shutdown(): void {
      clearInterval(reaper)
      for (const s of sessions.values()) s.proc.kill()
      sessions.clear()
    },
  }
}
