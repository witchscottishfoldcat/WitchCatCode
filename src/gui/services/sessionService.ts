import { readdir, readFile, stat, unlink } from 'fs/promises'
import { join } from 'path'
import { getClaudeConfigHomeDir } from '../../utils/envUtils.js'

export type SessionSummary = {
  sessionId: string
  projectPath: string
  createdAt: string
  sizeBytes: number
  firstPrompt: string
}

export type SessionDetail = SessionSummary & {
  messages: SessionMessage[]
}

export type SessionMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: string
}

export function createSessionService() {
  return {
    async listSessions(limit = 50): Promise<SessionSummary[]> {
      const sessions: SessionSummary[] = []
      try {
        const configHome = getClaudeConfigHomeDir()
        const projectsDir = join(configHome, 'projects')
        const projects = await readdir(projectsDir).catch(() => [])

        for (const project of projects.slice(0, 20)) {
          const projectDir = join(projectsDir, project)
          const projectStat = await stat(projectDir).catch(() => null)
          if (!projectStat?.isDirectory()) continue

          const files = await readdir(projectDir).catch(() => [])
          for (const file of files) {
            if (!file.endsWith('.jsonl')) continue
            const sessionId = file.replace('.jsonl', '')
            const filePath = join(projectDir, file)
            const fileStat = await stat(filePath).catch(() => null)
            if (!fileStat) continue

            let firstPrompt = ''
            try {
              const content = await readFile(filePath, 'utf-8')
              const lines = content.split('\n').filter(Boolean)
              for (const line of lines.slice(0, 10)) {
                try {
                  const entry = JSON.parse(line)
                  if (entry.type === 'human' && entry.message?.content) {
                    const text = typeof entry.message.content === 'string'
                      ? entry.message.content
                      : entry.message.content.find?.((b: { type: string; text?: string }) => b.type === 'text')?.text ?? ''
                    if (text && !text.startsWith('<')) {
                      firstPrompt = text.slice(0, 120)
                      break
                    }
                  }
                } catch { /* skip malformed line */ }
              }
            } catch { /* unreadable file */ }

            sessions.push({
              sessionId,
              projectPath: project,
              createdAt: fileStat.mtime.toISOString(),
              sizeBytes: fileStat.size,
              firstPrompt,
            })

            if (sessions.length >= limit) break
          }
          if (sessions.length >= limit) break
        }
      } catch { /* config dir not accessible */ }

      sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      return sessions
    },

    async getSessionDetail(sessionId: string, projectPath: string): Promise<SessionDetail | null> {
      try {
        const configHome = getClaudeConfigHomeDir()
        const filePath = join(configHome, 'projects', projectPath, `${sessionId}.jsonl`)
        const fileStat = await stat(filePath).catch(() => null)
        if (!fileStat) return null

        const content = await readFile(filePath, 'utf-8')
        const lines = content.split('\n').filter(Boolean)
        const messages: SessionMessage[] = []
        let firstPrompt = ''

        for (const line of lines) {
          try {
            const entry = JSON.parse(line)
            if (entry.type === 'human' && entry.message?.content) {
              const text = typeof entry.message.content === 'string'
                ? entry.message.content
                : entry.message.content.find?.((b: { type: string; text?: string }) => b.type === 'text')?.text ?? ''
              if (text && !text.startsWith('<')) {
                if (!firstPrompt) firstPrompt = text.slice(0, 120)
                messages.push({ role: 'user', content: text, timestamp: entry.timestamp })
              }
            } else if (entry.type === 'assistant' && entry.message?.content) {
              const text = typeof entry.message.content === 'string'
                ? entry.message.content
                : entry.message.content.find?.((b: { type: string; text?: string }) => b.type === 'text')?.text ?? ''
              if (text) {
                messages.push({ role: 'assistant', content: text, timestamp: entry.timestamp })
              }
            }
          } catch { /* skip malformed line */ }
        }

        return {
          sessionId,
          projectPath,
          createdAt: fileStat.mtime.toISOString(),
          sizeBytes: fileStat.size,
          firstPrompt,
          messages: messages.slice(-50),
        }
      } catch {
        return null
      }
    },

    async deleteSession(sessionId: string, projectPath: string): Promise<boolean> {
      try {
        const configHome = getClaudeConfigHomeDir()
        const filePath = join(configHome, 'projects', projectPath, `${sessionId}.jsonl`)
        await unlink(filePath)
        return true
      } catch {
        return false
      }
    },
  }
}
