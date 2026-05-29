import { type ChildProcess, spawn } from 'child_process'
import { createInterface } from 'readline'
import { randomUUID } from 'crypto'
import { join } from 'path'
import { isInBundledMode } from '../../utils/bundledMode.js'

/**
 * Drives a single CLI session as a child process over the Agent SDK
 * stream-json control protocol (validated in scripts/gui-spike.mjs).
 *
 * Each GUI conversation = one of these. Process isolation gives each session
 * its own global sessionId / AppState / transcript, sidestepping the runtime's
 * single-active-session-per-process constraint (see docs/gui-full-cli-design.md).
 */

export type ProcEvent =
  | { type: 'system'; cwd: string; sessionId: string; tools: string[] }
  | { type: 'user-replay'; text: string }
  | { type: 'text'; delta: string; messageId: string }
  | { type: 'thinking'; delta: string; messageId: string }
  | { type: 'tool_use'; toolUseId: string; name: string; input: Record<string, unknown> }
  | { type: 'tool_result'; toolUseId: string; content: string; isError: boolean }
  | {
      type: 'permission'
      requestId: string
      toolUseId: string
      name: string
      input: Record<string, unknown>
      suggestions: unknown[]
      title?: string
    }
  | {
      type: 'result'
      isError: boolean
      result: string
      stopReason: string | null
      costUSD: number
      usage: Record<string, unknown> | null
    }
  | { type: 'error'; error: string }
  | { type: 'exit'; code: number | null; signal: string | null }

export type PermissionDecision =
  | { behavior: 'allow'; updatedInput?: Record<string, unknown>; always?: boolean }
  | { behavior: 'deny'; message?: string }

export type SessionProcessOpts = {
  sessionId: string
  cwd: string
  /** CLI permission mode: default | acceptEdits | plan | bypassPermissions */
  permissionMode: string
  model?: string
  /**
   * Thinking budget. `0` disables thinking (sets MAX_THINKING_TOKENS=0, see
   * utils/thinking.ts). Undefined = leave provider/model default.
   */
  maxThinkingTokens?: number
  /** Extra env (e.g. provider config). Merged over process.env. */
  env?: Record<string, string | undefined>
  /** Resume an existing transcript instead of starting fresh. */
  resume?: boolean
  onEvent: (event: ProcEvent) => void
  onDebug?: (msg: string) => void
}

const MAX_STDERR_LINES = 50

function resolveEntry(): { execPath: string; scriptArgs: string[] } {
  // Mirror bridge/bridgeMain.ts spawnScriptArgs(): compiled binary → execPath
  // is the binary itself; npm/dev → execPath is the node/bun runtime and we
  // must pass the entry script as the first arg.
  if (isInBundledMode() || !process.argv[1]) {
    return { execPath: process.execPath, scriptArgs: [] }
  }
  // In dev the running entry is bootstrap-entry.ts; reuse it for the child.
  const entry = join(import.meta.dir, '..', '..', 'bootstrap-entry.ts')
  return { execPath: process.execPath, scriptArgs: [entry] }
}

export type SessionProcess = ReturnType<typeof createSessionProcess>

export function createSessionProcess(opts: SessionProcessOpts) {
  const { sessionId, cwd, permissionMode, model, onEvent } = opts
  const debug = opts.onDebug ?? (() => {})

  const { execPath, scriptArgs } = resolveEntry()
  const args = [
    ...scriptArgs,
    '--print',
    '--session-id',
    sessionId,
    '--input-format',
    'stream-json',
    '--output-format',
    'stream-json',
    '--verbose',
    '--replay-user-messages',
    '--permission-mode',
    permissionMode,
    // Enables the can_use_tool control_request protocol in headless mode.
    // Without it, an `ask` decision is auto-denied (see spike findings).
    '--permission-prompt-tool',
    'stdio',
    ...(model ? ['--model', model] : []),
    ...(opts.resume ? ['--resume', sessionId] : []),
  ]

  debug(`[gui:session ${sessionId}] spawn ${execPath} ${args.join(' ')}`)

  const child: ChildProcess = spawn(execPath, args, {
    cwd,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: {
      ...process.env,
      ...opts.env,
      ...(opts.maxThinkingTokens !== undefined
        ? { MAX_THINKING_TOKENS: String(opts.maxThinkingTokens) }
        : {}),
      CLAUDE_CODE_ENVIRONMENT_KIND: 'gui',
    },
    windowsHide: true,
  })

  const lastStderr: string[] = []
  let exited = false
  // Cumulative-snapshot reconstruction: assistant messages arrive as growing
  // snapshots keyed by message id + block index. Track what we've emitted so we
  // forward only the new suffix as a delta, and emit each tool_use once.
  const emittedText = new Map<string, string>()
  const emittedThinking = new Map<string, string>()
  const seenToolUse = new Set<string>()
  const seenToolResult = new Set<string>()

  function write(obj: unknown): boolean {
    if (exited || !child.stdin?.writable) return false
    try {
      child.stdin.write(JSON.stringify(obj) + '\n')
      return true
    } catch {
      return false
    }
  }

  function emitDelta(
    map: Map<string, string>,
    key: string,
    full: string,
    kind: 'text' | 'thinking',
    messageId: string,
  ): void {
    const prev = map.get(key) ?? ''
    let delta: string
    if (full.startsWith(prev)) {
      delta = full.slice(prev.length)
    } else {
      // Snapshot diverged (rare) — re-emit whole block.
      delta = full
    }
    map.set(key, full)
    if (delta) onEvent({ type: kind, delta, messageId } as ProcEvent)
  }

  function handleAssistant(message: Record<string, unknown>): void {
    const msgId = (message.id as string) ?? 'msg'
    const content = message.content
    if (!Array.isArray(content)) return
    content.forEach((block, index) => {
      if (!block || typeof block !== 'object') return
      const b = block as Record<string, unknown>
      const key = `${msgId}:${index}`
      if (b.type === 'text' && typeof b.text === 'string') {
        // Pass the per-block key as the addressable id so distinct text/
        // thinking blocks in one message don't collide in the UI.
        emitDelta(emittedText, key, b.text, 'text', key)
      } else if (b.type === 'thinking' && typeof b.thinking === 'string') {
        emitDelta(emittedThinking, key, b.thinking, 'thinking', key)
      } else if (b.type === 'tool_use') {
        const toolUseId = (b.id as string) ?? randomUUID()
        if (seenToolUse.has(toolUseId)) return
        seenToolUse.add(toolUseId)
        onEvent({
          type: 'tool_use',
          toolUseId,
          name: (b.name as string) ?? 'Tool',
          input: (b.input as Record<string, unknown>) ?? {},
        })
      }
    })
  }

  function handleUser(message: Record<string, unknown>, raw: Record<string, unknown>): void {
    if (raw.isReplay) {
      const content = message.content
      const text =
        typeof content === 'string'
          ? content
          : Array.isArray(content)
            ? content
                .filter((b: { type?: string }) => b?.type === 'text')
                .map((b: { text?: string }) => b.text ?? '')
                .join('')
            : ''
      if (text) onEvent({ type: 'user-replay', text })
      return
    }
    // tool_result blocks
    const content = message.content
    if (!Array.isArray(content)) return
    for (const block of content) {
      if (!block || typeof block !== 'object') continue
      const b = block as Record<string, unknown>
      if (b.type !== 'tool_result') continue
      const toolUseId = (b.tool_use_id as string) ?? ''
      if (toolUseId && seenToolResult.has(toolUseId)) continue
      if (toolUseId) seenToolResult.add(toolUseId)
      const c = b.content
      const text =
        typeof c === 'string'
          ? c
          : Array.isArray(c)
            ? c
                .map((x: { type?: string; text?: string }) =>
                  x?.type === 'text' ? (x.text ?? '') : '',
                )
                .join('')
            : ''
      onEvent({
        type: 'tool_result',
        toolUseId,
        content: text,
        isError: b.is_error === true,
      })
    }
  }

  function handleStreamEvent(msg: Record<string, unknown>): void {
    const ev = msg.event as Record<string, unknown> | undefined
    if (!ev || ev.type !== 'content_block_delta') return
    const delta = ev.delta as Record<string, unknown> | undefined
    if (!delta) return
    // Live deltas not currently requested (no --include-partial-messages), but
    // handle them gracefully if a backend emits them. Keyed loosely by index.
    const idx = String((ev.index as number) ?? 0)
    if (delta.type === 'text_delta' && typeof delta.text === 'string') {
      onEvent({ type: 'text', delta: delta.text, messageId: `stream:${idx}` })
    } else if (delta.type === 'thinking_delta' && typeof delta.thinking === 'string') {
      onEvent({ type: 'thinking', delta: delta.thinking, messageId: `stream:${idx}` })
    }
  }

  function handleControlRequest(msg: Record<string, unknown>): void {
    const request = msg.request as Record<string, unknown> | undefined
    if (request?.subtype !== 'can_use_tool') return
    onEvent({
      type: 'permission',
      requestId: msg.request_id as string,
      toolUseId: (request.tool_use_id as string) ?? '',
      name: (request.tool_name as string) ?? 'Tool',
      input: (request.input as Record<string, unknown>) ?? {},
      suggestions: (request.permission_suggestions as unknown[]) ?? [],
      title: request.title as string | undefined,
    })
  }

  function handleResult(msg: Record<string, unknown>): void {
    onEvent({
      type: 'result',
      isError: msg.is_error === true,
      result: typeof msg.result === 'string' ? msg.result : '',
      stopReason: (msg.stop_reason as string) ?? null,
      costUSD: typeof msg.total_cost_usd === 'number' ? msg.total_cost_usd : 0,
      usage: (msg.usage as Record<string, unknown>) ?? null,
    })
    // A turn finished — reset per-turn snapshot trackers so the next turn's
    // message ids start clean (ids are unique, but bound memory anyway).
    emittedText.clear()
    emittedThinking.clear()
  }

  function handleLine(line: string): void {
    let msg: Record<string, unknown>
    try {
      msg = JSON.parse(line)
    } catch {
      return
    }
    switch (msg.type) {
      case 'system': {
        if (msg.subtype === 'init') {
          onEvent({
            type: 'system',
            cwd: (msg.cwd as string) ?? cwd,
            sessionId: (msg.session_id as string) ?? sessionId,
            tools: (msg.tools as string[]) ?? [],
          })
        }
        break
      }
      case 'assistant':
        handleAssistant((msg.message as Record<string, unknown>) ?? {})
        break
      case 'user':
        handleUser((msg.message as Record<string, unknown>) ?? {}, msg)
        break
      case 'stream_event':
        handleStreamEvent(msg)
        break
      case 'control_request':
        handleControlRequest(msg)
        break
      case 'result':
        handleResult(msg)
        break
    }
  }

  if (child.stdout) {
    const rl = createInterface({ input: child.stdout })
    rl.on('line', line => {
      debug(`[gui:session ${sessionId}] <<< ${line.slice(0, 200)}`)
      handleLine(line)
    })
  }
  if (child.stderr) {
    const rl = createInterface({ input: child.stderr })
    rl.on('line', line => {
      if (lastStderr.length >= MAX_STDERR_LINES) lastStderr.shift()
      lastStderr.push(line)
    })
  }

  child.on('error', err => {
    onEvent({ type: 'error', error: err.message })
  })
  child.on('exit', (code, signal) => {
    exited = true
    if (code && code !== 0 && lastStderr.length) {
      onEvent({ type: 'error', error: lastStderr.slice(-5).join('\n') })
    }
    onEvent({ type: 'exit', code, signal })
  })

  return {
    sessionId,
    cwd,
    get exited() {
      return exited
    },

    /** Send a user turn. */
    sendUserMessage(text: string): boolean {
      return write({
        type: 'user',
        session_id: '',
        message: { role: 'user', content: text },
        parent_tool_use_id: null,
      })
    },

    /** Reply to a pending can_use_tool control_request. */
    respondPermission(requestId: string, decision: PermissionDecision): boolean {
      const response: Record<string, unknown> =
        decision.behavior === 'allow'
          ? {
              behavior: 'allow',
              updatedInput: decision.updatedInput ?? {},
              ...(decision.always
                ? { decisionClassification: 'user_permanent' as const }
                : {}),
            }
          : { behavior: 'deny', message: decision.message ?? '用户拒绝', interrupt: false }
      return write({
        type: 'control_response',
        response: { subtype: 'success', request_id: requestId, response },
      })
    },

    /** Switch permission mode at runtime. */
    setMode(mode: string): boolean {
      return write({
        type: 'control_request',
        request_id: randomUUID(),
        request: { subtype: 'set_permission_mode', mode },
      })
    },

    /** Switch model at runtime. */
    setModel(model: string): boolean {
      return write({
        type: 'control_request',
        request_id: randomUUID(),
        request: { subtype: 'set_model', model },
      })
    },

    /** Set max thinking tokens at runtime (0 disables thinking). */
    setThinking(tokens: number): boolean {
      return write({
        type: 'control_request',
        request_id: randomUUID(),
        request: { subtype: 'set_max_thinking_tokens', max_thinking_tokens: tokens },
      })
    },

    /** Interrupt the current turn. */
    abort(): boolean {
      return write({
        type: 'control_request',
        request_id: randomUUID(),
        request: { subtype: 'interrupt' },
      })
    },

    /** Terminate the child process. */
    kill(): void {
      if (exited) return
      try {
        child.stdin?.end()
      } catch {
        /* ignore */
      }
      child.kill('SIGTERM')
      setTimeout(() => {
        if (!exited) child.kill('SIGKILL')
      }, 2000).unref?.()
    },
  }
}
