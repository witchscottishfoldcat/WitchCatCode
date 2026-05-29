// Stage-0 spike: drive the CLI as a subprocess over the stream-json control
// protocol. Confirms: (1) local (non-remote) headless works, (2) NDJSON event
// stream shape, (3) can_use_tool control_request → control_response envelope.
//
// Usage: node scripts/gui-spike.mjs "your prompt here"
import { spawn } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createInterface } from 'node:readline'

const prompt = process.argv[2] ?? '请创建一个文件 hello.txt，内容为 hi。'
const repoRoot = process.cwd()
const childCwd = mkdtempSync(join(tmpdir(), 'gui-spike-'))
console.log('[spike] child cwd =', childCwd)

const args = [
  join(repoRoot, 'src', 'bootstrap-entry.ts'),
  '--print',
  '--input-format', 'stream-json',
  '--output-format', 'stream-json',
  '--verbose',
  '--replay-user-messages',
  '--permission-mode', 'default',
  '--permission-prompt-tool', 'stdio',
]
console.log('[spike] spawn: bun', args.join(' '))

const child = spawn('bun', args, {
  cwd: childCwd,
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, CLAUDE_CODE_ENVIRONMENT_KIND: 'gui-spike' },
  windowsHide: true,
})

function send(obj) {
  const line = JSON.stringify(obj) + '\n'
  console.log('[spike] >>>', line.trim())
  child.stdin.write(line)
}

// Send the user turn.
send({
  type: 'user',
  session_id: '',
  message: { role: 'user', content: prompt },
  parent_tool_use_id: null,
})

let sawResult = false
const rlOut = createInterface({ input: child.stdout })
rlOut.on('line', line => {
  let msg
  try { msg = JSON.parse(line) } catch { console.log('[spike] <<< (raw)', line); return }
  console.log('[spike] <<<', msg.type, JSON.stringify(msg).slice(0, 300))

  // Auto-approve any can_use_tool permission request.
  if (msg.type === 'control_request' && msg.request?.subtype === 'can_use_tool') {
    console.log('[spike] !! permission asked for tool =', msg.request.tool_name)
    send({
      type: 'control_response',
      response: {
        subtype: 'success',
        request_id: msg.request_id,
        response: { behavior: 'allow', updatedInput: msg.request.input ?? {} },
      },
    })
  }

  if (msg.type === 'result') {
    sawResult = true
    console.log('[spike] === RESULT ===', JSON.stringify(msg).slice(0, 500))
    setTimeout(() => { child.kill('SIGTERM') }, 500)
  }
})

const rlErr = createInterface({ input: child.stderr })
rlErr.on('line', line => console.log('[spike][stderr]', line))

child.on('exit', (code, sig) => {
  console.log(`[spike] child exited code=${code} sig=${sig} sawResult=${sawResult}`)
  process.exit(sawResult ? 0 : 1)
})

// Safety timeout.
setTimeout(() => {
  console.log('[spike] TIMEOUT — killing child')
  child.kill('SIGKILL')
}, 90_000)
