import {
  readCustomApiStorage,
  writeCustomApiStorage,
  getActiveProviderConfig,
  getProviderKeyFromConfig,
  type ProviderConfig,
  type CustomApiStorageData,
  type CompatibleProviderKind,
  type ProviderAuthMode,
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

export type UpdateProviderInput = {
  id: string
  kind: CompatibleProviderKind
  authMode: ProviderAuthMode
  baseURL?: string
  apiKey?: string
  models: string[]
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

    updateProvider(input: UpdateProviderInput): boolean {
      const data = readCustomApiStorage()
      const providers = data.providers ?? []
      const idx = providers.findIndex(p => p.id === input.id)
      if (idx === -1) return false

      const updated: ProviderConfig = {
        ...providers[idx],
        ...input,
      }
      const nextProviders = [...providers]
      nextProviders[idx] = updated

      const next: CustomApiStorageData = {
        ...data,
        providers: nextProviders,
      }
      writeCustomApiStorage(next)
      return true
    },

    setActiveProvider(providerId: string): boolean {
      const data = readCustomApiStorage()
      const providers = data.providers ?? []
      const provider = providers.find(p => p.id === providerId)
      if (!provider) return false

      const next: CustomApiStorageData = {
        ...data,
        activeProviderKey: getProviderKeyFromConfig(provider),
        activeProvider: provider.id,
        activeAuthMode: provider.authMode,
        activeModel: provider.models[0],
        providerKind: provider.kind,
        providerId: provider.id,
        authMode: provider.authMode,
        baseURL: provider.baseURL,
        apiKey: provider.apiKey,
        model: provider.models[0],
        savedModels: provider.models,
      }
      writeCustomApiStorage(next)
      return true
    },

    setActiveModel(model: string): boolean {
      const data = readCustomApiStorage()
      const providers = data.providers ?? []
      const active = getActiveProviderConfig(data)
      if (!active) return false
      const provider = providers.find(p => p.id === active.id)
      if (!provider || !provider.models.includes(model)) return false

      const next: CustomApiStorageData = {
        ...data,
        activeModel: model,
        model,
      }
      writeCustomApiStorage(next)
      return true
    },
  }
}
