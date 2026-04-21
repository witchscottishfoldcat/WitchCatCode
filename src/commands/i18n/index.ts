import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

const i18n = {
  type: 'local-jsx',
  name: 'i18n',
  description: t('command.i18n.description'),
  load: () => import('./i18n.js'),
} satisfies Command

export default i18n
