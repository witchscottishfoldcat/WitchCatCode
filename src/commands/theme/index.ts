import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

const theme = {
  type: 'local-jsx',
  name: 'theme',
  description: t('command.theme.description'),
  load: () => import('./theme.js'),
} satisfies Command

export default theme
