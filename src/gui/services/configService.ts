import {
  readCustomApiStorage,
  getActiveProviderConfig,
  type ProviderConfig,
  type CustomApiStorageData,
} from '../../utils/customApiStorage.js'

function maskApiKey(key: string | undefined): string {
  if (!key) return ''
  if (key.length <= 4) return '****'
  return '****' + key.slice(-4)
}

export type ProviderSummary = {
  id: string
  kind: string
  authMode: string
  baseURL: string | undefined
  maskedApiKey: string
  models: string[]
  isActive: boolean
}

export type CurrentConfig = {
  activeProviderKey: string | undefined
  activeModel: string | undefined
  providerKind: string | undefined
  providerId: string | undefined
  authMode: string | undefined
  baseURL: string | undefined
}

export function createConfigService() {
  return {
    getProviders(): ProviderSummary[] {
      const data = readCustomApiStorage()
      const providers = data.providers ?? []
      const active = getActiveProviderConfig(data)

      return providers.map((p: ProviderConfig) => ({
        id: p.id,
        kind: p.kind,
        authMode: p.authMode,
        baseURL: p.baseURL,
        maskedApiKey: maskApiKey(p.apiKey),
        models: p.models ?? [],
        isActive: active?.id === p.id,
      }))
    },

    getCurrentConfig(): CurrentConfig {
      const data = readCustomApiStorage()
      return {
        activeProviderKey: data.activeProviderKey,
        activeModel: data.activeModel,
        providerKind: data.providerKind,
        providerId: data.providerId,
        authMode: data.authMode,
        baseURL: data.baseURL,
      }
    },
  }
}
