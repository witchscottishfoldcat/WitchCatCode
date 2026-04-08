import {
  readCustomApiStorage,
  getActiveProviderConfig,
  type ProviderConfig,
  type CompatibleProviderKind,
} from './customApiStorage.js'

export type ResolvedProvider = {
  kind: CompatibleProviderKind | undefined
  provider: ProviderConfig | undefined
  baseURL: string | undefined
  apiKey: string | undefined
  authMode: string | undefined
  reasoning: ProviderConfig['reasoning']
  oauth: ProviderConfig['oauth']
}

function findProviderByModel(
  model: string,
  providers: ProviderConfig[],
): ProviderConfig | undefined {
  return providers.find(p => p.models.includes(model))
    ?? providers[0]
}

function findProviderByActiveConfig(
  storage: ReturnType<typeof readCustomApiStorage>,
): ProviderConfig | undefined {
  return getActiveProviderConfig(storage)
}

export function resolveProviderForModel(model?: string): ResolvedProvider {
  const storage = readCustomApiStorage()
  const providers = storage.providers ?? []

  const provider = model
    ? findProviderByModel(model, providers)
    : findProviderByActiveConfig(storage)

  if (!provider) {
    return {
      kind: undefined,
      provider: undefined,
      baseURL: process.env.ANTHROPIC_BASE_URL,
      apiKey: process.env.WITCHCAT_API_KEY || process.env.ANTHROPIC_API_KEY,
      authMode: undefined,
      reasoning: undefined,
      oauth: undefined,
    }
  }

  return {
    kind: provider.kind,
    provider,
    baseURL: provider.baseURL ?? process.env.ANTHROPIC_BASE_URL,
    apiKey: provider.apiKey ?? process.env.WITCHCAT_API_KEY ?? process.env.ANTHROPIC_API_KEY,
    authMode: provider.authMode,
    reasoning: provider.reasoning,
    oauth: provider.oauth,
  }
}
