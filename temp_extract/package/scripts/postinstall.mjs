import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const nodeModules = join(root, 'node_modules')

const SHIMS = [
  { src: 'shims/ant-claude-for-chrome-mcp', dest: '@ant/claude-for-chrome-mcp' },
  { src: 'shims/ant-computer-use-input', dest: '@ant/computer-use-input' },
  { src: 'shims/ant-computer-use-mcp', dest: '@ant/computer-use-mcp' },
  { src: 'shims/ant-computer-use-swift', dest: '@ant/computer-use-swift' },
  { src: 'shims/color-diff-napi', dest: 'color-diff-napi' },
  { src: 'shims/modifiers-napi', dest: 'modifiers-napi' },
  { src: 'shims/url-handler-napi', dest: 'url-handler-napi' },
]

for (const { src, dest } of SHIMS) {
  const srcPath = join(root, src)
  const destPath = join(nodeModules, dest)
  if (existsSync(srcPath)) {
    mkdirSync(dirname(destPath), { recursive: true })
    cpSync(srcPath, destPath, { force: true, recursive: true })
  }
}
