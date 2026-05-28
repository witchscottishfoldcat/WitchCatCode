import type { GuiServices } from '../index.js'

export async function handleStatsRoutes(
  request: Request,
  path: string,
  services: GuiServices
): Promise<Response> {
  if (path === '/api/stats/overview') {
    const stats = services.statsService.getOverview()
    return Response.json(stats)
  }
  return new Response('Not Found', { status: 404 })
}
