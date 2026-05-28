import type { GuiServices } from '../index.js'

export async function handleSessionRoutes(
  request: Request,
  path: string,
  services: GuiServices
): Promise<Response> {
  if (path === '/api/sessions') {
    const sessions = await services.sessionService.listSessions()
    return Response.json(sessions)
  }
  return new Response('Not Found', { status: 404 })
}
