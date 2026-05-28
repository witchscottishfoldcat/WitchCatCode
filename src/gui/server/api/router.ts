import type { GuiServices } from '../index.js'
import { handleConfigRoutes } from './configApi.js'
import { handleSessionRoutes } from './sessionApi.js'
import { handleStatsRoutes } from './statsApi.js'

export type ApiContext = {
  services: GuiServices
}

export async function handleApiRoute(
  request: Request,
  path: string,
  ctx: ApiContext,
): Promise<Response | null> {
  if (path.startsWith('/api/config')) {
    return handleConfigRoutes(request, path, ctx.services)
  }
  if (path.startsWith('/api/sessions')) {
    return handleSessionRoutes(request, path, ctx.services)
  }
  if (path.startsWith('/api/stats')) {
    return handleStatsRoutes(request, path, ctx.services)
  }
  return null
}
