import type { ToolUseContext } from '../../Tool.js'
import type {
  LocalJSXCommandContext,
  LocalJSXCommandOnDone,
} from '../../types/command.js'
import { getLocale, setLocale } from '../../i18n/core.js'
import type { Locale } from '../../i18n/core.js'

const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  'zh-CN': '简体中文',
}

const AVAILABLE_LOCALES: Locale[] = ['en', 'zh-CN']

export async function call(
  onDone: LocalJSXCommandOnDone,
  _context: ToolUseContext & LocalJSXCommandContext,
  args: string,
): Promise<null> {
  const currentLocale = getLocale()

  if (!args || args.trim() === '') {
    const localeList = AVAILABLE_LOCALES
      .map(l => (l === currentLocale ? `> ${LOCALE_LABELS[l]} (${l})` : `  ${LOCALE_LABELS[l]} (${l})`))
      .join('\n')
    onDone(
      `Current language: ${LOCALE_LABELS[currentLocale]}\n\nAvailable languages:\n${localeList}\n\nUsage: /i18n <locale>\n  /i18n en     - English\n  /i18n zh-CN  - 简体中文`,
      { display: 'system' },
    )
    return null
  }

  const targetLocale = args.trim() as Locale

  if (!AVAILABLE_LOCALES.includes(targetLocale)) {
    const localeList = AVAILABLE_LOCALES.map(l => `${l}`).join(', ')
    onDone(
      `Unknown locale: "${targetLocale}". Available: ${localeList}`,
      { display: 'system' },
    )
    return null
  }

  if (targetLocale === currentLocale) {
    onDone(`Language is already set to ${LOCALE_LABELS[currentLocale]}`, { display: 'system' })
    return null
  }

  setLocale(targetLocale)
  onDone(`Language switched to ${LOCALE_LABELS[targetLocale]}. Restart the session for full effect.`, { display: 'system' })
  return null
}
