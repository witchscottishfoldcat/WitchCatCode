import type { GuiServices } from '../index.js'

export async function handleConfigRoutes(
  request: Request,
  path: string,
  services: GuiServices
): Promise<Response> {
  if (path === '/api/config/providers' && request.method === 'GET') {
    const providers = services.configService.getProviders()
    return Response.json(providers)
  }
  if (path === '/api/config/providers' && request.method === 'PUT') {
    try {
      const body = await request.json()
      const ok = services.configService.updateProvider(body)
      if (!ok) return Response.json({ error: 'Provider not found' }, { status: 404 })
      return Response.json({ success: true })
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 })
    }
  }
  if (path === '/api/config/activate' && request.method === 'POST') {
    try {
      const body = await request.json()
      const providerId = typeof body.providerId === 'string' ? body.providerId : undefined
      if (!providerId) return Response.json({ error: 'Missing providerId' }, { status: 400 })
      const ok = services.configService.setActiveProvider(providerId)
      if (!ok) return Response.json({ error: 'Provider not found' }, { status: 404 })
      return Response.json({ success: true })
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 })
    }
  }
  if (path === '/api/config/current' && request.method === 'GET') {
    const current = services.configService.getCurrentConfig()
    return Response.json(current)
  }
  return new Response('Not Found', { status: 404 })
}
