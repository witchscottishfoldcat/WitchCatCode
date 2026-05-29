import type { GuiServices } from '../index.js'

export async function handleSessionRoutes(
  request: Request,
  path: string,
  services: GuiServices
): Promise<Response> {
  if (path === '/api/sessions' && request.method === 'GET') {
    const sessions = await services.sessionService.listSessions()
    return Response.json(sessions)
  }

  const detailMatch = path.match(/^\/api\/sessions\/([^\/]+)$/)
  if (detailMatch && request.method === 'GET') {
    const sessionId = decodeURIComponent(detailMatch[1])
    const projectPath = new URL(request.url).searchParams.get('project') || ''
    if (!projectPath) {
      return Response.json({ error: 'Missing project parameter' }, { status: 400 })
    }
    const detail = await services.sessionService.getSessionDetail(sessionId, projectPath)
    if (!detail) return Response.json({ error: 'Session not found' }, { status: 404 })
    return Response.json(detail)
  }

  const deleteMatch = path.match(/^\/api\/sessions\/([^\/]+)$/)
  if (deleteMatch && request.method === 'DELETE') {
    const sessionId = decodeURIComponent(deleteMatch[1])
    const projectPath = new URL(request.url).searchParams.get('project') || ''
    if (!projectPath) {
      return Response.json({ error: 'Missing project parameter' }, { status: 400 })
    }
    const ok = await services.sessionService.deleteSession(sessionId, projectPath)
    if (!ok) return Response.json({ error: 'Failed to delete' }, { status: 500 })
    return Response.json({ success: true })
  }

  return new Response('Not Found', { status: 404 })
}
