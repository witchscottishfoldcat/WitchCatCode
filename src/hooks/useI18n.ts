import * as React from 'react'
import { getLocale, setLocale, subscribeLocaleChange, t as translate } from '../i18n/core.js'
import type { Locale } from '../i18n/core.js'

export interface UseI18nReturn {
  t: typeof translate
  locale: Locale
  setLocale: (locale: Locale) => void
}

export function useI18n(): UseI18nReturn {
  const [locale, setLocaleState] = React.useState<Locale>(getLocale)

  React.useEffect(() => {
    setLocaleState(getLocale())
    return subscribeLocaleChange(() => {
      setLocaleState(getLocale())
    })
  }, [])

  const handleSetLocale = React.useCallback((newLocale: Locale) => {
    setLocale(newLocale)
  }, [])

  return { t: translate, locale, setLocale: handleSetLocale }
}
