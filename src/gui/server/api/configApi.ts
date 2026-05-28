import type { GuiServices } from '../index.js'

export async function handleConfigRoutes(
  request: Request,
  path: string,
  services: GuiServices
): Promise<Response> {
  if (path === '/api/config/providers') {
    const providers = services.configService.getProviders()
    return Response.json(providers)
  }
  if (path === '/api/config/current') {
    const current = services.configService.getCurrentConfig()
    return Response.json(current)
  }
  return new Response('Not Found', { status: 404 })
}
