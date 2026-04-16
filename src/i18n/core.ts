import en from './locales/en.js'
import zhCN from './locales/zh-CN.js'

export type Locale = 'en' | 'zh-CN'

type TranslationMap = Record<string, string>

const LOCALES: Record<Locale, TranslationMap> = {
  en,
  'zh-CN': zhCN,
}

const LOCALE_CONFIG_KEY = 'locale'
let currentLocale: Locale = 'en'
let initialized = false

const LISTENERS = new Set<() => void>()

function loadPersistedLocale(): Locale {
  try {
    const { getGlobalConfig } = require('../utils/config.js')
    const config = getGlobalConfig() as Record<string, unknown>
    const persisted = config[LOCALE_CONFIG_KEY]
    if (persisted === 'en' || persisted === 'zh-CN') {
      return persisted
    }
  } catch {
    // config not yet available (e.g. during early bootstrap)
  }
  return 'en'
}

function persistLocale(locale: Locale): void {
  try {
    const { saveGlobalConfig } = require('../utils/config.js')
    saveGlobalConfig((config: Record<string, unknown>) => ({
      ...config,
      [LOCALE_CONFIG_KEY]: locale,
    }))
  } catch {
    // silently fail during early bootstrap or in test environments
  }
}

export function initLocale(): void {
  if (initialized) return
  initialized = true
  currentLocale = loadPersistedLocale()
}

export function setLocale(locale: Locale): void {
  if (!LOCALES[locale]) return
  currentLocale = locale
  persistLocale(locale)
  for (const listener of LISTENERS) {
    listener()
  }
}

export function getLocale(): Locale {
  if (!initialized) {
    initLocale()
  }
  return currentLocale
}

export function subscribeLocaleChange(listener: () => void): () => void {
  LISTENERS.add(listener)
  return () => { LISTENERS.delete(listener) }
}

export type TFunc = typeof t

export function t(key: string, params?: Record<string, string | number>): string {
  const locale = getLocale()
  const translation = LOCALES[locale]?.[key] ?? LOCALES.en[key] ?? key
  if (!params) return translation
  return translation.replace(/\{(\w+)\}/g, (match, name) => {
    const value = params[name]
    return value !== undefined ? String(value) : match
  })
}
